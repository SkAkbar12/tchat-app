
// routes/chatRoutes.js
import express from 'express';
import { getUserChats, accessChat, searchUser } from '../controllers/chatController.js';
import protect  from '../middleware/auth.js';

const router = express.Router();

router.route('/').get(protect, getUserChats);
router.route('/access').post(protect, accessChat);
router.route('/search').get(protect, searchUser);

export default router;