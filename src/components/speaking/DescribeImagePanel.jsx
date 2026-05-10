import { useEffect, useRef, useState } from "react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { callClaudeScore } from "../../utils/claudeScorer";
import { generateMockScore } from "../../utils/readAloudScorer";
import useScoreTracker from "../../hooks/useScoreTracker";

const IMAGES = [
  {
    id: "di-01", type: "Bar Chart", title: "University Enrolment by Subject (2024)",
    data: [{ name: "Engineering", value: 3200 }, { name: "Business", value: 4100 }, { name: "Medicine", value: 1800 }, { name: "Arts", value: 2600 }, { name: "Law", value: 1500 }],
    trend: "Business has the highest enrolment, followed by Arts and Engineering. Medicine and Law have the fewest students.",
    template: "The bar chart illustrates university enrolment by subject in 2024. Overall, Business attracts the most students. Engineering and Arts occupy the middle range, while Medicine and Law have comparatively low numbers. The most significant feature is…",
  },
  {
    id: "di-02", type: "Line Chart", title: "Average Temperature (°C) — 2023",
    data: [{ name: "Jan", value: 12 }, { name: "Mar", value: 17 }, { name: "May", value: 24 }, { name: "Jul", value: 31 }, { name: "Sep", value: 26 }, { name: "Nov", value: 16 }],
    trend: "Temperatures rise steadily from January, peak in July at 31°C, and fall through autumn.",
    template: "The line chart shows average monthly temperatures over 2023. There is a clear upward trend from January to July, where temperatures peak at 31 degrees. A subsequent decline is visible through the second half of the year. Notably…",
  },
  {
    id: "di-03", type: "Pie Chart", title: "Household Energy Use",
    data: [{ name: "Heating", value: 42 }, { name: "Appliances", value: 24 }, { name: "Water", value: 18 }, { name: "Lighting", value: 16 }],
    trend: "Heating dominates at 42%. Appliances are second. Lighting represents the smallest share.",
    template: "The pie chart presents the breakdown of household energy consumption. Heating accounts for the largest proportion at 42%, followed by appliances at 24%. Water heating and lighting make up the remainder. Overall, space heating clearly dominates…",
  },
  {
    id: "di-04", type: "Bar Chart", title: "Global CO₂ Emissions by Sector",
    data: [{ name: "Energy", value: 34 }, { name: "Transport", value: 16 }, { name: "Industry", value: 24 }, { name: "Agriculture", value: 11 }, { name: "Buildings", value: 15 }],
    trend: "Energy generation is the largest source of emissions. Industry is second. Agriculture contributes the least.",
    template: "This bar chart compares CO₂ emissions across economic sectors. Energy generation is by far the largest contributor at 34%, while industry ranks second. Transport, buildings, and agriculture account for the remaining share. The data suggest that…",
  },
  {
    id: "di-05", type: "Line Chart", title: "Internet Users Worldwide (billions)",
    data: [{ name: "2010", value: 2.0 }, { name: "2013", value: 2.7 }, { name: "2016", value: 3.5 }, { name: "2019", value: 4.1 }, { name: "2022", value: 5.3 }],
    trend: "Global internet users have grown steadily from 2 billion in 2010 to over 5 billion in 2022.",
    template: "The line graph shows the growth in global internet users from 2010 to 2022. The trend is consistently upward, rising from 2 billion to 5.3 billion over twelve years. Growth appears to have accelerated after 2016. Overall…",
  },
];

const COLORS = ["#38BDF8", "#A78BFA", "#34D399", "#FBBF24", "#F87171"];

