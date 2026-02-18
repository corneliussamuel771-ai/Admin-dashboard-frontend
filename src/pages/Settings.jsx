import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import "./Settings.css";
import { BASE_URL } from "../constants";

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [modal, setModal] = useState({ type: "", open: false });
  const [inputValue, setInputValue] = useState("");
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Ensure the response contains username, email, and settings
      setSettings(res.data);
    } catch (err) {
      toast.error("Failed to fetch settings");
    }
  };

  const handleToggle = async (key) => {
    if (!settings) return;
    const oldValue = settings[key];
    setSettings({ ...settings, [key]: !oldValue });

    try {
      await axios.put(
        `${BASE_URL}/api/settings`,
        { [key]: !oldValue },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success(`${key} updated`);
    } catch (err) {
      setSettings({ ...settings, [key]: oldValue });
      toast.error("Failed to update setting");
    }
  };

  const openModal = (type, currentValue = "") => {
    setModal({ type, open: true });
    setInputValue(currentValue);
  };

  const closeModal = () => {
    setModal({ type: "", open: false });
    setInputValue("");
    setPasswords({ current: "", new: "", confirm: "" });
  };

  // SAVE USERNAME OR EMAIL
  const saveAccountInfo = async () => {
    if (!inputValue) return toast.error("Value cannot be empty");

    try {
      const res = await axios.put(
        `${BASE_URL}/api/users/${modal.type}`,
        { value: inputValue },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      toast.success(`${modal.type} updated successfully`);
      closeModal();
      // Update local state to reflect new username/email immediately
      setSettings((prev) => ({ ...prev, [modal.type]: res.data[modal.type] }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Error updating");
    }
  };

  // CHANGE PASSWORD
  const changePassword = async () => {
    if (!passwords.current || !passwords.new || !passwords.confirm)
      return toast.error("All fields are required");

    if (passwords.new !== passwords.confirm)
      return toast.error("New password and confirm password do not match");

    try {
      await axios.put(
        `${BASE_URL}/api/settings/password`,
        {
          currentPassword: passwords.current,
          newPassword: passwords.new,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success("Password changed successfully");
      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error changing password");
    }
  };

  const deleteAccount = async () => {
    if (!window.confirm("Are you sure? This cannot be undone.")) return;

    try {
      await axios.delete(`${BASE_URL}/api/settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      localStorage.removeItem("token");
      window.location.href = "/";
    } catch (err) {
      toast.error("Failed to delete account");
    }
  };

  const logoutAll = async () => {
    try {
      await axios.post(
        `${BASE_URL}/api/settings/logout-all`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      localStorage.removeItem("token");
      window.location.href = "/";
    } catch (err) {
      toast.error("Failed to logout all sessions");
    }
  };

  if (!settings) return <p>Loading...</p>;

  return (
    <div className="settings-page">
      <div className="settings-container">
        <h2>Settings</h2>

        {/* ACCOUNT */}
        <section>
          <h3>Account</h3>
          <div className="settings-item">
            <span>Change Username: {settings.username}</span>
            <button
              className="secondary-btn"
              onClick={() => openModal("username", settings.username)}
            >
              Edit
            </button>
          </div>
          <div className="settings-item">
            <span>Change Email: {settings.email}</span>
            <button
              className="secondary-btn"
              onClick={() => openModal("email", settings.email)}
            >
              Edit
            </button>
          </div>
          <div className="settings-item">
            <span>Change Password</span>
            <button
              className="secondary-btn"
              onClick={() => openModal("password")}
            >
              Update
            </button>
          </div>
        </section>

        {/* PRIVACY */}
        <section>
          <h3>Privacy</h3>
          <Toggle
            label="Public Profile"
            enabled={settings.isPublic}
            onClick={() => handleToggle("isPublic")}
          />
          <Toggle
            label="Allow Friend Requests"
            enabled={settings.allowRequests}
            onClick={() => handleToggle("allowRequests")}
          />
        </section>

        {/* NOTIFICATIONS */}
        <section>
          <h3>Notifications</h3>
          <Toggle
            label="Notify on Likes"
            enabled={settings.notifyLikes}
            onClick={() => handleToggle("notifyLikes")}
          />
          <Toggle
            label="Notify on Comments"
            enabled={settings.notifyComments}
            onClick={() => handleToggle("notifyComments")}
          />
        </section>

        {/* SECURITY */}
        <section>
          <h3>Security</h3>
          <button onClick={logoutAll} className="secondary-btn">
            Logout All Devices
          </button>
        </section>

        {/* DANGER ZONE */}
        <section className="danger">
          <h3>Danger Zone</h3>
          <button onClick={deleteAccount} className="danger-btn">
            Delete Account
          </button>
        </section>
      </div>

      {/* MODAL */}
      {modal.open && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>
              {modal.type === "password"
                ? "Change Password"
                : `Edit ${modal.type}`}
            </h3>

            {modal.type === "password" ? (
              <>
                <input
                  type="password"
                  placeholder="Current Password"
                  value={passwords.current}
                  onChange={(e) =>
                    setPasswords({ ...passwords, current: e.target.value })
                  }
                />
                <input
                  type="password"
                  placeholder="New Password"
                  value={passwords.new}
                  onChange={(e) =>
                    setPasswords({ ...passwords, new: e.target.value })
                  }
                />
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  value={passwords.confirm}
                  onChange={(e) =>
                    setPasswords({ ...passwords, confirm: e.target.value })
                  }
                />
                <button className="primary-btn" onClick={changePassword}>
                  Save Password
                </button>
              </>
            ) : (
              <>
                <input
                  type={modal.type === "email" ? "email" : "text"}
                  placeholder={`Enter new ${modal.type}`}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
                <button className="primary-btn" onClick={saveAccountInfo}>
                  Save
                </button>
              </>
            )}

            <button className="secondary-btn" onClick={closeModal}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Toggle({ label, enabled, onClick }) {
  return (
    <div className="settings-item">
      <span>{label}</span>
      <div className={`toggle ${enabled ? "enabled" : ""}`} onClick={onClick}>
        <div className="toggle-knob"></div>
      </div>
    </div>
  );
}
