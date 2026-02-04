import { Link } from "react-router-dom";
import { useAuth } from "../state/AuthContext.tsx";

export const TopNav = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="top-nav">
      <div className="nav-left">
        <span className="app-name">Culture Plans Hub</span>
        <span className="badge-accent">Local Marketing</span>
      </div>
      <div className="nav-right">
        <div className="nav-links">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/upload">Upload</Link>
        </div>
        <div className="user-meta">
          <span className="user-name">{user?.email}</span>
          <span className="user-region">
            {user?.role.toUpperCase()} {user?.region ? `• ${user.region}` : ""}
          </span>
        </div>
        <button
          className="btn btn-ghost btn-ghost-light"
          type="button"
          onClick={logout}
        >
          Sign out
        </button>
      </div>
    </nav>
  );
};
