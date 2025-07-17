// Messaging controller
const pool = require('../config/db');
let io, connectedUsers;
try {
  ({ io, connectedUsers } = require('../server'));
} catch (e) {}

// Send a message to a user
exports.sendMessage = async (req, res) => {
  try {
    const { recipientId, message, type, conversationId } = req.body; // type: 'user' or 'group'
    const senderId = parseInt(req.user.id, 10);
    let conversationIdFinal = conversationId;

    if (!conversationIdFinal) {
      if (type === 'user') {
        const recipientIdInt = parseInt(recipientId, 10);
        console.log('senderId:', senderId, 'recipientIdInt:', recipientIdInt, 'typeof senderId:', typeof senderId, 'typeof recipientIdInt:', typeof recipientIdInt);
        if (isNaN(senderId) || isNaN(recipientIdInt)) {
          return res.status(400).json({ error: 'Invalid user ID(s): senderId or recipientId is not a number.' });
        }
        const arr = [senderId, recipientIdInt];
        // Find or create user-to-user conversation
        const { rows: existing } = await pool.query(
          "SELECT * FROM conversations WHERE type = 'user' AND user_ids @> $1::int[] AND array_length(user_ids, 1) = 2",
          [arr]
        );
        if (existing.length > 0) {
          conversationIdFinal = existing[0].id;
        } else {
          const { rows } = await pool.query(
            "INSERT INTO conversations (type, user_ids, last_message) VALUES ('user', $1::int[], $2) RETURNING id",
            [arr, message]
          );
          conversationIdFinal = rows[0].id;
        }
        // Insert the message for user-to-user
        await pool.query(
          "INSERT INTO messages (sender_id, receiver_id, message, conversation_id) VALUES ($1, $2, $3, $4)",
          [senderId, recipientIdInt, message, conversationIdFinal]
        );
      } else if (type === 'group') {
        // Find or create group conversation
        const { rows: existing } = await pool.query(
          "SELECT * FROM conversations WHERE type = 'group' AND group_name = $1",
          [recipientId]
        );
        if (existing.length > 0) {
          conversationIdFinal = existing[0].id;
        } else {
          const { rows } = await pool.query(
            "INSERT INTO conversations (type, group_name, last_message) VALUES ('group', $1, $2) RETURNING id",
            [recipientId, message]
          );
          conversationIdFinal = rows[0].id;
        }
        // Insert the message for group (receiver_id is null)
        await pool.query(
          "INSERT INTO messages (sender_id, receiver_id, group_name, message, conversation_id) VALUES ($1, NULL, $2, $3, $4)",
          [senderId, recipientId, message, conversationIdFinal]
        );
      }
      await pool.query(
        "UPDATE conversations SET last_message = $1, updated_at = NOW() WHERE id = $2",
        [message, conversationIdFinal]
      );
      res.json({ message: 'Message sent', conversationId: conversationIdFinal });
    } else {
      // If conversationId is provided, just insert the message
      await pool.query(
        "INSERT INTO messages (sender_id, receiver_id, message, conversation_id) VALUES ($1, NULL, $2, $3)",
        [senderId, message, conversationIdFinal]
      );
      await pool.query(
        "UPDATE conversations SET last_message = $1, updated_at = NOW() WHERE id = $2",
        [message, conversationIdFinal]
      );
      res.json({ message: 'Message sent', conversationId: conversationIdFinal });
    }
  } catch (err) {
    console.error('Error in sendMessage:', err);
    res.status(500).json({ error: err.message || 'Failed to send message' });
  }
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

// List all conversations for the user
exports.getConversations = async (req, res) => {
  const userId = req.user.id;
  const { rows } = await pool.query(
    "SELECT * FROM conversations WHERE $1 = ANY(user_ids) OR type = 'group' ORDER BY updated_at DESC",
    [userId]
  );
  res.json({ conversations: rows });
};

// Get all messages for a conversation
exports.getConversationMessages = async (req, res) => {
  const { id } = req.params;
  const { rows } = await pool.query(
    `SELECT m.*, u.name AS sender_name
     FROM messages m
     LEFT JOIN users u ON m.sender_id = u.id
     WHERE m.conversation_id = $1
     ORDER BY m.created_at ASC`,
    [id]
  );
  res.json({ messages: rows });
};
