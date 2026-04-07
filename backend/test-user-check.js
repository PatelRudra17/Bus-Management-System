const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log('Connected to MongoDB');
  
  const User = require('./models/User');
  const users = await User.find({}).select('name email role');
  
  console.log('\nRegistered Users:');
  console.log('================');
  users.forEach(user => {
    console.log(`Name: ${user.name}`);
    console.log(`Email: ${user.email}`);
    console.log(`Role: ${user.role}`);
    console.log('---');
  });
  
  if (users.length === 0) {
    console.log('No users found! You need to register first.');
  }
  
  mongoose.connection.close();
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
