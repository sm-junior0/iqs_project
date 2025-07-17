const express = require('express');
const { authenticate } = require('../middleware/authMiddleware');
const {
  sendMessage,
  getInbox,
  getSent,
  getConversations,
  getConversationMessages
} = require('../controllers/messageController');

const router = express.Router();

router.use(authenticate);

router.post('/send', sendMessage);
router.get('/inbox', getInbox);
router.get('/sent', getSent);
router.get('/conversations', getConversations);
router.get('/conversation/:id', getConversationMessages);

module.exports = router;
