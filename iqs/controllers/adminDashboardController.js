const pool = require('../config/db');

// Admin Dashboard: Show requests, evaluators, evaluations, new apps, settings
exports.getDashboard = async (req, res) => {
  const [schools, evaluators, applications, evaluations, settings] = await Promise.all([
    pool.query('SELECT * FROM schools'),
    pool.query("SELECT * FROM users WHERE role = 'evaluator'"),
    pool.query('SELECT * FROM applications'),
    pool.query('SELECT * FROM evaluations'),
    pool.query('SELECT * FROM settings'),
  ]);
  res.json({
    schools: schools.rows,
    evaluators: evaluators.rows,
    applications: applications.rows,
    evaluations: evaluations.rows,
    settings: settings.rows
  });
};
