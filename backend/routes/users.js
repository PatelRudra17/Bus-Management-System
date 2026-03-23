const express = require('express');
const router = express.Router();
const { 
  getProfile, 
  updateProfile, 
  getMyApplications, 
  getApplicationById,
  getMyPasses,
  getMyPayments,
  markNotificationRead,
  getNotifications,
  deleteAccount
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/applications', getMyApplications);
router.get('/applications/:id', getApplicationById);
router.get('/passes', getMyPasses);
router.get('/payments', getMyPayments);
router.get('/notifications', getNotifications);
router.put('/notifications/:notificationId', markNotificationRead);
router.delete('/account', deleteAccount);

module.exports = router;
