const express = require('express');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { manageSessions, listSessions, trackAttendance, uploadTrainingReport, getSession, updateSession, deleteSession } = require('../controllers/trainerController');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(authenticate, authorize(['trainer']));

router.post('/manage-session', upload.single('file'), manageSessions);
router.get('/sessions', listSessions);
router.get('/sessions/:id', getSession);
router.put('/sessions/:id', upload.single('file'), updateSession);
router.delete('/sessions/:id', deleteSession);
router.post('/track-attendance', upload.single('file'), trackAttendance);
router.post('/upload-report', uploadTrainingReport);

module.exports = router;
