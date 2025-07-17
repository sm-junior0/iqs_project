const pool = require('../config/db');
const path = require('path');
const fs = require('fs');

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

// Update manageSessions to only require title, location, joining_date, duration
exports.manageSessions = async (req, res) => {
  try {
    const { title, location, joining_date, duration } = req.body;
    if (!title || !location || !joining_date || !duration) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const { rows } = await pool.query(
      'INSERT INTO trainings (trainer_id, title, location, joining_date, duration) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.user.id, title, location, joining_date, duration]
    );
    res.status(201).json({ session: rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create session', error: err.message });
  }
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
  const { title, location, joining_date, duration } = req.body;
  if (!title || !location || !joining_date || !duration) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  try {
    const { rows } = await pool.query(
      'UPDATE trainings SET title = $1, location = $2, joining_date = $3, duration = $4 WHERE id = $5 AND trainer_id = $6 RETURNING *',
      [title, location, joining_date, duration, id, req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Session not found or not authorized' });
    res.json({ session: rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update session', error: err.message });
  }
};

// Delete a session by ID
exports.deleteSession = async (req, res) => {
  const { id } = req.params;
  const { rowCount } = await pool.query('DELETE FROM trainings WHERE id = $1 AND trainer_id = $2', [id, req.user.id]);
  if (rowCount === 0) return res.status(404).json({ message: 'Session not found or not authorized' });
  res.json({ message: 'Session deleted' });
};

// List all uploaded reports for the trainer
exports.listReports = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM trainings WHERE trainer_id = $1 AND report_path IS NOT NULL', [req.user.id]);
    res.json({ reports: rows });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch reports', error: err.message });
  }
};

// Get a single report by ID (if owned by trainer)
exports.getReport = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM trainings WHERE id = $1 AND trainer_id = $2 AND report_path IS NOT NULL', [id, req.user.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Report not found' });
    res.json({ report: rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch report', error: err.message });
  }
};

// Delete a report by ID (if owned by trainer)
exports.deleteReport = async (req, res) => {
  const { id } = req.params;
  try {
    // Only allow delete if trainer owns the report
    const { rowCount } = await pool.query('DELETE FROM trainings WHERE id = $1 AND trainer_id = $2 AND report_path IS NOT NULL', [id, req.user.id]);
    if (rowCount === 0) return res.status(404).json({ message: 'Report not found or not authorized' });
    res.json({ message: 'Report deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete report', error: err.message });
  }
};

// Download a report file by ID (if owned by trainer)
exports.downloadReport = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query('SELECT report_path FROM trainings WHERE id = $1 AND trainer_id = $2 AND report_path IS NOT NULL', [id, req.user.id]);
    if (rows.length === 0 || !rows[0].report_path) return res.status(404).json({ message: 'Report not found or not authorized' });
    const filePath = path.resolve(rows[0].report_path);
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'File not found' });
    res.download(filePath);
  } catch (err) {
    res.status(500).json({ message: 'Failed to download report', error: err.message });
  }
};

// Attendance report endpoints
exports.getAttendance = async (req, res) => {
  const { id } = req.params;
  try {
    // Join attendance and trainings to check trainer ownership
    const { rows } = await pool.query(
      `SELECT attendance.* FROM attendance JOIN trainings ON attendance.session_id = trainings.id WHERE attendance.id = $1 AND trainings.trainer_id = $2`,
      [id, req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Attendance report not found or not authorized' });
    res.json({ attendance: rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch attendance report', error: err.message });
  }
};

exports.updateAttendance = async (req, res) => {
  const { id } = req.params;
  try {
    // Check ownership
    const { rows } = await pool.query(
      `SELECT attendance.*, trainings.trainer_id FROM attendance JOIN trainings ON attendance.session_id = trainings.id WHERE attendance.id = $1 AND trainings.trainer_id = $2`,
      [id, req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Attendance report not found or not authorized' });
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    // Update report_path
    await pool.query('UPDATE attendance SET report_path = $1 WHERE id = $2', [req.file.path, id]);
    res.json({ message: 'Attendance report updated', report_path: req.file.path });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update attendance report', error: err.message });
  }
};

exports.deleteAttendance = async (req, res) => {
  const { id } = req.params;
  try {
    // Check ownership
    const { rows } = await pool.query(
      `SELECT attendance.id FROM attendance JOIN trainings ON attendance.session_id = trainings.id WHERE attendance.id = $1 AND trainings.trainer_id = $2`,
      [id, req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Attendance report not found or not authorized' });
    await pool.query('DELETE FROM attendance WHERE id = $1', [id]);
    res.json({ message: 'Attendance report deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete attendance report', error: err.message });
  }
};

// List all attendance records for the trainer
exports.listAttendance = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT attendance.* FROM attendance JOIN trainings ON attendance.session_id = trainings.id WHERE trainings.trainer_id = $1`,
      [req.user.id]
    );
    res.json({ attendance: rows });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch attendance records', error: err.message });
  }
};

// Get attendance statistics for charts
exports.getAttendanceStats = async (req, res) => {
  try {
    // Get monthly attendance counts for the current year
    const currentYear = new Date().getFullYear();
    const { rows } = await pool.query(
      `SELECT 
        EXTRACT(MONTH FROM trainings.joining_date) as month,
        COUNT(attendance.id) as attendance_count
      FROM trainings 
      LEFT JOIN attendance ON trainings.id = attendance.session_id 
      WHERE trainings.trainer_id = $1 
        AND EXTRACT(YEAR FROM trainings.joining_date) = $2
      GROUP BY EXTRACT(MONTH FROM trainings.joining_date)
      ORDER BY month`,
      [req.user.id, currentYear]
    );
    
    // Create array with all 12 months, defaulting to 0 for months with no data
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const monthData = rows.find(row => parseInt(row.month) === month);
      return {
        month,
        count: monthData ? parseInt(monthData.attendance_count) : 0
      };
    });
    
    res.json({ 
      monthlyStats: monthlyData,
      totalAttendance: rows.reduce((sum, row) => sum + parseInt(row.attendance_count), 0)
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch attendance statistics', error: err.message });
  }
};

// Get trainer profile
exports.getProfile = async (req, res) => {
  try {
    const trainer_id = req.user.id;
    const { rows } = await pool.query('SELECT id, name, email, role, created_at FROM users WHERE id = $1', [trainer_id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ profile: rows[0] });
  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update trainer profile
exports.updateProfile = async (req, res) => {
  try {
    const trainer_id = req.user.id;
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }
    await pool.query(
      'UPDATE users SET name = $1, email = $2 WHERE id = $3',
      [name, email, trainer_id]
    );
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
