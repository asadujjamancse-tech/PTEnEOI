import { useState } from "react";
import { motion } from "framer-motion";

// ── Orbit ring definitions ────────────────────────────────────────────────────
// Each ring: radius (px), speed (s), direction, array of { ch, color, size }
const RINGS = [
  {
    id: "r1", radius: 95, speed: 9, cw: true,
    letters: [
      { ch: "S", color: "#06b6d4", size: 26 },
      { ch: "P", color: "#a855f7", size: 22 },
      { ch: "T", color: "#10b981", size: 24 },
    ],
  },
  {
    id: "r2", radius: 180, speed: 16, cw: false,
    letters: [
      { ch: "E", color: "#f59e0b", size: 30 },
      { ch: "A", color: "#ef4444", size: 26 },
      { ch: "K", color: "#6366f1", size: 28 },
      { ch: "W", color: "#22c55e", size: 24 },
    ],
  },
  {
    id: "r3", radius: 270, speed: 23, cw: true,
    letters: [
      { ch: "R", color: "#ec4899", size: 36 },
      { ch: "I", color: "#3b82f6", size: 28 },
      { ch: "N", color: "#f97316", size: 30 },
      { ch: "G", color: "#14b8a6", size: 26 },
      { ch: "L", color: "#8b5cf6", size: 32 },
    ],
  },
  {
    id: "r4", radius: 370, speed: 32, cw: false,
    letters: [
      { ch: "9",   color: "#06b6d4", size: 44 },
      { ch: "0",   color: "#a855f7", size: 42 },
      { ch: "P",   color: "#22c55e", size: 36 },
      { ch: "T",   color: "#f59e0b", size: 38 },
      { ch: "E",   color: "#3b82f6", size: 40 },
      { ch: "A",   color: "#ef4444", size: 34 },
    ],
  },
];

const ZONES = [
  { tag: "S", from: "#06b6d4", to: "#3b82f6" },
  { tag: "W", from: "#a855f7", to: "#6366f1" },
  { tag: "R", from: "#10b981", to: "#14b8a6" },
  { tag: "L", from: "#f59e0b", to: "#f97316" },
];

