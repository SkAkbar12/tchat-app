import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AuthContext from "../context/AuthContext";


export default function AuthProvider({ children }) {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authenticate, setAuthenticate] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const publicRoutes = ["/login", "/signup"];

  const API = "http://localhost:3000/api/auth";

  useEffect(() => {

    const initAuth = async () => {

      const token = localStorage.getItem("accessToken");
      const user=localStorage.getItem("userData");
      if (token && user) {
        try {
        const parsedUser = JSON.parse(user);
          setUser(parsedUser)
          setAuthenticate(true);

          // Redirect if already logged in
          if (publicRoutes.includes(location.pathname)) {
            navigate("/home");
          }

        } catch (err) {
          console.error("Invalid token");
          localStorage.removeItem("accessToken");
           localStorage.removeItem("userData");
          setUser(null);
          setAuthenticate(false);
        }

      } else {
        setAuthenticate(false);

        if (!publicRoutes.includes(location.pathname)) {
          navigate("/login");
        }
      }

      setLoading(false);
    };

    initAuth();

  }, [location.pathname]);

  const logout = async () => {
    try {
      await fetch(`${API}/logout`, {
        method: "POST",
        credentials: "include"
      });
    } catch (err) {
      console.log("Logout error:", err);
    }

    localStorage.removeItem("accessToken");
    setUser(null);
    setAuthenticate(false);

    navigate("/login");
  };

  const value = {
    user,
    setUser,
    logout,
    authenticate,
    setAuthenticate
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}