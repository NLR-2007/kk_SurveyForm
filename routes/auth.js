const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

router.post('/login', authController.login);
router.post('/verify-otp', authController.verifyOTP);
router.post('/logout', [verifyToken], authController.logout);

// Admin only routes
router.post('/register', [verifyToken, verifyAdmin], authController.register);

module.exports = router;
