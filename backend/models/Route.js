const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  routeNumber: {
    type: String,
    required: [true, 'Route number is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  source: {
    type: String,
    required: [true, 'Source is required'],
    trim: true
  },
  destination: {
    type: String,
    required: [true, 'Destination is required'],
    trim: true
  },
  stops: [{
    name: {
      type: String,
      required: true
    },
    sequence: {
      type: Number,
      required: true
    },
    distance: Number
  }],
  distance: {
    type: Number,
    required: [true, 'Distance is required'],
    min: [0, 'Distance cannot be negative']
  },
  fare: {
    type: Number,
    required: [true, 'Fare is required'],
    min: [0, 'Fare cannot be negative']
  },
  discountFares: {
    student: {
      type: Number,
      default: function() { return Math.round(this.fare * 0.5); }
    },
    senior: {
      type: Number,
      default: function() { return Math.round(this.fare * 0.5); }
    },
    disabled: {
      type: Number,
      default: function() { return Math.round(this.fare * 0.3); }
    }
  },
  duration: {
    type: String,
    default: '60 mins'
  },
  busType: {
    type: String,
    enum: ['standard', 'ac', 'luxury'],
    default: 'standard'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  totalSeats: {
    type: Number,
    default: 40
  },
  operatingHours: {
    start: {
      type: String,
      default: '06:00'
    },
    end: {
      type: String,
      default: '22:00'
    }
  }
}, {
  timestamps: true
});

routeSchema.index({ source: 1, destination: 1 });
routeSchema.index({ routeNumber: 1 });

module.exports = mongoose.model('Route', routeSchema);
