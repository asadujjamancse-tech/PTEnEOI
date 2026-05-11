import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useTheme } from "./ThemeContext";

const SECTIONS = [
  {
    id: "speaking",
    label: "Speaking",
    icon: "🎤",
    color: "#38BDF8",
    bg: "#0C1F35",
    border: "#1D4ED8",
    tasks: [
      { name: "Repeat Sentence", qs: "10–12", feeds: "Listening", pct: 28, note: "", critical: true },
      { name: "Read Aloud", qs: "6–7", feeds: "Reading", pct: 15, note: "", critical: true },
      { name: "Summarize Group Discussion", qs: "1–2", feeds: "Listening", pct: 12, note: "New 2025", critical: true },
      { name: "Describe Image", qs: "3–4", feeds: "—", pct: 12, note: "", critical: false },
      { name: "Respond to a Situation", qs: "1–2", feeds: "—", pct: 10, note: "New 2025", critical: false },
      { name: "Re-tell Lecture", qs: "1–2", feeds: "Listening", pct: 10, note: "", critical: false },
      { name: "Answer Short Question", qs: "5–6", feeds: "Listening", pct: 8, note: "", critical: false },
    ],
  },
  {
    id: "writing",
    label: "Writing",
    icon: "✍️",
    color: "#A78BFA",
    bg: "#160C35",
    border: "#6D28D9",
    tasks: [
      { name: "Write Essay", qs: "1–2", feeds: "—", pct: 58, note: "Expanded 0–6 scale", critical: true },
      { name: "Summarize Written Text", qs: "1–2", feeds: "Reading", pct: 25, note: "Content 0–4 (doubled)", critical: true },
      { name: "R&W Fill in the Blanks", qs: "5–6", feeds: "Reading", pct: 17, note: "", critical: true },
      { name: "Write From Dictation", qs: "3–4", feeds: "Listening", pct: 5, note: "Minor Writing contribution", critical: false },
    ],
  },
  {
    id: "reading",
    label: "Reading",
    icon: "📖",
    color: "#34D399",
    bg: "#052E1C",
    border: "#065F46",
    tasks: [
      { name: "R&W Fill in the Blanks", qs: "5–6", feeds: "Writing", pct: 30, note: "", critical: true },
      { name: "Fill in the Blanks (Drop-down)", qs: "4–5", feeds: "—", pct: 22, note: "", critical: true },
      { name: "Reorder Paragraphs", qs: "2–3", feeds: "—", pct: 18, note: "", critical: true },
      { name: "Summarize Written Text", qs: "1–2", feeds: "Writing", pct: 10, note: "", critical: false },
      { name: "MCQ Multiple Answers", qs: "1–2", feeds: "—", pct: 5, note: "⚠ Negative marking", critical: false },
      { name: "MCQ Single Answer", qs: "1–2", feeds: "—", pct: 5, note: "", critical: false },
    ],
  },
  {
    id: "listening",
    label: "Listening",
    icon: "👂",
    color: "#FBBF24",
    bg: "#1C1005",
    border: "#92400E",
    tasks: [
      { name: "Repeat Sentence", qs: "10–12", feeds: "Speaking", pct: 25, note: "Highest volume task", critical: true },
      { name: "Write From Dictation", qs: "3–4", feeds: "Writing", pct: 20, note: "", critical: true },
      { name: "Summarize Spoken Text", qs: "1–2", feeds: "—", pct: 13, note: "", critical: true },
      { name: "Fill in the Blanks (Type In)", qs: "2–3", feeds: "Reading", pct: 10, note: "", critical: false },
      { name: "Highlight Incorrect Words", qs: "2–3", feeds: "Reading", pct: 8, note: "", critical: false },
      { name: "Re-tell Lecture", qs: "1–2", feeds: "Speaking", pct: 7, note: "", critical: false },
      { name: "Others", qs: "varies", feeds: "—", pct: 17, note: "MCQ, Highlight Summary, Select Missing Words", critical: false },
    ],
  },
];

