/**
 * Usage: node scripts/makeAdmin.js <email>
 * Promotes an existing user to admin role.
 */
const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');

const email = process.argv[2];
if (!email) {
  console.error('Usage: node scripts/makeAdmin.js <email>');
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/buspassdb')
  .then(async () => {
    const user = await User.findOne({ email });
    if (!user) {
      console.error(`No user found with email: ${email}`);
      process.exit(1);
    }
    user.role = 'admin';
    await user.save();
    console.log(`✅ ${email} is now an admin`);
    process.exit(0);
  })
  .catch(err => { console.error(err); process.exit(1); });
