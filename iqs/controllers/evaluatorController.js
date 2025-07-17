const pool = require('../config/db');
const feedbackModel = require('../models/feedbackModel');
const path = require('path');
const schoolModel = require('../models/schoolModel');
const multer = require('multer');
const fs = require('fs');

exports.mySchools = async (req, res) => {
  const result = await pool.query('SELECT * FROM schools WHERE evaluator_id = $1', [req.user.id]);
  res.json(result.rows);
};

// Upload a report for a school (with file upload)
exports.uploadReport = async (req, res) => {
  const evaluator_id = req.user.id;
  const { school_id, visit_date } = req.body;
  if (!school_id || !visit_date || !req.file) {
    return res.status(400).json({ message: 'Missing school_id, visit_date, or file' });
  }
  // Check if evaluator is assigned to this school
  const { rows: schoolRows } = await pool.query('SELECT * FROM schools WHERE id = $1 AND evaluator_id = $2', [school_id, evaluator_id]);
  if (schoolRows.length === 0) {
    return res.status(403).json({ message: 'You are not assigned to this school' });
  }
  await pool.query(
    'INSERT INTO evaluations (school_id, evaluator_id, report_path, visit_date) VALUES ($1, $2, $3, $4)',
    [school_id, evaluator_id, req.file.path, visit_date]
  );
  res.json({ message: 'Report uploaded' });
};

// View past visits
exports.visitHistory = async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM evaluations WHERE evaluator_id = $1 ORDER BY visit_date DESC', [req.user.id]);
  res.json({ visits: rows });
};

// Get reports for a school
exports.reportsForSchool = async (req, res) => {
  const { school_id } = req.params;
  const { rows } = await pool.query('SELECT * FROM evaluations WHERE school_id = $1', [school_id]);
  res.json({ reports: rows });
};

// Delete a report by ID (only if evaluator owns it)
exports.deleteReport = async (req, res) => {
  const { id } = req.params;
  // Only allow deletion if the evaluator owns the report
  const { rowCount } = await pool.query('DELETE FROM evaluations WHERE id = $1 AND evaluator_id = $2', [id, req.user.id]);
  if (rowCount === 0) return res.status(404).json({ message: 'Report not found or not authorized' });
  res.json({ message: 'Report deleted' });
};

// Submit feedback to a school
exports.submitSchoolFeedback = async (req, res) => {
  try {
    const { rating, type, description } = req.body;
    const school_id = req.params.schoolId;
    const evaluator_id = req.user.id;
    let document_path = null;
    if (req.file) {
      document_path = req.file.path;
    }
    if (!rating || !type || !description) {
      return res.status(400).json({ message: 'All fields except supporting document are required.' });
    }
    const result = await feedbackModel.create(
      school_id,
      evaluator_id,
      rating,
      type,
      description,
      document_path
    );
    res.status(201).json({ message: 'Feedback submitted successfully.', feedback: result.rows[0] });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

exports.downloadReport = async (req, res) => {
  const { id } = req.params;
  const { rows } = await pool.query('SELECT * FROM evaluations WHERE id = $1 AND evaluator_id = $2', [id, req.user.id]);
  const report = rows[0];
  if (!report || !report.report_path) return res.status(404).json({ message: 'Report not found or not authorized' });
  res.download(path.resolve(report.report_path));
};

// Upload a document for an assigned school
exports.uploadSchoolDoc = async (req, res) => {
  const evaluator_id = req.user.id;
  const { school_id } = req.body;
  if (!school_id || !req.file) {
    return res.status(400).json({ message: 'Missing school_id or file' });
  }
  // Check if evaluator is assigned to this school
  const { rows: schoolRows } = await pool.query('SELECT * FROM schools WHERE id = $1 AND evaluator_id = $2', [school_id, evaluator_id]);
  if (schoolRows.length === 0) {
    return res.status(403).json({ message: 'You are not assigned to this school' });
  }
  // Save document in school_docs
  await pool.query(
    'INSERT INTO school_docs (school_id, doc_path, doc_type) VALUES ($1, $2, $3)',
    [school_id, req.file.path, req.body.doc_type || 'other']
  );
  res.json({ message: 'Document uploaded' });
};

// Download all documents for assigned schools
exports.downloadSchoolDocs = async (req, res) => {
  const evaluator_id = req.user.id;
  // Get all schools assigned to this evaluator
  const { rows: schools } = await pool.query('SELECT id FROM schools WHERE evaluator_id = $1', [evaluator_id]);
  const schoolIds = schools.map(s => s.id);
  if (schoolIds.length === 0) {
    return res.status(404).json({ message: 'No assigned schools' });
  }
  // Get all docs for these schools
  const { rows: docs } = await pool.query('SELECT * FROM school_docs WHERE school_id = ANY($1)', [schoolIds]);
  res.json({ documents: docs });
};

// Download a single document by doc_id for assigned schools
exports.downloadSchoolDocById = async (req, res) => {
  const evaluator_id = req.user.id;
  const doc_id = req.params.doc_id;
  // Get the document and its school
  const { rows: docs } = await pool.query('SELECT * FROM school_docs WHERE id = $1', [doc_id]);
  if (docs.length === 0) {
    return res.status(404).json({ message: 'Document not found' });
  }
  const doc = docs[0];
  // Check if evaluator is assigned to this school
  const { rows: schoolRows } = await pool.query('SELECT * FROM schools WHERE id = $1 AND evaluator_id = $2', [doc.school_id, evaluator_id]);
  if (schoolRows.length === 0) {
    return res.status(403).json({ message: 'You are not assigned to this school' });
  }
  const filePath = path.resolve(doc.doc_path);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'File not found on server' });
  }
  res.download(filePath, (err) => {
    if (err) {
      return res.status(500).json({ message: 'Error downloading file' });
    }
  });
};

// Get tasks assigned to the evaluator
exports.getMyTasks = async (req, res) => {
  const evaluator_id = req.user.id;
  const { rows } = await schoolModel.getTasksByEvaluator(evaluator_id);
  res.json({ tasks: rows });
};

// Get evaluator profile
exports.getProfile = async (req, res) => {
  try {
    const evaluator_id = req.user.id;
    const { rows } = await pool.query('SELECT id, name, email, role, created_at FROM users WHERE id = $1', [evaluator_id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ profile: rows[0] });
  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update evaluator profile
exports.updateProfile = async (req, res) => {
  try {
    const evaluator_id = req.user.id;
    const { name, email } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }
    
    // Check if email is already taken by another user
    const { rows: existingUsers } = await pool.query(
      'SELECT id FROM users WHERE email = $1 AND id != $2',
      [email, evaluator_id]
    );
    
    if (existingUsers.length > 0) {
      return res.status(409).json({ message: 'Email already in use' });
    }
    
    const { rows } = await pool.query(
      'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING id, name, email, role, created_at',
      [name, email, evaluator_id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'Profile updated successfully', profile: rows[0] });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
