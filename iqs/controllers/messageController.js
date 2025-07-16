// Messaging controller
const pool = require('../config/db');
let io, connectedUsers;
try {
  ({ io, connectedUsers } = require('../server'));
} catch (e) {}

// Send a message to a user
exports.sendMessage = async (req, res) => {
  const { receiver_id, message } = req.body;
  if (!receiver_id || !message) return res.status(400).json({ message: 'Missing fields' });
  await pool.query(
    'INSERT INTO messages (sender_id, receiver_id, message) VALUES ($1, $2, $3)',
    [req.user.id, receiver_id, message]
  );
  // Real-time emit
  if (io && connectedUsers && connectedUsers[receiver_id]) {
    io.to(connectedUsers[receiver_id]).emit('receive-message', { from: req.user.id, message });
  }
  res.json({ message: 'Message sent' });
};

// Get received messages for the logged-in user
exports.getInbox = async (req, res) => {
  const { rows } = await pool.query(
    'SELECT * FROM messages WHERE receiver_id = $1 ORDER BY created_at DESC',
    [req.user.id]
  );
  res.json({ inbox: rows });
};

// Get sent messages for the logged-in user
exports.getSent = async (req, res) => {
  const { rows } = await pool.query(
    'SELECT * FROM messages WHERE sender_id = $1 ORDER BY created_at DESC',
    [req.user.id]
  );
  res.json({ sent: rows });
};
