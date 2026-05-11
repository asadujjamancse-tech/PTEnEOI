import { useMemo } from "react";

const XP_KEY = "pte_xp_v1";
const WEEKS = 15;
const DAYS = 7;
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function loadXPLog() {
  try {
    const data = JSON.parse(localStorage.getItem(XP_KEY) || "{}");
    return data.log || [];
  } catch { return []; }
}

// Build a map of date → total XP
function buildDayMap(log) {
  const map = {};
  log.forEach(({ day, amount }) => {
    map[day] = (map[day] || 0) + amount;
  });
  return map;
}

// Generate the last WEEKS*7 days as date strings
function buildGrid() {
  const grid = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // Start from the Sunday at or before (today - WEEKS*7 days)
  const start = new Date(today);
  start.setDate(today.getDate() - today.getDay() - (WEEKS - 1) * 7);

  for (let w = 0; w < WEEKS; w++) {
    const week = [];
    for (let d = 0; d < DAYS; d++) {
      const date = new Date(start);
      date.setDate(start.getDate() + w * 7 + d);
      week.push(date.toISOString().slice(0, 10));
    }
    grid.push(week);
  }
  return grid;
}

function xpColor(xp) {
  if (!xp) return "#0A1222";
  if (xp < 20) return "#064E3B40";
  if (xp < 50) return "#065F46";
  if (xp < 100) return "#059669";
  if (xp < 200) return "#10B981";
  return "#34D399";
}

function monthLabel(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString("default", { month: "short" });
}

export default function StudyHeatmap() {
  const log = loadXPLog();
  const dayMap = useMemo(() => buildDayMap(log), [log]);
  const grid = useMemo(() => buildGrid(), []);

  const todayStr = new Date().toISOString().slice(0, 10);
  const totalDaysActive = Object.keys(dayMap).length;
  const totalXP = Object.values(dayMap).reduce((s, v) => s + v, 0);
  const maxXP = Math.max(...Object.values(dayMap), 1);

  // Month labels: show when month changes between weeks
  const monthLabels = grid.map((week, wi) => {
    const first = week[0];
    const prev = wi > 0 ? grid[wi - 1][0] : null;
    if (!prev || monthLabel(first) !== monthLabel(prev)) return monthLabel(first);
    return "";
  });

  return (
    <div style={{ background: "#0A1222", border: "1px solid #1E293B", borderRadius: 12, padding: 16, marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>Study Activity</div>
          <div style={{ fontSize: 11, color: "#475569" }}>Last {WEEKS} weeks · {totalDaysActive} active days</div>
        </div>
        <div style={{ fontSize: 12, color: "#34D399", fontWeight: 700 }}>{totalXP} XP earned</div>
      </div>

      <div style={{ overflowX: "auto" }}>
        {/* Month labels */}
        <div style={{ display: "flex", marginBottom: 2, paddingLeft: 28 }}>
          {monthLabels.map((label, wi) => (
            <div key={wi} style={{ width: 14, marginRight: 3, fontSize: 9, color: "#475569", whiteSpace: "nowrap" }}>
              {label}
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 0 }}>
          {/* Day labels */}
          <div style={{ display: "flex", flexDirection: "column", gap: 3, marginRight: 4, paddingTop: 0 }}>
            {DAY_LABELS.map((d, i) => (
              <div key={d} style={{ height: 14, fontSize: 9, color: i % 2 === 1 ? "#475569" : "transparent", lineHeight: "14px" }}>{d}</div>
            ))}
          </div>

          {/* Grid */}
          <div style={{ display: "flex", gap: 3 }}>
            {grid.map((week, wi) => (
              <div key={wi} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {week.map(dateStr => {
                  const xp = dayMap[dateStr] || 0;
                  const isToday = dateStr === todayStr;
                  const isFuture = dateStr > todayStr;
                  return (
                    <div
                      key={dateStr}
                      title={xp ? `${dateStr}: ${xp} XP` : dateStr}
                      style={{
                        width: 14, height: 14,
                        borderRadius: 3,
                        background: isFuture ? "transparent" : xpColor(xp),
                        border: isToday ? "1px solid #38BDF8" : "1px solid transparent",
                        cursor: xp ? "default" : "default",
                        flexShrink: 0,
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, paddingLeft: 28 }}>
          <span style={{ fontSize: 10, color: "#475569" }}>Less</span>
          {["#0A1222", "#064E3B40", "#065F46", "#059669", "#10B981", "#34D399"].map((c, i) => (
            <div key={i} style={{ width: 12, height: 12, borderRadius: 2, background: c, border: "1px solid #1E293B" }} />
          ))}
          <span style={{ fontSize: 10, color: "#475569" }}>More</span>
          <span style={{ fontSize: 10, color: "#475569", marginLeft: 8 }}>Max: {maxXP} XP/day</span>
        </div>
      </div>
    </div>
  );
}
