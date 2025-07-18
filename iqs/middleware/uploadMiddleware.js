const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: "dxbq9zjeh",
  api_key:"437796137469585",
  api_secret: "Dxqe3VuoB_Z8hhN1iZ8HUMRjCcI",
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    resource_type: 'raw', 
    folder: 'iqs_uploads', // Change folder name as needed
    format: async (req, file) => 'pdf', // or use file.mimetype.split('/')[1] for dynamic
    public_id: (req, file) => `${Date.now()}-${Math.round(Math.random() * 1e9)}`,
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    cb(null, true); // accept all files, or customize for PDF, DOCX etc.
  }
});

module.exports = upload;
