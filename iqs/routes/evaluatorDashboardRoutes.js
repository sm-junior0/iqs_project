const express = require('express');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { getDashboard } = require('../controllers/evaluatorDashboardController');

const router = express.Router();
router.use(authenticate, authorize(['evaluator']));
router.get('/dashboard', getDashboard);

module.exports = router;
