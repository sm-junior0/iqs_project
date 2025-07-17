const express = require('express');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { 
  manageSessions, 
  listSessions, 
  trackAttendance, 
  uploadTrainingReport, 
  getSession, 
  updateSession, 
  deleteSession, 
  getProfile, 
  updateProfile 
} = require('../controllers/trainerController');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(authenticate, authorize(['trainer']));

// Update manage-session to require only title, location, joining_date, duration
// No file upload required for session creation
router.post('/manage-session', require('../controllers/trainerController').manageSessions);
router.get('/sessions', listSessions);
router.get('/sessions/:id', getSession);
// Update PUT /sessions/:id to not require file upload
router.put('/sessions/:id', require('../controllers/trainerController').updateSession);
router.delete('/sessions/:id', deleteSession);
router.post('/track-attendance', upload.single('file'), trackAttendance);
router.post('/upload-report', uploadTrainingReport);

// Add endpoints for reports
router.get('/reports', require('../controllers/trainerController').listReports);
router.get('/reports/:id', require('../controllers/trainerController').getReport);
router.delete('/reports/:id', require('../controllers/trainerController').deleteReport);
router.get('/reports/:id/download', require('../controllers/trainerController').downloadReport);

// Attendance report endpoints
router.get('/attendance/:id', require('../controllers/trainerController').getAttendance);
router.put('/attendance/:id', upload.single('file'), require('../controllers/trainerController').updateAttendance);
router.delete('/attendance/:id', require('../controllers/trainerController').deleteAttendance);

// List all attendance records for the trainer
router.get('/attendance', require('../controllers/trainerController').listAttendance);
// Get attendance statistics for charts
router.get('/attendance-stats', require('../controllers/trainerController').getAttendanceStats);

// Trainer profile endpoints
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

module.exports = router;
