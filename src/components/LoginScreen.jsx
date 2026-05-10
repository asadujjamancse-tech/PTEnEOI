import { useState, useEffect } from "react";

const FLOATING = [
  { ch: "S", x: 8,  y: 12, size: 120, delay: 0,    dur: 7 },
  { ch: "P", x: 82, y: 8,  size: 80,  delay: 1.2,  dur: 9 },
  { ch: "E", x: 55, y: 70, size: 100, delay: 0.5,  dur: 8 },
  { ch: "A", x: 20, y: 60, size: 60,  delay: 2,    dur: 11 },
  { ch: "K", x: 70, y: 40, size: 90,  delay: 0.8,  dur: 6 },
  { ch: "W", x: 90, y: 65, size: 110, delay: 1.5,  dur: 10 },
  { ch: "R", x: 40, y: 85, size: 75,  delay: 3,    dur: 7.5 },
  { ch: "I", x: 5,  y: 80, size: 55,  delay: 0.3,  dur: 9.5 },
  { ch: "T", x: 60, y: 20, size: 85,  delay: 1.8,  dur: 8.5 },
  { ch: "L", x: 30, y: 35, size: 70,  delay: 2.5,  dur: 12 },
  { ch: "N", x: 75, y: 88, size: 65,  delay: 0.7,  dur: 6.5 },
  { ch: "G", x: 48, y: 5,  size: 95,  delay: 4,    dur: 9 },
  { ch: "9", x: 15, y: 45, size: 50,  delay: 1,    dur: 10.5 },
  { ch: "0", x: 88, y: 30, size: 55,  delay: 2.2,  dur: 7 },
];

const TITLE_CHARS = ["P","T","E"," ","9","0"," ","M","a","s","t","e","r"];

const ZONE_ITEMS = [
  { tag: "S", label: "Speaking",  color: "#38BDF8", tasks: "Read Aloud · Repeat Sentence" },
  { tag: "W", label: "Writing",   color: "#A78BFA", tasks: "Write Essay · Summarize Text" },
  { tag: "R", label: "Reading",   color: "#34D399", tasks: "Fill Blanks · Reorder Para" },
  { tag: "L", label: "Listening", color: "#FBBF24", tasks: "Write Dictation · Summarize" },
];

