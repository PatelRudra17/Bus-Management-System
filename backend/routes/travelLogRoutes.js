const express = require('express');
const router = express.Router();
const {
  startTrip,
  endTrip,
  triggerSOS,
  getLiveTrip,
  getTravelHistory,
  getAllTravelLogs,
  getBusPassengers
} = require('../controllers/travelLogController');
const { protect, authorize } = require('../middleware/auth');

// User routes
router.post('/start', protect, startTrip);
router.put('/end/:tripId', protect, endTrip);
router.post('/sos/:tripId', protect, triggerSOS);
router.get('/live/:tripId', protect, getLiveTrip);
router.get('/history', protect, getTravelHistory);

// Admin routes
router.get('/admin/all', protect, authorize('admin'), getAllTravelLogs);
router.get('/admin/bus/:busId/passengers', protect, authorize('admin'), getBusPassengers);

module.exports = router;
