import React from "react";

export default function Header({ toggleTheme }) {
  return (
    <div className="header">
      <h1>Dashboard</h1>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
}
