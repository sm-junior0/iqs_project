const pool = require('../config/db');
const path = require('path');
const fs = require('fs');

// Upload required files
// Upload required files for the school (stub, assumes file middleware)
exports.uploadDocs = async (req, res) => {
  const { school_id } = req.body;
  if (!school_id || !req.files || req.files.length === 0) return res.status(400).json({ message: 'Missing school_id or files' });
  const filePaths = [];
  for (const file of req.files) {
    await pool.query('INSERT INTO school_docs (school_id, doc_path, doc_type) VALUES ($1, $2, $3)', [school_id, file.path, 'other']);
    filePaths.push(file.path);
  }
  res.json({ message: 'Documents uploaded', files: filePaths });
};

// Download approved certificate
// Download approved certificate (returns path, not file stream)
exports.downloadCertificate = async (req, res) => {
  const { rows } = await pool.query('SELECT certificate_path FROM schools WHERE id = $1', [req.user.id]);
  if (!rows[0] || !rows[0].certificate_path) return res.status(404).json({ message: 'Certificate not found' });
  const filePath = path.resolve(rows[0].certificate_path);
  if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'Certificate file not found on server' });
  res.download(filePath, (err) => {
    if (err) {
      return res.status(500).json({ message: 'Error downloading certificate' });
    }
  });
};

// View evaluator feedback
// View evaluator feedback for a specific application
exports.feedbackForApplication = async (req, res) => {
  const { app_id } = req.params;
  // Find the application to get the school_id
  const appResult = await pool.query('SELECT school_id FROM applications WHERE id = $1', [app_id]);
  if (!appResult.rows[0]) return res.status(404).json({ message: 'Application not found' });
  const school_id = appResult.rows[0].school_id;
  // Get feedback for the school
  const { rows } = await pool.query('SELECT * FROM feedback WHERE school_id = $1', [school_id]);
  if (!rows.length) return res.status(404).json({ message: 'Feedback not found' });
  res.json({ feedback: rows });
};

exports.applyAccreditation = async (req, res) => {
  const { type } = req.body;
  const result = await pool.query(
    'INSERT INTO applications (school_id, type) VALUES ($1, $2) RETURNING *',
    [req.user.id, type]
  );
  res.json(result.rows[0]);
};

exports.trackApplication = async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM applications WHERE school_id = $1',
    [req.user.id]
  );
  res.json(result.rows);
};

// First-time school application: collects all required info in one request (authenticated)
exports.firstTimeApply = async (req, res) => {
  const { name, country, accreditation_type } = req.body;
  // Check for required fields
  if (!name || !country || !accreditation_type) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  // Check for uploaded files
  if (!req.files || !req.files.registration_doc || !req.files.curriculum_doc) {
    return res.status(400).json({ message: 'Both registration and curriculum documents are required.' });
  }
  const registrationDoc = req.files.registration_doc[0];
  const curriculumDoc = req.files.curriculum_doc[0];
  try {
    const school_id = req.user.id;
    // Check if school exists in schools table
    const { rows: schoolRows } = await pool.query('SELECT * FROM schools WHERE id = $1', [school_id]);
    if (schoolRows.length === 0) {
      // Insert school row if not exists
      await pool.query(
        'INSERT INTO schools (id, name, country) VALUES ($1, $2, $3)',
        [school_id, name, country]
      );
    } else {
      // Optionally update school profile with name/country if needed
      await pool.query(
        'UPDATE schools SET name = $1, country = $2 WHERE id = $3',
        [name, country, school_id]
      );
    }
    // Create application
    const appResult = await pool.query(
      'INSERT INTO applications (school_id, type) VALUES ($1, $2) RETURNING id',
      [school_id, accreditation_type]
    );
    const application_id = appResult.rows[0].id;
    // Save registration and curriculum documents
    await pool.query(
      'INSERT INTO school_docs (school_id, doc_path, doc_type) VALUES ($1, $2, $3), ($1, $4, $5)',
      [school_id, registrationDoc.path, 'registration', curriculumDoc.path, 'curriculum']
    );
    res.status(201).json({ message: 'School application submitted', school_id, application_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to submit application', error: err.message });
  }
};
