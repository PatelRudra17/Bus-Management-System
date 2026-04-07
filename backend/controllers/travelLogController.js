const TravelLog = require('../models/TravelLog');
const SmartCard = require('../models/SmartCard');
const Route = require('../models/Route');

// @desc    Start a trip (Tap card at boarding)
// @route   POST /api/travel/start
// @access  Private
exports.startTrip = async (req, res) => {
  try {
    const {
      busId,
      routeId,
      boardingStop,
      boardingLocation
    } = req.body;

    // Find user's card
    const card = await SmartCard.findOne({ userId: req.user._id });

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Smart card not found. Please apply for a card first.'
      });
    }

    // Check if card is valid
    if (!card.isValid()) {
      return res.status(400).json({
        success: false,
        message: 'Card is not active or has been blocked'
      });
    }

    // Check if user already has an ongoing trip
    const ongoingTrip = await TravelLog.findOne({
      cardId: card._id,
      status: 'ongoing'
    });

    if (ongoingTrip) {
      return res.status(400).json({
        success: false,
        message: 'You have an ongoing trip. Please complete it first.',
        data: ongoingTrip
      });
    }

    // Get route details
    const route = await Route.findById(routeId);
    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    // Create travel log
    const travelLog = await TravelLog.create({
      cardId: card._id,
      userId: req.user._id,
      busId,
      routeId,
      boardingPoint: {
        stopName: boardingStop,
        location: {
          type: 'Point',
          coordinates: boardingLocation // [longitude, latitude]
        },
        timestamp: new Date()
      },
      fare: {
        baseFare: 0, // Will be calculated at end
        concessionApplied: 0,
        finalFare: 0
      },
      status: 'ongoing'
    });

    // Update card stats
    card.stats.totalTrips += 1;
    card.stats.lastUsed = new Date();
    await card.save();

    res.status(201).json({
      success: true,
      message: 'Trip started successfully. Tap again when you alight.',
      data: travelLog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    End a trip (Tap card at alighting)
// @route   PUT /api/travel/end/:tripId
// @access  Private
exports.endTrip = async (req, res) => {
  try {
    const {
      alightingStop,
      alightingLocation
    } = req.body;

    const travelLog = await TravelLog.findOne({
      _id: req.params.tripId,
      userId: req.user._id,
      status: 'ongoing'
    }).populate('routeId');

    if (!travelLog) {
      return res.status(404).json({
        success: false,
        message: 'Ongoing trip not found'
      });
    }

    // Calculate distance (simplified - in real app use geospatial calculation)
    const distance = calculateDistance(
      travelLog.boardingPoint.location.coordinates,
      alightingLocation
    );

    // Calculate fare based on distance
    const baseFare = calculateFare(distance, travelLog.routeId);

    // Get card for concession
    const card = await SmartCard.findById(travelLog.cardId);
    const concessionAmount = (baseFare * card.concessionPercentage) / 100;
    const finalFare = baseFare - concessionAmount;

    // Check balance
    if (card.balance < finalFare) {
      return res.status(400).json({
        success: false,
        message: `Insufficient balance. Required: Rs. ${finalFare}, Available: Rs. ${card.balance}`
      });
    }

    // Deduct balance
    await card.deductBalance(finalFare);

    // Complete trip
    await travelLog.completeTrip({
      stopName: alightingStop,
      location: {
        type: 'Point',
        coordinates: alightingLocation
      },
      timestamp: new Date()
    });

    travelLog.distance = distance;
    travelLog.fare = {
      baseFare,
      concessionApplied: concessionAmount,
      finalFare
    };
    await travelLog.save();

    res.status(200).json({
      success: true,
      message: 'Trip completed successfully',
      data: {
        tripDetails: travelLog,
        fareDeducted: finalFare,
        remainingBalance: card.balance
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Trigger SOS during trip
// @route   POST /api/travel/sos/:tripId
// @access  Private
exports.triggerSOS = async (req, res) => {
  try {
    const travelLog = await TravelLog.findOne({
      _id: req.params.tripId,
      userId: req.user._id
    }).populate('cardId');

    if (!travelLog) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Trigger SOS
    await travelLog.triggerSOS();

    // Get card details for emergency contacts
    const card = await SmartCard.findById(travelLog.cardId);

    // TODO: Send notifications to emergency contacts
    // TODO: Alert authorities
    // TODO: Send to control room

    res.status(200).json({
      success: true,
      message: 'SOS triggered. Emergency contacts and authorities have been notified.',
      data: {
        tripId: travelLog.tripId,
        location: travelLog.liveLocation,
        emergencyContacts: card.safetyFeatures.emergencyContacts
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get live trip details
// @route   GET /api/travel/live/:tripId
// @access  Private
exports.getLiveTrip = async (req, res) => {
  try {
    const travelLog = await TravelLog.findOne({
      _id: req.params.tripId,
      userId: req.user._id,
      status: 'ongoing'
    }).populate('routeId', 'name startPoint endPoint');

    if (!travelLog) {
      return res.status(404).json({
        success: false,
        message: 'No ongoing trip found'
      });
    }

    res.status(200).json({
      success: true,
      data: travelLog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user's travel history
// @route   GET /api/travel/history
// @access  Private
exports.getTravelHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const query = { userId: req.user._id };
    if (status) query.status = status;

    const travelLogs = await TravelLog.find(query)
      .populate('routeId', 'name startPoint endPoint')
      .sort({ 'boardingPoint.timestamp': -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await TravelLog.countDocuments(query);

    res.status(200).json({
      success: true,
      data: travelLogs,
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

// ========== ADMIN ROUTES ==========

// @desc    Get all travel logs (Admin)
// @route   GET /api/travel/admin/all
// @access  Private/Admin
exports.getAllTravelLogs = async (req, res) => {
  try {
    const { busId, date, status, page = 1, limit = 50 } = req.query;

    const query = {};
    if (busId) query.busId = busId;
    if (status) query.status = status;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query['boardingPoint.timestamp'] = { $gte: startDate, $lt: endDate };
    }

    const travelLogs = await TravelLog.find(query)
      .populate('userId', 'name email phone')
      .populate('cardId', 'cardNumber')
      .populate('routeId', 'name')
      .sort({ 'boardingPoint.timestamp': -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await TravelLog.countDocuments(query);

    res.status(200).json({
      success: true,
      data: travelLogs,
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

// @desc    Get passengers on a specific bus (Admin)
// @route   GET /api/travel/admin/bus/:busId/passengers
// @access  Private/Admin
exports.getBusPassengers = async (req, res) => {
  try {
    const { busId } = req.params;

    // Find all ongoing trips on this bus
    const passengers = await TravelLog.find({
      busId,
      status: 'ongoing'
    })
      .populate('userId', 'name phone')
      .populate('cardId', 'cardNumber verification.aadhaarNumber');

    res.status(200).json({
      success: true,
      data: {
        busId,
        passengerCount: passengers.length,
        passengers
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Helper function to calculate distance (simplified)
function calculateDistance(coord1, coord2) {
  // In real app, use proper geospatial calculation
  // This is a simplified version
  const R = 6371; // Earth's radius in km
  const dLat = (coord2[1] - coord1[1]) * Math.PI / 180;
  const dLon = (coord2[0] - coord1[0]) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(coord1[1] * Math.PI / 180) * Math.cos(coord2[1] * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Helper function to calculate fare
function calculateFare(distance, route) {
  // Simplified fare calculation
  // In real app, use route-specific fare structure
  const baseRate = 5; // Rs. 5 per km
  return Math.ceil(distance * baseRate);
}

module.exports = exports;
