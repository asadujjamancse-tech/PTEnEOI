import { useState, useEffect } from "react";
import useStreakXP from "../hooks/useStreakXP";

const CHALLENGE_KEY = "pte_daily_challenges_v1";

// Pool of possible challenges — 3 are picked deterministically by date
const CHALLENGE_POOL = [
  { id: "wfd5",    label: "Complete 5 Write From Dictation",  xp: 30, icon: "✍️",  tab: "listening", sub: "dictation" },
  { id: "scorer2", label: "Score 2 essays with AI Scorer",    xp: 40, icon: "🤖",  tab: "scorer" },
  { id: "vocab20", label: "Score 20+ in Rapid Vocab",         xp: 35, icon: "⚡",  tab: "vocab" },
  { id: "read3",   label: "Practice Read Aloud 3 times",      xp: 25, icon: "📖",  tab: "speaking", sub: "read_aloud" },
  { id: "smart3",  label: "Do 3 Smart Dictation rounds",      xp: 35, icon: "🧠",  tab: "listening", sub: "smart" },
  { id: "repeat5", label: "Complete 5 Repeat Sentences",      xp: 25, icon: "🔁",  tab: "speaking", sub: "repeat_sentence" },
  { id: "essay1",  label: "Submit a 200+ word essay",         xp: 45, icon: "📝",  tab: "writing", sub: "essay" },
  { id: "reorder3",label: "Do 3 Reorder Paragraphs",          xp: 20, icon: "🔀",  tab: "reading", sub: "reorder" },
  { id: "smart5",  label: "Review 5 SRS sentences",           xp: 30, icon: "🎯",  tab: "listening", sub: "smart" },
  { id: "tracker1",label: "Log today's practice scores",      xp: 15, icon: "📊",  tab: "tracker" },
];

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// Deterministic daily pick based on date string — same 3 challenges per day for all users
function pickForDay(dateStr) {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) hash = (hash * 31 + dateStr.charCodeAt(i)) >>> 0;
  const indices = [];
  let seed = hash;
  while (indices.length < 3) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const idx = seed % CHALLENGE_POOL.length;
    if (!indices.includes(idx)) indices.push(idx);
  }
  return indices.map(i => CHALLENGE_POOL[i]);
}

function loadState() {
  try {
    const raw = JSON.parse(localStorage.getItem(CHALLENGE_KEY) || "{}");
    if (raw.date !== todayStr()) return { date: todayStr(), done: [] };
    return raw;
  } catch { return { date: todayStr(), done: [] }; }
}

export default function DailyChallenges({ onNavigate }) {
  const [state, setState] = useState(loadState);
  const { addXP } = useStreakXP();
  const today = todayStr();
  const challenges = pickForDay(today);

  // Refresh at midnight
  useEffect(() => {
    const now = new Date();
    const msToMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1) - now;
    const t = setTimeout(() => setState({ date: todayStr(), done: [] }), msToMidnight);
    return () => clearTimeout(t);
  }, []);

  const markDone = (id, xp) => {
    if (state.done.includes(id)) return;
    const next = { date: today, done: [...state.done, id] };
    setState(next);
    localStorage.setItem(CHALLENGE_KEY, JSON.stringify(next));
    addXP(xp, `Daily challenge: ${id}`);
  };

  const allDone = challenges.every(c => state.done.includes(c.id));
  const donePct = Math.round((state.done.filter(id => challenges.some(c => c.id === id)).length / 3) * 100);

  return (
    <div style={{ background: "#0A1222", border: "1px solid #1E293B", borderRadius: 12, padding: 16, marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>📅 Daily Challenges</div>
          <div style={{ fontSize: 11, color: "#475569" }}>Resets at midnight · Complete all 3 for bonus XP</div>
        </div>
        <div style={{ fontSize: 12, color: allDone ? "#34D399" : "#64748B", fontWeight: 700 }}>
          {allDone ? "✅ All done!" : `${donePct}%`}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, background: "#1E293B", borderRadius: 4, marginBottom: 12, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${donePct}%`, background: "linear-gradient(90deg,#FBBF24,#F59E0B)", borderRadius: 4, transition: "width .4s" }} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {challenges.map(c => {
          const done = state.done.includes(c.id);
          return (
            <div key={c.id} style={{
              display: "flex", alignItems: "center", gap: 10,
              background: done ? "rgba(52,211,153,0.06)" : "#080E1A",
              border: `1px solid ${done ? "rgba(52,211,153,0.25)" : "#1E293B"}`,
              borderRadius: 9, padding: "9px 12px",
              transition: "all .2s",
            }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{c.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: done ? "#34D399" : "#E2E8F0", fontWeight: 600, textDecoration: done ? "line-through" : "none" }}>
                  {c.label}
                </div>
                <div style={{ fontSize: 11, color: "#475569" }}>+{c.xp} XP</div>
              </div>
              {done ? (
                <span style={{ fontSize: 16 }}>✅</span>
              ) : (
                <div style={{ display: "flex", gap: 6 }}>
                  {onNavigate && c.tab && (
                    <button
                      onClick={() => onNavigate(c.tab, c.sub)}
                      style={{ padding: "5px 10px", borderRadius: 7, border: "1px solid #1E293B", background: "transparent", color: "#38BDF8", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
                    >
                      Go →
                    </button>
                  )}
                  <button
                    onClick={() => markDone(c.id, c.xp)}
                    style={{ padding: "5px 10px", borderRadius: 7, border: "1px solid rgba(52,211,153,0.3)", background: "rgba(52,211,153,0.06)", color: "#34D399", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
                  >
                    Mark done
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {allDone && (
        <div style={{ marginTop: 10, background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)", borderRadius: 8, padding: "8px 12px", textAlign: "center", fontSize: 13, color: "#34D399", fontWeight: 700 }}>
          🎉 Daily challenges complete! Come back tomorrow for new ones.
        </div>
      )}
    </div>
  );
}
