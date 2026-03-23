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
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/auth');

router.post('/', protect, createApplication);
router.get('/:id', protect, getApplication);
router.post('/:id/renew', protect, renewApplication);
router.get('/:id/download', protect, downloadPass);
router.delete('/:id/cancel', protect, cancelApplication);

router.put('/:id/approve', protect, adminOnly, approveApplication);
router.put('/:id/reject', protect, adminOnly, rejectApplication);

module.exports = router;
