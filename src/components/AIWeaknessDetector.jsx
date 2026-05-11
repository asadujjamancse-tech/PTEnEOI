import { useMemo } from "react";

// Reads from the same localStorage keys used by useScoreTracker
const SESSIONS_KEY = "pte_sessions";

const ZONE_COLOR = { S: "#38BDF8", W: "#A78BFA", R: "#34D399", L: "#FBBF24" };
const ZONE_NAME  = { S: "Speaking", W: "Writing", R: "Reading", L: "Listening" };
const TARGET = 79; // PTE 79+ is the common PR/visa threshold

function loadSessions() {
  try { return JSON.parse(localStorage.getItem(SESSIONS_KEY) || "[]"); } catch { return []; }
}

// Returns the last N sessions' average per zone
function zoneAverages(sessions, n = 10) {
  const recent = sessions.slice(-n);
  if (!recent.length) return null;
  const avgs = {};
  ["S","W","R","L"].forEach(z => {
    const vals = recent.map(s => Number(s[z])).filter(v => v > 0);
    avgs[z] = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null;
  });
  return avgs;
}

// Trend: compare first half vs second half of recent sessions
function zoneTrend(sessions, z, n = 10) {
  const recent = sessions.slice(-n).map(s => Number(s[z])).filter(v => v > 0);
  if (recent.length < 4) return "stable";
  const half = Math.floor(recent.length / 2);
  const first = recent.slice(0, half).reduce((a, b) => a + b, 0) / half;
  const second = recent.slice(half).reduce((a, b) => a + b, 0) / (recent.length - half);
  if (second - first >= 3) return "up";
  if (first - second >= 3) return "down";
  return "stable";
}

const TASK_TIPS = {
  S: [
    { threshold: 65, tip: "Critical: Read Aloud daily — 5–7 attempts. It scores both Speaking AND Reading." },
    { threshold: 72, tip: "Focus on Repeat Sentence — do 10/day. Captures Speaking + Listening simultaneously." },
    { threshold: 79, tip: "Polish Describe Image with a 4-part template. Add 2 specific data points every attempt." },
  ],
  W: [
    { threshold: 65, tip: "Critical: Write Essay — minimum 200 words every time or Form score caps at 0." },
    { threshold: 72, tip: "Summarize Written Text must be ONE sentence (5–75 words). Multi-sentence = 0 on Form." },
    { threshold: 79, tip: "Expand vocabulary range in essays — aim for 3 topic-specific collocations per paragraph." },
  ],
  R: [
    { threshold: 65, tip: "Critical: R&W Fill in the Blanks — highest Reading weight (18%). Do 5 per day." },
    { threshold: 72, tip: "Reorder Paragraph: find the topic sentence first (broadest idea, no pronoun at start)." },
    { threshold: 79, tip: "Drop-down Fill Blanks: eliminate by part of speech before checking collocational fit." },
  ],
  L: [
    { threshold: 65, tip: "Critical: Write From Dictation — 22% of Listening. Every word position scores separately." },
    { threshold: 72, tip: "Summarize Spoken: write keywords DURING audio. Target exactly 50–70 words." },
    { threshold: 79, tip: "Fill Blanks (Type): anticipate the missing word TYPE before you hear it." },
  ],
};

function getTip(zone, score) {
  const tips = TASK_TIPS[zone] || [];
  for (const t of tips) {
    if (score < t.threshold) return t.tip;
  }
  return "Strong zone — maintain with 2–3 practice sessions per week.";
}

const TREND_ICON = { up: "📈", down: "📉", stable: "→" };
const TREND_COLOR = { up: "#34D399", down: "#F87171", stable: "#64748B" };

