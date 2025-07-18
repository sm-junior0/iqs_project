const pool = require('../config/db');
// const path = require('path'); // No longer needed for Cloudinary

exports.uploadFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const { type, related_id } = req.body;
  // Cloudinary multer-storage exposes req.file.path as the URL
  const fileUrl = req.file.path || req.file.url;

  await pool.query(
    'INSERT INTO files (uploader_id, type, path, related_id) VALUES ($1, $2, $3, $4)',
    [req.user.id, type, fileUrl, related_id || null]
  );

  res.json({ message: 'File uploaded', url: fileUrl });
};

exports.downloadFile = async (req, res) => {
  const { id } = req.params;
  const { rows } = await pool.query('SELECT * FROM files WHERE id = $1', [id]);
  const file = rows[0];

  if (!file) return res.status(404).json({ message: 'File not found' });

  // Instead of downloading, redirect to Cloudinary URL
  return res.redirect(file.path);
};