export default function DescribeImagePanel() {
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState("prep"); // prep | recording | done
  const [prepTimer, setPrepTimer] = useState(25);
  const [recTimer, setRecTimer] = useState(40);
  const [transcript, setTranscript] = useState("");
  const [score, setScore] = useState(null);
  const [scoring, setScoring] = useState(false);
  const { addPracticeScore } = useScoreTracker();
  const recognitionRef = useRef(null);
  const transcriptRef = useRef("");
  const timerRef = useRef(null);
  const img = IMAGES[idx];

  useEffect(() => {
    if (phase === "prep" && prepTimer > 0) {
      timerRef.current = setInterval(() => setPrepTimer(t => { if (t <= 1) { clearInterval(timerRef.current); startRecording(); return 0; } return t - 1; }), 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [phase]);

  const startRecording = () => {
    setPhase("recording");
    setRecTimer(40);
    transcriptRef.current = "";
    timerRef.current = setInterval(() => setRecTimer(t => { if (t <= 1) { clearInterval(timerRef.current); stopRecording(); return 0; } return t - 1; }), 1000);
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) {
      const rec = new SR();
      rec.continuous = true;
      rec.interimResults = false;
      rec.onresult = (e) => { for (let i = e.resultIndex; i < e.results.length; i++) if (e.results[i].isFinal) transcriptRef.current += e.results[i][0].transcript + " "; };
      rec.start();
      recognitionRef.current = rec;
    }
  };

  const stopRecording = () => {
    clearInterval(timerRef.current);
    try { recognitionRef.current?.stop(); } catch {}
    setTranscript(transcriptRef.current.trim());
    setPhase("done");
  };

  const submitScore = async () => {
    setScoring(true);
    const prompt = `Image: ${img.title} (${img.type}). Key trend: ${img.trend}`;
    const answer = transcriptRef.current.trim() || transcript || "No speech detected.";
    try {
      const result = await callClaudeScore({ skill: "read_aloud", question: prompt, answer });
      setScore(result);
      if (result?.overall) addPracticeScore("S", result.overall);
    } catch {
      const mock = generateMockScore();
      setScore(mock);
      addPracticeScore("S", mock.overall || 60);
    }
    setScoring(false);
  };

  const next = () => {
    setIdx(i => (i + 1) % IMAGES.length);
    setPhase("prep"); setPrepTimer(25); setRecTimer(40); setTranscript(""); setScore(null); setScoring(false);
    transcriptRef.current = ""; clearInterval(timerRef.current); try { recognitionRef.current?.stop(); } catch {}
  };

  const renderChart = () => {
    if (img.type === "Pie Chart") return (
      <PieChart><Pie data={img.data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${name}: ${value}%`}>
        {img.data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
      </Pie><Tooltip contentStyle={{ background: "#0F1929", border: "1px solid #334155", color: "#fff" }} /></PieChart>
    );
    if (img.type === "Line Chart") return (
      <LineChart data={img.data}><XAxis dataKey="name" tick={{ fill: "#64748B", fontSize: 10 }} /><YAxis tick={{ fill: "#64748B", fontSize: 10 }} /><Tooltip contentStyle={{ background: "#0F1929", border: "1px solid #334155", color: "#fff" }} /><Line type="monotone" dataKey="value" stroke="#38BDF8" strokeWidth={2} dot={{ r: 3 }} /></LineChart>
    );
    return (
      <BarChart data={img.data}><XAxis dataKey="name" tick={{ fill: "#64748B", fontSize: 10 }} /><YAxis tick={{ fill: "#64748B", fontSize: 10 }} /><Tooltip contentStyle={{ background: "#0F1929", border: "1px solid #334155", color: "#fff" }} /><Bar dataKey="value" fill="#38BDF8" /></BarChart>
    );
  };

  return (
    <div style={{ background: "#0F1929", border: "1px solid #1E293B", borderRadius: 12, padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>Describe Image</div>
          <div style={{ color: "#64748B", fontSize: 13 }}>25s prep, then 40s to describe the image aloud.</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {phase === "prep" && <span style={{ color: "#FBBF24", fontWeight: 700, fontSize: 13 }}>Prep: {prepTimer}s</span>}
          {phase === "recording" && <span style={{ color: "#F87171", fontWeight: 700, fontSize: 13 }}>Recording: {recTimer}s</span>}
          {phase === "done" && <span style={{ color: "#34D399", fontWeight: 700, fontSize: 13 }}>Done</span>}
          <div style={{ color: "#475569", fontSize: 12 }}>{idx + 1} / {IMAGES.length}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 14 }}>
        <div style={{ background: "#080E1A", borderRadius: 10, padding: 14 }}>
          <div style={{ color: "#38BDF8", fontWeight: 700, fontSize: 12, marginBottom: 8 }}>{img.type} — {img.title}</div>
          <ResponsiveContainer width="100%" height={160}>{renderChart()}</ResponsiveContainer>
          <div style={{ color: "#64748B", fontSize: 11, marginTop: 8 }}>{img.trend}</div>
        </div>
        <div>
          <div style={{ color: "#FBBF24", fontSize: 11, fontWeight: 700, marginBottom: 6 }}>TEMPLATE</div>
          <div style={{ color: "#94A3B8", fontSize: 12, lineHeight: 1.7, background: "#080E1A", borderRadius: 8, padding: 10 }}>{img.template}</div>
        </div>
      </div>

      {phase === "done" && (
        <div style={{ marginBottom: 14 }}>
          {transcript && (
            <div style={{ background: "#071226", borderRadius: 10, padding: 12, marginBottom: 10 }}>
              <div style={{ fontSize: 12, color: "#64748B", marginBottom: 4 }}>Your response:</div>
              <div style={{ fontSize: 13, color: "#E2E8F0", lineHeight: 1.6 }}>{transcript || "No speech detected."}</div>
            </div>
          )}
          {!score && !scoring && <button className="btn-primary" style={{ padding: "8px 20px" }} onClick={submitScore}>Submit for AI Score</button>}
          {scoring && <div style={{ color: "#64748B", fontSize: 13 }}>Scoring…</div>}
          {score && (
            <div style={{ background: "#071226", borderRadius: 10, padding: 14 }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>AI Score</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                {[["Overall", score.overall], ["Fluency", score.fluency], ["Pronunciation", score.pronunciation], ["Content", score.content]].map(([l, v]) => (
                  <div key={l} style={{ background: "#0A1828", borderRadius: 8, padding: 8, textAlign: "center" }}>
                    <div style={{ fontSize: 10, color: "#64748B", fontWeight: 700 }}>{l}</div>
                    <div style={{ fontSize: 20, fontWeight: 800, marginTop: 2 }}>{v ?? "–"}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {phase === "recording" && (
        <div style={{ background: "#071226", borderRadius: 10, padding: 14, marginBottom: 14 }}>
          <div style={{ color: "#F87171", fontWeight: 700 }}>Recording… {recTimer}s left</div>
          <button className="btn-primary" style={{ marginTop: 10, padding: "7px 16px", background: "#475569" }} onClick={stopRecording}>■ Stop Early</button>
        </div>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        <button className="qtab" onClick={next}>Next Image ▶</button>
      </div>
    </div>
  );
}
