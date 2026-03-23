const QRCode = require('qrcode');
const PassApplication = require('../models/PassApplication');
const User = require('../models/User');
const logger = require('../utils/logger');

exports.generateQRCode = async (req, res) => {
  try {
    const { passNumber, applicationId, userId, route } = req.body;

    const qrData = JSON.stringify({
      passNumber,
      applicationId,
      userId,
      route,
      timestamp: Date.now(),
      type: 'BUS_PASS'
    });

    const qrCode = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: {
        dark: '#1a365d',
        light: '#ffffff'
      }
    });

    res.json({
      success: true,
      qrCode,
      qrData
    });
  } catch (error) {
    logger.error('QR generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating QR code'
    });
  }
};

exports.verifyPass = async (req, res) => {
  try {
    let { qrData } = req.body;

    if (!qrData || typeof qrData !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid QR data provided',
        valid: false
      });
    }

    qrData = qrData.trim();

    if (qrData.startsWith('data:image')) {
      return res.status(400).json({
        success: false,
        message: 'Please provide text QR data, not image data',
        valid: false
      });
    }

    let parsedData;
    
    try {
      parsedData = JSON.parse(qrData);
    } catch (e) {
      if (qrData.startsWith('PASS') || qrData.startsWith('BP')) {
        parsedData = { passNumber: qrData };
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid QR code format',
          valid: false
        });
      }
    }

    const passNumber = parsedData.passNumber || parsedData.PassNumber || parsedData.pass_number;

    if (!passNumber) {
      return res.status(400).json({
        success: false,
        message: 'Pass number not found in QR data',
        valid: false
      });
    }

    const application = await PassApplication.findOne({ 
      passNumber: passNumber.toUpperCase() 
    })
      .populate('userId', 'name email phone')
      .populate('routeId');

    if (!application) {
      logger.warn(`Verification failed: Pass ${passNumber} not found`);
      return res.json({
        success: false,
        message: 'Pass not found in database',
        valid: false
      });
    }

    const isExpired = new Date(application.endDate) < new Date();
    const isValid = application.status === 'approved' && !isExpired;

    const verificationResult = {
      success: true,
      valid: isValid,
      details: {
        passNumber: application.passNumber,
        holderName: application.userId?.name,
        holderEmail: application.userId?.email,
        holderPhone: application.userId?.phone,
        route: application.routeId ? {
          number: application.routeId.routeNumber,
          source: application.routeId.source,
          destination: application.routeId.destination
        } : null,
        passType: application.passType,
        validFrom: application.startDate,
        validTill: application.endDate,
        status: application.status,
        isExpired: isExpired
      },
      verifiedAt: new Date(),
      verifiedBy: req.user?.id || 'public'
    };

    if (isValid) {
      logger.info(`Pass verified successfully: ${passNumber}`);
      application.activityLog.push({
        action: 'Pass Verified',
        performedBy: req.user?.id || 'public',
        timestamp: Date.now(),
        details: `Pass verified at ${new Date().toISOString()}`
      });
      await application.save();
    } else if (application.status === 'rejected') {
      verificationResult.message = 'Pass was rejected';
    } else if (application.status === 'pending') {
      verificationResult.message = 'Pass is still pending approval';
    } else if (isExpired) {
      verificationResult.message = 'Pass has expired';
    }

    res.json(verificationResult);
  } catch (error) {
    logger.error('Verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying pass',
      valid: false
    });
  }
};

exports.verifyPassByNumber = async (req, res) => {
  try {
    const { passNumber } = req.params;

    if (!passNumber) {
      return res.status(400).json({
        success: false,
        message: 'Pass number is required',
        valid: false
      });
    }

    const application = await PassApplication.findOne({ 
      passNumber: passNumber.toUpperCase() 
    })
      .populate('userId', 'name email phone')
      .populate('routeId');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Pass not found',
        valid: false
      });
    }

    const isExpired = new Date(application.endDate) < new Date();
    const isValid = application.status === 'approved' && !isExpired;

    res.json({
      success: true,
      valid: isValid,
      details: {
        passNumber: application.passNumber,
        holderName: application.userId?.name,
        holderPhone: application.userId?.phone,
        route: application.routeId ? {
          number: application.routeId.routeNumber,
          source: application.routeId.source,
          destination: application.routeId.destination
        } : null,
        validTill: application.endDate,
        isExpired: isExpired
      }
    });
  } catch (error) {
    logger.error('Verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying pass'
    });
  }
};

exports.getVerificationHistory = async (req, res) => {
  try {
    const applications = await PassApplication.find({
      'activityLog.action': 'Pass Verified'
    })
      .populate('userId', 'name email')
      .sort({ updatedAt: -1 })
      .limit(100);

    const history = applications.map(app => ({
      passNumber: app.passNumber,
      userName: app.userId?.name,
      verificationCount: app.activityLog.filter(
        log => log.action === 'Pass Verified'
      ).length,
      lastVerified: app.activityLog
        .filter(log => log.action === 'Pass Verified')
        .sort((a, b) => b.timestamp - a.timestamp)[0]?.timestamp
    }));

    res.json({
      success: true,
      history
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching verification history'
    });
  }
};
