const User = require('../models/User');
const PassApplication = require('../models/PassApplication');
const Payment = require('../models/Payment');
const logger = require('../utils/logger');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, addresses } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, addresses },
      { new: true, runValidators: true }
    );

    logger.info(`Profile updated for: ${user.email}`);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

exports.getMyApplications = async (req, res) => {
  try {
    const applications = await PassApplication.find({ userId: req.user.id })
      .populate('routeId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching applications',
      error: error.message
    });
  }
};

exports.getApplicationById = async (req, res) => {
  try {
    const application = await PassApplication.findOne({
      _id: req.params.id,
      userId: req.user.id
    }).populate('routeId');

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

exports.getMyPasses = async (req, res) => {
  try {
    const passes = await PassApplication.find({
      userId: req.user.id,
      status: 'approved'
    })
      .populate('routeId')
      .sort({ endDate: -1 });

    res.json({
      success: true,
      count: passes.length,
      passes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching passes',
      error: error.message
    });
  }
};

exports.getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user.id })
      .populate('applicationId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: payments.length,
      payments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching payments',
      error: error.message
    });
  }
};

exports.markNotificationRead = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const notificationIndex = user.notifications.findIndex(
      n => n._id.toString() === req.params.notificationId
    );

    if (notificationIndex !== -1) {
      user.notifications[notificationIndex].read = true;
      await user.save();
    }

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating notification',
      error: error.message
    });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('notifications')
      .sort({ 'notifications.createdAt': -1 });

    res.json({
      success: true,
      notifications: user.notifications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
      error: error.message
    });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { isActive: false });

    logger.info(`Account deactivated for user: ${req.user.email}`);

    res.json({
      success: true,
      message: 'Account deactivated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deactivating account',
      error: error.message
    });
  }
};
