const pool = require('../config/db');

exports.create = (trainer_id, title, location, joining_date, duration) =>
  pool.query(
    'INSERT INTO trainings (trainer_id, title, location, joining_date, duration) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [trainer_id, title, location, joining_date, duration]
  );

exports.getByTrainer = (trainer_id) =>
  pool.query('SELECT * FROM trainings WHERE trainer_id = $1', [trainer_id]);
