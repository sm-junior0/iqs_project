const pool = require('../config/db');

// List sessions
exports.listSessions = async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM trainings WHERE trainer_id = $1', [req.user.id]);
  res.json({ sessions: rows });
};

// Track attendance and submit a report file
exports.trackAttendance = async (req, res) => {
  const { session_id } = req.body;
  if (!session_id || !req.file) return res.status(400).json({ message: 'Missing session_id or file' });
  // Check if the session exists and belongs to the trainer
  const { rows } = await pool.query('SELECT * FROM trainings WHERE id = $1 AND trainer_id = $2', [session_id, req.user.id]);
  if (rows.length === 0) {
    return res.status(404).json({ message: 'Session not found or not authorized' });
  }
  // Insert attendance record
  await pool.query(
    'INSERT INTO attendance (session_id, report_path) VALUES ($1, $2)',
    [session_id, req.file.path]
  );
  res.json({ message: 'Attendance report submitted' });
};

// Upload training report
exports.uploadTrainingReport = async (req, res) => {
  const { session_id, report_path } = req.body;
  if (!session_id || !report_path) return res.status(400).json({ message: 'Missing fields' });
  await pool.query('UPDATE trainings SET report_path = $1 WHERE id = $2', [report_path, session_id]);
  res.json({ message: 'Training report uploaded' });
};

exports.manageSessions = async (req, res) => {
  const { title, session_date } = req.body;
  if (!title || !session_date || !req.file) {
    return res.status(400).json({ message: 'Missing title, session_date, or file' });
  }
  await pool.query(
    'INSERT INTO trainings (trainer_id, title, session_date, report_path) VALUES ($1, $2, $3, $4)',
    [req.user.id, title, session_date, req.file.path]
  );
  res.json({ message: 'Session created' });
};

// View a single session by ID
exports.getSession = async (req, res) => {
  const { id } = req.params;
  const { rows } = await pool.query('SELECT * FROM trainings WHERE id = $1 AND trainer_id = $2', [id, req.user.id]);
  if (rows.length === 0) return res.status(404).json({ message: 'Session not found' });
  res.json({ session: rows[0] });
};

// Update a session by ID
exports.updateSession = async (req, res) => {
  const { id } = req.params;
  const { title, session_date } = req.body;
  if (!title || !session_date || !req.file) {
    return res.status(400).json({ message: 'Missing title, session_date, or file' });
  }
  const { rowCount } = await pool.query(
    'UPDATE trainings SET title = $1, session_date = $2, report_path = $3 WHERE id = $4 AND trainer_id = $5',
    [title, session_date, req.file.path, id, req.user.id]
  );
  if (rowCount === 0) return res.status(404).json({ message: 'Session not found or not authorized' });
  res.json({ message: 'Session updated' });
};

// Delete a session by ID
exports.deleteSession = async (req, res) => {
  const { id } = req.params;
  const { rowCount } = await pool.query('DELETE FROM trainings WHERE id = $1 AND trainer_id = $2', [id, req.user.id]);
  if (rowCount === 0) return res.status(404).json({ message: 'Session not found or not authorized' });
  res.json({ message: 'Session deleted' });
};
