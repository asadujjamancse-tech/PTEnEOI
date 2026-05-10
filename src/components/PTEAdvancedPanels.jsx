import React, { useMemo, useRef, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import useLocalStorage from "../hooks/useLocalStorage";
import { awardGamification, buildStudyPlan, compareTranscript, QUESTION_SEEDS, rankTasks, scoreEssayLocally } from "../utils/pteIntelligence";
import { buttonStyle, cardStyle, inputStyle, MetricCard, ProgressBar, ResponsiveGrid, SectionHeader } from "./FeatureShell";

const sectionMeta = {
  Speaking: "#38BDF8",
  Writing: "#A78BFA",
  Reading: "#34D399",
  Listening: "#FBBF24",
};

const mockSections = [
  { id: "speaking", label: "Speaking", minutes: 54, tasks: ["Read Aloud", "Repeat Sentence", "Describe Image"] },
  { id: "writing", label: "Writing", minutes: 60, tasks: ["Summarize Written Text", "Write Essay"] },
  { id: "reading", label: "Reading", minutes: 32, tasks: ["R&W Fill in the Blanks", "Reorder Paragraph"] },
  { id: "listening", label: "Listening", minutes: 45, tasks: ["Summarize Spoken Text", "Write From Dictation"] },
];

export function MockTestSystem() {
  const [history, setHistory] = useLocalStorage("pte_mock_history", []);
  const [active, setActive] = useState(null);
  const [section, setSection] = useState(mockSections[0].id);

  const current = mockSections.find((item) => item.id === section);
  const latest = history[0];

  function finishMock() {
    const score = {
      id: Date.now(),
      date: new Date().toISOString().slice(0, 10),
      Speaking: 65 + Math.floor(Math.random() * 20),
      Writing: 62 + Math.floor(Math.random() * 22),
      Reading: 64 + Math.floor(Math.random() * 21),
      Listening: 63 + Math.floor(Math.random() * 23),
      wrong: ["Collocation error in R&W FIB", "Missed plural in dictation", "Essay paragraph too short"],
    };
    score.Overall = Math.round((score.Speaking + score.Writing + score.Reading + score.Listening) / 4);
    setHistory((items) => [score, ...items].slice(0, 20));
    setActive(null);
  }

  return (
    <div>
      <SectionHeader title="AlfaPTE-Style Mock Tests" subtitle="Timed local mock flow with auto scoring simulation, result history, skill breakdown, wrong-answer review, and progress comparison." />
      <ResponsiveGrid min={180} style={{ marginBottom: 14 }}>
        <MetricCard label="Mocks saved" value={history.length} color="#38BDF8" />
        <MetricCard label="Latest overall" value={latest?.Overall || "-"} color="#34D399" />
        <MetricCard label="Best score" value={history.length ? Math.max(...history.map((item) => item.Overall)) : "-"} color="#A78BFA" />
      </ResponsiveGrid>

      <div style={cardStyle}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
          {mockSections.map((item) => (
            <button key={item.id} className="qtab" onClick={() => setSection(item.id)} style={section === item.id ? { background: "#0EA5E9", borderColor: "#0EA5E9", color: "#fff" } : {}}>
              {item.label} · {item.minutes}m
            </button>
          ))}
        </div>
        <div style={{ background: "#0A1222", border: "1px solid #1E293B", borderRadius: 12, padding: 14, marginBottom: 12 }}>
          <div style={{ fontWeight: 800, marginBottom: 8 }}>{current.label} Section</div>
          <div style={{ color: "#94A3B8", fontSize: 12, marginBottom: 10 }}>{current.tasks.join(" · ")}</div>
          <button style={buttonStyle} onClick={() => setActive(current.id)}>{active === current.id ? "Section Running" : "Start Timed Section"}</button>
          {active === current.id && <button style={{ ...buttonStyle, marginLeft: 8, background: "#34D399", color: "#052E1C" }} onClick={finishMock}>Finish & Auto Score</button>}
        </div>

        {history.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={[...history].reverse()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                  <XAxis dataKey="date" tick={{ fill: "#64748B", fontSize: 11 }} />
                  <YAxis domain={[40, 90]} tick={{ fill: "#64748B", fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "#0F1929", border: "1px solid #334155", color: "#fff" }} />
                  <Line dataKey="Overall" stroke="#38BDF8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div style={{ background: "#0A1222", border: "1px solid #1E293B", borderRadius: 12, padding: 12 }}>
              <div style={{ color: "#FBBF24", fontWeight: 800, fontSize: 12, marginBottom: 8 }}>Wrong Answer Review</div>
              {latest?.wrong.map((item) => <div key={item} style={{ color: "#94A3B8", fontSize: 12, lineHeight: 1.7 }}>- {item}</div>)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function RepeatSentencePractice() {
  const reference = "The final report must include a clear summary of the research findings.";
  const [transcript, setTranscript] = useState("");
  const [daily, setDaily] = useLocalStorage("pte_repeat_daily", []);
  const recognitionRef = useRef(null);
  const score = compareTranscript(reference, transcript);

  function playAudio() {
    const utterance = new SpeechSynthesisUtterance(reference);
    utterance.rate = 0.92;
    window.speechSynthesis?.speak(utterance);
  }

  function recordSpeech() {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) return;
    const recognition = new Recognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.onresult = (event) => setTranscript(event.results[0][0].transcript);
    recognition.start();
    recognitionRef.current = recognition;
  }

  function savePractice() {
    setDaily((items) => [{ date: new Date().toISOString().slice(0, 10), score: score.accuracy, taskId: "repeat_sentence" }, ...items].slice(0, 30));
  }

  return (
    <div>
      <SectionHeader title="Repeat Sentence AI Practice" subtitle="Browser audio playback, speech-to-text where supported, local accuracy comparison, fluency scoring, pronunciation estimate, and daily tracking." />
      <div style={cardStyle}>
        <div style={{ color: "#CBD5E1", lineHeight: 1.7, marginBottom: 12 }}>{reference}</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          <button style={buttonStyle} onClick={playAudio}>Play Audio</button>
          <button style={{ ...buttonStyle, background: "#A78BFA" }} onClick={recordSpeech}>Record Speech</button>
          <button style={{ ...buttonStyle, background: "#34D399", color: "#052E1C" }} onClick={savePractice}>Save Practice</button>
        </div>
        <textarea style={{ ...inputStyle, minHeight: 90 }} value={transcript} onChange={(event) => setTranscript(event.target.value)} placeholder="Speech transcript appears here. You can edit it if browser recognition is unavailable." />
        <ResponsiveGrid min={150} style={{ marginTop: 12 }}>
          <MetricCard label="Accuracy" value={score.accuracy} color="#38BDF8" />
          <MetricCard label="Fluency" value={score.fluency} color="#34D399" />
          <MetricCard label="Pronunciation" value={score.pronunciation} color="#A78BFA" />
          <MetricCard label="Daily reps" value={daily.length} color="#FBBF24" />
        </ResponsiveGrid>
      </div>
    </div>
  );
}

export function DescribeImageTrainer() {
  const images = [
    { title: "Energy Output", type: "Line chart", trend: "Solar output rises steadily while coal declines after June." },
    { title: "Student Survey", type: "Bar chart", trend: "Online learning has the highest satisfaction, followed by blended classes." },
    { title: "Population Share", type: "Pie chart", trend: "The largest segment is working-age adults, with a smaller senior population." },
  ];
  const [index, setIndex] = useState(0);
  const [response, setResponse] = useState("");
  const current = images[index % images.length];
  const local = scoreEssayLocally(response);

  return (
    <div>
      <SectionHeader title="Describe Image AI Trainer" subtitle="Random chart prompts, template suggestions, speaking timer placeholder, recording-ready response box, score prediction, and vocabulary recommendations." />
      <div style={cardStyle}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div style={{ background: "#0A1222", border: "1px solid #1E293B", borderRadius: 12, padding: 14 }}>
            <div style={{ color: "#38BDF8", fontWeight: 800, fontSize: 12 }}>{current.type}</div>
            <div style={{ height: 180, marginTop: 12 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[{ name: "A", value: 38 }, { name: "B", value: 56 }, { name: "C", value: 72 }, { name: "D", value: 64 }]}>
                  <XAxis dataKey="name" tick={{ fill: "#64748B" }} />
                  <YAxis tick={{ fill: "#64748B" }} />
                  <Tooltip contentStyle={{ background: "#0F1929", border: "1px solid #334155", color: "#fff" }} />
                  <Bar dataKey="value" fill="#38BDF8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ color: "#94A3B8", fontSize: 12 }}>{current.trend}</div>
            <button style={{ ...buttonStyle, marginTop: 10 }} onClick={() => setIndex((value) => value + 1)}>Random Image</button>
          </div>
          <div>
            <div style={{ color: "#FBBF24", fontSize: 12, fontWeight: 800, marginBottom: 8 }}>Template</div>
            <div style={{ color: "#94A3B8", fontSize: 12, lineHeight: 1.7, marginBottom: 10 }}>The image illustrates... Overall, the most significant feature is... In comparison... In conclusion, the data suggests...</div>
            <textarea style={{ ...inputStyle, minHeight: 150 }} value={response} onChange={(event) => setResponse(event.target.value)} placeholder="Speak or type your 40-second answer..." />
            <MetricCard label="Estimated score" value={response.trim() ? local.overall : "-"} color="#34D399" detail="Vocabulary: trend, proportion, peak, decline, overall" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function StudyPlanner() {
  const [examDate, setExamDate] = useLocalStorage("pte_exam_date", "2026-06-15");
  const scores = { S: 72, W: 69, R: 74, L: 70 };
  const days = Math.max(1, Math.ceil((new Date(examDate) - new Date()) / 86400000));
  const plan = buildStudyPlan(scores, days);

  return (
    <div>
      <SectionHeader title="Smart Study Planner" subtitle="Weakness-based schedule, exam countdown, daily targets, streak-ready tracking, and adaptive recommendations using local logic first." />
      <div style={cardStyle}>
        <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 12, alignItems: "end", marginBottom: 14 }}>
          <div>
            <div style={{ color: "#64748B", fontSize: 11, marginBottom: 4 }}>Exam date</div>
            <input type="date" style={inputStyle} value={examDate} onChange={(event) => setExamDate(event.target.value)} />
          </div>
          <MetricCard label="Countdown" value={`${days}d`} color="#FBBF24" detail="Plan adapts to remaining time" />
        </div>
        {plan.map((item) => (
          <div key={item.id} style={{ background: "#0A1222", border: "1px solid #1E293B", borderRadius: 10, padding: 12, marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
              <div><strong>{item.name}</strong><div style={{ color: "#64748B", fontSize: 12 }}>{item.target} · {item.recommendation}</div></div>
              <div style={{ color: "#38BDF8", fontWeight: 800 }}>{item.minutes}m</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AIQuestionBank() {
  const [query, setQuery] = useState("");
  const [favorites, setFavorites] = useLocalStorage("pte_qbank_favorites", []);
  const [history, setHistory] = useLocalStorage("pte_qbank_history", []);
  const filtered = QUESTION_SEEDS.filter((item) => `${item.type} ${item.prompt} ${item.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase()));

  function practice(item) {
    setHistory((items) => [{ ...item, date: new Date().toISOString().slice(0, 10), score: 65 + Math.floor(Math.random() * 20) }, ...items].slice(0, 50));
  }

  return (
    <div>
      <SectionHeader title="AI Question Bank" subtitle="Generated-style local question bank with difficulty, tags, favorites, practice history, search, filters, and explanations." />
      <div style={cardStyle}>
        <input style={{ ...inputStyle, marginBottom: 12 }} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by task, tag, category, or difficulty" />
        {filtered.map((item) => (
          <div key={item.prompt} style={{ background: "#0A1222", border: "1px solid #1E293B", borderRadius: 12, padding: 12, marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div>
                <div style={{ color: "#38BDF8", fontSize: 11, fontWeight: 800 }}>{item.type} · {item.difficulty}</div>
                <div style={{ color: "#E2E8F0", fontSize: 13, lineHeight: 1.6, marginTop: 4 }}>{item.prompt}</div>
                <div style={{ color: "#64748B", fontSize: 11, marginTop: 5 }}>AI explanation: focus on task form, timing, and the highest scoring content words.</div>
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
                <button style={{ ...buttonStyle, padding: "7px 10px" }} onClick={() => practice(item)}>Practice</button>
                <button style={{ ...buttonStyle, padding: "7px 10px", background: favorites.includes(item.prompt) ? "#FBBF24" : "#1E293B", color: favorites.includes(item.prompt) ? "#111827" : "#94A3B8" }} onClick={() => setFavorites((items) => items.includes(item.prompt) ? items.filter((prompt) => prompt !== item.prompt) : [...items, item.prompt])}>Save</button>
              </div>
            </div>
          </div>
        ))}
        <div style={{ color: "#64748B", fontSize: 12 }}>{history.length} practice attempts stored locally · {favorites.length} favorites</div>
      </div>
    </div>
  );
}

export function AnalyticsDashboard() {
  const [mockHistory] = useLocalStorage("pte_mock_history", []);
  const data = mockHistory.length ? [...mockHistory].reverse() : [
    { date: "May 01", Speaking: 68, Writing: 65, Reading: 70, Listening: 66, Overall: 67 },
    { date: "May 04", Speaking: 72, Writing: 69, Reading: 74, Listening: 70, Overall: 71 },
    { date: "May 07", Speaking: 78, Writing: 73, Reading: 76, Listening: 75, Overall: 76 },
  ];
  const latest = data[data.length - 1];
  const radar = Object.keys(sectionMeta).map((skill) => ({ skill, score: latest[skill] || 65, full: 90 }));

  return (
    <div>
      <SectionHeader title="Full Analytics Dashboard" subtitle="Score trends, prediction charts, weakness radar, accuracy trends, study-time analytics, and performance comparison using Recharts." />
      <div style={cardStyle}>
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr .8fr", gap: 12 }}>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="date" tick={{ fill: "#64748B", fontSize: 11 }} />
                <YAxis domain={[40, 90]} tick={{ fill: "#64748B", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#0F1929", border: "1px solid #334155", color: "#fff" }} />
                {Object.entries(sectionMeta).map(([skill, color]) => <Line key={skill} dataKey={skill} stroke={color} strokeWidth={2} />)}
                <Line dataKey="Overall" stroke="#fff" strokeDasharray="4 4" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radar}>
                <PolarGrid stroke="#1E293B" />
                <PolarAngleAxis dataKey="skill" tick={{ fill: "#94A3B8", fontSize: 11 }} />
                <Radar dataKey="score" stroke="#38BDF8" fill="#38BDF8" fillOpacity={0.25} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export function GamificationPanel() {
  const [history] = useLocalStorage("pte_qbank_history", []);
  const game = awardGamification(history);
  const leaderboard = [
    { name: "You", xp: game.xp },
    { name: "Practice Avg", xp: 1240 },
    { name: "Premium Target", xp: 2100 },
  ].sort((a, b) => b.xp - a.xp);

  return (
    <div>
      <SectionHeader title="Leaderboard + Gamification" subtitle="XP, streaks, badges, achievements, weekly goals, leaderboard, and practice milestones with lightweight local persistence." />
      <ResponsiveGrid min={160} style={{ marginBottom: 14 }}>
        <MetricCard label="XP" value={game.xp} color="#38BDF8" />
        <MetricCard label="Level" value={game.level} color="#A78BFA" />
        <MetricCard label="Streak" value={`${game.streak}d`} color="#FBBF24" />
      </ResponsiveGrid>
      <div style={cardStyle}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <div style={{ fontWeight: 800, marginBottom: 8 }}>Badges</div>
            {(game.badges.length ? game.badges : ["Start first practice"]).map((badge) => <span key={badge} style={{ display: "inline-block", background: "#1E293B", color: "#CBD5E1", borderRadius: 20, padding: "5px 10px", fontSize: 12, margin: 3 }}>{badge}</span>)}
          </div>
          <div>
            <div style={{ fontWeight: 800, marginBottom: 8 }}>Leaderboard</div>
            {leaderboard.map((row, index) => <div key={row.name} style={{ display: "flex", justifyContent: "space-between", color: "#94A3B8", fontSize: 13, marginBottom: 8 }}><span>{index + 1}. {row.name}</span><strong>{row.xp} XP</strong></div>)}
          </div>
        </div>
        <div style={{ marginTop: 12 }}><ProgressBar value={Math.min((game.xp % 500) / 5, 100)} color="#34D399" /></div>
      </div>
    </div>
  );
}

export function ProductionReadinessPanel() {
  const items = ["Error boundaries", "Loading states", "API abstraction", "Environment configs", "PWA manifest", "Feature gates", "Mobile charts"];
  return (
    <div>
      <SectionHeader title="Production Readiness" subtitle="A non-invasive readiness panel tracks deployment concerns without changing current functionality." />
      <div style={cardStyle}>
        {items.map((item, index) => (
          <div key={item} style={{ display: "flex", justifyContent: "space-between", borderBottom: index === items.length - 1 ? "none" : "1px solid #1E293B", padding: "10px 0", color: "#CBD5E1", fontSize: 13 }}>
            <span>{item}</span>
            <span style={{ color: index < 4 ? "#34D399" : "#FBBF24", fontWeight: 800 }}>{index < 4 ? "Added" : "Planned"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
