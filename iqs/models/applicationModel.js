const pool = require('../config/db');

exports.create = (school_id, type) =>
  pool.query(
    'INSERT INTO applications (school_id, type) VALUES ($1, $2) RETURNING *',
    [school_id, type]
  );

exports.getBySchool = (school_id) =>
  pool.query('SELECT * FROM applications WHERE school_id = $1', [school_id]);

exports.updateStatus = (application_id, status) =>
  pool.query('UPDATE applications SET status = $1 WHERE id = $2', [status, application_id]);