const CustomTooltip = ({ active, payload, color }) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div style={{ background: "#0F1929", border: `1px solid ${color}40`, borderRadius: 10, padding: "10px 14px", maxWidth: 220 }}>
        <div style={{ color: "#fff", fontWeight: 700, fontSize: 12, marginBottom: 4 }}>{d.name}</div>
        <div style={{ color, fontSize: 20, fontWeight: 800 }}>~{d.pct}%</div>
        <div style={{ color: "#64748B", fontSize: 11, marginTop: 2 }}>{d.qs} questions</div>
        {d.feeds !== "—" && <div style={{ color: "#64748B", fontSize: 11 }}>Also feeds: {d.feeds}</div>}
        {d.note && <div style={{ color: "#FBBF24", fontSize: 11, marginTop: 3 }}>{d.note}</div>}
      </div>
    );
  }
  return null;
};

function SectionPanel({ section, active, onClick, dm }) {
  const isActive = active === section.id;
  return (
    <button
      onClick={() => onClick(section.id)}
      style={{
        background: isActive ? section.bg : dm ? "#0A1222" : "#F1F5F9",
        border: `1px solid ${isActive ? section.color : dm ? "#1E293B" : "#CBD5E1"}`,
        borderRadius: 12,
        padding: "12px 18px",
        cursor: "pointer",
        color: isActive ? section.color : dm ? "#64748B" : "rgba(0,0,0,0.5)",
        fontWeight: 700,
        fontSize: 14,
        display: "flex",
        alignItems: "center",
        gap: 8,
        transition: "all .2s",
        flex: 1,
      }}
    >
      <span style={{ fontSize: 18 }}>{section.icon}</span>
      {section.label}
      {isActive && <span style={{ marginLeft: "auto", fontSize: 10, background: section.color + "20", padding: "2px 8px", borderRadius: 20 }}>selected</span>}
    </button>
  );
}

