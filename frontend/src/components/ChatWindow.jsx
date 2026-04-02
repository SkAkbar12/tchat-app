import React, { useState, useEffect, useRef } from "react";
import fetchWithAuth from "../fetchWithAuth";
import { useAuth } from "../context/useAuth";
import { useSocket } from "../context/SocketContext";
import "./css/chatwindow.css";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

function ChatWindow({ selectedChat, currentUser, onChatUpdate, setNotifications }) {
  const { socket, connected, onlineUsers } = useSocket();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTypingAnim, setIsTypingAnim] = useState(false);
  const messagesEndRef = useRef(null);
  const selectedChatRef = useRef(selectedChat);
  const typingTimeoutRef = useRef(null);

  // Keep ref updated
  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ========== Socket event listeners (UPDATED) ==========
  useEffect(() => {
    if (!socket) return;

    const handleMessageReceived = (msg) => {
      const incomingChatId = msg?.message?.chat?._id;
      const currentId = selectedChatRef.current?._id;
      if (incomingChatId === currentId) {
        setMessages(prev =>
          prev.find(m => m._id === msg.message._id) ? prev : [...prev, msg.message]
        );
      }
    };

    const handleTyping = (roomId) => {
      // Only show typing if it's for the currently open chat
      if (roomId && selectedChatRef.current?._id === roomId) {
        setIsTypingAnim(true);
      }
    };

    const handleStopTyping = (roomId) => {
      if (roomId && selectedChatRef.current?._id === roomId) {
        setIsTypingAnim(false);
      }
    };

    socket.on("message received", handleMessageReceived);
    socket.on("typing", handleTyping);
    socket.on("stop typing", handleStopTyping);

    return () => {
      socket.off("message received", handleMessageReceived);
      socket.off("typing", handleTyping);
      socket.off("stop typing", handleStopTyping);
    };
  }, [socket]);

  // ========== Join chat room when selectedChat changes or connection restored ==========
  useEffect(() => {
    if (selectedChat?._id && connected && socket) {
      socket.emit("join chat", selectedChat._id);
    }
  }, [selectedChat, connected, socket]);

  // ========== Fetch messages when selectedChat changes ==========
  useEffect(() => {
    if (!selectedChat?._id) {
      setMessages([]);
      return;
    }
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const res = await fetchWithAuth(`messages/${selectedChat._id}`);
        const data = await res.json();
        if (data.success) setMessages(data.message);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [selectedChat]);

  const typingHandler = (e) => {
    setMessage(e.target.value);
    if (!connected || !selectedChat?._id) return;

    if (!typing) {
      setTyping(true);
      socket?.emit("typing", selectedChat._id);
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket?.emit("stop typing", selectedChat._id);
      setTyping(false);
    }, 1000);
  };

  const handleSendMessage = async (content) => {
    if (!content.trim() || !selectedChat?._id) return;

    try {
      const res = await fetchWithAuth("messages/send", {
        method: "POST",
        body: JSON.stringify({ content, chatId: selectedChat._id }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages(prev => [...prev, data.message]);
        setMessage("");

        if (connected && socket) {
          socket.emit("stop typing", selectedChat._id);
          socket.emit("send message", data);
        } else {
          console.warn("Socket not connected – message saved but not sent in real time");
        }

        if (onChatUpdate) onChatUpdate();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSendMessage(message);
  };

  if (!currentUser) return <div>Loading...</div>;
  if (!selectedChat) return <div>Select a chat</div>;

  const otherUser = !selectedChat.isGroupChat
    ? selectedChat.users.find(u => u._id !== currentUser._id)
    : null;
  const isOtherOnline = otherUser ? onlineUsers.has(otherUser._id) : false;

  const chatName = selectedChat.isGroupChat
    ? selectedChat.chatName
    : otherUser?.name;
  const chatAvatar = selectedChat.isGroupChat
    ? selectedChat.groupPic
    : otherUser?.profilePic;

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div style={{ position: "relative" }}>
          <img src={chatAvatar} className="header-avatar" alt="" />
          {!selectedChat.isGroupChat && (
            <span className={`online-dot ${isOtherOnline ? "online" : "offline"}`} />
          )}
        </div>
        <span>{chatName}</span>
      </div>

      <div className="message-list">
        {messages.map(msg => (
          <div
            key={msg._id}
            className={`message ${String(msg.sender?._id) === String(currentUser._id) ? "own" : "other"}`}
          >
            <img
              src={String(msg.sender?._id) === String(currentUser._id) ? currentUser.profilePic : msg.sender?.profilePic}
              className="message-avatar"
              alt=""
            />
            <div className="message-content">
              <div className="message-text">{msg.content}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* ========== FIXED typing indicator block ========== */}
      <div style={{ height: "50px", width: "100px" }}>
        {isTypingAnim && (
          <DotLottieReact
            src="https://lottie.host/081b2fdb-b985-4283-ace5-cec8a4be293d/z81O69UEEh.lottie"
            loop
            autoplay
            style={{ height: "100%", width: "100%" }}
          />
        )}
      </div>

      <form onSubmit={handleSubmit} className="message-input-box">
        <input
          type="text"
          value={message}
          onChange={typingHandler}
          placeholder="Type message..."
          className="message-input"
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default ChatWindow;