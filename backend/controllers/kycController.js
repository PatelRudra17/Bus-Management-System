const User = require('../models/User');
const logger = require('../utils/logger');
const { sendEmail } = require('../utils/emailService');

// Validate Aadhaar using Verhoeff checksum (real validation algorithm)
const verhoeffTable = {
  d: [
    [0,1,2,3,4,5,6,7,8,9],[1,2,3,4,0,6,7,8,9,5],
    [2,3,4,0,1,7,8,9,5,6],[3,4,0,1,2,8,9,5,6,7],
    [4,0,1,2,3,9,5,6,7,8],[5,9,8,7,6,0,4,3,2,1],
    [6,5,9,8,7,1,0,4,3,2],[7,6,5,9,8,2,1,0,4,3],
    [8,7,6,5,9,3,2,1,0,4],[9,8,7,6,5,4,3,2,1,0]
  ],
  p: [
    [0,1,2,3,4,5,6,7,8,9],[1,5,7,6,2,8,3,0,9,4],
    [5,8,0,3,7,9,6,1,4,2],[8,9,1,6,0,4,3,5,2,7],
    [9,4,5,3,1,2,6,8,7,0],[4,2,8,6,5,7,3,9,0,1],
    [2,7,9,3,8,0,6,4,1,5],[7,0,4,6,9,1,3,2,5,8]
  ],
  inv: [0,4,3,2,1,5,6,7,8,9]
};

function validateAadhaar(aadhaarNumber) {
  const num = aadhaarNumber.replace(/\s/g, '');
  if (!/^\d{12}$/.test(num)) return false;
  // Cannot start with 0 or 1
  if (num[0] === '0' || num[0] === '1') return false;

  let c = 0;
  const digits = num.split('').map(Number).reverse();
  for (let i = 0; i < digits.length; i++) {
    c = verhoeffTable.d[c][verhoeffTable.p[i % 8][digits[i]]];
  }
  return c === 0;
}

// Validate PAN format: ABCDE1234F
function validatePAN(pan) {
  return /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan.toUpperCase());
}

// Generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Mask Aadhaar: XXXX-XXXX-1234
function maskAadhaar(num) {
  const clean = num.replace(/\s/g, '');
  return `XXXX-XXXX-${clean.slice(-4)}`;
}

// @desc    Get KYC status
// @route   GET /api/kyc/status
exports.getKycStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('aadhaarNumber aadhaarVerified panNumber panVerified kycStatus');

    res.json({
      success: true,
      kyc: {
        aadhaarNumber: user.aadhaarNumber || null,
        aadhaarVerified: user.aadhaarVerified,
        panNumber: user.panNumber || null,
        panVerified: user.panVerified,
        kycStatus: user.kycStatus
      }
    });
  } catch (error) {
    logger.error('KYC status error', { error: error.message });
    res.status(500).json({ success: false, message: 'Error fetching KYC status' });
  }
};

// @desc    Submit Aadhaar and send OTP
// @route   POST /api/kyc/aadhaar/send-otp
exports.sendAadhaarOtp = async (req, res) => {
  try {
    const { aadhaarNumber } = req.body;
    const clean = aadhaarNumber.replace(/\s/g, '');

    if (!validateAadhaar(clean)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Aadhaar number. Must be 12 digits with valid checksum.'
      });
    }

    const user = await User.findById(req.user.id);

    if (user.aadhaarVerified) {
      return res.status(400).json({
        success: false,
        message: 'Aadhaar is already verified'
      });
    }

    // Generate OTP and save
    const otp = generateOTP();
    user.aadhaarNumber = maskAadhaar(clean);
    user.kycOtp = otp;
    user.kycOtpExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    await user.save();

    // Send OTP via email (demo — real flow sends to Aadhaar-linked mobile)
    await sendEmail({
      to: user.email,
      subject: 'Aadhaar Verification OTP - Bus Pass System',
      html: `
        <h2>Aadhaar Verification</h2>
        <p>Hello ${user.name},</p>
        <p>Your OTP for Aadhaar verification is:</p>
        <h1 style="text-align:center; color:#0e7490; letter-spacing:8px; font-size:36px;">${otp}</h1>
        <p>This OTP is valid for <strong>10 minutes</strong>.</p>
        <p style="color:#888; font-size:12px;">This is a demo verification. In production, OTP would be sent to your Aadhaar-linked mobile number via UIDAI.</p>
      `
    });

    logger.info(`Aadhaar OTP sent to: ${user.email}`, { userId: user._id });

    res.json({
      success: true,
      message: 'OTP sent to your registered email address',
      // In demo mode, also return OTP for easy testing
      demoOtp: process.env.NODE_ENV !== 'production' ? otp : undefined
    });
  } catch (error) {
    logger.error('Aadhaar OTP error', { error: error.message });
    res.status(500).json({ success: false, message: 'Error sending OTP' });
  }
};

// @desc    Verify Aadhaar OTP
// @route   POST /api/kyc/aadhaar/verify-otp
exports.verifyAadhaarOtp = async (req, res) => {
  try {
    const { otp } = req.body;

    const user = await User.findById(req.user.id);

    if (user.aadhaarVerified) {
      return res.status(400).json({
        success: false,
        message: 'Aadhaar is already verified'
      });
    }

    if (!user.kycOtp || !user.kycOtpExpire) {
      return res.status(400).json({
        success: false,
        message: 'No OTP request found. Please request a new OTP.'
      });
    }

    if (new Date() > user.kycOtpExpire) {
      user.kycOtp = undefined;
      user.kycOtpExpire = undefined;
      await user.save();
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.'
      });
    }

    if (user.kycOtp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // Mark Aadhaar as verified
    user.aadhaarVerified = true;
    user.kycOtp = undefined;
    user.kycOtpExpire = undefined;
    user.kycStatus = user.panVerified ? 'verified' : 'partial';
    await user.save();

    logger.info(`Aadhaar verified for: ${user.email}`, { userId: user._id });

    res.json({
      success: true,
      message: 'Aadhaar verified successfully',
      kycStatus: user.kycStatus
    });
  } catch (error) {
    logger.error('Aadhaar verify error', { error: error.message });
    res.status(500).json({ success: false, message: 'Error verifying OTP' });
  }
};

// @desc    Submit and verify PAN
// @route   POST /api/kyc/pan/verify
exports.verifyPan = async (req, res) => {
  try {
    const { panNumber } = req.body;
    const pan = panNumber.toUpperCase().trim();

    if (!validatePAN(pan)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid PAN format. Must be like ABCDE1234F'
      });
    }

    const user = await User.findById(req.user.id);

    if (user.panVerified) {
      return res.status(400).json({
        success: false,
        message: 'PAN is already verified'
      });
    }

    // Demo verification — simulate API call with 2 second delay
    // In production, this would call NSDL/UTIITSL API
    const masked = `${pan.slice(0, 2)}XXXXX${pan.slice(-2)}`;

    user.panNumber = masked;
    user.panVerified = true;
    user.kycStatus = user.aadhaarVerified ? 'verified' : 'partial';
    await user.save();

    logger.info(`PAN verified for: ${user.email}`, { userId: user._id });

    res.json({
      success: true,
      message: 'PAN verified successfully',
      panNumber: masked,
      kycStatus: user.kycStatus
    });
  } catch (error) {
    logger.error('PAN verify error', { error: error.message });
    res.status(500).json({ success: false, message: 'Error verifying PAN' });
  }
};
