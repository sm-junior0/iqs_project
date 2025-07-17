const pool = require('../config/db');

// School Dashboard: Applications, docs, status, cert, feedback
exports.getDashboard = async (req, res) => {
  console.log('School dashboard accessed by user:', req.user);
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'Unauthorized: user not found in request' });
  }
  try {
    const [applications, docs, feedbacks, certificate, school] = await Promise.all([
      pool.query('SELECT * FROM applications WHERE school_id = $1', [req.user.id]),
      pool.query('SELECT * FROM school_docs WHERE school_id = $1', [req.user.id]),
      pool.query('SELECT * FROM feedback WHERE school_id = $1', [req.user.id]),
      pool.query('SELECT certificate_path FROM schools WHERE id = $1', [req.user.id]),
      pool.query('SELECT name, country FROM schools WHERE id = $1', [req.user.id]),
    ]);
    res.json({
      applications: applications.rows,
      docs: docs.rows,
      feedbacks: feedbacks.rows,
      certificate: certificate.rows[0]?.certificate_path || null,
      school: school.rows[0] || null
    });
  } catch (err) {
    console.error('School dashboard error:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};
