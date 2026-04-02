import Chat from '../model/chatModel.js';
import Message from '../model/Message.js';
import asyncHandler from '../utils/asyncHandler.js';
import { AppError } from '../utils/errorHandler.js';
import sendResponse from '../utils/apiResponse.js';
import { io } from '../server.js';

// Send message
const sendMessage = asyncHandler(async (req, res, next) => {
  const { content, chatId } = req.body;

  if (!content || !chatId)
    return next(new AppError('Content and chatId required', 400));

  const chat = await Chat.findById(chatId).populate(
    'users',
    '_id name profilePic'
  );

  if (!chat) return next(new AppError('Chat not found', 404));

  if (!chat.users.map(u => u._id.toString()).includes(req.user.id))
    return next(new AppError('Not authorized', 403));

  // Create message
  const newMessage = await Message.create({
    sender: req.user.id,
    content,
    chat: chatId,
  });

  await newMessage.populate('sender', '_id name profilePic');

  // Update latest message
  chat.latestMessage = newMessage._id;
  await chat.save();

  const responseData = {
    ...newMessage.toObject(),
    chat: {
      _id: chat._id,
      users: chat.users.map(u => u._id.toString()),
    },
  };

  // 🔥 SEND TO ALL USERS EXCEPT SENDER


  // Send response to sender
  sendResponse(res, 201, true, responseData);
});

// Get messages
const getMessages = asyncHandler(async (req, res, next) => {
  const { chatId } = req.params;

  const messages = await Message.find({ chat: chatId })
    .populate('sender', 'name profilePic')
    .sort({ createdAt: 1 });

  sendResponse(res, 200, true, messages);
});

export { sendMessage, getMessages };