const express = require('express');
const router = express.Router();
const { 
  createRoute, 
  getAllRoutes, 
  getRoute, 
  updateRoute, 
  deleteRoute,
  updateFare,
  searchRoutes
} = require('../controllers/routeController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/search', searchRoutes);
router.get('/', getAllRoutes);
router.get('/:id', getRoute);

router.post('/', protect, adminOnly, createRoute);
router.put('/:id', protect, adminOnly, updateRoute);
router.put('/:id/fare', protect, adminOnly, updateFare);
router.delete('/:id', protect, adminOnly, deleteRoute);

module.exports = router;
