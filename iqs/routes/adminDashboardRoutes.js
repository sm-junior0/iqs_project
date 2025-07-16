const express = require('express');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { getDashboard } = require('../controllers/adminDashboardController');

const router = express.Router();
router.use(authenticate, authorize(['admin']));
router.get('/dashboard', getDashboard);

module.exports = router;
