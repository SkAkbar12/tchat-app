// routes/messageRoutes.js
import express from 'express';
import { sendMessage, getMessages } from '../controllers/messageController.js';
import  protect  from '../middleware/auth.js';

const router = express.Router();

router.route('/send').post(protect, sendMessage);
router.route('/:chatId').get(protect, getMessages);

export default router;