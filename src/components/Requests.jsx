import React, { useState, useEffect } from "react";
import "./Requests.css"; // We'll create this for styling

export default function Requests() {
  const [requests, setRequests] = useState([]);

  // Fetch incoming friend requests
  const fetchRequests = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch("http://localhost:5000/api/friends/requests", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch requests");
      const data = await res.json();
      setRequests(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Accept a friend request
  const acceptRequest = async (userId) => {
    const token = localStorage.getItem("token");
    try {
      await fetch(`http://localhost:5000/api/friends/accept/${userId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests((prev) => prev.filter((r) => r._id !== userId));
    } catch (err) {
      console.error(err);
    }
  };

  // Reject a friend request
  const rejectRequest = async (userId) => {
    const token = localStorage.getItem("token");
    try {
      await fetch(`http://localhost:5000/api/friends/reject/${userId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests((prev) => prev.filter((r) => r._id !== userId));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div className="requests-page">
      <h2>Incoming Friend Requests</h2>

      {requests.length === 0 ? (
        <p className="no-requests">No pending requests</p>
      ) : (
        <div className="requests-list">
          {requests.map((user) => (
            <div key={user._id} className="request-card">
              <div className="user-info">
                <p className="username">{user.username}</p>
                <p className="email">{user.email}</p>
              </div>
              <div className="actions">
                <button
                  className="accept-btn"
                  onClick={() => acceptRequest(user._id)}
                >
                  Accept
                </button>
                <button
                  className="reject-btn"
                  onClick={() => rejectRequest(user._id)}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}



