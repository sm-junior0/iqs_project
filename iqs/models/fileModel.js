const pool = require('../config/db');

exports.create = (uploader_id, type, path, related_id) =>
  pool.query(
    'INSERT INTO files (uploader_id, type, path, related_id) VALUES ($1, $2, $3, $4) RETURNING *',
    [uploader_id, type, path, related_id]
  );

exports.getById = (id) =>
  pool.query('SELECT * FROM files WHERE id = $1', [id]);
