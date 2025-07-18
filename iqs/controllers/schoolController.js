const pool = require('../config/db');
const path = require('path');
const fs = require('fs');

// Upload required files for the school (stub, assumes file middleware)
exports.uploadDocs = async (req, res) => {
  const { school_id } = req.body;
  if (!school_id || !req.files || req.files.length === 0) return res.status(400).json({ message: 'Missing school_id or files' });
  const fileUrls = [];
  for (const file of req.files) {
    await pool.query('INSERT INTO school_docs (school_id, doc_path, doc_type) VALUES ($1, $2, $3)', [school_id, file.path, 'other']);
    fileUrls.push(file.path);
  }
  res.json({ message: 'Documents uploaded', files: fileUrls });
};

// Download approved certificate (returns Cloudinary URL if available)
exports.downloadCertificate = async (req, res) => {
  const { rows } = await pool.query('SELECT certificate_path FROM schools WHERE id = $1', [req.user.id]);
  if (!rows[0] || !rows[0].certificate_path) return res.status(404).json({ message: 'Certificate not found' });
  const certPath = rows[0].certificate_path;
  // If the path looks like a URL, redirect
  if (/^https?:\/\//.test(certPath)) {
    return res.redirect(certPath);
  }
  // Fallback to local file (legacy)
  const filePath = path.resolve(certPath);
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
  // Debug: Log user and token info
  console.log('firstTimeApply called');
  console.log('req.user:', req.user);
  console.log('req.headers.authorization:', req.headers.authorization);
  const { name, country, accreditation_type } = req.body;
  // Check for required fields
  if (!name || !country || !accreditation_type) {
    console.log('Missing required fields:', { name, country, accreditation_type });
    return res.status(400).json({ message: 'Missing required fields' });
  }
  // Check for uploaded files
  if (!req.files || !req.files.registration_doc || !req.files.curriculum_doc) {
    console.log('Missing files:', req.files);
    return res.status(400).json({ message: 'Both registration and curriculum documents are required.' });
  }
  const registrationDoc = req.files.registration_doc[0];
  const curriculumDoc = req.files.curriculum_doc[0];
  try {
    const school_id = req.user.id;
    // Debug: Log school_id
    console.log('school_id:', school_id);
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
    // Save registration and curriculum documents (Cloudinary URLs)
    await pool.query(
      'INSERT INTO school_docs (school_id, doc_path, doc_type) VALUES ($1, $2, $3), ($1, $4, $5)',
      [school_id, registrationDoc.path, 'registration', curriculumDoc.path, 'curriculum']
    );
    res.status(201).json({ message: 'School application submitted', school_id, application_id });
  } catch (err) {
    console.error('Error in firstTimeApply:', err);
    res.status(500).json({ message: 'Failed to submit application', error: err.message });
  }
};

// Get all applications for the logged-in school
exports.getAllApplications = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM applications WHERE school_id = $1 ORDER BY submitted_at DESC', [req.user.id]);
    res.json({ applications: rows });
  } catch (err) {
    console.error('Error in getAllApplications:', err);
    res.status(500).json({ message: 'Failed to fetch applications', error: err.message });
  }
};

// Get a specific application by ID (must belong to the school)
exports.getApplicationById = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM applications WHERE id = $1 AND school_id = $2', [id, req.user.id]);
    if (!rows.length) return res.status(404).json({ message: 'Application not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Error in getApplicationById:', err);
    res.status(500).json({ message: 'Failed to fetch application', error: err.message });
  }
};

// Delete a specific application by ID (must belong to the school)
exports.deleteApplicationById = async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM applications WHERE id = $1 AND school_id = $2',
      [id, req.user.id]
    );
    if (rowCount === 0) {
      return res.status(404).json({ message: 'Application not found or not authorized' });
    }
    res.json({ message: 'Application deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete application', error: err.message });
  }
};

// Get all certificates for the logged-in school
exports.getAllCertificates = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT certificate_path FROM schools WHERE id = $1', [req.user.id]);
    res.json({ certificates: rows.map(r => r.certificate_path).filter(Boolean) });
  } catch (err) {
    console.error('Error in getAllCertificates:', err);
    res.status(500).json({ message: 'Failed to fetch certificates', error: err.message });
  }
};

// Get all feedback for the logged-in school
exports.getAllFeedback = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT f.*, u.name as evaluator_name 
      FROM feedback f 
      LEFT JOIN users u ON f.evaluator_id = u.id 
      WHERE f.school_id = $1 
      ORDER BY f.created_at DESC
    `, [req.user.id]);
    res.json({ feedback: rows });
  } catch (err) {
    console.error('Error in getAllFeedback:', err);
    res.status(500).json({ message: 'Failed to fetch feedback', error: err.message });
  }
};
