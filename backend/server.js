import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { Server } from "socket.io";
import http from 'http';
import connectDB from './model/db.js';
import authRoutes from './router/authRoutes.js';
import chatRoutes from './router/chatRoutes.js';
import messageRoutes from './router/messageRoutes.js';
import { errorHandler } from './utils/errorHandler.js';
import path from 'path';

import { fileURLToPath } from 'url';

// Fix __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve frontend build
const frontendPath = path.join(__dirname, '../frontend/dist');
dotenv.config();

const app = express();
connectDB();
app.use(express.static(frontendPath));

// Handle React routing (important)
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api/', limiter);
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: ['http://localhost:5173' || '*'], credentials: true }));

app.use('/api/auth', authRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRoutes);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

const io = new Server(server, {
  pingTimeout: 60000,
  cors: { origin: "http://localhost:5173" || '*', credentials: true },
});

const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("setup", (user) => {
    if (!user?._id) return;
    const userId = String(user._id);
    socket.join(userId);
    
    if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
    onlineUsers.get(userId).add(socket.id);
    
    socket.broadcast.emit("user-online", userId);
    socket.emit("connected");
    console.log(`User ${userId} online`);
  });

  socket.on("join chat", (roomId) => {
    if (roomId) {
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room ${roomId}`);
    }
  });

  socket.on("send message", (data) => {
    const message = data?.message;
    if (!message?.chat?._id) return;
    socket.to(message.chat._id).emit("message received", data);
  });

  // ========== UPDATED: include room ID in typing events ==========
  socket.on("typing", (room) => {
    if (room && typeof room === "string") {
      socket.to(room).emit("typing", room);
    }
  });

  socket.on("stop typing", (room) => {
    if (room && typeof room === "string") {
      socket.to(room).emit("stop typing", room);
    }
  });

  socket.on("disconnect", () => {
    let disconnectedUserId = null;
    for (let [userId, sockets] of onlineUsers.entries()) {
      if (sockets.has(socket.id)) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          onlineUsers.delete(userId);
          disconnectedUserId = userId;
        }
        break;
      }
    }
    if (disconnectedUserId) {
      socket.broadcast.emit("user-offline", disconnectedUserId);
      console.log(`User ${disconnectedUserId} offline`);
    }
    console.log("Socket disconnected:", socket.id);
  });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
export { io };