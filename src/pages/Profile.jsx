// src/pages/Profile.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Profile() {
  const [user, setUser] = useState({
    username: "",
    email: "",
    _id: "",
    createdAt: "",
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token"); // JWT token
        if (!token) {
          setMessage("No user logged in");
          setLoading(false);
          return;
        }

        const res = await axios.get("http://localhost:5000/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(res.data);
      } catch (err) {
        console.error(err);
        setMessage("Failed to fetch user");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.reload(); // or navigate to login page
  };

  if (loading) return <p>Loading user...</p>;

  if (message) return <p>{message}</p>;

  return (
    <div className="profile-page">
      <div className="profile-wrapper">
        <div className="profile-header">
          <div className="avatar">{user.username?.charAt(0).toUpperCase()}</div>

          <div className="header-info">
            <h2>{user.username}</h2>
            <p>{user.email}</p>
            <span className="status-badge">Active</span>
          </div>
        </div>

        <div className="profile-details">
          <div className="detail-item">
            <label>User ID</label>
            <p>{user._id}</p>
          </div>

          <div className="detail-item">
            <label>Joined</label>
            <p>{new Date(user.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="profile-actions">
          <button className="secondary-btn">Edit Profile</button>

          <button className="danger-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
