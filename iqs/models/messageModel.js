const pool = require('../config/db');

exports.create = (sender_id, receiver_id, message) =>
  pool.query(
    'INSERT INTO messages (sender_id, receiver_id, message) VALUES ($1, $2, $3)',
    [sender_id, receiver_id, message]
  );

exports.getForUser = (user_id) =>
  pool.query(
    'SELECT * FROM messages WHERE receiver_id = $1 OR receiver_id IS NULL ORDER BY created_at DESC',
    [user_id]
  );
