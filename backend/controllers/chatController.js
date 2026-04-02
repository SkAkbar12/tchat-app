import Chat from '../model/chatModel.js';
import Message from '../model/Message.js';
import User from '../model/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import { AppError } from '../utils/errorHandler.js';
import sendResponse from '../utils/apiResponse.js';

// @desc    Get all chats of logged-in user
// @route   GET /api/chats
// @access  Private
const getUserChats = asyncHandler(async (req, res, next) => {
  const chats = await Chat.find({ users: { $in: [req.user.id] } })
    .populate('users', 'name email profilePic')
    .populate('groupAdmin', 'name email profilePic')
    .populate('latestMessage')
    .sort({ updatedAt: -1 });

  sendResponse(res, 200, true, chats);
});

// @desc    Access or create a one-on-one chat
// @route   POST /api/chats/access
// @access  Private
const accessChat = asyncHandler(async (req, res, next) => {
  const { userId } = req.body;
  if (!userId) {
    return next(new AppError('UserId is required', 400));
  }

  // Check if target user exists
  const targetUser = await User.findById(userId);
  if (!targetUser) {
    return next(new AppError('User not found', 404));
  }

  // Check if chat already exists
  let chat = await Chat.findOne({
    isGroupChat: false,
    users: { $all: [req.user.id, userId] },
  })
    .populate('users', 'name email profilePic')
    .populate('latestMessage');

  if (chat) {
    return sendResponse(res, 200, true, chat);
  }

  // Create new chat
  chat = await Chat.create({
    chatName: 'sender', // You may set a better default
    isGroupChat: false,
    users: [req.user.id, userId],
  });

  const fullChat = await Chat.findById(chat._id).populate(
    'users',
    'name email profilePic'
  );

  sendResponse(res, 201, true, fullChat);
});

// @desc    Search users by name/email
// @route   GET /api/search?q=:query
// @access  Private
const searchUser = asyncHandler(async (req, res, next) => {
  const { q } = req.query;
  if (!q) {
    return next(new AppError('Search query is required', 400));
  }

  const users = await User.find({
    $or: [
      { name: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } },
    ],
  })
    .select('-password -refreshToken -usersInChats')
    .limit(12); // prevent too many results

  sendResponse(res, 200, true, users);
});

export { getUserChats, accessChat, searchUser };