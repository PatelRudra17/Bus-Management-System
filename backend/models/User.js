const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[+]?[0-9]{7,15}$/, 'Please enter a valid phone number (digits only, 7-15 chars)']
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  addresses: [{
    street: String,
    city: String,
    state: String,
    zipCode: String
  }],
  notifications: [{
    title: String,
    message: String,
    type: {
      type: String,
      enum: ['info', 'success', 'warning', 'error'],
      default: 'info'
    },
    read: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  // KYC Fields
  aadhaarNumber: {
    type: String,
    trim: true
  },
  aadhaarVerified: {
    type: Boolean,
    default: false
  },
  panNumber: {
    type: String,
    uppercase: true,
    trim: true
  },
  panVerified: {
    type: Boolean,
    default: false
  },
  kycStatus: {
    type: String,
    enum: ['none', 'partial', 'verified'],
    default: 'none'
  },
  kycOtp: String,
  kycOtpExpire: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, {
  timestamps: true
});

// Indexes for performance (email already indexed via unique: true)
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ role: 1, isActive: 1 }); // Compound index for combined queries

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getSignedJwtToken = function() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not defined');
  }
  return require('jsonwebtoken').sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

module.exports = mongoose.model('User', userSchema);
