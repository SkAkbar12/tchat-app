import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/useAuth";
import { SocketProvider } from "./context/SocketContext";
import Home from './components/Home';
import Login from "./LoginComponent/Login";
import Signup from "./LoginComponent/Signup";

function ProtectedRoute({ children }) {
  const { authenticate } = useAuth();
  const location = useLocation();
  const publicRoutes = ["/login", "/signup"];

  if (!authenticate && !publicRoutes.includes(location.pathname)) {
    return <Navigate to="/login" />;
  }
  if (authenticate && publicRoutes.includes(location.pathname)) {
    return <Navigate to="/home" />;
  }
  return children;
}

function App() {
  const { loading, user } = useAuth();

  if (loading) return <div>Checking authentication...</div>;

  return (
    <SocketProvider user={user}>
      <Routes>
        <Route path="/login" element={<ProtectedRoute><Login /></ProtectedRoute>} />
        <Route path="/signup" element={<ProtectedRoute><Signup /></ProtectedRoute>} />
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><div>Admin Panel</div></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/home" />} />
      </Routes>
    </SocketProvider>
  );
}

export default App;