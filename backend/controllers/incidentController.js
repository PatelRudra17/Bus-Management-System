const Incident = require('../models/Incident');
const TravelLog = require('../models/TravelLog');
const SmartCard = require('../models/SmartCard');

// @desc    Report an incident
// @route   POST /api/incidents/report
// @access  Private
exports.reportIncident = async (req, res) => {
  try {
    const {
      travelLogId,
      busId,
      routeId,
      incidentType,
      severity,
      description,
      incidentTime,
      location,
      photos
    } = req.body;

    // Get user's card
    const card = await SmartCard.findOne({ userId: req.user._id });

    const incident = await Incident.create({
      reportedBy: {
        userId: req.user._id,
        cardId: card ? card._id : null,
        reporterType: 'passenger'
      },
      travelLogId,
      busId,
      routeId,
      incidentType,
      severity: severity || 'medium',
      description,
      incidentTime: incidentTime || new Date(),
      location,
      evidence: {
        photos: photos || []
      }
    });

    // If travel log provided, mark it as having incident
    if (travelLogId) {
      await TravelLog.findByIdAndUpdate(travelLogId, {
        incidentReported: true,
        incidentDetails: incident._id
      });
    }

    res.status(201).json({
      success: true,
      message: 'Incident reported successfully. Authorities have been notified.',
      data: incident
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user's reported incidents
// @route   GET /api/incidents/my-reports
// @access  Private
exports.getMyIncidents = async (req, res) => {
  try {
    const incidents = await Incident.find({ 'reportedBy.userId': req.user._id })
      .populate('routeId', 'name')
      .populate('travelLogId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: incidents
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get incident details
// @route   GET /api/incidents/:id
// @access  Private
exports.getIncidentDetails = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id)
      .populate('reportedBy.userId', 'name email phone')
      .populate('routeId', 'name')
      .populate('travelLogId')
      .populate('assignedTo', 'name email')
      .populate('identifiedPersons.cardId')
      .populate('identifiedPersons.userId', 'name email phone');

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: 'Incident not found'
      });
    }

    // Check if user is authorized to view
    if (
      incident.reportedBy.userId.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this incident'
      });
    }

    res.status(200).json({
      success: true,
      data: incident
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add witness statement
// @route   POST /api/incidents/:id/witness
// @access  Private
exports.addWitnessStatement = async (req, res) => {
  try {
    const { statement } = req.body;

    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: 'Incident not found'
      });
    }

    const card = await SmartCard.findOne({ userId: req.user._id });

    incident.evidence.witnesses.push({
      cardId: card ? card._id : null,
      name: req.user.name,
      contact: req.user.phone,
      statement
    });

    await incident.save();

    res.status(200).json({
      success: true,
      message: 'Witness statement added',
      data: incident
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ========== ADMIN ROUTES ==========

// @desc    Get all incidents (Admin)
// @route   GET /api/incidents/admin/all
// @access  Private/Admin
exports.getAllIncidents = async (req, res) => {
  try {
    const { status, severity, type, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (severity) query.severity = severity;
    if (type) query.incidentType = type;

    const incidents = await Incident.find(query)
      .populate('reportedBy.userId', 'name email phone')
      .populate('routeId', 'name')
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Incident.countDocuments(query);

    res.status(200).json({
      success: true,
      data: incidents,
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

// @desc    Assign incident to investigator (Admin)
// @route   PUT /api/incidents/admin/:id/assign
// @access  Private/Admin
exports.assignIncident = async (req, res) => {
  try {
    const { assignedTo } = req.body;

    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: 'Incident not found'
      });
    }

    incident.assignedTo = assignedTo;
    incident.status = 'under_investigation';
    incident.investigation.startedAt = new Date();

    incident.updates.push({
      updatedBy: req.user._id,
      comment: `Incident assigned to investigator`,
      statusChanged: 'under_investigation'
    });

    await incident.save();

    res.status(200).json({
      success: true,
      message: 'Incident assigned successfully',
      data: incident
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update incident status (Admin)
// @route   PUT /api/incidents/admin/:id/status
// @access  Private/Admin
exports.updateIncidentStatus = async (req, res) => {
  try {
    const { status, comment, findings, actionTaken, policeInvolved, firNumber } = req.body;

    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: 'Incident not found'
      });
    }

    incident.status = status;

    if (findings) incident.investigation.findings = findings;
    if (actionTaken) incident.investigation.actionTaken = actionTaken;
    if (policeInvolved !== undefined) incident.investigation.policeInvolved = policeInvolved;
    if (firNumber) incident.investigation.firNumber = firNumber;

    if (status === 'resolved' || status === 'closed') {
      incident.investigation.completedAt = new Date();
      incident.resolution.resolvedAt = new Date();
      incident.resolution.resolvedBy = req.user._id;
    }

    incident.updates.push({
      updatedBy: req.user._id,
      comment: comment || `Status updated to ${status}`,
      statusChanged: status
    });

    await incident.save();

    res.status(200).json({
      success: true,
      message: 'Incident status updated',
      data: incident
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Identify persons involved (Admin)
// @route   POST /api/incidents/admin/:id/identify
// @access  Private/Admin
exports.identifyPersons = async (req, res) => {
  try {
    const { travelLogId } = req.body;

    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: 'Incident not found'
      });
    }

    // Find all passengers on the bus during incident time
    const incidentTime = incident.incidentTime;
    const timeWindow = 30 * 60 * 1000; // 30 minutes window

    const passengersOnBus = await TravelLog.find({
      busId: incident.busId,
      'boardingPoint.timestamp': {
        $lte: new Date(incidentTime.getTime() + timeWindow)
      },
      $or: [
        { status: 'ongoing' },
        {
          'alightingPoint.timestamp': {
            $gte: new Date(incidentTime.getTime() - timeWindow)
          }
        }
      ]
    })
      .populate('cardId')
      .populate('userId');

    // Add identified persons
    incident.identifiedPersons = passengersOnBus.map(log => ({
      cardId: log.cardId._id,
      userId: log.userId._id,
      role: 'involved',
      aadhaarLinked: log.cardId.verification.aadhaarNumber,
      notes: `On bus ${incident.busId} during incident`
    }));

    incident.updates.push({
      updatedBy: req.user._id,
      comment: `${passengersOnBus.length} persons identified from bus logs`
    });

    await incident.save();

    res.status(200).json({
      success: true,
      message: `${passengersOnBus.length} persons identified`,
      data: incident.identifiedPersons
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get incident statistics (Admin)
// @route   GET /api/incidents/admin/statistics
// @access  Private/Admin
exports.getIncidentStatistics = async (req, res) => {
  try {
    const totalIncidents = await Incident.countDocuments();
    const pendingIncidents = await Incident.countDocuments({ status: 'reported' });
    const underInvestigation = await Incident.countDocuments({ status: 'under_investigation' });
    const resolvedIncidents = await Incident.countDocuments({ status: 'resolved' });

    const incidentsByType = await Incident.aggregate([
      { $group: { _id: '$incidentType', count: { $sum: 1 } } }
    ]);

    const incidentsBySeverity = await Incident.aggregate([
      { $group: { _id: '$severity', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalIncidents,
        pendingIncidents,
        underInvestigation,
        resolvedIncidents,
        incidentsByType,
        incidentsBySeverity
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
