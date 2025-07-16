const pool = require('../config/db');

exports.create = (school_id, evaluator_id, rating, type, description, document_path) =>
  pool.query(
    'INSERT INTO feedback (school_id, evaluator_id, rating, type, description, document_path) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [school_id, evaluator_id, rating, type, description, document_path]
  );

exports.getBySchool = (school_id) =>
  pool.query('SELECT * FROM feedback WHERE school_id = $1', [school_id]);
