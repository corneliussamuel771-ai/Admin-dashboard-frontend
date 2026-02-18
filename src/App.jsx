// src/App.jsx
import { Routes, Route, Outlet, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
<Toaster position="topright" />;
import Admin from "./pages/Admin.jsx";
import Post from "./pages/Post.jsx";
import Login from "./pages/Login.jsx";
import Profile from "./pages/Profile.jsx";
import Signup from "./pages/Signup.jsx";
import Settings from "./pages/Settings.jsx";
import Sidebar from "./components/Sidebar.jsx";
import "./App.css";
import "./Login.css";
import "./Friends.css";
import "./auth.css";

// Layout wrapper for admin routes with sidebar
function AdminLayout() {
  return (
    <div style={{ display: "flex" }}>
      <div style={{ flex: 1, padding: "20px" }}>
        <Outlet />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Redirect "/" to "/login" */}
      <Route path="/" element={<Navigate to="/login" />} />

      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected admin routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Admin />} />
        <Route path="analytics" element={<Admin view="analytics" />} />
        <Route path="friends" element={<Admin view="friends" />} />
        <Route path="requests" element={<Admin view="requests" />} />
        <Route path="settings" element={<Settings />} />
        <Route path="posts" element={<Post />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}
