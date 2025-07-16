const pool = require('../config/db');

exports.getAll = () => 
  pool.query('SELECT * FROM schools');

exports.getByEvaluator = (evaluator_id) =>
  pool.query('SELECT * FROM schools WHERE evaluator_id = $1', [evaluator_id]);

exports.assignEvaluator = (school_id, evaluator_id) =>
  pool.query('UPDATE schools SET evaluator_id = $1 WHERE id = $2', [evaluator_id, school_id]);

exports.updateStatus = (school_id, status) =>
  pool.query('UPDATE schools SET status = $1 WHERE id = $2', [status, school_id]);

exports.getById = (school_id) =>
  pool.query('SELECT * FROM schools WHERE id = $1', [school_id]);

exports.updateCertificatePath = (school_id, certPath) =>
  pool.query('UPDATE schools SET certificate_path = $1 WHERE id = $2', [certPath, school_id]);

exports.createTask = (evaluator_id, school_id, description) =>
  pool.query('INSERT INTO tasks (evaluator_id, school_id, description, status) VALUES ($1, $2, $3, $4) RETURNING *', [evaluator_id, school_id, description, 'pending']);

exports.getTasksByEvaluator = (evaluator_id) =>
  pool.query('SELECT * FROM tasks WHERE evaluator_id = $1 ORDER BY created_at DESC', [evaluator_id]);
