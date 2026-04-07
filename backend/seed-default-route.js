const mongoose = require('mongoose');
const Route = require('./models/Route');
require('dotenv').config();

const seedDefaultRoute = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if routes exist
    const routeCount = await Route.countDocuments();
    console.log(`Found ${routeCount} routes in database`);

    if (routeCount === 0) {
      // Create a default route
      const defaultRoute = await Route.create({
        routeName: 'Default City Route',
        routeNumber: 'RT-001',
        source: 'City Center',
        destination: 'Bus Terminal',
        distance: 10,
        duration: 30,
        stops: ['City Center', 'Main Market', 'Railway Station', 'Bus Terminal'],
        fare: {
          general: 20,
          student: 10,
          senior: 10,
          disabled: 6
        },
        schedule: [
          { departureTime: '06:00', arrivalTime: '06:30' },
          { departureTime: '09:00', arrivalTime: '09:30' },
          { departureTime: '12:00', arrivalTime: '12:30' },
          { departureTime: '15:00', arrivalTime: '15:30' },
          { departureTime: '18:00', arrivalTime: '18:30' }
        ],
        status: 'active'
      });

      console.log('✓ Default route created successfully!');
      console.log('Route ID:', defaultRoute._id);
      console.log('Route Name:', defaultRoute.routeName);
    } else {
      console.log('Routes already exist, skipping seed');
      const routes = await Route.find().limit(5);
      console.log('\nExisting routes:');
      routes.forEach(route => {
        console.log(`- ${route.routeName} (${route.routeNumber}) - ID: ${route._id}`);
      });
    }

    await mongoose.connection.close();
    console.log('\nDone!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

seedDefaultRoute();
