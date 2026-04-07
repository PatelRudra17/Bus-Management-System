const express = require('express');
const router = express.Router();
const { getKycStatus, sendAadhaarOtp, verifyAadhaarOtp, verifyPan } = require('../controllers/kycController');
const { protect, authorize } = require('../middleware/auth');
const { body } = require('express-validator');
const { validate } = require('../middleware/validator');

// KYC is only for users, not admins
router.use(protect);
router.use(authorize('user'));

router.get('/status', getKycStatus);

router.post('/aadhaar/send-otp', [
  body('aadhaarNumber')
    .trim()
    .notEmpty().withMessage('Aadhaar number is required')
    .matches(/^\d{12}$/).withMessage('Aadhaar must be exactly 12 digits'),
  validate
], sendAadhaarOtp);

router.post('/aadhaar/verify-otp', [
  body('otp')
    .trim()
    .notEmpty().withMessage('OTP is required')
    .isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  validate
], verifyAadhaarOtp);

router.post('/pan/verify', [
  body('panNumber')
    .trim()
    .notEmpty().withMessage('PAN number is required')
    .matches(/^[A-Za-z]{5}[0-9]{4}[A-Za-z]$/).withMessage('Invalid PAN format (e.g. ABCDE1234F)'),
  validate
], verifyPan);

module.exports = router;
