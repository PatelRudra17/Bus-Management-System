const mongoose = require('mongoose');

const travelLogSchema = new mongoose.Schema({
  cardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SmartCard',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Trip Details
  tripId: {
    type: String,
    unique: true,
    default: () => 'TRIP' + Date.now() + Math.random().toString(36).substr(2, 6).toUpperCase()
  },
  busId: {
    type: String,
    required: true
  },
  routeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: true
  },

  // Boarding Information
  boardingPoint: {
    stopName: String,
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: '2dsphere'
      }
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now
    }
  },

  // Alighting Information
  alightingPoint: {
    stopName: String,
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number] // [longitude, latitude]
      }
    },
    timestamp: Date
  },

  // Trip Status
  status: {
    type: String,
    enum: ['ongoing', 'completed', 'cancelled'],
    default: 'ongoing'
  },

  // Fare Calculation
  fare: {
    baseFare: {
      type: Number,
      required: true
    },
    concessionApplied: {
      type: Number,
      default: 0
    },
    finalFare: {
      type: Number,
      required: true
    }
  },

  // Safety & Tracking
  safetyData: {
    isNightTravel: {
      type: Boolean,
      default: false
    },
    occupancy: {
      type: String,
      enum: ['low', 'medium', 'high', 'overcrowded']
    },
    sosTriggered: {
      type: Boolean,
      default: false
    },
    sosTimestamp: Date,
    emergencyAlertSent: {
      type: Boolean,
      default: false
    }
  },

  // Linked CCTV footage (for incident management)
  cctvFootage: {
    available: {
      type: Boolean,
      default: false
    },
    cameraIds: [String],
    footageRetainedUntil: Date
  },

  // Distance and Duration
  distance: {
    type: Number, // in kilometers
    default: 0
  },
  duration: {
    type: Number, // in minutes
    default: 0
  },

  // Real-time Updates
  liveLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: [Number]
  },
  etaToDestination: Date,

  // Additional Info
  notes: String,
  incidentReported: {
    type: Boolean,
    default: false
  },
  incidentDetails: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Incident'
  }

}, {
  timestamps: true
});

// Indexes for efficient queries (tripId already indexed via unique: true)
travelLogSchema.index({ cardId: 1, 'boardingPoint.timestamp': -1 });
travelLogSchema.index({ userId: 1, 'boardingPoint.timestamp': -1 });
travelLogSchema.index({ busId: 1, 'boardingPoint.timestamp': -1 });
travelLogSchema.index({ status: 1 });
travelLogSchema.index({ 'boardingPoint.timestamp': -1 });

// Calculate duration when trip is completed
travelLogSchema.pre('save', function(next) {
  if (this.status === 'completed' && this.alightingPoint.timestamp && this.boardingPoint.timestamp) {
    this.duration = Math.round((this.alightingPoint.timestamp - this.boardingPoint.timestamp) / (1000 * 60));
  }

  // Check if night travel (between 9 PM and 6 AM)
  const boardingHour = new Date(this.boardingPoint.timestamp).getHours();
  this.safetyData.isNightTravel = boardingHour >= 21 || boardingHour < 6;

  next();
});

// Method to complete trip
travelLogSchema.methods.completeTrip = async function(alightingData) {
  this.alightingPoint = alightingData;
  this.status = 'completed';
  await this.save();
};

// Method to trigger SOS
travelLogSchema.methods.triggerSOS = async function() {
  this.safetyData.sosTriggered = true;
  this.safetyData.sosTimestamp = new Date();
  this.safetyData.emergencyAlertSent = true;
  await this.save();
};

module.exports = mongoose.model('TravelLog', travelLogSchema);