export default function AIWeaknessDetector() {
  const sessions = loadSessions();
  const avgs = useMemo(() => zoneAverages(sessions), [sessions]);

  if (!sessions.length || !avgs) {
    return (
      <div style={{ background: "#0A1222", border: "1px solid #1E293B", borderRadius: 12, padding: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>🔍 AI Weakness Detector</div>
        <div style={{ fontSize: 13, color: "#64748B" }}>
          Log at least one practice session in Score Tracker to see your weakness analysis.
        </div>
      </div>
    );
  }

  // Sort zones by score ascending — weakest first
  const sorted = ["S","W","R","L"]
    .filter(z => avgs[z] !== null)
    .sort((a, b) => (avgs[a] || 0) - (avgs[b] || 0));

  const weakest = sorted[0];
  const gapToTarget = TARGET - (avgs[weakest] || 0);

  return (
    <div style={{ background: "#0A1222", border: "1px solid #1E293B", borderRadius: 12, padding: 16, marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>🔍 AI Weakness Detector</div>
          <div style={{ fontSize: 11, color: "#475569" }}>Based on last {Math.min(sessions.length, 10)} sessions</div>
        </div>
        <div style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 8, padding: "5px 10px", fontSize: 11, color: "#FCA5A5", fontWeight: 700 }}>
          Focus: {ZONE_NAME[weakest]}
        </div>
      </div>

      {/* Zone bars */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
        {sorted.map(z => {
          const score = avgs[z] || 0;
          const trend = zoneTrend(sessions, z);
          const gap = TARGET - score;
          const isWeakest = z === weakest;
          return (
            <div key={z} style={{
              background: isWeakest ? "rgba(248,113,113,0.04)" : "#080E1A",
              border: `1px solid ${isWeakest ? "rgba(248,113,113,0.2)" : "#1E293B"}`,
              borderRadius: 9, padding: "10px 12px",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: ZONE_COLOR[z] }}>{ZONE_NAME[z]}</span>
                  <span style={{ fontSize: 12, color: TREND_COLOR[trend] }}>{TREND_ICON[trend]}</span>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  {gap > 0 && <span style={{ fontSize: 11, color: "#475569" }}>-{gap} to target</span>}
                  {gap <= 0 && <span style={{ fontSize: 11, color: "#34D399" }}>✓ On target</span>}
                  <span style={{ fontSize: 15, fontWeight: 800, color: score >= TARGET ? "#34D399" : score >= 72 ? "#FBBF24" : "#F87171" }}>
                    {score}
                  </span>
                </div>
              </div>
              <div style={{ height: 5, background: "#1E293B", borderRadius: 4, overflow: "hidden", marginBottom: 6 }}>
                <div style={{
                  height: "100%", borderRadius: 4,
                  width: `${Math.min((score / 90) * 100, 100)}%`,
                  background: score >= TARGET ? "#34D399" : score >= 72 ? "#FBBF24" : "#F87171",
                  transition: "width .5s",
                }} />
              </div>
              {isWeakest && (
                <div style={{ fontSize: 12, color: "#94A3B8", lineHeight: 1.5 }}>
                  💡 {getTip(z, score)}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Overall recommendation */}
      <div style={{ background: "#0C1B35", border: "1px solid #1D4ED830", borderRadius: 9, padding: "10px 14px" }}>
        <div style={{ fontSize: 11, color: "#60A5FA", fontWeight: 700, marginBottom: 4 }}>STUDY PRIORITY THIS WEEK</div>
        <div style={{ fontSize: 12, color: "#94A3B8", lineHeight: 1.6 }}>
          {gapToTarget > 10
            ? `${ZONE_NAME[weakest]} needs the most work (avg ${avgs[weakest]}). Spend 60% of practice time here. ${getTip(weakest, avgs[weakest] || 0)}`
            : gapToTarget > 0
            ? `You're close — ${ZONE_NAME[weakest]} needs ${gapToTarget} more points to reach target. Focus on high-weight tasks.`
            : "All zones are at or above target. Maintain consistency with 2–3 sessions per zone per week."
          }
        </div>
      </div>
    </div>
  );
}