export default function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [titleReady, setTitleReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setTitleReady(true), 300);
    return () => clearTimeout(t);
  }, []);

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
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #020812 0%, #050F24 40%, #080D1E 100%)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative", fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>

      {/* Animated CSS */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        @keyframes floatLetter {
          0%   { transform: translateY(0px)   rotate(0deg)   scale(1);    opacity: var(--op-start); }
          33%  { transform: translateY(-28px) rotate(6deg)   scale(1.05); opacity: var(--op-mid); }
          66%  { transform: translateY(-14px) rotate(-4deg)  scale(0.97); opacity: var(--op-start); }
          100% { transform: translateY(0px)   rotate(0deg)   scale(1);    opacity: var(--op-mid); }
        }
        @keyframes letterDrop {
          from { opacity: 0; transform: translateY(-24px); filter: blur(6px); }
          to   { opacity: 1; transform: translateY(0);     filter: blur(0); }
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 30px #0EA5E960, 0 0 60px #0EA5E930; }
          50%      { box-shadow: 0 0 50px #0EA5E990, 0 0 90px #0EA5E950; }
        }
        @keyframes scanline {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(400%); }
        }
        @keyframes zoneBadgePop {
          from { opacity: 0; transform: scale(0.8) translateY(10px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes ringRotate {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .login-input {
          width: 100%;
          padding: 12px 16px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 12px;
          color: #F1F5F9;
          font-size: 14px;
          font-family: inherit;
          outline: none;
          transition: all .25s;
          box-sizing: border-box;
          backdrop-filter: blur(4px);
        }
        .login-input:focus {
          border-color: #0EA5E9;
          background: rgba(14,165,233,0.08);
          box-shadow: 0 0 0 3px rgba(14,165,233,0.15);
        }
        .login-input::placeholder { color: rgba(255,255,255,0.25); }
        .login-btn {
          width: 100%;
          padding: 14px;
          border: none;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 700;
          font-family: inherit;
          cursor: pointer;
          transition: all .25s;
          position: relative;
          overflow: hidden;
        }
        .login-btn:not(:disabled) {
          background: linear-gradient(135deg, #0EA5E9, #2563EB);
          color: #fff;
          box-shadow: 0 8px 24px rgba(14,165,233,0.35);
        }
        .login-btn:not(:disabled):hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(14,165,233,0.5);
        }
        .login-btn:disabled {
          background: rgba(30,41,59,0.8);
          color: rgba(255,255,255,0.3);
          cursor: not-allowed;
        }
        .login-btn:not(:disabled):active {
          transform: translateY(0);
        }
      `}</style>

      {/* Radial glow orbs */}
      <div style={{ position: "absolute", top: "20%", left: "15%", width: 400, height: 400, background: "radial-gradient(circle, rgba(14,165,233,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "20%", right: "15%", width: 350, height: 350, background: "radial-gradient(circle, rgba(167,139,250,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />

      {/* Floating letters */}
      {FLOATING.map((f, i) => (
        <div key={i} style={{
          position: "absolute",
          left: `${f.x}%`,
          top: `${f.y}%`,
          fontSize: f.size,
          fontWeight: 900,
          color: "rgba(255,255,255,0.04)",
          userSelect: "none",
          pointerEvents: "none",
          lineHeight: 1,
          "--op-start": "0.04",
          "--op-mid": "0.08",
          animation: `floatLetter ${f.dur}s ease-in-out ${f.delay}s infinite`,
        }}>
          {f.ch}
        </div>
      ))}

      {/* Main card */}
      <div style={{
        position: "relative",
        width: "100%",
        maxWidth: 460,
        margin: "0 20px",
        background: "rgba(10,18,34,0.85)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 24,
        padding: "40px 36px",
        backdropFilter: "blur(30px)",
        boxShadow: "0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}>
        {/* Scanline effect */}
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius: 24, pointerEvents: "none" }}>
          <div style={{ position: "absolute", left: 0, right: 0, height: "40%", background: "linear-gradient(to bottom, transparent, rgba(14,165,233,0.015), transparent)", animation: "scanline 4s linear infinite" }} />
        </div>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 72, height: 72, borderRadius: 20, background: "linear-gradient(135deg,#0EA5E9,#2563EB)", marginBottom: 16, animation: "glowPulse 3s ease-in-out infinite", position: "relative" }}>
            {/* Rotating ring */}
            <div style={{ position: "absolute", inset: -4, borderRadius: 24, border: "2px solid transparent", borderTopColor: "rgba(56,189,248,0.6)", borderRightColor: "rgba(56,189,248,0.2)", animation: "ringRotate 3s linear infinite" }} />
            <span style={{ fontSize: 28, fontWeight: 900, color: "#fff", letterSpacing: "-1px" }}>90</span>
          </div>

          {/* Animated title */}
          <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.5px", lineHeight: 1.2, marginBottom: 6 }}>
            {TITLE_CHARS.map((ch, i) => (
              <span key={i} style={{
                display: "inline-block",
                color: (i === 4 || i === 5) ? "#38BDF8" : "#F1F5F9",
                opacity: titleReady ? 1 : 0,
                animation: titleReady ? `letterDrop 0.5s ease forwards` : "none",
                animationDelay: `${i * 0.06}s`,
                whiteSpace: ch === " " ? "pre" : "normal",
                minWidth: ch === " " ? "0.3em" : undefined,
              }}>{ch}</span>
            ))}
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", letterSpacing: "0.5px" }}>
            AI-Powered PTE Academic Practice
          </div>
        </div>

        {/* SWRL badges */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 28 }}>
          {ZONE_ITEMS.map((z, i) => (
            <div key={z.tag} style={{
              background: `${z.color}10`,
              border: `1px solid ${z.color}30`,
              borderRadius: 12,
              padding: "8px 6px",
              textAlign: "center",
              animation: `zoneBadgePop 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards`,
              animationDelay: `${0.3 + i * 0.1}s`,
              opacity: 0,
            }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: z.color, lineHeight: 1 }}>{z.tag}</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 3, fontWeight: 600 }}>{z.label.toUpperCase()}</div>
            </div>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={submit}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", marginBottom: 7, letterSpacing: "0.8px" }}>
              USERNAME
            </label>
            <input
              className="login-input"
              type="text"
              autoComplete="username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              placeholder="Enter your username"
            />
          </div>

          <div style={{ marginBottom: 22 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", marginBottom: 7, letterSpacing: "0.8px" }}>
              PASSWORD
            </label>
            <input
              className="login-input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <div style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 10, padding: "10px 14px", color: "#FCA5A5", fontSize: 13, marginBottom: 16 }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="login-btn">
            {loading ? "Signing in…" : "Sign In →"}
          </button>
        </form>

        <div style={{ marginTop: 20, textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.2)" }}>
          Speaking · Writing · Reading · Listening
        </div>
      </div>
    </div>
  );
}
