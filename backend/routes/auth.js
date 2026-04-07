const express = require('express');
const router = express.Router();
const { register, login, getMe, forgotPassword, resetPassword, updatePassword, logout } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validators } = require('../middleware/validator');

router.post('/register', validators.register, register);
router.post('/login', validators.login, login);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resetToken', resetPassword);
router.put('/update-password', protect, validators.updatePassword, updatePassword);
router.post('/logout', protect, logout);

module.exports = router;
