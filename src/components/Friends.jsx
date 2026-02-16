import { useEffect, useState } from "react";
import { BASE_URL } from "../constants";

export default function Friends() {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`${BASE_URL}/api/friends`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();

        // Deduplicate friends by _id
        const uniqueFriends = [
          ...new Map(data.map((f) => [f._id, f])).values(),
        ];

        setFriends(uniqueFriends);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch friends");
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, [token]);

  if (loading) return <p>Loading friends...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="friends-page">
      <h2>Your Friends</h2>

      <div className="friends-row">
        {/* Add Friend Card */}
        <div
          className="friend-card add-friend-card"
          onClick={() => alert("Add a new friend")}
        >
          <div className="friend-info">
            <p className="friend-username">+ Add Friend</p>
            <small className="friend-email">Invite someone to connect</small>
          </div>
        </div>

        {/* Existing friends */}
        {friends.map((f) => (
          <div key={f._id} className="friend-card">
            <img
              src={f.avatar || "/placeholder.png"}
              className="friend-avatar"
            />
            <div className="friend-info">
              <p className="friend-username">{f.username}</p>
              <p className="friend-email">{f.email}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {friends.length === 0 && !loading && <p>No friends yet</p>}
    </div>
  );
}
