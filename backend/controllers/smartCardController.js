const SmartCard = require('../models/SmartCard');
const User = require('../models/User');
const TravelLog = require('../models/TravelLog');

// @desc    Apply for smart card
// @route   POST /api/cards/apply
// @access  Private
exports.applyForCard = async (req, res) => {
  try {
    const {
      aadhaarNumber,
      panNumber,
      concessionType,
      concessionDocument,
      emergencyContacts,
      familyTrackingEnabled,
      nightTravelAlert,
      womenOnlyZone
    } = req.body;

    // Check if user already has a card
    const existingCard = await SmartCard.findOne({ userId: req.user._id });
    if (existingCard) {
      return res.status(400).json({
        success: false,
        message: 'You already have a smart card'
      });
    }

    // Check if Aadhaar or PAN already registered
    const duplicateAadhaar = await SmartCard.findOne({ 'verification.aadhaarNumber': aadhaarNumber });
    const duplicatePAN = await SmartCard.findOne({ 'verification.panNumber': panNumber });

    if (duplicateAadhaar || duplicatePAN) {
      return res.status(400).json({
        success: false,
        message: 'Aadhaar or PAN already registered with another card'
      });
    }

    // Determine concession percentage
    const concessionMap = {
      'student': 50,
      'senior': 50,
      'disabled': 75,
      'women': 25,
      'none': 0
    };

    const card = await SmartCard.create({
      userId: req.user._id,
      verification: {
        aadhaarNumber,
        panNumber,
        photo: req.file ? req.file.path : '',
        aadhaarVerified: false,
        panVerified: false
      },
      concessionType: concessionType || 'none',
      concessionPercentage: concessionMap[concessionType || 'none'],
      concessionDocument: concessionDocument || '',
      safetyFeatures: {
        emergencyContacts: emergencyContacts || [],
        familyTrackingEnabled: familyTrackingEnabled || false,
        nightTravelAlert: nightTravelAlert || false,
        womenOnlyZone: womenOnlyZone || false
      },
      activityLog: [{
        action: 'created',
        performedBy: req.user._id,
        details: 'Card application submitted'
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Smart card application submitted successfully. Verification pending.',
      data: card
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user's smart card
// @route   GET /api/cards/my-card
// @access  Private
exports.getMyCard = async (req, res) => {
  try {
    const card = await SmartCard.findOne({ userId: req.user._id })
      .populate('userId', 'name email phone');

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'No smart card found. Please apply for one.'
      });
    }

    res.status(200).json({
      success: true,
      data: card
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Recharge smart card
// @route   POST /api/cards/recharge
// @access  Private
exports.rechargeCard = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid recharge amount'
      });
    }

    const card = await SmartCard.findOne({ userId: req.user._id });

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Smart card not found'
      });
    }

    // Add balance
    await card.addBalance(amount);

    // Log activity
    card.activityLog.push({
      action: 'recharged',
      performedBy: req.user._id,
      details: `Recharged Rs. ${amount}`,
      amount: amount,
      timestamp: new Date()
    });
    await card.save();

    res.status(200).json({
      success: true,
      message: `Successfully recharged Rs. ${amount}`,
      data: {
        newBalance: card.balance,
        cardNumber: card.cardNumber
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update card safety features
// @route   PUT /api/cards/safety-features
// @access  Private
exports.updateSafetyFeatures = async (req, res) => {
  try {
    const {
      sosEnabled,
      emergencyContacts,
      familyTrackingEnabled,
      nightTravelAlert,
      womenOnlyZone
    } = req.body;

    const card = await SmartCard.findOne({ userId: req.user._id });

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Smart card not found'
      });
    }

    // Update safety features
    if (sosEnabled !== undefined) card.safetyFeatures.sosEnabled = sosEnabled;
    if (emergencyContacts) card.safetyFeatures.emergencyContacts = emergencyContacts;
    if (familyTrackingEnabled !== undefined) card.safetyFeatures.familyTrackingEnabled = familyTrackingEnabled;
    if (nightTravelAlert !== undefined) card.safetyFeatures.nightTravelAlert = nightTravelAlert;
    if (womenOnlyZone !== undefined) card.safetyFeatures.womenOnlyZone = womenOnlyZone;

    await card.save();

    res.status(200).json({
      success: true,
      message: 'Safety features updated successfully',
      data: card.safetyFeatures
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get card transaction history
// @route   GET /api/cards/transactions
// @access  Private
exports.getTransactionHistory = async (req, res) => {
  try {
    const card = await SmartCard.findOne({ userId: req.user._id });

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Smart card not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        activityLog: card.activityLog,
        stats: card.stats,
        balance: card.balance
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get travel history
// @route   GET /api/cards/travel-history
// @access  Private
exports.getTravelHistory = async (req, res) => {
  try {
    const card = await SmartCard.findOne({ userId: req.user._id });

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Smart card not found'
      });
    }

    const travelLogs = await TravelLog.find({ cardId: card._id })
      .populate('routeId', 'name startPoint endPoint')
      .sort({ 'boardingPoint.timestamp': -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      data: travelLogs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ========== ADMIN ROUTES ==========

// @desc    Get all smart cards (Admin)
// @route   GET /api/cards/admin/all
// @access  Private/Admin
exports.getAllCards = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;

    const cards = await SmartCard.find(query)
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await SmartCard.countDocuments(query);

    res.status(200).json({
      success: true,
      data: cards,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Verify/Approve smart card (Admin)
// @route   PUT /api/cards/admin/:id/verify
// @access  Private/Admin
exports.verifyCard = async (req, res) => {
  try {
    const { aadhaarVerified, panVerified, status } = req.body;

    const card = await SmartCard.findById(req.params.id);

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Card not found'
      });
    }

    // Update verification status
    if (aadhaarVerified !== undefined) card.verification.aadhaarVerified = aadhaarVerified;
    if (panVerified !== undefined) card.verification.panVerified = panVerified;

    // If both verified, activate card
    if (card.verification.aadhaarVerified && card.verification.panVerified) {
      card.status = 'active';
      card.verification.verificationDate = new Date();

      // Add activity log
      card.activityLog.push({
        action: 'activated',
        performedBy: req.user._id,
        details: 'Card verified and activated by admin'
      });
    }

    await card.save();

    res.status(200).json({
      success: true,
      message: 'Card verification updated',
      data: card
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Block/Unblock smart card (Admin)
// @route   PUT /api/cards/admin/:id/block
// @access  Private/Admin
exports.blockCard = async (req, res) => {
  try {
    const { action, reason } = req.body; // action: 'block' or 'unblock'

    const card = await SmartCard.findById(req.params.id);

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Card not found'
      });
    }

    if (action === 'block') {
      card.status = 'blocked';
      card.blacklisted.isBlacklisted = true;
      card.blacklisted.reason = reason || 'Blocked by admin';
      card.blacklisted.blacklistedDate = new Date();
      card.blacklisted.blacklistedBy = req.user._id;

      card.activityLog.push({
        action: 'blocked',
        performedBy: req.user._id,
        details: reason || 'Card blocked'
      });
    } else if (action === 'unblock') {
      card.status = 'active';
      card.blacklisted.isBlacklisted = false;
      card.blacklisted.reason = '';

      card.activityLog.push({
        action: 'unblocked',
        performedBy: req.user._id,
        details: 'Card unblocked'
      });
    }

    await card.save();

    res.status(200).json({
      success: true,
      message: `Card ${action}ed successfully`,
      data: card
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get card statistics (Admin)
// @route   GET /api/cards/admin/statistics
// @access  Private/Admin
exports.getCardStatistics = async (req, res) => {
  try {
    const totalCards = await SmartCard.countDocuments();
    const activeCards = await SmartCard.countDocuments({ status: 'active' });
    const pendingCards = await SmartCard.countDocuments({ status: 'pending' });
    const blockedCards = await SmartCard.countDocuments({ status: 'blocked' });

    const totalBalance = await SmartCard.aggregate([
      { $group: { _id: null, total: { $sum: '$balance' } } }
    ]);

    const totalTrips = await SmartCard.aggregate([
      { $group: { _id: null, total: { $sum: '$stats.totalTrips' } } }
    ]);

    const totalRevenue = await SmartCard.aggregate([
      { $group: { _id: null, total: { $sum: '$stats.totalSpent' } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalCards,
        activeCards,
        pendingCards,
        blockedCards,
        totalBalance: totalBalance[0]?.total || 0,
        totalTrips: totalTrips[0]?.total || 0,
        totalRevenue: totalRevenue[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = exports;
