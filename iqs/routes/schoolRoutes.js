const express = require('express');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const {
  applyAccreditation,
  trackApplication,
  uploadDocs,
  downloadCertificate,
  feedbackForApplication
} = require('../controllers/schoolController');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(authenticate, authorize(['school']));

router.post('/apply', applyAccreditation);
router.get('/track', trackApplication);
router.post('/upload-docs', upload.array('docs'), uploadDocs);
router.get('/download-certificate', downloadCertificate);
router.get('/feedback/:app_id', feedbackForApplication);
router.post('/first-time-apply', upload.fields([
  { name: 'registration_doc', maxCount: 1 },
  { name: 'curriculum_doc', maxCount: 1 }
]), require('../controllers/schoolController').firstTimeApply);

module.exports = router;