export default function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res  = await fetch("/api/auth/app/login", {
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
      position: "relative", minHeight: "100vh", overflow: "hidden",
      background: "#020b24",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Inter','Segoe UI',sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
        * { box-sizing: border-box; }

        /* ── Orbit keyframes ───────────────────────── */
        @keyframes orbit-cw  { to { transform: rotate( 360deg); } }
        @keyframes orbit-ccw { to { transform: rotate(-360deg); } }

        /* Keep letter visually upright while arm rotates */
        @keyframes upright-cw  { to { transform: translateX(var(--r)) translateY(-50%) rotate(-360deg); } }
        @keyframes upright-ccw { to { transform: translateX(var(--r)) translateY(-50%) rotate( 360deg); } }

        .orbit-arm {
          position: absolute; top: 0; left: 0; width: 0; height: 0;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          animation-fill-mode: both;
        }
        .orbit-arm.cw  { animation-name: orbit-cw;  }
        .orbit-arm.ccw { animation-name: orbit-ccw; }

        .orbit-letter {
          position: absolute;
          font-weight: 900; user-select: none; pointer-events: none;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          animation-fill-mode: both;
          /* base position: moved out by --r from arm origin */
          transform: translateX(var(--r)) translateY(-50%);
        }
        .orbit-arm.cw  .orbit-letter { animation-name: upright-cw;  }
        .orbit-arm.ccw .orbit-letter { animation-name: upright-ccw; }

        /* Login inputs */
        .login-input {
          width: 100%; padding: 13px 16px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 12px; color: #F1F5F9;
          font-size: 14px; font-family: inherit; outline: none;
          transition: border-color .2s, background .2s, box-shadow .2s;
          backdrop-filter: blur(4px);
        }
        .login-input:focus {
          border-color: #0EA5E9;
          background: rgba(14,165,233,0.08);
          box-shadow: 0 0 0 3px rgba(14,165,233,0.15);
        }
        .login-input::placeholder { color: rgba(255,255,255,0.22); }
      `}</style>

      {/* Centre glow */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse at 50% 50%, rgba(14,165,233,0.10), transparent 65%)",
      }} />

      {/* ── Orbital rings ── fixed at viewport centre */}
      <div style={{
        position: "fixed", top: "50%", left: "50%",
        width: 0, height: 0,
        pointerEvents: "none", zIndex: 1,
      }}>
        {RINGS.flatMap((ring) =>
          ring.letters.map((lt, i) => {
            /* Negative delay pre-runs the animation so letters are evenly spaced */
            const delay = `${-((ring.speed / ring.letters.length) * i)}s`;
            return (
              <div
                key={`${ring.id}-${i}`}
                className={`orbit-arm ${ring.cw ? "cw" : "ccw"}`}
                style={{
                  animationDuration: `${ring.speed}s`,
                  animationDelay: delay,
                }}
              >
                <span
                  className="orbit-letter"
                  style={{
                    "--r": `${ring.radius}px`,
                    fontSize: lt.size,
                    color: lt.color,
                    animationDuration: `${ring.speed}s`,
                    animationDelay: delay,
                    textShadow: `0 0 18px ${lt.color}88`,
                  }}
                >
                  {lt.ch}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* ── Login card ── */}
      <motion.div
        initial={{ opacity: 0, y: 36 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "relative", zIndex: 10,
          width: "100%", maxWidth: 430,
          margin: "24px 16px",
          borderRadius: 24,
          border: "1px solid rgba(14,165,233,0.22)",
          background: "rgba(2,11,36,0.88)",
          backdropFilter: "blur(36px)",
          WebkitBackdropFilter: "blur(36px)",
          boxShadow: "0 0 80px rgba(14,165,233,0.14), 0 40px 80px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.06)",
          padding: "36px 32px",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 22 }}>
          <motion.div
            animate={{ boxShadow: ["0 0 22px rgba(59,130,246,0.4)", "0 0 50px rgba(14,165,233,0.85)", "0 0 22px rgba(59,130,246,0.4)"] }}
            transition={{ duration: 3, repeat: Infinity }}
            style={{
              marginBottom: 16, width: 90, height: 90, borderRadius: 22,
              background: "linear-gradient(135deg,#22d3ee,#2563eb)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <span style={{ fontSize: 36, fontWeight: 900, color: "#fff", letterSpacing: "-1px" }}>90</span>
          </motion.div>

          <h1 style={{ margin: 0, fontSize: 30, fontWeight: 800, color: "#fff", letterSpacing: "-0.4px" }}>
            PTE <span style={{ color: "#22d3ee" }}>90</span> Master
          </h1>
          <p style={{ margin: "7px 0 0", fontSize: 13, color: "rgba(255,255,255,0.38)", textAlign: "center" }}>
            AI-Powered PTE Academic Practice
          </p>
        </div>

        {/* SWRL pills */}
        <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 26 }}>
          {ZONES.map((z, i) => (
            <motion.div
              key={z.tag}
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.35 + i * 0.08, type: "spring", stiffness: 280, damping: 22 }}
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.92 }}
              style={{
                width: 54, height: 54, borderRadius: 15,
                background: `linear-gradient(135deg,${z.from},${z.to})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontWeight: 900, fontSize: 19,
                boxShadow: `0 4px 18px rgba(0,0,0,0.45)`,
                cursor: "default",
              }}
            >
              {z.tag}
            </motion.div>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={submit}>
          <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
            <div>
              <label style={{ display: "block", fontSize: 10.5, fontWeight: 700, color: "rgba(255,255,255,0.32)", letterSpacing: "0.9px", marginBottom: 7 }}>
                USERNAME
              </label>
              <input className="login-input" type="text" autoComplete="username"
                value={username} onChange={e => setUsername(e.target.value)}
                required placeholder="Enter your username" />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 10.5, fontWeight: 700, color: "rgba(255,255,255,0.32)", letterSpacing: "0.9px", marginBottom: 7 }}>
                PASSWORD
              </label>
              <input className="login-input" type="password" autoComplete="current-password"
                value={password} onChange={e => setPassword(e.target.value)}
                required placeholder="Enter your password" />
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                marginTop: 12,
                background: "rgba(248,113,113,0.1)",
                border: "1px solid rgba(248,113,113,0.3)",
                borderRadius: 10, padding: "10px 14px",
                color: "#FCA5A5", fontSize: 13,
              }}
            >
              {error}
            </motion.div>
          )}

          <motion.button
            type="submit" disabled={loading}
            whileHover={!loading ? { scale: 1.02, boxShadow: "0 0 34px rgba(14,165,233,0.65)" } : {}}
            whileTap={!loading ? { scale: 0.97 } : {}}
            style={{
              marginTop: 20, width: "100%", padding: "14px",
              border: "none", borderRadius: 12,
              fontSize: 15, fontWeight: 700, fontFamily: "inherit",
              cursor: loading ? "not-allowed" : "pointer",
              background: loading ? "rgba(30,41,59,0.8)" : "linear-gradient(135deg,#0ea5e9,#2563eb)",
              color: loading ? "rgba(255,255,255,0.3)" : "#fff",
              boxShadow: loading ? "none" : "0 8px 24px rgba(14,165,233,0.35)",
              transition: "background .2s, color .2s, box-shadow .2s",
            }}
          >
            {loading ? "Signing in…" : "Sign In →"}
          </motion.button>
        </form>

        <p style={{ marginTop: 18, textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.18)" }}>
          Speaking · Writing · Reading · Listening
        </p>
      </motion.div>
    </div>
  );
}
