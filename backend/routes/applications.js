const express = require('express');
const router = express.Router();
const {
  createApplication,
  approveApplication,
  rejectApplication,
  getApplication,
  renewApplication,
  downloadPass,
  cancelApplication
} = require('../controllers/applicationController');
const { protect, adminOnly } = require('../middleware/auth');
const { validators } = require('../middleware/validator');

router.post('/', protect, validators.createApplication, createApplication);
router.get('/:id', protect, validators.mongoId, getApplication);
router.post('/:id/renew', protect, validators.mongoId, renewApplication);
router.get('/:id/download', protect, validators.mongoId, downloadPass);
router.delete('/:id/cancel', protect, validators.mongoId, cancelApplication);

router.put('/:id/approve', protect, adminOnly, validators.mongoId, approveApplication);
router.put('/:id/reject', protect, adminOnly, validators.mongoId, rejectApplication);

module.exports = router;
