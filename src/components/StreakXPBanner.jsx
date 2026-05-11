import useStreakXP from "../hooks/useStreakXP";

const LEVEL_TITLES = [
  "", "Beginner", "Learner", "Practitioner", "Achiever",
  "Proficient", "Advanced", "Expert", "Master", "Champion", "Legend", "PTE 90",
];

export default function StreakXPBanner() {
  const { currentStreak, totalXP, todayXP, level, levelProgress } = useStreakXP();

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      background: "#0A1222", border: "1px solid #1E293B",
      borderRadius: 12, padding: "10px 16px", marginBottom: 16,
      flexWrap: "wrap",
    }}>
      {/* Streak */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        <span style={{ fontSize: 20 }}>{currentStreak >= 7 ? "🔥" : currentStreak >= 3 ? "🌟" : "📅"}</span>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: currentStreak >= 3 ? "#FBBF24" : "#94A3B8", lineHeight: 1 }}>
            {currentStreak}d
          </div>
          <div style={{ fontSize: 10, color: "#475569" }}>streak</div>
        </div>
      </div>

      <div style={{ width: 1, height: 28, background: "#1E293B", flexShrink: 0 }} />

      {/* Level */}
      <div style={{ flexShrink: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#38BDF8" }}>
          Lv.{level} <span style={{ color: "#64748B", fontWeight: 500 }}>{LEVEL_TITLES[Math.min(level, LEVEL_TITLES.length - 1)]}</span>
        </div>
        <div style={{ fontSize: 10, color: "#475569" }}>{totalXP} XP total</div>
      </div>

      {/* Level bar */}
      <div style={{ flex: 1, minWidth: 80 }}>
        <div style={{ height: 5, background: "#1E293B", borderRadius: 4, overflow: "hidden" }}>
          <div style={{
            height: "100%", width: `${levelProgress}%`,
            background: "linear-gradient(90deg,#0EA5E9,#A78BFA)",
            borderRadius: 4, transition: "width .6s",
          }} />
        </div>
        <div style={{ fontSize: 10, color: "#475569", marginTop: 2 }}>{levelProgress}% to next level</div>
      </div>

      {/* Today XP */}
      {todayXP > 0 && (
        <div style={{ flexShrink: 0, background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)", borderRadius: 8, padding: "4px 10px" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#34D399" }}>+{todayXP}</div>
          <div style={{ fontSize: 10, color: "#475569" }}>today</div>
        </div>
      )}
    </div>
  );
}
