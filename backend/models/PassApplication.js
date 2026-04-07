const mongoose = require('mongoose');

const passApplicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  applicationId: {
    type: String,
    unique: true,
    default: () => 'BP' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase()
  },
  routeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: [true, 'Route is required']
  },
  passType: {
    type: String,
    enum: ['student', 'senior', 'general', 'disabled'],
    required: [true, 'Pass type is required']
  },
  duration: {
    type: String,
    enum: ['1month', '3months', '6months', '12months'],
    required: [true, 'Duration is required']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
    default: Date.now
  },
  endDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'expired', 'cancelled'],
    default: 'pending'
  },
  documents: {
    idProof: {
      type: String,
      required: [true, 'ID proof is required']
    },
    photo: {
      type: String,
      required: [true, 'Photo is required']
    },
    additionalDocuments: [String]
  },
  remarks: {
    type: String,
    default: ''
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date,
  qrCode: {
    type: String
  },
  passNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  activityLog: [{
    action: String,
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    details: String
  }]
}, {
  timestamps: true
});

passApplicationSchema.pre('save', function(next) {
  const durationMap = {
    '1month': 30,
    '3months': 90,
    '6months': 180,
    '12months': 365
  };
  
  if (this.isModified('startDate') || this.isModified('duration')) {
    const days = durationMap[this.duration] || 30;
    this.endDate = new Date(this.startDate);
    this.endDate.setDate(this.endDate.getDate() + days);
  }
  
  if (this.isModified('status') && this.status === 'approved' && !this.passNumber) {
    this.passNumber = 'PASS' + Date.now() + Math.random().toString(36).substr(2, 4).toUpperCase();
  }
  
  next();
});

// Indexes (applicationId and passNumber already indexed via unique: true)
passApplicationSchema.index({ userId: 1, status: 1 });
passApplicationSchema.index({ createdAt: -1 });
passApplicationSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('PassApplication', passApplicationSchema);
