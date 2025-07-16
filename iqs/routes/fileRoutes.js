const express = require('express');
const { authenticate } = require('../middleware/authMiddleware');
const { uploadFile, downloadFile } = require('../controllers/fileController');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Upload file (any authenticated user)
router.post('/upload', authenticate, upload.single('file'), uploadFile);

// Download file by ID
router.get('/download/:id', authenticate, downloadFile);

module.exports = router;
