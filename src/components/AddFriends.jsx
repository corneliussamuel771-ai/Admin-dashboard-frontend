import { useEffect, useState } from "react";
import { BASE_URL } from "../constants";

export default function AddFriends() {
  const [users, setUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!token) return;

    Promise.all([
      fetch(`${BASE_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json()),

      fetch(`${BASE_URL}/api/friends`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json()),

      fetch(`${BASE_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json()),
    ])
      .then(([allUsers, friendsData, me]) => {
        setFriends(friendsData.map((f) => f._id));
        setSentRequests(me.sentRequests || []);

        const filtered = allUsers.filter(
          (u) =>
            u._id !== userId &&
            !friendsData.some((f) => f._id === u._id) &&
            !me.sentRequests?.includes(u._id),
        );

        setUsers(filtered);
      })
      .catch(console.error);
  }, []);

  const sendRequest = async (id) => {
    await fetch(`${BASE_URL}/api/friends/request/${id}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    setUsers((prev) => prev.filter((u) => u._id !== id));
  };

  return (
    <div className="add-friends-page">
      <h3>Add Friends</h3>

      {users.length === 0 ? (
        <p>No users to add</p>
      ) : (
        users.map((user) => (
          <div key={user._id} className="friend-card">
            <div>
              <p>{user.username}</p>
              <small>{user.email}</small>
            </div>

            <button onClick={() => sendRequest(user._id)}>Add Friend</button>
          </div>
        ))
      )}
    </div>
  );
}
