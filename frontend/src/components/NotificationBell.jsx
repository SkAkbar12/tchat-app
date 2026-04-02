// NotificationBell.js
import React, { useState, useRef, useEffect } from "react";
import "./css/notificationBell.css"; // we'll create this

const NotificationBell = ({ notifications, onSelectChat, onClearAll, onRemove }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.length;

  const handleNotificationClick = (notification) => {
    // When clicking a notification, select the corresponding chat
    onSelectChat({ _id: notification.chatId }); // we need full chat object? Actually onSelectChat expects a chat object.
    // But we only have chatId. We could fetch the chat details or pass just the id and let Home find it.
    // For simplicity, we'll pass an object with _id, and Home will need to find the full chat from the list.
    // We'll modify handleSelectChat in Home to accept id and find the chat.
    setShowDropdown(false);
    onRemove(notification.messageId); // remove this notification
  };

  return (
    <div className="notification-bell" ref={dropdownRef}>
      <button
        className="bell-button"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        🔔 {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
      </button>

      {showDropdown && (
        <div className="notification-dropdown">
          {notifications.length === 0 ? (
            <div className="no-notifications">No new messages</div>
          ) : (
            <>
              <div className="notification-header">
                <span>Notifications</span>
                <button onClick={onClearAll} className="clear-all">
                  Clear all
                </button>
              </div>
              <ul className="notification-list">
                {notifications.map((notif) => (
                  <li
                    key={notif.messageId}
                    className="notification-item"
                    onClick={() => handleNotificationClick(notif)}
                  >
                    <img
                      src={notif.senderPic || "/default-avatar.png"}
                      alt={notif.senderName}
                      className="notification-avatar"
                    />
                    <div className="notification-content">
                      <div className="notification-sender">{notif.senderName}</div>
                      <div className="notification-message">{notif.content}</div>
                      <div className="notification-time">
                        {new Date(notif.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;