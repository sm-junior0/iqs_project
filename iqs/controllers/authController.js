const pool = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { secret, expiresIn } = require('../config/jwt');
const crypto = require('crypto');
const { sendMail } = require('../utils/mailer');

// User login: checks credentials and returns JWT
exports.login = async (req, res) => {
  // console.log('Login attempt:', req.body.email, req.body.password);

  const { email, password } = req.body;
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  const user = rows[0];
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });

  const match = await bcrypt.compare(password, user.password_hash);
  console.log('Password match:', match);
  if (!match) return res.status(400).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ id: user.id, role: user.role }, secret, { expiresIn });
  res.json({
  token,
  user: {
    id: user.id,
    email: user.email,
    fullName: user.name,
    accountType: user.role === 'school' ? 'institution' : user.role
  }
});
};

// Send password reset email with real email logic
exports.resetPasswordRequest = async (req, res) => {
  const { email } = req.body;
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  const user = rows[0];
  if (!user) return res.status(404).json({ message: 'User not found' });
  // Generate a secure random token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry
  // Store token and expiry in DB (add columns if needed)
  await pool.query('UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3', [resetToken, expires, user.id]);

  // Send email
  try {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
    await sendMail({
      to: email,
      subject: 'IQS Password Reset',
      text: `You requested a password reset. Click the link to reset your password: ${resetUrl}\nIf you did not request this, ignore this email.`,
      html: `<p>You requested a password reset.</p><p><a href="${resetUrl}">Reset your password</a></p><p>If you did not request this, ignore this email.</p>`
    });
    res.json({ message: 'Password reset email sent' });
  } catch (err) {
    console.error('Error sending email:', err);
    res.status(500).json({ message: 'Failed to send reset email', error: err.message });
  }
};

// Confirm + update new password
exports.resetPasswordConfirm = async (req, res) => {
  const { email, token, newPassword } = req.body;
  if (!email || !token || !newPassword) return res.status(400).json({ message: 'Missing fields' });

  // Find user with matching email and token, and check expiry
  const { rows } = await pool.query(
    'SELECT * FROM users WHERE email = $1 AND reset_token = $2 AND reset_token_expires > NOW()',
    [email, token]
  );
  const user = rows[0];
  if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

  // Update password and clear reset token
  const password_hash = await bcrypt.hash(newPassword, 10);
  await pool.query(
    'UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2',
    [password_hash, user.id]
  );
  res.json({ message: 'Password updated' });
};

// Signup for admin
exports.signupAdmin = async (req, res) => {
  await signupWithRole(req, res, 'admin');
};
// Signup for evaluator
exports.signupEvaluator = async (req, res) => {
  await signupWithRole(req, res, 'evaluator');
};
// Signup for school
exports.signupSchool = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  if (rows[0]) return res.status(409).json({ message: 'User already exists' });
  const password_hash = await bcrypt.hash(password, 10);
  // Create user
  const userResult = await pool.query(
    'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
    [name, email, password_hash, 'school']
  );
  const user = userResult.rows[0];
  res.status(201).json(user);
};
// Signup for trainer
exports.signupTrainer = async (req, res) => {
  await signupWithRole(req, res, 'trainer');
};

// Helper for signup
async function signupWithRole(req, res, role) {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  if (rows[0]) return res.status(409).json({ message: 'User already exists' });
  const password_hash = await bcrypt.hash(password, 10);
  const result = await pool.query(
    'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
    [name, email, password_hash, role]
  );
  res.status(201).json(result.rows[0]);
}