export default function PTEWeights() {
  const { darkMode: dm } = useTheme();
  const [active, setActive] = useState("speaking");
  const [view, setView] = useState("both"); // "table" | "chart" | "both"

  const section = SECTIONS.find(s => s.id === active);

  const handleTab = (id) => setActive(id === active ? active : id);

  const top80 = section.tasks.filter(t => {
    let cum = 0;
    for (const tt of section.tasks) {
      cum += tt.pct;
      if (tt === t) break;
    }
    return cum <= 80;
  });

  return (
    <div style={{ minHeight: "100vh", background: dm ? "#070D1A" : "#F0F4F8", color: dm ? "#fff" : "#0F172A", fontFamily: "'DM Sans', system-ui, sans-serif", padding: "28px 24px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        button { font-family: inherit; }
        [data-theme="light"] .sw-card { background: #FFFFFF !important; border-color: #E2E8F0 !important; }
        [data-theme="light"] .sw-card-inner-border { border-color: #F1F5F9 !important; }
        [data-theme="light"] .sw-table-head { border-bottom-color: #E2E8F0 !important; }
        [data-theme="light"] .sw-info { background: #EFF6FF !important; border-color: #93C5FD !important; color: #1D4ED8 !important; }
        [data-theme="light"] .sw-summary { background: #FFFFFF !important; border-color: #E2E8F0 !important; }
        [data-theme="light"] .sw-summary-col { border-right-color: #E2E8F0 !important; }
        [data-theme="light"] .sw-summary-col .sw-bar-bg { background: #E2E8F0 !important; }
        [data-theme="light"] .sw-footer { color: #94A3B8 !important; }
        [data-theme="light"] .sw-80-card { background: #EFF6FF !important; border-color: #93C5FD !important; }
        [data-theme="light"] .sw-80-item { background: #F1F5F9 !important; }
        [data-theme="light"] .sw-80-card .sw-80-footer { color: #64748B !important; }
        [data-theme="light"] .sw-dual-card { background: #FFFBEB !important; border-color: #FDE68A !important; }
      `}</style>

      {/* Header */}
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, letterSpacing: "-.5px" }}>
            PTE Score <span style={{ fontStyle: "italic", color: "#38BDF8" }}>Weight</span> Dashboard
          </div>
          <p style={{ color: "#475569", fontSize: 13, marginTop: 4 }}>
            Approximate task contributions per skill · Based on Pearson official Score Guide · Updated August 2025
          </p>
        </div>

        {/* Official note */}
        <div className="sw-info" style={{ background: "#0C1B35", border: "1px solid #1D4ED8", borderRadius: 10, padding: "10px 16px", marginBottom: 24, fontSize: 12, color: "#60A5FA", lineHeight: 1.6 }}>
          ℹ️ <strong>Pearson does not publish exact percentages.</strong> These are calculated estimates based on the official number of questions per task × max score points, derived from the Pearson PTE Academic Score Guide (pearsonpte.com). Actual weight varies slightly between test versions (52–64 tasks per test).
        </div>

        {/* Skill tabs */}
        <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
          {SECTIONS.map(s => <SectionPanel key={s.id} section={s} active={active} onClick={handleTab} dm={dm} />)}
        </div>

        {/* View toggle */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, justifyContent: "flex-end" }}>
          {[["table", "📋 Table"], ["chart", "📊 Chart"], ["both", "⊞ Both"]].map(([v, l]) => (
            <button key={v} onClick={() => setView(v)} style={{ background: view === v ? section.color + "20" : dm ? "#0F1929" : "#F1F5F9", border: `1px solid ${view === v ? section.color : dm ? "#1E293B" : "#E2E8F0"}`, color: view === v ? section.color : dm ? "#64748B" : "rgba(0,0,0,0.5)", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all .2s" }}>{l}</button>
          ))}
        </div>

        {/* Content area */}
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>

          {/* TABLE */}
          {(view === "table" || view === "both") && (
            <div className="sw-card" style={{ flex: view === "both" ? "1 1 420px" : "1 1 100%", background: "#0A1222", border: `1px solid ${section.border}`, borderRadius: 16, overflow: "hidden" }}>
              {/* Section header */}
              <div style={{ background: section.bg, borderBottom: `1px solid ${section.border}`, padding: "14px 20px", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 20 }}>{section.icon}</span>
                <div>
                  <div style={{ color: section.color, fontWeight: 800, fontSize: 15 }}>{section.label} Score</div>
                  <div style={{ color: "#475569", fontSize: 11 }}>Approximate task weight contribution</div>
                </div>
              </div>

              {/* Table head */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 60px 90px 90px", padding: "10px 20px", borderBottom: "1px solid #1E293B" }}>
                {["Task", "Qs", "Also Feeds", "Weight"].map((h, i) => (
                  <div key={h} style={{ fontSize: 10, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em", textAlign: i > 0 ? "center" : "left" }}>{h}</div>
                ))}
              </div>

              {/* Rows */}
              {section.tasks.map((task, i) => {
                const isTop = task.pct >= 20;
                const isMed = task.pct >= 10 && task.pct < 20;
                const barW = (task.pct / section.tasks[0].pct) * 100;
                return (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 60px 90px 90px", padding: "12px 20px", borderBottom: i < section.tasks.length - 1 ? "1px solid #0F1929" : "none", background: isTop ? section.bg : "transparent", transition: "background .15s", alignItems: "center" }}>
                    {/* Task name */}
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: isTop ? section.color : isMed ? section.color + "99" : "#334155", flexShrink: 0 }}></div>
                        <span style={{ fontSize: 13, fontWeight: isTop ? 700 : 500, color: isTop ? (dm ? "#F1F5F9" : "#1E293B") : (dm ? "#94A3B8" : "#64748B") }}>{task.name}</span>
                        {task.critical && <span style={{ fontSize: 9, fontWeight: 800, color: section.color, background: section.color + "15", padding: "1px 6px", borderRadius: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>VVI</span>}
                      </div>
                      {task.note && (
                        <div style={{ marginLeft: 12, fontSize: 10, color: task.note.includes("⚠") ? "#F87171" : "#FBBF24", marginTop: 2 }}>{task.note}</div>
                      )}
                      {/* Progress bar */}
                      <div style={{ marginLeft: 12, marginTop: 5, height: 3, background: dm ? "#1E293B" : "#E2E8F0", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ width: `${barW}%`, height: "100%", background: `linear-gradient(90deg, ${section.color}, ${section.color}88)`, borderRadius: 2, transition: "width .6s ease" }}></div>
                      </div>
                    </div>
                    {/* Qs */}
                    <div style={{ textAlign: "center", fontSize: 12, color: "#64748B", fontWeight: 600 }}>{task.qs}</div>
                    {/* Feeds */}
                    <div style={{ textAlign: "center" }}>
                      {task.feeds !== "—" ? (
                        <span style={{ fontSize: 11, background: dm ? "#1E293B" : "#EFF6FF", color: dm ? "#94A3B8" : "#0EA5E9", borderRadius: 6, padding: "2px 8px" }}>{task.feeds}</span>
                      ) : (
                        <span style={{ fontSize: 11, color: dm ? "#334155" : "#94A3B8" }}>—</span>
                      )}
                    </div>
                    {/* Weight */}
                    <div style={{ textAlign: "center" }}>
                      <span style={{ fontSize: 15, fontWeight: 800, color: isTop ? section.color : isMed ? section.color + "CC" : "#475569" }}>~{task.pct}%</span>
                    </div>
                  </div>
                );
              })}

              {/* Total */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 60px 90px 90px", padding: "10px 20px", borderTop: `1px solid ${section.border}`, background: section.bg }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: dm ? "#94A3B8" : "#64748B" }}>Total</div>
                <div></div>
                <div></div>
                <div style={{ textAlign: "center", fontSize: 14, fontWeight: 800, color: section.color }}>100%</div>
              </div>
            </div>
          )}

          {/* CHART */}
          {(view === "chart" || view === "both") && (
            <div style={{ flex: view === "both" ? "1 1 300px" : "1 1 100%", display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Horizontal bar chart */}
              <div className="sw-card" style={{ background: "#0A1222", border: `1px solid ${section.border}`, borderRadius: 16, padding: "20px", overflow: "hidden" }}>
                <div style={{ color: section.color, fontWeight: 700, fontSize: 13, marginBottom: 16 }}>{section.icon} {section.label} — Weight Breakdown</div>
                <ResponsiveContainer width="100%" height={section.tasks.length * 44 + 10}>
                  <BarChart
                    layout="vertical"
                    data={section.tasks}
                    margin={{ left: 0, right: 40, top: 0, bottom: 0 }}
                    barSize={18}
                  >
                    <XAxis type="number" domain={[0, section.tasks[0].pct + 10]} tick={false} axisLine={false} tickLine={false} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={160}
                      tick={{ fill: "#94A3B8", fontSize: 11, fontWeight: 500 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => v.length > 22 ? v.slice(0, 21) + "…" : v}
                    />
                    <Tooltip content={<CustomTooltip color={section.color} />} cursor={{ fill: section.color + "08" }} />
                    <Bar dataKey="pct" radius={[0, 6, 6, 0]}>
                      {section.tasks.map((t, i) => (
                        <Cell
                          key={i}
                          fill={t.pct >= 20 ? section.color : t.pct >= 10 ? section.color + "99" : section.color + "55"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div style={{ display: "flex", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
                  {[[section.color, "High (≥20%)"], [section.color + "99", "Medium (10–19%)"], [section.color + "55", "Lower (<10%)"]].map(([c, l]) => (
                    <div key={l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 3, background: c }}></div>
                      <span style={{ fontSize: 10, color: "#64748B" }}>{l}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 80% insight card */}
              <div className="sw-80-card" style={{ background: "#0C1B35", border: "1px solid #1D4ED8", borderRadius: 14, padding: "16px 18px" }}>
                <div style={{ color: "#60A5FA", fontWeight: 700, fontSize: 12, marginBottom: 10 }}>⚡ 80% Rule for {section.label}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {(() => {
                    let cum = 0;
                    return section.tasks.filter(t => { const over = cum >= 80; cum += t.pct; return !over; }).map((t, i) => (
                      <div key={i} className="sw-80-item" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#0F1929", borderRadius: 8, padding: "8px 12px" }}>
                        <div style={{ fontSize: 12, color: dm ? "#CBD5E1" : "#1E293B", fontWeight: 600 }}>{t.name}</div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: section.color }}>~{t.pct}%</div>
                      </div>
                    ));
                  })()}
                </div>
                <div className="sw-80-footer" style={{ marginTop: 10, fontSize: 11, color: "#475569" }}>
                  These tasks alone cover the majority of your {section.label} score. Master these first.
                </div>
              </div>

              {/* Dual-skill callout */}
              {section.tasks.some(t => t.feeds !== "—") && (
                <div className="sw-dual-card" style={{ background: "#1A1305", border: "1px solid #92400E", borderRadius: 14, padding: "14px 16px" }}>
                  <div style={{ color: "#FBBF24", fontWeight: 700, fontSize: 12, marginBottom: 8 }}>🔄 Dual-Skill Bonus</div>
                  {section.tasks.filter(t => t.feeds !== "—").map((t, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                      <span style={{ fontSize: 12, color: "#D97706" }}>{t.name}</span>
                      <span style={{ fontSize: 11, background: "#292105", color: "#FBBF24", borderRadius: 6, padding: "2px 8px" }}>→ {t.feeds}</span>
                    </div>
                  ))}
                  <div style={{ fontSize: 11, color: "#78350F", marginTop: 6 }}>Every correct response here scores in TWO skills simultaneously.</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* All sections summary row */}
        <div className="sw-summary" style={{ marginTop: 28, background: "#0A1222", border: "1px solid #1E293B", borderRadius: 16, overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid #1E293B" }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>📌 All Sections — Top Tasks at a Glance</div>
            <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>Tasks with ≥20% weight in their respective skill score</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0 }}>
            {SECTIONS.map((s, si) => (
              <div key={s.id} className="sw-summary-col" style={{ borderRight: si < 3 ? "1px solid #1E293B" : "none", padding: "16px 16px" }}>
                <div style={{ color: s.color, fontWeight: 700, fontSize: 12, marginBottom: 10 }}>{s.icon} {s.label}</div>
                {s.tasks.filter(t => t.pct >= 20).map((t, i) => (
                  <div key={i} style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 12, color: dm ? "#E2E8F0" : "#1E293B", fontWeight: 600, lineHeight: 1.3 }}>{t.name}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                      <div className="sw-bar-bg" style={{ flex: 1, height: 4, background: "#1E293B", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ width: `${t.pct}%`, height: "100%", background: s.color, borderRadius: 2 }}></div>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 800, color: s.color }}>~{t.pct}%</span>
                    </div>
                    {t.feeds !== "—" && <div style={{ fontSize: 10, color: "#64748B", marginTop: 2 }}>+ feeds {t.feeds}</div>}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="sw-footer" style={{ marginTop: 16, textAlign: "center", fontSize: 11, color: "#334155" }}>
          Source: Pearson PTE Academic Official Score Guide (pearsonpte.com) · August 2025 format · Estimates only — exact weights vary per test version
        </div>
      </div>
    </div>
  );
}
