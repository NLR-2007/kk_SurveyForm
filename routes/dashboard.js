const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// Dashboard endpoints require Admin rights
router.use([verifyToken, verifyAdmin]);

router.get('/stats', dashboardController.getDashboardStats);
router.get('/charts', dashboardController.getAnalyticsCharts);

module.exports = router;
