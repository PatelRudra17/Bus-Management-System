const express = require('express');
const router = express.Router();
const { 
  createPayment, 
  getPayment, 
  getAllPayments,
  refundPayment,
  getPaymentStats,
  createRazorpayOrder,
  verifyRazorpayPayment,
} = require('../controllers/paymentController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/stats', protect, adminOnly, getPaymentStats);
router.get('/', protect, getAllPayments);
router.get('/:id', protect, getPayment);
router.post('/', protect, createPayment);
router.post('/razorpay/order', protect, createRazorpayOrder);
router.post('/razorpay/verify', protect, verifyRazorpayPayment);
router.put('/:id/refund', protect, adminOnly, refundPayment);

module.exports = router;
