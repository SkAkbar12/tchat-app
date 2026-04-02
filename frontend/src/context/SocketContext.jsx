import React, { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";

const SocketContext = createContext(null);
const endpoint = "http://localhost:3000";

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error("useSocket must be used within SocketProvider");
  return context;
};

export const SocketProvider = ({ children, user }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  useEffect(() => {
    if (!user?._id) return;

    const newSocket = io(endpoint, { transports: ["websocket"] });
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Socket connected");
      newSocket.emit("setup", user);
    });

    newSocket.on("connected", () => setConnected(true));

    // Handle disconnection explicitly
    newSocket.on("disconnect", () => {
      console.log("Socket disconnected");
      setConnected(false);
    });

    newSocket.on("user-online", (userId) => {
      setOnlineUsers(prev => new Set(prev).add(userId));
    });

    newSocket.on("user-offline", (userId) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    });

    newSocket.on("connect_error", (err) => console.error("Socket error:", err));

    return () => {
      newSocket.disconnect();
      setSocket(null);
      setConnected(false);
      setOnlineUsers(new Set());
    };
  }, [user?._id]);

  return (
    <SocketContext.Provider value={{ socket, connected, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};