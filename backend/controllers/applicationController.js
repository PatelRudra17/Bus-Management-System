const PassApplication = require('../models/PassApplication');
const Route = require('../models/Route');
const User = require('../models/User');
const Payment = require('../models/Payment');
const QRCode = require('qrcode');
const PDFDocument = require('pdfkit');
const logger = require('../utils/logger');
const { sendApplicationStatusEmail } = require('../utils/emailService');
const { emitToUser, emitToAdmins } = require('../server');

const calculateFare = (baseFare, passType, duration) => {
  const discountMap = {
    student: 0.5,
    senior: 0.5,
    disabled: 0.3,
    general: 1
  };
  
  const durationMultiplier = {
    '1month': 1,
    '3months': 2.8,
    '6months': 5,
    '12months': 9
  };

  const discountedFare = baseFare * discountMap[passType];
  const total = discountedFare * durationMultiplier[duration];
  
  return Math.round(total);
};

exports.createApplication = async (req, res) => {
  try {
    const { routeId, passType, duration, startDate, idProof, photo, additionalDocuments } = req.body;

    if (!routeId) {
      return res.status(400).json({
        success: false,
        message: 'Route is required'
      });
    }

    if (!idProof || !idProof.startsWith('data:image')) {
      return res.status(400).json({
        success: false,
        message: 'ID proof image is required'
      });
    }

    if (!photo || !photo.startsWith('data:image')) {
      return res.status(400).json({
        success: false,
        message: 'Photo is required'
      });
    }

    const route = await Route.findById(routeId);
    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    const existingApplication = await PassApplication.findOne({
      userId: req.user.id,
      status: { $in: ['pending', 'approved'] }
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active or pending application'
      });
    }

    const totalAmount = calculateFare(route.fare, passType, duration);

    const application = await PassApplication.create({
      userId: req.user.id,
      routeId,
      passType,
      duration,
      startDate: startDate || Date.now(),
      documents: {
        idProof,
        photo,
        additionalDocuments: additionalDocuments || []
      },
      totalAmount,
      activityLog: [{
        action: 'Application Created',
        performedBy: req.user.id,
        timestamp: Date.now(),
        details: 'New pass application submitted'
      }]
    });

    const populatedApplication = await PassApplication.findById(application._id)
      .populate('userId', 'name email phone')
      .populate('routeId');

    logger.info(`New application created: ${application.applicationId}`, {
      userId: req.user.id,
      routeId
    });

    try {
      await sendApplicationStatusEmail(req.user, application, 'pending');
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    const user = await User.findById(req.user.id);
    user.notifications.push({
      title: 'Application Submitted',
      message: `Your bus pass application ${application.applicationId} has been submitted successfully.`,
      type: 'success'
    });
    await user.save();

    try {
      emitToUser(req.user.id, 'notification', {
        title: 'Application Submitted',
        message: `Your application ${application.applicationId} is pending review`,
        type: 'success'
      });
      emitToAdmins('adminNotification', {
        type: 'new_application',
        applicationId: application.applicationId,
        userName: user.name,
        message: `New application from ${user.name}`
      });
    } catch (socketError) {
      console.log('Socket emit failed:', socketError);
    }

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      application: populatedApplication
    });
  } catch (error) {
    logger.error('Application creation error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error creating application',
      error: error.message
    });
  }
};

