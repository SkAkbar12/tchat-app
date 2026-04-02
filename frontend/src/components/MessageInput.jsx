import React, { useState } from "react";

function MessageInput({ onSend }) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSend(message);
      setMessage("");
    }
  };

  return (
    <form className="message-input-box" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Type message..."
        className="message-input"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button type="submit" className="send-btn">
        Send
      </button>
    </form>
  );
}

export default MessageInput;