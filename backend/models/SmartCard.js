const mongoose = require('mongoose');

const smartCardSchema = new mongoose.Schema({
  cardNumber: {
    type: String,
    unique: true,
    required: true,
    default: () => 'SC' + Date.now() + Math.random().toString(36).substr(2, 6).toUpperCase()
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // One card per person
  },

  // Identity Verification
  verification: {
    aadhaarNumber: {
      type: String,
      required: [true, 'Aadhaar number is required'],
      unique: true,
      match: [/^\d{12}$/, 'Aadhaar must be 12 digits']
    },
    panNumber: {
      type: String,
      required: [true, 'PAN number is required'],
      unique: true,
      match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format']
    },
    aadhaarVerified: {
      type: Boolean,
      default: false
    },
    panVerified: {
      type: Boolean,
      default: false
    },
    photo: {
      type: String,
      required: true
    },
    verificationDate: Date
  },

  // Card Status
  status: {
    type: String,
    enum: ['pending', 'active', 'blocked', 'suspended', 'expired'],
    default: 'pending'
  },
  issuedDate: {
    type: Date
  },
  expiryDate: {
    type: Date
  },

  // Payment/Balance
  balance: {
    type: Number,
    default: 0,
    min: 0
  },
  autoRecharge: {
    enabled: {
      type: Boolean,
      default: false
    },
    threshold: {
      type: Number,
      default: 50
    },
    amount: {
      type: Number,
      default: 500
    }
  },

  // Concession
  concessionType: {
    type: String,
    enum: ['none', 'student', 'senior', 'disabled', 'women'],
    default: 'none'
  },
  concessionPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  concessionDocument: String,

  // Safety Features
  safetyFeatures: {
    sosEnabled: {
      type: Boolean,
      default: true
    },
    emergencyContacts: [{
      name: String,
      phone: String,
      relationship: String
    }],
    familyTrackingEnabled: {
      type: Boolean,
      default: false
    },
    linkedFamilyMembers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    nightTravelAlert: {
      type: Boolean,
      default: false
    },
    womenOnlyZone: {
      type: Boolean,
      default: false
    }
  },

  // Blacklist (for safety)
  blacklisted: {
    isBlacklisted: {
      type: Boolean,
      default: false
    },
    reason: String,
    blacklistedDate: Date,
    blacklistedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },

  // Statistics
  stats: {
    totalTrips: {
      type: Number,
      default: 0
    },
    totalSpent: {
      type: Number,
      default: 0
    },
    lastUsed: Date
  },

  // Activity Log
  activityLog: [{
    action: {
      type: String,
      enum: ['created', 'activated', 'recharged', 'blocked', 'unblocked', 'updated', 'expired']
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    details: String,
    amount: Number
  }]
}, {
  timestamps: true
});

// Index for faster queries (cardNumber, userId, aadhaarNumber, panNumber already indexed via unique: true)
smartCardSchema.index({ status: 1 });
smartCardSchema.index({ status: 1, expiryDate: 1 }); // Compound index for active card queries

// Pre-save middleware to set expiry date
smartCardSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'active' && !this.expiryDate) {
    this.issuedDate = new Date();
    this.expiryDate = new Date();
    this.expiryDate.setFullYear(this.expiryDate.getFullYear() + 5); // Card valid for 5 years
  }
  next();
});

// Method to check if card is valid
smartCardSchema.methods.isValid = function() {
  return this.status === 'active' &&
         this.expiryDate > new Date() &&
         !this.blacklisted.isBlacklisted;
};

// Method to deduct balance
smartCardSchema.methods.deductBalance = async function(amount) {
  if (this.balance < amount) {
    throw new Error('Insufficient balance');
  }
  this.balance -= amount;
  this.stats.totalSpent += amount;
  this.stats.lastUsed = new Date();
  await this.save();
};

// Method to add balance
smartCardSchema.methods.addBalance = async function(amount) {
  this.balance += amount;
  await this.save();
};

module.exports = mongoose.model('SmartCard', smartCardSchema);
