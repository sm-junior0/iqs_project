const pool = require('../config/db');
const path = require('path');

exports.uploadFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const { type, related_id } = req.body;
  const { filename, path: filepath } = req.file;

  await pool.query(
    'INSERT INTO files (uploader_id, type, path, related_id) VALUES ($1, $2, $3, $4)',
    [req.user.id, type, filepath, related_id || null]
  );

  res.json({ message: 'File uploaded', filename });
};

exports.downloadFile = async (req, res) => {
  const { id } = req.params;
  const { rows } = await pool.query('SELECT * FROM files WHERE id = $1', [id]);
  const file = rows[0];

  if (!file) return res.status(404).json({ message: 'File not found' });

  res.download(path.resolve(file.path));
};
