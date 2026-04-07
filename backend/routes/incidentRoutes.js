const express = require('express');
const router = express.Router();
const {
  reportIncident,
  getMyIncidents,
  getIncidentDetails,
  addWitnessStatement,
  getAllIncidents,
  assignIncident,
  updateIncidentStatus,
  identifyPersons,
  getIncidentStatistics
} = require('../controllers/incidentController');
const { protect, authorize } = require('../middleware/auth');

// User routes
router.post('/report', protect, reportIncident);
router.get('/my-reports', protect, getMyIncidents);
router.get('/:id', protect, getIncidentDetails);
router.post('/:id/witness', protect, addWitnessStatement);

// Admin routes
router.get('/admin/all', protect, authorize('admin'), getAllIncidents);
router.put('/admin/:id/assign', protect, authorize('admin'), assignIncident);
router.put('/admin/:id/status', protect, authorize('admin'), updateIncidentStatus);
router.post('/admin/:id/identify', protect, authorize('admin'), identifyPersons);
router.get('/admin/statistics', protect, authorize('admin'), getIncidentStatistics);

module.exports = router;
