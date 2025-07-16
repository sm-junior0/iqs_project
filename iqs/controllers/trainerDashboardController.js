const pool = require('../config/db');

// Trainer Dashboard: Sessions, attendance, reports
exports.getDashboard = async (req, res) => {
  const [sessions, attendance, reports] = await Promise.all([
    pool.query('SELECT * FROM trainings WHERE trainer_id = $1', [req.user.id]),
    pool.query(`SELECT attendance.* FROM attendance JOIN trainings ON attendance.session_id = trainings.id WHERE trainings.trainer_id = $1`, [req.user.id]),
    pool.query('SELECT * FROM trainings WHERE trainer_id = $1', [req.user.id]),
  ]);
  res.json({
    sessions: sessions.rows,
    attendance: attendance.rows,
    reports: reports.rows
  });
};
