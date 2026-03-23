const express = require('express');
const router = express.Router();
const { 
  getDashboardStats,
  getAllUsers,
  getUserDetails,
  updateUser,
  deleteUser,
  getAllApplications,
  exportApplications,
  getReports,
  createAdmin
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);
router.use(adminOnly);

router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.get('/users/:id', getUserDetails);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.post('/users', createAdmin);

router.get('/applications', getAllApplications);
router.get('/applications/export', exportApplications);

router.get('/reports', getReports);

module.exports = router;
