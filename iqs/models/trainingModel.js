const pool = require('../config/db');

exports.create = (trainer_id, title, session_date, report_path) =>
  pool.query(
    'INSERT INTO trainings (trainer_id, title, session_date, report_path) VALUES ($1, $2, $3, $4) RETURNING *',
    [trainer_id, title, session_date, report_path]
  );

exports.getByTrainer = (trainer_id) =>
  pool.query('SELECT * FROM trainings WHERE trainer_id = $1', [trainer_id]);
