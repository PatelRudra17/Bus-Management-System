const mongoose = require('mongoose');
const Route = require('./models/Route');
require('dotenv').config();

const testRoute = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Get the route that the mobile app is trying to use
    const routeId = '69bb146ccbd715778e343b4d';
    const route = await Route.findById(routeId);

    if (route) {
      console.log('\n✓ Route found successfully!');
      console.log('Route ID:', route._id);
      console.log('Route Name:', route.routeName);
      console.log('Route Number:', route.routeNumber);
      console.log('Fare structure:', JSON.stringify(route.fare, null, 2));
    } else {
      console.log('\n✗ Route NOT found!');
      console.log('This is why the app is getting "Bad Request" error');
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

testRoute();
