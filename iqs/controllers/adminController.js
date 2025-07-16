const pool = require('../config/db');
const { t } = require('../utils/translator');
const schoolModel = require('../models/schoolModel');
const applicationModel = require('../models/applicationModel');
const { generateCertificate } = require('../utils/certificateGenerator');

let io, connectedUsers;
try {
  ({ io, connectedUsers } = require('../server'));
} catch (e) {}

// Get all countries
exports.getCountries = async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM countries');
  res.json({ countries: rows });
};

// Get all schools
exports.getSchools = async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM schools');
  res.json({ schools: rows });
};

// Get all evaluators
exports.getEvaluators = async (req, res) => {
  const { rows } = await pool.query("SELECT id, name, email FROM users WHERE role = 'evaluator'");
  res.json({ evaluators: rows });
};

// Get all users (manage accounts)
exports.getUsers = async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM users');
  res.json({ users: rows });
};

// Create user
exports.createUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  const bcrypt = require('bcrypt');
  const password_hash = await bcrypt.hash(password, 10);
  const { rows } = await pool.query(
    'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING *',
    [name, email, password_hash, role]
  );
  res.status(201).json(rows[0]);
};

// Update user
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, role } = req.body;
  const { rows } = await pool.query(
    'UPDATE users SET name = $1, email = $2, role = $3 WHERE id = $4 RETURNING *',
    [name, email, role, id]
  );
  res.json(rows[0]);
};

// Delete user
exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM users WHERE id = $1', [id]);
  res.json({ message: 'User deleted' });
};

// Send message (individual or group)
exports.sendMessage = async (req, res) => {
  const { receiver_id, message, group } = req.body;
  if (group) {
    // group can be 'all', 'evaluator', 'school', 'trainer'
    let users;
    if (group === 'all') {
      users = await pool.query('SELECT id FROM users');
    } else {
      users = await pool.query('SELECT id FROM users WHERE role = $1', [group]);
    }
    for (const user of users.rows) {
      await pool.query(
        'INSERT INTO messages (sender_id, receiver_id, message) VALUES ($1, $2, $3)',
        [req.user.id, user.id, message]
      );
      // Real-time emit
      if (io && connectedUsers && connectedUsers[user.id]) {
        io.to(connectedUsers[user.id]).emit('receive-message', { from: 'admin', message, group });
      }
    }
  } else {
    await pool.query(
      'INSERT INTO messages (sender_id, receiver_id, message) VALUES ($1, $2, $3)',
      [req.user.id, receiver_id, message]
    );
    // Real-time emit
    if (io && connectedUsers && connectedUsers[receiver_id]) {
      io.to(connectedUsers[receiver_id]).emit('receive-message', { from: 'admin', message });
    }
  }
  res.json({ message: t('message_sent', req.lang) });
};

// List all reports (evaluations)
exports.getReports = async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM evaluations');
  res.json({ reports: rows });
};

// View a single report by ID
exports.getReportById = async (req, res) => {
  const { id } = req.params;
  const { rows } = await pool.query('SELECT * FROM evaluations WHERE id = $1', [id]);
  if (rows.length === 0) return res.status(404).json({ message: 'Report not found' });
  res.json({ report: rows[0] });
};

// Delete a report by ID
exports.deleteReportById = async (req, res) => {
  const { id } = req.params;
  const { rowCount } = await pool.query('DELETE FROM evaluations WHERE id = $1', [id]);
  if (rowCount === 0) return res.status(404).json({ message: 'Report not found' });
  res.json({ message: 'Report deleted' });
};

// Download a report file by ID
const path = require('path');
const fs = require('fs');
exports.downloadReportById = async (req, res) => {
  const { id } = req.params;
  const { rows } = await pool.query('SELECT report_path FROM evaluations WHERE id = $1', [id]);
  if (rows.length === 0 || !rows[0].report_path) return res.status(404).json({ message: 'Report not found' });
  const filePath = path.resolve(rows[0].report_path);
  if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'File not found' });
  res.download(filePath);
};

// Get all settings
exports.getSettings = async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM settings');
  res.json({ settings: rows });
};

// Update a setting
exports.updateSettings = async (req, res) => {
  const { key, value } = req.body;
  await pool.query('UPDATE settings SET value = $1 WHERE key = $2', [value, key]);
  res.json({ message: t('settings_updated', req.lang) });
};

// Admin dashboard
exports.getDashboard = async (req, res) => {
  const pool = require('../config/db');
  try {
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
  } catch (err) {
    res.status(500).json({ message: 'Failed to load dashboard data', error: err.message });
  }
};

