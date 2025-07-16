const express = require('express');
const {
  getDashboard,
  sendMessage,
  getCountries,
  getSchools,
  getEvaluators,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getReports,
  getReportById,
  deleteReportById,
  downloadReportById,
  getSettings,
  updateSettings,
  assignEvaluator,
  changeStatus,
  addSchool,
  addEvaluator,
  addTrainer,
  getNewApplications,
  assignTask
} = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authenticate, authorize(['admin']));

router.get('/dashboard', getDashboard);
router.get('/countries', getCountries);
router.get('/schools', getSchools);
router.get('/evaluators', getEvaluators);
router.get('/users', getUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.post('/message', sendMessage);
router.post('/assign-evaluator', assignEvaluator);
router.post('/change-status', changeStatus);
router.post('/settings', updateSettings);
router.get('/reports', getReports);
router.get('/reports/:id', getReportById);
router.delete('/reports/:id', deleteReportById);
router.get('/reports/:id/download', downloadReportById);
router.get('/settings', getSettings);
router.put('/settings', updateSettings);
router.post('/add-school', addSchool);
router.post('/add-evaluator', addEvaluator);
router.post('/add-trainer', addTrainer);
router.get('/new-applications', getNewApplications);
router.post('/assign-task', assignTask);

module.exports = router;