exports.approveApplication = async (req, res) => {
  try {
    const { remarks } = req.body;
    const application = await PassApplication.findById(req.params.id)
      .populate('userId')
      .populate('routeId');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Application is not pending'
      });
    }

    const qrData = JSON.stringify({
      passNumber: application.passNumber || 'PENDING',
      applicationId: application.applicationId,
      userId: application.userId?._id || application.userId,
      route: application.routeId?.routeNumber || 'CITY-PASS'
    });

    const qrCode = await QRCode.toDataURL(qrData);

    application.status = 'approved';
    application.remarks = remarks || 'Application approved';
    application.reviewedBy = req.user.id;
    application.reviewedAt = Date.now();
    application.qrCode = qrCode;
    application.activityLog.push({
      action: 'Application Approved',
      performedBy: req.user.id,
      timestamp: Date.now(),
      details: remarks || 'Approved by admin'
    });

    await application.save();

    logger.info(`Application approved: ${application.applicationId}`, {
      approvedBy: req.user.id
    });

    try {
      await sendApplicationStatusEmail(application.userId, application, 'approved');
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    const user = await User.findById(application.userId?._id || application.userId);
    if (user) {
      user.notifications.push({
        title: 'Application Approved!',
        message: `Your bus pass ${application.passNumber} has been approved.`,
        type: 'success'
      });
      await user.save();
    }

    try {
      const uid = (application.userId?._id || application.userId)?.toString();
      if (uid) {
        emitToUser(uid, 'notification', {
          title: 'Application Approved!',
          message: `Your pass ${application.passNumber} is now active`,
          type: 'success',
          passNumber: application.passNumber
        });
        emitToUser(uid, 'applicationApproved', {
          applicationId: application.applicationId,
          passNumber: application.passNumber
        });
      }
    } catch (socketError) {
      console.log('Socket emit failed:', socketError);
    }

    res.json({
      success: true,
      message: 'Application approved successfully',
      application
    });
  } catch (error) {
    logger.error('Application approval error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error approving application',
      error: error.message
    });
  }
};

exports.rejectApplication = async (req, res) => {
  try {
    const { remarks } = req.body;
    const application = await PassApplication.findById(req.params.id)
      .populate('userId')
      .populate('routeId');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Application is not pending'
      });
    }

    application.status = 'rejected';
    application.remarks = remarks || 'Application rejected';
    application.reviewedBy = req.user.id;
    application.reviewedAt = Date.now();
    application.activityLog.push({
      action: 'Application Rejected',
      performedBy: req.user.id,
      timestamp: Date.now(),
      details: remarks || 'Rejected by admin'
    });

    await application.save();

    logger.info(`Application rejected: ${application.applicationId}`, {
      rejectedBy: req.user.id,
      reason: remarks
    });

    try {
      await sendApplicationStatusEmail(application.userId, application, 'rejected');
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    const user = await User.findById(application.userId._id);
    user.notifications.push({
      title: 'Application Rejected',
      message: `Your application ${application.applicationId} has been rejected. Reason: ${remarks}`,
      type: 'error'
    });
    await user.save();

    try {
      emitToUser(application.userId._id.toString(), 'notification', {
        title: 'Application Rejected',
        message: `Your application ${application.applicationId} was rejected: ${remarks}`,
        type: 'error'
      });
    } catch (socketError) {
      console.log('Socket emit failed:', socketError);
    }

    res.json({
      success: true,
      message: 'Application rejected',
      application
    });
  } catch (error) {
    logger.error('Application rejection error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error rejecting application',
      error: error.message
    });
  }
};

exports.getApplication = async (req, res) => {
  try {
    const application = await PassApplication.findById(req.params.id)
      .populate('userId')
      .populate('routeId')
      .populate('reviewedBy', 'name email');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.json({
      success: true,
      application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching application',
      error: error.message
    });
  }
};

exports.renewApplication = async (req, res) => {
  try {
    const existingApplication = await PassApplication.findById(req.params.id);

    if (!existingApplication) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    if (existingApplication.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const newApplication = await PassApplication.create({
      userId: req.user.id,
      routeId: existingApplication.routeId,
      passType: existingApplication.passType,
      duration: req.body.duration || existingApplication.duration,
      startDate: existingApplication.endDate || Date.now(),
      documents: existingApplication.documents,
      totalAmount: existingApplication.totalAmount,
      activityLog: [{
        action: 'Renewal Request',
        performedBy: req.user.id,
        timestamp: Date.now(),
        details: 'Pass renewal requested'
      }]
    });

    logger.info(`Pass renewal requested for: ${existingApplication.applicationId}`);

    res.status(201).json({
      success: true,
      message: 'Renewal application submitted',
      application: newApplication
    });
  } catch (error) {
    logger.error('Renewal error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error renewing pass',
      error: error.message
    });
  }
};

