import React, { useRef, useEffect } from "react";

function MessageList({ messages, loading, error, currentUser }) {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (loading && messages.length === 0) {
    return <div className="messages-loading">Loading messages...</div>;
  }

  if (error) {
    return <div className="messages-error">{error}</div>;
  }

  return (
    <div className="messages-area">
      {messages.map((msg) => {
        const isOwn =
  String(msg.sender?._id) === String(currentUser?._id);
        return (
          <div key={msg._id} className={`message ${isOwn ? "own" : "other"}`}>
           <img
  src={
    isOwn
      ? currentUser?.profilePic
      : msg.sender?.profilePic
  }
  className="message-avatar"
  alt=""
/>
            <div className="message-content">
              <div className="message-sender">{msg.sender?.name}</div>
             <div className={isOwn ? "msg-own-text" : "msg-other-text"}>
  {msg.content}
</div>
              <div className="message-time">
                {new Date(msg.createdAt).toLocaleTimeString()}
              </div>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}

export default MessageList;