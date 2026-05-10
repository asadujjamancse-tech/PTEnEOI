import { useState } from "react";

export default function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/app/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
      } else {
        localStorage.setItem("app_token", data.token);
        onLogin(data.token);
      }
    } catch {
      setError("Cannot reach server. Make sure it is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #030B1A 0%, #06132B 60%, #0A1A3A 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
    }}>
      <div style={{
        width: "100%",
        maxWidth: 400,
        padding: "40px 36px",
        background: "#0F1929",
        border: "1px solid #1E293B",
        borderRadius: 20,
        boxShadow: "0 24px 60px rgba(0,0,0,.6)",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 60,
            height: 60,
            borderRadius: 16,
            background: "linear-gradient(135deg,#0EA5E9,#2563EB)",
            fontSize: 26,
            fontWeight: 900,
            color: "#fff",
            marginBottom: 14,
            boxShadow: "0 8px 24px rgba(14,165,233,.35)",
          }}>90</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#F1F5F9", letterSpacing: "-0.5px" }}>
            PTE 90 Master
          </div>
          <div style={{ fontSize: 13, color: "#475569", marginTop: 4 }}>
            Sign in to continue
          </div>
        </div>

        <form onSubmit={submit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#94A3B8", marginBottom: 6 }}>
              USERNAME
            </label>
            <input
              type="text"
              autoComplete="username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "11px 14px",
                background: "#080E1A",
                border: "1px solid #1E293B",
                borderRadius: 10,
                color: "#F1F5F9",
                fontSize: 14,
                outline: "none",
                boxSizing: "border-box",
              }}
              placeholder="Enter your username"
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#94A3B8", marginBottom: 6 }}>
              PASSWORD
            </label>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "11px 14px",
                background: "#080E1A",
                border: "1px solid #1E293B",
                borderRadius: 10,
                color: "#F1F5F9",
                fontSize: 14,
                outline: "none",
                boxSizing: "border-box",
              }}
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <div style={{
              background: "#2D0A0A",
              border: "1px solid #7F1D1D",
              borderRadius: 8,
              padding: "10px 14px",
              color: "#FCA5A5",
              fontSize: 13,
              marginBottom: 16,
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              background: loading ? "#1E3A5F" : "linear-gradient(135deg,#0EA5E9,#2563EB)",
              border: "none",
              borderRadius: 10,
              color: "#fff",
              fontWeight: 700,
              fontSize: 15,
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: loading ? "none" : "0 6px 20px rgba(14,165,233,.3)",
              transition: "all .2s ease",
            }}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
