const express = require('express');
const router = express.Router();
const { 
  generateQRCode, 
  verifyPass, 
  verifyPassByNumber,
  getVerificationHistory
} = require('../controllers/verificationController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/generate-qr', protect, generateQRCode);
router.post('/verify', verifyPass);
router.get('/verify/:passNumber', verifyPassByNumber);
router.get('/history', protect, adminOnly, getVerificationHistory);

module.exports = router;
