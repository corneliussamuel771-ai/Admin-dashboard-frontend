import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import StatsCard from "../components/StatsCard";
import Chart from "../components/Chart";
import Friends from "../components/Friends.jsx";
import AddFriends from "../components/AddFriends.jsx";
import SkeletonCard from "../components/SkeletonCard";
import SkeletonChart from "../components/SkeletonChart";
import Requests from "../components/Requests.jsx";
import { apiFetch } from "../api";

export default function Admin({ view = "overview" }) {
  const [selected] = useState("overview");
  const [theme, setTheme] = useState("light");
  const [overview, setOverview] = useState({});
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [requests, setRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((prev) => (prev === "light" ? "dark" : "light"));

  const fetchOverview = async () => {
    try {
      setLoadingOverview(true);
      const data = await apiFetch("/admin/overview");
      setOverview(data);
    } finally {
      setLoadingOverview(false);
    }
  };

  const fetchRequests = async () => {
    const data = await apiFetch("/friends/requests");
    setRequests(data);
  };

  const fetchFriends = async () => {
    const data = await apiFetch("/friends");
    setFriends(data);
  };

  const fetchAllUsers = async () => {
    const data = await apiFetch("/users");
    const userId = localStorage.getItem("userId");
    setAllUsers(data.filter((u) => u._id !== userId));
  };

  useEffect(() => {
    fetchOverview();
    fetchRequests();
    fetchFriends();
    fetchAllUsers();
  }, []);

  return (
    <div className="app">
      <Sidebar selected="overview" requestCount={requests.length} />
      <div className="main">
        <Header toggleTheme={toggleTheme} />
        {view === "overview" && (
          <>
            <h2>Overview</h2>

            <div className="stats-container">
              {loadingOverview ? (
                <>
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </>
              ) : (
                <>
                  <StatsCard
                    title="Followers"
                    value={overview.followers ?? 0}
                  />
                  <StatsCard title="Likes" value={overview.likes ?? 0} />
                  <StatsCard title="Posts" value={overview.posts ?? 0} />
                  <StatsCard title="Comments" value={overview.comments ?? 0} />
                  <StatsCard
                    title="Engagement"
                    value={`${overview.engagement ?? 0}%`}
                  />
                </>
              )}
            </div>

            {loadingOverview ? (
              <SkeletonChart />
            ) : (
              <Chart data={overview.weeklyFollowers ?? []} />
            )}
          </>
        )}

        {view === "friends" && (
          <>
            <Friends />
            <AddFriends />
          </>
        )}

        {view === "requests" && <Requests />}
      </div>
    </div>
  );
}
