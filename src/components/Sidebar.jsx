import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../constants";

export default function Sidebar({ selected, requestCount }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Fetch active user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login"); // redirect if no token
          return;
        }

        // Use full backend URL if needed
        const res = await axios.get(`${BASE_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(res.data);
      } catch (err) {
        console.error(err);
        localStorage.removeItem("token"); // remove invalid token
        navigate("/login"); // redirect to login
      }
    };
    fetchUser();
  }, [navigate]);

  // Generate initials for avatar
  const getInitials = (name) => {
    if (!name) return "";
    const names = name.split(" ");
    return names.length > 1
      ? names[0][0].toUpperCase() + names[1][0].toUpperCase()
      : name[0].toUpperCase();
  };

  const items = [
    { id: "overview", label: "Overview", path: "/admin" },
    { id: "analytics", label: "Analytics", path: "/admin/analytics" },
    { id: "posts", label: "Posts", path: "/admin/posts" },
    { id: "friends", label: "Friends", path: "/admin/friends" },
    {
      id: "requests",
      label: (
        <>
          Requests{" "}
          {requestCount > 0 && <span className="badge">{requestCount}</span>}
        </>
      ),
      path: "/admin/requests",
    },
    { id: "settings", label: "Settings", path: "/admin/settings" },
    { id: "profile", label: "Profile", path: "/admin/profile" },
  ];

  // FIXED logout: use navigate instead of window.location.href
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login"); // SPA-friendly redirect
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Maxi Media</h2>
        {user && (
          <div className="user-info">
            <div className="avatar">{getInitials(user.username)}</div>
            <div>
              <p>
                <strong>{user.username}</strong>
              </p>
              <p>{user.email}</p>
            </div>
          </div>
        )}
      </div>

      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <button
              className={selected === item.id ? "active" : ""}
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </button>
          </li>
        ))}

        <li>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </li>
      </ul>
    </div>
  );
}
