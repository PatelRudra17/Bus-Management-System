const express = require('express');
const router = express.Router();
const {
  applyForCard,
  getMyCard,
  rechargeCard,
  updateSafetyFeatures,
  getTransactionHistory,
  getTravelHistory,
  getAllCards,
  verifyCard,
  blockCard,
  getCardStatistics
} = require('../controllers/smartCardController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// User routes
router.post('/apply', protect, upload.single('photo'), applyForCard);
router.get('/my-card', protect, getMyCard);
router.post('/recharge', protect, rechargeCard);
router.put('/safety-features', protect, updateSafetyFeatures);
router.get('/transactions', protect, getTransactionHistory);
router.get('/travel-history', protect, getTravelHistory);

// Admin routes
router.get('/admin/all', protect, authorize('admin'), getAllCards);
router.put('/admin/:id/verify', protect, authorize('admin'), verifyCard);
router.put('/admin/:id/block', protect, authorize('admin'), blockCard);
router.get('/admin/statistics', protect, authorize('admin'), getCardStatistics);

module.exports = router;
