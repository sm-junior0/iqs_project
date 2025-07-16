const express = require('express');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { getDashboard } = require('../controllers/trainerDashboardController');

const router = express.Router();
router.use(authenticate, authorize(['trainer']));
router.get('/dashboard', getDashboard);

module.exports = router;
