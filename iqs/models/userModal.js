const pool = require('../config/db');

exports.findByEmail = (email) => 
  pool.query('SELECT * FROM users WHERE email = $1', [email]);

exports.findById = (id) => 
  pool.query('SELECT * FROM users WHERE id = $1', [id]);

exports.create = (name, email, passwordHash, role) =>
  pool.query(
    'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING *',
    [name, email, passwordHash, role]
  );
