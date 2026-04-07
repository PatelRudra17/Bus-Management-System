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
const { validators } = require('../middleware/validator');

router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', validators.updateProfile, updateProfile);
router.get('/applications', validators.pagination, getMyApplications);
router.get('/applications/:id', validators.mongoId, getApplicationById);
router.get('/passes', validators.pagination, getMyPasses);
router.get('/payments', validators.pagination, getMyPayments);
router.get('/notifications', validators.pagination, getNotifications);
router.put('/notifications/:notificationId', validators.mongoId, markNotificationRead);
router.delete('/account', deleteAccount);

module.exports = router;