exports.downloadPass = async (req, res) => {
  try {
    const application = await PassApplication.findOne({
      _id: req.params.id,
      userId: req.user.id,
      status: 'approved'
    })
      .populate('userId')
      .populate('routeId');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Approved pass not found'
      });
    }

    const doc = new PDFDocument({ size: 'A4', layout: 'landscape' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=BusPass_${application.passNumber}.pdf`);

    doc.pipe(res);

    doc.rect(0, 0, doc.page.width, doc.page.height).fill('#f0f4f8');

    doc.rect(50, 50, doc.page.width - 100, doc.page.height - 100)
       .stroke('#1a365d');

    doc.fontSize(28).fillColor('#1a365d')
       .text('BUS PASS', 0, 80, { align: 'center' });

    doc.fontSize(12).fillColor('#2d3748')
       .text('Bus Pass Management System', 0, 115, { align: 'center' });

    if (application.qrCode) {
      const qrImage = Buffer.from(application.qrCode.split(',')[1], 'base64');
      doc.image(qrImage, 650, 70, { width: 80, height: 80 });
    }

    doc.fontSize(10).fillColor('#4a5568');
    
    const leftCol = 80;
    let yPos = 170;

    doc.text(`Pass Number: ${application.passNumber}`, leftCol, yPos);
    doc.text(`Application ID: ${application.applicationId}`, leftCol, yPos + 20);
    doc.text(`Pass Type: ${application.passType.toUpperCase()}`, leftCol, yPos + 40);
    doc.text(`Duration: ${application.duration}`, leftCol, yPos + 60);
    doc.text(`Start Date: ${new Date(application.startDate).toLocaleDateString()}`, leftCol, yPos + 80);
    doc.text(`End Date: ${new Date(application.endDate).toLocaleDateString()}`, leftCol, yPos + 100);

    yPos = 170;
    const rightCol = 400;

    doc.text(`Name: ${application.userId.name}`, rightCol, yPos);
    doc.text(`Email: ${application.userId.email}`, rightCol, yPos + 20);
    doc.text(`Phone: ${application.userId.phone}`, rightCol, yPos + 40);
    doc.text(`Route: ${application.routeId?.routeNumber || 'City Pass'}`, rightCol, yPos + 60);
    doc.text(`${application.routeId?.source || ''} ${application.routeId?.destination ? '- ' + application.routeId.destination : ''}`, rightCol, yPos + 80);
    doc.text(`Amount: ₹${application.totalAmount}`, rightCol, yPos + 100);

    doc.fontSize(8).fillColor('#718096')
       .text('This pass is valid for the person named above only.', 80, 500, { align: 'center' })
       .text('For verification, present this pass along with valid ID proof.', 80, 515, { align: 'center' })
       .text(`Generated on: ${new Date().toLocaleString()}`, 80, 530, { align: 'center' });

    doc.end();
  } catch (error) {
    logger.error('Download pass error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error generating pass',
      error: error.message
    });
  }
};

exports.cancelApplication = async (req, res) => {
  try {
    const application = await PassApplication.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    if (application.status === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel approved pass. Please contact support.'
      });
    }

    application.status = 'cancelled';
    application.activityLog.push({
      action: 'Application Cancelled',
      performedBy: req.user.id,
      timestamp: Date.now(),
      details: 'Cancelled by user'
    });

    await application.save();

    logger.info(`Application cancelled: ${application.applicationId}`);

    res.json({
      success: true,
      message: 'Application cancelled',
      application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cancelling application',
      error: error.message
    });
  }
};

exports.checkExpiredPasses = async () => {
  try {
    const expiredPasses = await PassApplication.find({
      status: 'approved',
      endDate: { $lt: new Date() }
    });

    for (const pass of expiredPasses) {
      pass.status = 'expired';
      await pass.save();

      const user = await User.findById(pass.userId);
      user.notifications.push({
        title: 'Pass Expired',
        message: `Your pass ${pass.passNumber} has expired.`,
        type: 'warning'
      });
      await user.save();
    }

    console.log(`Expired ${expiredPasses.length} passes`);
  } catch (error) {
    console.error('Error checking expired passes:', error);
  }
};
