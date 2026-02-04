import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext.tsx";
import type { Region, UserRole } from "../types.ts";

const regions: Region[] = [
  "Northeast",
  "Southeast",
  "Midwest",
  "Central",
  "West",
  "National",
];

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("regional");
  const [region, setRegion] = useState<Region>("Northeast");
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    try {
      await login({
        email,
        role,
        region: role === "regional" ? region : null,
      });
      navigate("/dashboard");
    } catch (err) {
      setError("Login failed. Check your details.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <span className="badge-accent">Culture Plans Hub</span>
          <h1>Sign in</h1>
          <p className="subtle">Upload decks and manage campaigns.</p>
        </div>
        <form className="form-stack" onSubmit={handleSubmit}>
          <label className="form-group">
            <span>Email</span>
            <input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label className="form-group">
            <span>Role</span>
            <select
              value={role}
              onChange={(event) => setRole(event.target.value as UserRole)}
            >
              <option value="regional">Regional</option>
              <option value="national">National</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          {role === "regional" ? (
            <label className="form-group">
              <span>Region</span>
              <select
                value={region}
                onChange={(event) => setRegion(event.target.value as Region)}
              >
                {regions
                  .filter((item) => item !== "National")
                  .map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
              </select>
            </label>
          ) : null}
          {error ? <div className="inline-warning">{error}</div> : null}
          <button className="btn btn-primary" type="submit">
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
};
