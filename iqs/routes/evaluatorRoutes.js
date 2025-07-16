const express = require('express');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { mySchools, uploadReport, visitHistory, reportsForSchool, deleteReport, downloadReport, submitSchoolFeedback, getMyTasks } = require('../controllers/evaluatorController');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(authenticate, authorize(['evaluator']));

router.get('/my-schools', mySchools);
router.post('/upload-report', authenticate, authorize(['evaluator']), upload.single('file'), require('../controllers/evaluatorController').uploadReport);
router.get('/visit-history', visitHistory);
router.get('/reports/:school_id', reportsForSchool);
router.get('/my-tasks', authenticate, authorize(['evaluator']), getMyTasks);
router.post('/upload', authenticate, authorize(['evaluator']), upload.single('file'), require('../controllers/evaluatorController').uploadSchoolDoc);
router.get('/download', authenticate, authorize(['evaluator']), require('../controllers/evaluatorController').downloadSchoolDocs);
router.get('/download/:doc_id', authenticate, authorize(['evaluator']), require('../controllers/evaluatorController').downloadSchoolDocById);

// Evaluator submits feedback to a school
router.post('/schools/:schoolId/feedback', upload.single('supportingDocument'), submitSchoolFeedback);

// Delete a report by ID (only if evaluator owns it)
router.delete('/report/:id', deleteReport);
// Download a report by ID (only if evaluator owns it)
router.get('/report/download/:id', downloadReport);

module.exports = router;
