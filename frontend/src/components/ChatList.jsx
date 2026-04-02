import React from 'react';
import { useSocket } from '../context/SocketContext';
import './css/chatlist.css';

function ChatList({ chats, onSelectChat, currentUser }) {
  const { onlineUsers } = useSocket();

  const getOtherUser = (chat) => {
    if (chat.isGroupChat) return null;
    return chat.users.find(u => u._id !== currentUser._id);
  };

  return (
    <div className="chat-list">
      {chats.map(chat => {
        const otherUser = getOtherUser(chat);
        const isOnline = otherUser ? onlineUsers.has(otherUser._id) : false;
        return (
          <div key={chat._id} className="chat-item" onClick={() => onSelectChat(chat)}>
            <div className="avatar" style={{ position: "relative" }}>
              <img
                src={chat.isGroupChat ? chat.groupPic : otherUser?.profilePic}
                alt="avatar"
                className="chat-avatar"
              />
              {!chat.isGroupChat && (
                <span className={`online-dot ${isOnline ? "online" : "offline"}`} />
              )}
            </div>
            <div className="chat-info">
              <div className="chat-name">
                {chat.isGroupChat ? chat.chatName : otherUser?.name}
              </div>
              {chat.latestMessage && (
                <div className="last-message">{chat.latestMessage.content}</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ChatList;