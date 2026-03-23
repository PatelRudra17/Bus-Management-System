const Payment = require('../models/Payment');
const PassApplication = require('../models/PassApplication');
const User = require('../models/User');
const logger = require('../utils/logger');
const crypto = require('crypto');

let razorpay = null;
try {
  const Razorpay = require('razorpay');
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
} catch (e) {
  console.warn('Razorpay package not installed — payment orders disabled. Run: npm install razorpay');
}

// Create Razorpay order
exports.createRazorpayOrder = async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(503).json({ success: false, message: 'Razorpay not configured. Install razorpay package and set API keys.' });
    }
    const { amount, currency = 'INR', receipt } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }
    const options = {
      amount: Math.round(amount * 100), // paise
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
    };
    const order = await razorpay.orders.create(options);
    res.json({
      success: true,
      order,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    logger.error('Razorpay order creation error', { error: error.message });
    res.status(500).json({ success: false, message: 'Error creating payment order', error: error.message });
  }
};

// Verify Razorpay payment signature
exports.verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, applicationId, amount, paymentMethod } = req.body;

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    // Save payment record
    const payment = await Payment.create({
      userId: req.user.id,
      applicationId: applicationId || null,
      amount,
      paymentMethod: paymentMethod || 'razorpay',
      paymentStatus: 'success',
      transactionId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
    });

    if (applicationId) {
      await PassApplication.findByIdAndUpdate(applicationId, { paymentStatus: 'paid' });
    }

    logger.info(`Razorpay payment verified: ${razorpay_payment_id}`);
    res.json({ success: true, message: 'Payment verified', payment });
  } catch (error) {
    logger.error('Razorpay verification error', { error: error.message });
    res.status(500).json({ success: false, message: 'Error verifying payment', error: error.message });
  }
};

exports.createPayment = async (req, res) => {
  try {
    const { applicationId, amount, paymentMethod } = req.body;

    const application = await PassApplication.findById(applicationId);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    if (application.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Payment already completed'
      });
    }

    const payment = await Payment.create({
      userId: req.user.id,
      applicationId,
      amount,
      paymentMethod,
      paymentStatus: 'success'
    });

    application.paymentStatus = 'paid';
    await application.save();

    logger.info(`Payment successful: ${payment.transactionId}`, {
      userId: req.user.id,
      applicationId
    });

    res.status(201).json({
      success: true,
      message: 'Payment successful',
      payment
    });
  } catch (error) {
    logger.error('Payment error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error processing payment',
      error: error.message
    });
  }
};

exports.getPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('applicationId')
      .populate('userId', 'name email phone');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.json({
      success: true,
      payment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching payment',
      error: error.message
    });
  }
};

exports.getAllPayments = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, userId } = req.query;

    const query = {};
    if (status) query.paymentStatus = status;
    if (userId) query.userId = userId;

    const payments = await Payment.find(query)
      .populate('userId', 'name email')
      .populate('applicationId', 'applicationId passNumber')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Payment.countDocuments(query);

    res.json({
      success: true,
      payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching payments',
      error: error.message
    });
  }
};

exports.refundPayment = async (req, res) => {
  try {
    const { reason } = req.body;

    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (payment.paymentStatus !== 'success') {
      return res.status(400).json({
        success: false,
        message: 'Payment cannot be refunded'
      });
    }

    payment.paymentStatus = 'refunded';
    payment.refundAmount = payment.amount;
    payment.refundReason = reason;
    payment.refundedAt = Date.now();

    await payment.save();

    const application = await PassApplication.findById(payment.applicationId);
    if (application) {
      application.paymentStatus = 'refunded';
      await application.save();
    }

    logger.info(`Payment refunded: ${payment.transactionId}`, {
      reason,
      refundedBy: req.user.id
    });

    res.json({
      success: true,
      message: 'Payment refunded successfully',
      payment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error processing refund',
      error: error.message
    });
  }
};

exports.getPaymentStats = async (req, res) => {
  try {
    const stats = await Payment.aggregate([
      {
        $group: {
          _id: '$paymentStatus',
          count: { $sum: 1 },
          total: { $sum: '$amount' }
        }
      }
    ]);

    const methodStats = await Payment.aggregate([
      { $match: { paymentStatus: 'success' } },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          total: { $sum: '$amount' }
        }
      }
    ]);

    const recentPayments = await Payment.find({ paymentStatus: 'success' })
      .populate('userId', 'name email')
      .populate('applicationId', 'applicationId passNumber')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      stats,
      methodStats,
      recentPayments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching payment stats',
      error: error.message
    });
  }
};
