const pool = require('../config/db');

// Evaluator Dashboard: Assigned schools, upload/download docs, reports, visits
exports.getDashboard = async (req, res) => {
  const [mySchools, visits, reports] = await Promise.all([
    pool.query('SELECT * FROM schools WHERE evaluator_id = $1', [req.user.id]),
    pool.query('SELECT * FROM evaluations WHERE evaluator_id = $1', [req.user.id]),
    pool.query('SELECT * FROM evaluations WHERE evaluator_id = $1', [req.user.id]),
  ]);
  res.json({
    mySchools: mySchools.rows,
    visits: visits.rows,
    reports: reports.rows
  });
};
