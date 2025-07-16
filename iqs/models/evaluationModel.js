const pool = require('../config/db');

exports.create = (school_id, evaluator_id, report_path, visit_date) =>
  pool.query(
    'INSERT INTO evaluations (school_id, evaluator_id, report_path, visit_date) VALUES ($1, $2, $3, $4) RETURNING *',
    [school_id, evaluator_id, report_path, visit_date]
  );

exports.getBySchool = (school_id) =>
  pool.query('SELECT * FROM evaluations WHERE school_id = $1', [school_id]);
