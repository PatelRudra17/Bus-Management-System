const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
  incidentId: {
    type: String,
    unique: true,
    default: () => 'INC' + Date.now() + Math.random().toString(36).substr(2, 6).toUpperCase()
  },

  // Reporting Details
  reportedBy: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    cardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SmartCard'
    },
    reporterType: {
      type: String,
      enum: ['passenger', 'driver', 'conductor', 'admin', 'system'],
      default: 'passenger'
    }
  },

  // Trip Details (if applicable)
  travelLogId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TravelLog'
  },
  busId: String,
  routeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route'
  },

  // Incident Details
  incidentType: {
    type: String,
    enum: [
      'harassment',
      'theft',
      'accident',
      'medical_emergency',
      'misbehavior',
      'fare_evasion',
      'property_damage',
      'safety_concern',
      'other'
    ],
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  description: {
    type: String,
    required: true
  },

  // Time and Location
  incidentTime: {
    type: Date,
    required: true
  },
  location: {
    stopName: String,
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: [Number] // [longitude, latitude]
    }
  },

  // Evidence
  evidence: {
    photos: [String],
    cctvFootage: {
      available: Boolean,
      cameraIds: [String],
      timeRange: {
        start: Date,
        end: Date
      }
    },
    witnesses: [{
      cardId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SmartCard'
      },
      name: String,
      contact: String,
      statement: String
    }]
  },

  // Identified Persons (from bus log)
  identifiedPersons: [{
    cardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SmartCard'
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['suspect', 'witness', 'victim', 'involved']
    },
    aadhaarLinked: String,
    notes: String
  }],

  // Status and Resolution
  status: {
    type: String,
    enum: ['reported', 'under_investigation', 'resolved', 'closed', 'escalated'],
    default: 'reported'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },

  // Investigation
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  investigation: {
    startedAt: Date,
    completedAt: Date,
    findings: String,
    actionTaken: String,
    policeInvolved: {
      type: Boolean,
      default: false
    },
    firNumber: String,
    policeStation: String
  },

  // Resolution
  resolution: {
    resolvedAt: Date,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    outcome: String,
    compensationProvided: {
      type: Boolean,
      default: false
    },
    compensationAmount: Number,
    followUpRequired: {
      type: Boolean,
      default: false
    }
  },

  // Comments/Updates
  updates: [{
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    comment: String,
    statusChanged: String
  }],

  // Notifications sent
  notificationsSent: [{
    to: String, // email or phone
    type: String, // 'email', 'sms', 'push'
    sentAt: Date,
    status: String
  }]

}, {
  timestamps: true
});

// Indexes (incidentId already indexed via unique: true)
incidentSchema.index({ 'reportedBy.userId': 1 });
incidentSchema.index({ travelLogId: 1 });
incidentSchema.index({ status: 1 });
incidentSchema.index({ severity: 1 });
incidentSchema.index({ incidentTime: -1 });
incidentSchema.index({ status: 1, severity: 1 }); // Compound index for filtering

// Middleware to set priority based on severity
incidentSchema.pre('save', function(next) {
  if (this.isModified('severity')) {
    const priorityMap = {
      'low': 'low',
      'medium': 'medium',
      'high': 'high',
      'critical': 'urgent'
    };
    this.priority = priorityMap[this.severity];
  }
  next();
});

module.exports = mongoose.model('Incident', incidentSchema);
