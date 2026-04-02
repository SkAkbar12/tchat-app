import React, { useState, useEffect } from "react";
import "./css/home.css";
import { useAuth } from "../context/useAuth";
import fetchWithAuth from "../fetchWithAuth";
import SearchBar from "./SearchBar";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";

function Home() {
  const { user, logout } = useAuth();

  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);

  // ✅ NOTIFICATIONS STATE (FROM LOCAL STORAGE)
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem("notifications");
    return saved ? JSON.parse(saved) : [];
  });

  const [showNotifications, setShowNotifications] = useState(false);

  // ✅ SAVE TO LOCAL STORAGE
  useEffect(() => {
    localStorage.setItem("notifications", JSON.stringify(notifications));
  }, [notifications]);

  // ✅ FETCH CHATS
  const fetchChats = async () => {
  try {
    const res = await fetchWithAuth("chats");
    const data = await res.json();
    if (data.success) setChats(data.message);
  } catch (err) {
    console.error(err);
  }
};

useEffect(() => {
  fetchChats();
}, []);
  return (
    <div className="home-container">
      <div className="sidebar">
        
        {/* 🔔 TOP BAR */}
        <div className="top-bar">
          <img src={user?.profilePic} className="profile-pic" alt="" />
   <div style={{ color: "black" }}>{user?.name}</div>
          {/* 🔔 NOTIFICATION BELL */}
          <div className="notification-wrapper">
            <button
              className="bell-btn"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              🔔
              {notifications.length > 0 && (
                <span className="badge">{notifications.length}</span>
              )}
            </button>

            {/* 🔔 DROPDOWN */}
            {showNotifications && (
              <div className="notification-dropdown">
                {notifications.length === 0 ? (
                  <p>No messages</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      className="notification-item"
                      onClick={() => {
                        setSelectedChat(n.chat);

                        // remove after click
                        setNotifications((prev) =>
                          prev.filter((x) => x._id !== n._id)
                        );

                        setShowNotifications(false);
                      }}
                    >
                      <b>{n.sender?.name}</b>: {n.content}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <button onClick={logout}>Logout</button>
        </div>

       <SearchBar onSelectChat={setSelectedChat} />

        <ChatList
          chats={chats}
          selectedChat={selectedChat}
          onSelectChat={setSelectedChat}
          currentUser={user}
        />
      </div>

      {/* ✅ PASS setNotifications */}
      <ChatWindow
        selectedChat={selectedChat}
        currentUser={user}
        onChatUpdate={fetchChats}
        setNotifications={setNotifications}
      />
    </div>
  );
}

export default Home;