// Assign evaluator
exports.assignEvaluator = async (req, res) => {
  const { school_id, evaluator_id } = req.body;
  if (!school_id || !evaluator_id) return res.status(400).json({ message: 'Missing school_id or evaluator_id' });

  // Check if evaluator exists and is an evaluator
  const { rows: evaluatorRows } = await pool.query('SELECT * FROM users WHERE id = $1 AND role = $2', [evaluator_id, 'evaluator']);
  if (evaluatorRows.length === 0) {
    return res.status(404).json({ message: 'Evaluator not found' });
  }

  // Try to assign evaluator to school
  const result = await schoolModel.assignEvaluator(school_id, evaluator_id);
  if (result.rowCount === 0) {
    return res.status(404).json({ message: 'School not found' });
  }

  res.json({ message: 'Evaluator assigned' });
};

// Change status
exports.changeStatus = async (req, res) => {
  const { type, id, status } = req.body;
  if (!type || !id || !status) return res.status(400).json({ message: 'Missing type, id, or status' });
  if (type === 'school') {
    const result = await schoolModel.updateStatus(id, status);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'School not found' });
    }
    // If status is approved, generate certificate
    if (status.toLowerCase() === 'approved') {
      // Get school name
      const schoolRows = await schoolModel.getById(id);
      if (!schoolRows.rows.length) {
        return res.status(404).json({ message: 'School not found' });
      }
      const schoolName = schoolRows.rows[0].name;
      const approvedDate = new Date().toLocaleDateString();
      try {
        const certPath = await generateCertificate(schoolName, approvedDate);
        await schoolModel.updateCertificatePath(id, certPath);
      } catch (err) {
        return res.status(500).json({ message: 'Failed to generate certificate', error: err.message });
      }
    }
    res.json({ message: 'School status updated' });
  } else if (type === 'application') {
    const result = await applicationModel.updateStatus(id, status);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Application not found' });
    }
    res.json({ message: 'Application status updated' });
  } else {
    res.status(400).json({ message: 'Invalid type' });
  }
};

// Add a new school
exports.addSchool = async (req, res) => {
  const { name, address, contact_email } = req.body;
  if (!name || !address || !contact_email) return res.status(400).json({ message: 'Missing fields' });
  const { rows } = await pool.query(
    'INSERT INTO schools (name, address, contact_email) VALUES ($1, $2, $3) RETURNING *',
    [name, address, contact_email]
  );
  res.status(201).json(rows[0]);
};

// Add a new evaluator
exports.addEvaluator = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });
  const bcrypt = require('bcrypt');
  const password_hash = await bcrypt.hash(password, 10);
  const { rows } = await pool.query(
    'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING *',
    [name, email, password_hash, 'evaluator']
  );
  res.status(201).json(rows[0]);
};

// Add a new trainer
exports.addTrainer = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });
  const bcrypt = require('bcrypt');
  const password_hash = await bcrypt.hash(password, 10);
  const { rows } = await pool.query(
    'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING *',
    [name, email, password_hash, 'trainer']
  );
  res.status(201).json(rows[0]);
};

// Assign a task to an evaluator
exports.assignTask = async (req, res) => {
  const { evaluator_id, school_id, description } = req.body;
  if (!evaluator_id || !school_id || !description) {
    return res.status(400).json({ message: 'Missing evaluator_id, school_id, or description' });
  }
  // Optionally check if evaluator and school exist
  const { rows: evaluatorRows } = await pool.query('SELECT * FROM users WHERE id = $1 AND role = $2', [evaluator_id, 'evaluator']);
  if (evaluatorRows.length === 0) {
    return res.status(404).json({ message: 'Evaluator not found' });
  }
  const { rows: schoolRows } = await pool.query('SELECT * FROM schools WHERE id = $1', [school_id]);
  if (schoolRows.length === 0) {
    return res.status(404).json({ message: 'School not found' });
  }
  const result = await schoolModel.createTask(evaluator_id, school_id, description);
  res.status(201).json({ task: result.rows[0] });
};

// Get all new (pending) applications with school name
exports.getNewApplications = async (req, res) => {
  const { rows } = await pool.query(`
    SELECT a.id, s.name AS school_name, a.type, a.submitted_at
    FROM applications a
    JOIN schools s ON a.school_id = s.id
    WHERE a.status = 'pending'
    ORDER BY a.submitted_at DESC
  `);
  res.json({ applications: rows });
};