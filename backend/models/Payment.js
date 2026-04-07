const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PassApplication',
    required: false
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  currency: {
    type: String,
    default: 'INR'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'upi', 'netbanking', 'wallet', 'cash', 'razorpay'],
    required: [true, 'Payment method is required']
  },
  razorpayOrderId: {
    type: String,
    sparse: true
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'success', 'failed', 'refunded', 'cancelled'],
    default: 'pending'
  },
  gateway: {
    type: String,
    enum: ['razorpay', 'stripe', 'manual'],
    default: 'manual'
  },
  gatewayTransactionId: String,
  paymentDetails: {
    cardLast4: String,
    bankName: String,
    upiId: String
  },
  receipt: {
    type: String
  },
  refundAmount: {
    type: Number,
    default: 0
  },
  refundReason: String,
  refundedAt: Date
}, {
  timestamps: true
});

paymentSchema.pre('save', function(next) {
  if (!this.transactionId) {
    this.transactionId = 'TXN' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
  }
  next();
});

// Indexes (transactionId already indexed via unique: true)
paymentSchema.index({ userId: 1, paymentStatus: 1 });
paymentSchema.index({ createdAt: -1 });
paymentSchema.index({ applicationId: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
