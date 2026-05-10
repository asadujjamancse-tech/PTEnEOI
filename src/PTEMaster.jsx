// PTEMaster: main React component for the PTE practice app.
// This single-file component contains both data (sample questions, defaults)
// and the UI for multiple tabs: Priority Map, AI Scorer, Score Tracker, Question Bank.
//
// Notes for beginners:
// - This component uses React hooks for state (useState).
// - The `scoreResponse` function sends user text to the backend proxy `/api/score`.
// - The UI is large (many small sections). If you want to improve readability,
//   consider splitting the file into smaller components (e.g., ScorerPanel, TrackerPanel).
import { useState } from "react";
import useScoreTracker from "./hooks/useScoreTracker";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import EssayFeedbackPanel from "./components/EssayFeedbackPanel";
import PriorityIntelligencePanel from "./components/PriorityIntelligencePanel";
import {
  AIQuestionBank,
  AnalyticsDashboard,
  GamificationPanel,
  MockTestSystem,
  ProductionReadinessPanel,
  StudyPlanner,
} from "./components/PTEAdvancedPanels";
import ReadAloudPanel from "./components/readAloud/ReadAloudPanel";
import ReadingPanel from "./components/practice/ReadingPanel";
import WritingPanel from "./components/practice/WritingPanel";
import ListeningPanel from "./components/practice/ListeningPanel";
import PriorityTaskDetail from "./components/PriorityTaskDetail";
// Speaking panels
import RepeatSentencePanel from "./components/speaking/RepeatSentencePanel";
import DescribeImagePanel from "./components/speaking/DescribeImagePanel";
import RetellLecturePanel from "./components/speaking/RetellLecturePanel";
// Reading panels
import RWFillBlanksPanel from "./components/reading/RWFillBlanksPanel";
import ReorderPanel from "./components/reading/ReorderPanel";
import DropdownFillBlanksPanel from "./components/reading/DropdownFillBlanksPanel";
// Writing panels
import SummarizeWrittenPanel from "./components/writing/SummarizeWrittenPanel";
// Listening panels
import WriteDictationPanel from "./components/listening/WriteDictationPanel";
import SummarizeSpeechPanel from "./components/listening/SummarizeSpeechPanel";
import TypeInFillBlanksPanel from "./components/listening/TypeInFillBlanksPanel";

// Simple constants used for display colours and labels.
const ZONE_COLOR = { S: "#38BDF8", W: "#A78BFA", R: "#34D399", L: "#FBBF24" };
const ZONE_NAME = { S: "Speaking", W: "Writing", R: "Reading", L: "Listening" };

const PRIORITY_TASKS = [
  { id: "read_aloud", name: "Read Aloud", zone: "S", vvi: 5, skills: ["Speaking", "Reading"], weight: 15, brief: "Read a 60–90 word passage aloud. 35s preparation + 40s speaking time. Scores both Speaking (fluency, pronunciation, content) AND Reading simultaneously — the highest dual-skill ROI task in the whole test.", tip: "Pace 70–80 wpm. Stress content words. Zero hesitation. Do 5–7/day." },
  { id: "repeat_sentence", name: "Repeat Sentence", zone: "S", vvi: 5, skills: ["Speaking", "Listening"], weight: 13, brief: "Listen to a sentence (3–9 seconds) and repeat it verbatim immediately after. Scores Speaking AND Listening. No preparation time — pure auditory memory and clear articulation under pressure.", tip: "Capture rhythm + meaning. Even partial sentences score. Do 10–15/day." },
  { id: "describe_image", name: "Describe Image", zone: "S", vvi: 4, skills: ["Speaking"], weight: 10, brief: "Describe a graph, chart, map or process image in 40 seconds. Purely Speaking. You have 25s preparation. A fixed 4-part template removes all guesswork and lets you focus on fluency.", tip: "Template: Intro → Main trend → Detail → Conclusion in 40 sec." },
  { id: "retell_lecture", name: "Re-tell Lecture", zone: "S", vvi: 4, skills: ["Speaking", "Listening"], weight: 8, brief: "Listen to a 60–90s audio lecture then re-tell key points in your own words within 40 seconds. Scores Speaking AND Listening. Keyword notes during audio are essential — you cannot replay it.", tip: "Note keywords during audio. Speak 3–4 sentences confidently." },
  { id: "write_essay", name: "Write Essay", zone: "W", vvi: 5, skills: ["Writing"], weight: 24, brief: "Write a 200–300 word argumentative or discursive essay in 20 minutes. Purely Writing. Scored on Content, Form (word count), Grammar range, Vocabulary range, and Spelling. Going under 200 words caps your Form score at 0.", tip: "200–300 words exactly. 4 paras. Use discourse markers. NEVER go under 200!" },
  { id: "summarize_written", name: "Summarize Written Text", zone: "W", vvi: 5, skills: ["Writing", "Reading"], weight: 15, brief: "Read a passage and write a single-sentence summary in 5–75 words within 10 minutes. Scores Writing AND Reading. The one-sentence rule is non-negotiable — a multi-sentence response scores 0 on Form.", tip: "ONE sentence, 5–75 words. Use compound-complex structure." },
  { id: "rw_fitb", name: "R&W Fill in the Blanks", zone: "R", vvi: 5, skills: ["Reading", "Writing"], weight: 18, brief: "Drag words from a choice box into blanks in a reading passage. Scores Reading AND Writing. Tests collocation awareness and grammatical fit — check part of speech and surrounding words before committing.", tip: "Drag & Drop. Check collocation + grammar. Highest Reading weight!" },
  { id: "reorder", name: "Reorder Paragraph", zone: "R", vvi: 4, skills: ["Reading"], weight: 13, brief: "Drag shuffled text boxes into the correct logical order to form a coherent paragraph. Purely Reading. Identify the topic sentence (no pronoun reference, broadest idea) first, then chain the rest using discourse markers and pronoun links.", tip: "Find topic sentence first. Track pronoun references as clues." },
  { id: "r_fitb", name: "Fill in Blanks (Drop-down)", zone: "R", vvi: 4, skills: ["Reading"], weight: 10, brief: "Select the correct word from a drop-down list to complete blanks in a reading text. Purely Reading. Each blank tests vocabulary in context — eliminate options by grammatical category first, then by collocational fit.", tip: "Grammar + vocab. Eliminate wrong options by part of speech first." },
  { id: "write_dictation", name: "Write From Dictation", zone: "L", vvi: 5, skills: ["Listening", "Writing"], weight: 22, brief: "Listen to a sentence once (no replay) and type it verbatim. Scores Listening AND Writing. Every word and every spelling counts — there is no partial credit per word. Typically ~8 items; the highest single-task weight in Listening.", tip: "Every word = points. EXACT spelling. ~8 items. Highest Listening weight!" },
  { id: "summarize_spoken", name: "Summarize Spoken Text", zone: "L", vvi: 4, skills: ["Listening"], weight: 14, brief: "Listen to a 60–90s lecture once and write a 50–70 word summary in 10 minutes. Purely Listening. Note keywords and the main idea during playback — you cannot replay. Scored on Content, Form, Vocabulary, Spelling.", tip: "50–70 words. Write keywords DURING audio. Cover main idea + 2 details." },
  { id: "l_fitb", name: "Fill in Blanks (Type In)", zone: "L", vvi: 4, skills: ["Listening"], weight: 12, brief: "Listen to an audio recording and type the missing words directly into blanks (no word bank provided). Purely Listening. Exact spelling is required. Anticipate the word type from context in the sentence before you hear the blank filled.", tip: "Exact spelling. Anticipate word from context BEFORE you hear it." },
];

const SAMPLE_QS = {
  write_essay: [
    { prompt: "Some people believe that technology has made our lives more complicated. To what extent do you agree or disagree? Give reasons and examples from your own experience.", type: "Argumentative", range: "200–300 words" },
    { prompt: "Universities should accept equal numbers of male and female students in every subject. To what extent do you agree or disagree?", type: "Argumentative", range: "200–300 words" },
    { prompt: "In many countries, the government is spending large amounts of money on developing tourism. Do the advantages outweigh the disadvantages?", type: "Discursive", range: "200–300 words" },
  ],
  summarize_written: [
    { prompt: "Artificial intelligence is rapidly transforming industries worldwide. Machine learning algorithms now assist in medical diagnosis, enabling doctors to detect diseases earlier than ever before. In finance, AI-powered systems analyse vast datasets to predict market trends and manage risk. Manufacturing has been revolutionised through robotic automation that improves precision and reduces costs. However, critics argue that this technological revolution threatens millions of jobs and raises serious questions about privacy and algorithmic bias. The challenge for society is harnessing AI's potential while managing its risks responsibly.", type: "Academic", range: "1 sentence · 5–75 words" },
    { prompt: "Climate change is accelerating at an unprecedented rate, according to recent scientific reports. Global temperatures have risen by approximately 1.2 degrees Celsius above pre-industrial levels, causing widespread ecological disruption. Polar ice caps are melting at record speeds, contributing to rising sea levels that threaten coastal communities. Extreme weather events, including hurricanes, droughts, and wildfires, have increased in both frequency and intensity. Scientists warn that without immediate and drastic reductions in greenhouse gas emissions, the most severe consequences may become irreversible within this decade.", type: "Science", range: "1 sentence · 5–75 words" },
  ],
  read_aloud: [
    { prompt: "The relationship between economic growth and environmental sustainability remains one of the most debated topics in contemporary policy discussions. While rapid industrialisation has lifted billions out of poverty, it has also contributed significantly to carbon emissions and resource depletion.", type: "Academic", range: "Read aloud — record yourself, paste transcript" },
    { prompt: "Neuroscientists have discovered that the human brain maintains remarkable plasticity well into adulthood. Regular cognitive challenges, combined with adequate sleep and social interaction, can strengthen neural connections and potentially delay age-related cognitive decline.", type: "Science", range: "Read aloud — record yourself, paste transcript" },
  ],
  write_dictation: [
    { prompt: "The students were required to submit their assignments before the deadline.", type: "Sentence", range: "Type exactly what you hear" },
    { prompt: "Research suggests that regular exercise improves both physical and mental health significantly.", type: "Sentence", range: "Type exactly what you hear" },
    { prompt: "The government announced new policies to address the growing housing shortage in major cities.", type: "Sentence", range: "Type exactly what you hear" },
  ],
  rw_fitb: [
    { text: "Many researchers believe that the widespread adoption of renewable energy is [A] for addressing climate change. Solar and wind power have become increasingly [B] over the past decade, making them viable alternatives to fossil fuels.", blanks: [["essential","optional","theoretical","decorative"],["affordable","expensive","irrelevant","redundant"]], answers: ["essential","affordable"] },
    { text: "The discovery of antibiotics was [A] for modern medicine. These drugs made it possible to [B] bacterial infections that had previously been fatal, saving millions of lives.", blanks: [["revolutionary","catastrophic","insignificant","counterproductive"],["treat","spread","ignore","worsen"]], answers: ["revolutionary","treat"] },
  ],
};

const SCORABLE = [
  { id: "write_essay", label: "Write Essay" },
  { id: "summarize_written", label: "Summarize Written Text" },
  { id: "read_aloud", label: "Read Aloud (paste transcript)" },
  { id: "write_dictation", label: "Write From Dictation" },
];

const TASK_DESC = {
  write_essay: "Write Essay — PTE Academic standard (200–300 words, argumentative or discursive essay)",
  summarize_written: "Summarize Written Text — PTE Academic standard (must be exactly ONE sentence, 5–75 words, summarising a reading passage)",
  read_aloud: "Read Aloud — this is a transcript of the student's spoken response; evaluate oral fluency, pronunciation accuracy, and content faithfulness",
  write_dictation: "Write From Dictation — student typed what they heard; every word must be verbatim and spelled correctly",
};

// SCORE_PROMPT is a long instruction used when sending the student's response to an LLM
// for scoring. It asks the model to return a compact JSON following the PTE rubric.
// The exact prompt content is not modified here; it's passed to the backend proxy.
const SCORE_PROMPT = `You are a certified PTE Academic expert examiner with 10+ years of experience scoring official PTE tests. Apply the official PTE Academic marking rubrics strictly. Return ONLY valid compact JSON with no markdown fences, no preamble:
{
  "overall": <integer 0-90>,
  "band": "<one of: Expert 88-90 | Expert 85-87 | Advanced 79-84 | Upper Intermediate 65-78 | Intermediate 43-64 | Elementary 30-42>",
  "criteria": [
    {"name": "Content / Task Achievement", "score": <0-5>, "max": 5, "comment": "<specific actionable feedback>"},
    {"name": "Form & Length", "score": <0-5>, "max": 5, "comment": "<specific actionable feedback>"},
    {"name": "Grammar Range & Accuracy", "score": <0-5>, "max": 5, "comment": "<specific actionable feedback>"},
    {"name": "Vocabulary Range", "score": <0-5>, "max": 5, "comment": "<specific actionable feedback>"},
    {"name": "Spelling & Mechanics", "score": <0-5>, "max": 5, "comment": "<specific actionable feedback>"}
  ],
  "strengths": ["<specific strength 1>", "<specific strength 2>"],
  "fix_now": ["<most critical fix — be specific, not generic>", "<2nd fix>", "<3rd fix>"],
  "to_reach_90": "<One concrete, specific sentence: exactly what this student must change to hit 90>"
}`;

export default function PTEMaster() {
  // ---- Component state ----
  // `tab` switches between the app's main screens.
  const [tab, setTab] = useState("priority");
  const [scorerTask, setScorerTask] = useState("write_essay");
  const [userText, setUserText] = useState("");
  const [scoring, setScoring] = useState(false);
  const [scoreResult, setScoreResult] = useState(null);
  const [scoreError, setScoreError] = useState("");
  const { sessions, setSessions } = useScoreTracker();
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), S: "", W: "", R: "", L: "" });
  const [selectedTask, setSelectedTask] = useState(null);
  const [customTips, setCustomTips] = useState(() => {
    const saved = {};
    PRIORITY_TASKS.forEach(t => {
      const v = localStorage.getItem(`pte_tip_${t.id}`);
      if (v !== null) saved[t.id] = v;
    });
    return saved;
  });
  const saveCustomTip = (id, value) => {
    localStorage.setItem(`pte_tip_${id}`, value);
    setCustomTips(prev => ({ ...prev, [id]: value }));
  };
  const [qTask, setQTask] = useState("write_essay");
  const [qAnswers, setQAnswers] = useState({});
  const [qRevealed, setQRevealed] = useState({});
  const [qSelected, setQSelected] = useState({});
  // Zone sub-tabs
  const [speakingTab, setSpeakingTab] = useState("read_aloud");
  const [writingTab, setWritingTab]   = useState("essay");
  const [readingTab, setReadingTab]   = useState("rw_fitb");
  const [listeningTab, setListeningTab] = useState("dictation");

  // Derive overall score for each saved session and get the latest session.
  const sessionsWithOverall = sessions.map(s => {
    const vals = [s.S, s.W, s.R, s.L].filter(v => v != null);
    return { ...s, Overall: vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null };
  });
  const latest = sessionsWithOverall[sessionsWithOverall.length - 1];

  // scoreResponse: send the user's pasted text to the backend proxy /api/score.
  // The backend will forward it to Anthropic using the server-side API key.
  // This function sets local loading/error state and stores the parsed result.
  async function scoreResponse() {
    if (!userText.trim() || scoring) return; // prevent empty or duplicate calls
    setScoring(true); setScoreResult(null); setScoreError("");
    try {
      const res = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SCORE_PROMPT,
          messages: [{ role: "user", content: `Task: ${TASK_DESC[scorerTask]}\n\nStudent Response:\n${userText}` }]
        })
      });

      const data = await res.json();

      // The Anthropic / proxy response sometimes wraps text under data.content[].text.
      // We attempt to extract and parse JSON from that field; if parsing fails, we
      // fall back to returning the raw response (for easier debugging).
      const raw = (data.content || []).map(b => b.text || "").join("").replace(/```json|```/g, "").trim();
      try { setScoreResult(JSON.parse(raw)); }
      catch { setScoreResult(data); }
    } catch (e) { console.error(e); setScoreError("AI scoring failed — please try again."); }
    setScoring(false);
  }

  function addSession() {
    const { date, S, W, R, L } = form;
    if (!date || !S || !W || !R || !L) return;
    setSessions(p => [...p, { date, S: +S, W: +W, R: +R, L: +L }].sort((a, b) => a.date.localeCompare(b.date)));
    setForm({ date: new Date().toISOString().slice(0, 10), S: "", W: "", R: "", L: "" });
  }

  const wc = (t) => t.trim().split(/\s+/).filter(Boolean).length;

  const tabs = [
    { id: "priority", icon: "🎯", label: "Priority Map" },
    { id: "scorer", icon: "🤖", label: "AI Scorer" },
    { id: "tracker", icon: "📊", label: "Score Tracker" },
    { id: "qbank", icon: "📚", label: "Question Bank" },
    { id: "mock", icon: "🧪", label: "Mock Tests" },
    { id: "speaking", icon: "🎙️", label: "Speaking Zone" },
    { id: "planner", icon: "🗓️", label: "Study Planner" },
    { id: "analytics", icon: "📈", label: "Analytics" },
    { id: "game", icon: "🏆", label: "Gamification" },
    { id: "prod", icon: "🚀", label: "Production" },
  ];

  const qTaskTabs = [
    { id: "write_essay", icon: "✍️", label: "Write Essay" },
    { id: "summarize_written", icon: "📝", label: "Summarize Written" },
    { id: "read_aloud", icon: "🎤", label: "Read Aloud" },
    { id: "rw_fitb", icon: "📖", label: "R&W Fill in Blanks" },
    { id: "write_dictation", icon: "👂", label: "Write From Dictation" },
  ];

  const scoreColor = (s) => s >= 79 ? "#34D399" : s >= 65 ? "#FBBF24" : "#F87171";

  return (
    <div style={{ minHeight: "100vh", background: "#080E1A", color: "#fff", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #0F1929; } ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
        textarea, input, select { font-family: 'DM Sans', system-ui, sans-serif; }
        .tab-btn { background: none; border: none; cursor: pointer; padding: 12px 18px; color: #64748B; font-size: 13px; font-weight: 600; border-bottom: 2px solid transparent; transition: all .2s; white-space: nowrap; }
        .tab-btn:hover { color: #CBD5E1; }
        .tab-btn.active { color: #fff; border-bottom-color: #38BDF8; }
        .qtab { background: #1E293B; border: 1px solid #334155; border-radius: 8px; padding: 7px 14px; font-size: 12px; font-weight: 600; cursor: pointer; color: #94A3B8; transition: all .2s; }
        .qtab.active { background: #0EA5E9; border-color: #0EA5E9; color: #fff; }
        .qtab:hover:not(.active) { border-color: #475569; color: #CBD5E1; }
        .task-card { background: #0F1929; border: 1px solid #1E293B; border-radius: 12px; padding: 16px; transition: all .2s; }
        .task-card:hover { border-color: #334155; }
        .pill { display: inline-block; background: #1E293B; color: #94A3B8; border-radius: 20px; padding: 2px 10px; font-size: 11px; margin: 2px; }
        .btn-primary { background: #0EA5E9; border: none; color: #fff; font-weight: 700; border-radius: 10px; cursor: pointer; transition: all .2s; font-family: inherit; }
        .btn-primary:hover:not(:disabled) { background: #38BDF8; transform: translateY(-1px); }
        .btn-primary:disabled { background: #1E293B; color: #475569; cursor: not-allowed; transform: none; }
        .input-field { background: #0F1929; border: 1px solid #334155; border-radius: 10px; color: #fff; font-size: 14px; padding: 10px 14px; width: 100%; outline: none; transition: border .2s; }
        .input-field:focus { border-color: #0EA5E9; }
        textarea.input-field { resize: none; min-height: 160px; line-height: 1.7; }
        .score-bar-bg { background: #1E293B; border-radius: 4px; height: 6px; overflow: hidden; }
        .score-bar-fill { height: 6px; border-radius: 4px; transition: width .6s ease; }
        .reveal-btn { background: none; border: none; color: #64748B; font-size: 12px; cursor: pointer; padding: 4px 0; text-decoration: underline; }
        .reveal-btn:hover { color: #94A3B8; }
        .select-blank { background: #1E293B; border: 1px solid #475569; border-radius: 6px; color: #fff; padding: 3px 8px; font-size: 13px; cursor: pointer; }
        .send-to-scorer { background: #1D4ED8; border: none; color: #93C5FD; font-size: 12px; font-weight: 600; border-radius: 8px; padding: 7px 14px; cursor: pointer; margin-top: 8px; transition: all .2s; }
        .send-to-scorer:hover { background: #2563EB; color: #fff; }
        tr:hover td { background: rgba(255,255,255,.02); }
      `}</style>

      {/* Header */}
      <div style={{ background: "#0A1222", borderBottom: "1px solid #1E293B", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, letterSpacing: "-.3px" }}>PTE <span style={{ color: "#38BDF8" }}>90</span> Master</div>
          <div style={{ color: "#475569", fontSize: 11, marginTop: 2 }}>AI Scorer · Score Tracker · Question Bank</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {latest && ["S","W","R","L"].map(z => latest[z] != null && (
            <div key={z} style={{ textAlign: "center", padding: "4px 10px", background: "#0F1929", borderRadius: 8, border: `1px solid ${ZONE_COLOR[z]}30` }}>
              <div style={{ fontSize: 9, color: ZONE_COLOR[z], fontWeight: 700, textTransform: "uppercase" }}>{ZONE_NAME[z].slice(0,2)}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: scoreColor(latest[z]) }}>{latest[z]}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Nav tabs */}
      <div style={{ background: "#0A1222", borderBottom: "1px solid #1E293B", paddingLeft: 24, display: "flex", overflowX: "auto" }}>
        {tabs.map(t => (
          <button key={t.id} className={`tab-btn${tab === t.id ? " active" : ""}`} onClick={() => setTab(t.id)}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "28px 24px" }}>

        {/* ───── PRIORITY MAP ───── */}
        {tab === "priority" && (
          <div>
            <PriorityIntelligencePanel latestScores={latest} />

            <div style={{ background: "#0C1B35", border: "1px solid #1D4ED8", borderRadius: 12, padding: "16px 20px", marginBottom: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#60A5FA", marginBottom: 6 }}>⚡ The 80% Rule — Where Your Score Actually Comes From</div>
              <p style={{ color: "#94A3B8", fontSize: 13, margin: 0, lineHeight: 1.7 }}>
                These 12 task types generate roughly <strong style={{ color: "#fff" }}>80% of your total PTE score</strong>. Tasks marked <span style={{ color: "#FBBF24" }}>★★★★★</span> are <strong style={{ color: "#fff" }}>dual-skill contributors</strong> — one response impacts two skill scores simultaneously. They are your highest return-on-practice tasks. Master these before touching anything else.
              </p>
            </div>

            {/* Zone overview pills */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 28 }}>
              {['S','W','R','L'].map(z => {
                const zt = PRIORITY_TASKS.filter(t => t.zone === z);
                return (
                  <div key={z} style={{ background: "#0F1929", borderRadius: 12, padding: "16px", border: `1px solid ${ZONE_COLOR[z]}25` }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: ZONE_COLOR[z], marginBottom: 4 }}>{ZONE_NAME[z]}</div>
                    <div style={{ fontSize: 28, fontWeight: 800 }}>{zt.length}</div>
                    <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>priority tasks</div>
                    <div style={{ fontSize: 11, color: "#64748B", marginTop: 6 }}>{zt.filter(t=>t.vvi===5).length} critical · {zt.filter(t=>t.vvi===4).length} high</div>
                  </div>
                );
              })}
            </div>

            {['S','W','R','L'].map(zone => (
              <div key={zone} style={{ marginBottom: 28 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: ZONE_COLOR[zone] }}></div>
                  <span style={{ fontWeight: 700, fontSize: 14, color: ZONE_COLOR[zone] }}>{ZONE_NAME[zone]} Zone</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
                  {PRIORITY_TASKS.filter(t => t.zone === zone).map(task => (
                    <div
                      key={task.id}
                      className="task-card"
                      onClick={() => setSelectedTask(task)}
                      style={{
                        cursor: "pointer",
                        ...(task.vvi===5 ? { borderColor: ZONE_COLOR[zone]+"40", boxShadow: `0 0 0 1px ${ZONE_COLOR[zone]}20` } : {}),
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: 14, color: "#E2E8F0" }}>{task.name}</div>
                          <div style={{ marginTop: 6 }}>
                            {task.skills.map(s => <span key={s} className="pill">{s}</span>)}
                          </div>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 10 }}>
                          <div style={{ color: task.vvi===5 ? "#FBBF24" : "#94A3B8", fontSize: 13, letterSpacing: 1 }}>{"★".repeat(task.vvi)}{"☆".repeat(5-task.vvi)}</div>
                          <div style={{ display: "flex", gap: 5, justifyContent: "flex-end", alignItems: "center", marginTop: 4 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: ZONE_COLOR[zone] }}>~{task.weight}%</span>
                            <span style={{
                              fontSize: 9, fontWeight: 800, letterSpacing: .5, borderRadius: 4, padding: "2px 6px",
                              background: task.vvi===5 ? "#78350F" : "#1E3A2F",
                              color: task.vvi===5 ? "#FCD34D" : "#6EE7B7",
                            }}>{task.vvi===5 ? "CRITICAL" : "HIGH"}</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #1E293B", color: "#64748B", fontSize: 12, lineHeight: 1.6 }}>
                        💡 {customTips[task.id] ?? task.tip}
                      </div>
                      <div style={{ marginTop: 8, fontSize: 11, color: "#334155" }}>Tap to open →</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div style={{ background: "#1A0F0F", border: "1px solid #7F1D1D", borderRadius: 12, padding: "14px 18px" }}>
              <div style={{ color: "#FCA5A5", fontWeight: 700, fontSize: 12, marginBottom: 8 }}>⚠️ Lower Priority — Practise these ONLY after hitting 80+ in the tasks above</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                { ["Answer Short Question","Summarize Group Discussion","Respond to a Situation","MCQ Multiple Answers (R)","MCQ Single Answer (R)","MCQ Multiple Answers (L)","MCQ Single Answer (L)","Select Missing Words","Highlight Incorrect Words","Highlight Correct Summary"].map(t => (
                  <span key={t} className="pill" style={{ background: "#2D0F0F" }}>{t}</span>
                )) }
              </div>
            </div>

            {selectedTask && (
              <PriorityTaskDetail
                task={selectedTask}
                customTip={customTips[selectedTask.id] ?? null}
                onSaveTip={saveCustomTip}
                onClose={() => setSelectedTask(null)}
              />
            )}
          </div>
        )}

        {/* ───── AI SCORER ───── */}
        {tab === "scorer" && (
          <div style={{ maxWidth: 700 }}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>AI PTE Scorer</div>
              <p style={{ color: "#64748B", fontSize: 13, margin: 0 }}>Paste your response and get a real PTE-rubric score with detailed feedback to hit 90.</p>
            </div>

            {/* Task selector */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
              {SCORABLE.map(t => (
                <button key={t.id} className="qtab" onClick={() => { setScorerTask(t.id); setScoreResult(null); setUserText(""); }} style={scorerTask===t.id ? { background: "#0EA5E9", borderColor: "#0EA5E9", color: "#fff" } : {}}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Rubric hint */}
            <div style={{ background: "#0F1929", border: "1px solid #1E293B", borderRadius: 10, padding: "12px 16px", marginBottom: 14, fontSize: 12, color: "#64748B", lineHeight: 1.6 }}>
              {scorerTask === "write_essay" && "📏 Write Essay: 200–300 words · 4 paragraphs · Scored on: Content, Form, Grammar, Vocabulary, Spelling"}
              {scorerTask === "summarize_written" && "📏 Summarize Written Text: MUST be 1 sentence · 5–75 words · Scored on: Content, Form (1-sentence rule), Grammar, Vocabulary, Spelling"}
              {scorerTask === "read_aloud" && "📏 Read Aloud: Paste a transcript of what you said. Scored on: Content accuracy, Oral fluency, Pronunciation"}
              {scorerTask === "write_dictation" && "📏 Write From Dictation: Paste exactly what you typed. Every word & spelling counts. Scored on: Verbatim accuracy"}
            </div>

            <textarea
              className="input-field"
              style={{ minHeight: 180 }}
              placeholder={
                scorerTask === "write_essay" ? "Paste your essay here (aim for 200–300 words)..." :
                scorerTask === "summarize_written" ? "Paste your one-sentence summary here..." :
                scorerTask === "read_aloud" ? "Paste the transcript of what you said while reading aloud..." :
                "Paste what you typed from dictation..."
              }
              value={userText}
              onChange={e => setUserText(e.target.value)}
            />

            {scorerTask === "write_essay" && userText.trim() && (
              <div style={{ fontSize: 12, marginTop: 6, color: wc(userText) < 200 ? "#F87171" : wc(userText) > 300 ? "#FBBF24" : "#34D399" }}>
                Word count: {wc(userText)} / 200–300 {wc(userText) < 200 ? "⚠ too short" : wc(userText) > 300 ? "⚠ too long" : "✓ good length"}
              </div>
            )}
            {scorerTask === "summarize_written" && userText.trim() && (
              <div style={{ fontSize: 12, marginTop: 6, color: wc(userText) < 5 ? "#F87171" : wc(userText) > 75 ? "#FBBF24" : "#34D399" }}>
                Word count: {wc(userText)} / 5–75 {wc(userText) < 5 ? "⚠ too short" : wc(userText) > 75 ? "⚠ too long" : "✓ good length"}
                {" · "}
                {(userText.trim().match(/[.!?]+(?:\s|$)/g) || []).length > 1
                  ? <span style={{ color: "#F87171" }}>⚠ multiple sentences detected — must be 1</span>
                  : <span style={{ color: "#34D399" }}>1 sentence ✓</span>}
              </div>
            )}

            {scorerTask === "write_essay" && <EssayFeedbackPanel text={userText} />}

            <button className="btn-primary" onClick={scoreResponse} disabled={!userText.trim() || scoring} style={{ width: "100%", padding: "14px", fontSize: 14, marginTop: 14 }}>
              {scoring ? "⏳ Scoring your response..." : "🤖 Score My Response"}
            </button>

            {scoreError && <div style={{ marginTop: 16, background: "#1A0000", border: "1px solid #7F1D1D", borderRadius: 10, padding: "12px 16px", color: "#FCA5A5", fontSize: 13 }}>{scoreError}</div>}

            {scoreResult && (
              <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Overall */}
                <div style={{ background: "#0F1929", border: "1px solid #1E293B", borderRadius: 14, padding: "24px", textAlign: "center" }}>
                  <div style={{ color: "#64748B", fontSize: 13, marginBottom: 8 }}>PTE Score</div>
                  <div style={{ fontSize: 72, fontWeight: 800, color: scoreColor(scoreResult.overall), lineHeight: 1, fontFamily: "'DM Serif Display', serif" }}>{scoreResult.overall}</div>
                  <div style={{ marginTop: 8, display: "inline-block", padding: "4px 16px", borderRadius: 20, fontSize: 13, fontWeight: 600, background: scoreResult.overall >= 79 ? "#064E3B" : scoreResult.overall >= 65 ? "#451A03" : "#450A0A", color: scoreColor(scoreResult.overall) }}>
                    {scoreResult.band}
                  </div>
                  <div style={{ marginTop: 16 }}>
                    <div className="score-bar-bg">
                      <div className="score-bar-fill" style={{ width: `${(scoreResult.overall/90)*100}%`, background: scoreColor(scoreResult.overall) }}></div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#475569", marginTop: 4 }}><span>0</span><span>🎯 Target: 90</span></div>
                  </div>
                </div>

                {/* Criteria */}
                <div style={{ background: "#0F1929", border: "1px solid #1E293B", borderRadius: 14, padding: "20px" }}>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>Criteria Breakdown</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {scoreResult.criteria?.map((c, i) => (
                      <div key={i}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: 13, color: "#CBD5E1" }}>{c.name}</span>
                          <span style={{ fontWeight: 700, fontSize: 13, color: scoreColor((c.score/c.max)*90) }}>{c.score}/{c.max}</span>
                        </div>
                        <div className="score-bar-bg">
                          <div className="score-bar-fill" style={{ width: `${(c.score/c.max)*100}%`, background: scoreColor((c.score/c.max)*90) }}></div>
                        </div>
                        <div style={{ fontSize: 11, color: "#64748B", marginTop: 4 }}>{c.comment}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Strengths + Fixes */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div style={{ background: "#052E1C", border: "1px solid #064E3B", borderRadius: 12, padding: "16px" }}>
                    <div style={{ color: "#34D399", fontWeight: 700, fontSize: 13, marginBottom: 8 }}>✅ Strengths</div>
                    {scoreResult.strengths?.map((s, i) => <div key={i} style={{ color: "#94A3B8", fontSize: 12, lineHeight: 1.6 }}>• {s}</div>)}
                  </div>
                  <div style={{ background: "#1C0505", border: "1px solid #4C0519", borderRadius: 12, padding: "16px" }}>
                    <div style={{ color: "#F87171", fontWeight: 700, fontSize: 13, marginBottom: 8 }}>🔧 Fix Now</div>
                    {scoreResult.fix_now?.map((f, i) => <div key={i} style={{ color: "#94A3B8", fontSize: 12, lineHeight: 1.6 }}>• {f}</div>)}
                  </div>
                </div>

                {/* To reach 90 */}
                <div style={{ background: "#0C1D35", border: "1px solid #1D4ED8", borderRadius: 12, padding: "16px" }}>
                  <div style={{ color: "#60A5FA", fontWeight: 700, fontSize: 13, marginBottom: 6 }}>🎯 What You Need to Hit 90</div>
                  <p style={{ color: "#CBD5E1", fontSize: 13, margin: 0, lineHeight: 1.7 }}>{scoreResult.to_reach_90}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ───── SCORE TRACKER ───── */}
        {tab === "tracker" && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Score Tracker</div>
              <p style={{ color: "#64748B", fontSize: 13, margin: 0 }}>Log practice test scores after each session. Track your journey from your current level to 90.</p>
            </div>

            {/* Log form */}
            <div style={{ background: "#0F1929", border: "1px solid #1E293B", borderRadius: 14, padding: "20px", marginBottom: 24 }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>+ Log New Session</div>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr auto", gap: 10, alignItems: "flex-end" }}>
                <div>
                  <div style={{ fontSize: 11, color: "#64748B", marginBottom: 4 }}>Date</div>
                  <input type="date" className="input-field" value={form.date} onChange={e => setForm(p => ({...p, date: e.target.value}))} />
                </div>
                {['S','W','R','L'].map(z => (
                  <div key={z}>
                    <div style={{ fontSize: 11, color: ZONE_COLOR[z], marginBottom: 4, fontWeight: 700 }}>{ZONE_NAME[z]}</div>
                    <input type="number" min="0" max="90" placeholder="0–90" className="input-field" value={form[z]} onChange={e => setForm(p => ({...p, [z]: e.target.value}))} />
                  </div>
                ))}
                <button className="btn-primary" onClick={addSession} style={{ padding: "10px 18px", fontSize: 13, whiteSpace: "nowrap" }}>Add</button>
              </div>
            </div>

            {sessionsWithOverall.length > 0 && (
              <>
                {/* Latest scores */}
                {latest && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
                    {['S','W','R','L'].map(z => {
                      const sc = latest[z]; const gap = 90 - sc;
                      return (
                        <div key={z} style={{ background: "#0F1929", border: `1px solid ${ZONE_COLOR[z]}30`, borderRadius: 12, padding: "16px", textAlign: "center" }}>
                          <div style={{ fontSize: 11, color: ZONE_COLOR[z], fontWeight: 700, marginBottom: 4 }}>{ZONE_NAME[z]}</div>
                          <div style={{ fontSize: 40, fontWeight: 800, color: scoreColor(sc), fontFamily: "'DM Serif Display', serif" }}>{sc}</div>
                          <div style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>{gap > 0 ? `${gap} pts to 90` : "🎯 Target hit!"}</div>
                          <div className="score-bar-bg" style={{ marginTop: 10 }}>
                            <div className="score-bar-fill" style={{ width: `${(sc/90)*100}%`, background: ZONE_COLOR[z] }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Chart */}
                <div style={{ background: "#0F1929", border: "1px solid #1E293B", borderRadius: 14, padding: "20px", marginBottom: 24 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 20 }}>Progress Chart</div>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={sessionsWithOverall}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                      <XAxis dataKey="date" tick={{ fill: "#475569", fontSize: 11 }} />
                      <YAxis domain={[40, 92]} tick={{ fill: "#475569", fontSize: 11 }} />
                      <Tooltip contentStyle={{ background: "#0F1929", border: "1px solid #334155", borderRadius: 8, color: "#fff", fontSize: 12 }} />
                      {[["S","#38BDF8","Speaking"],["W","#A78BFA","Writing"],["R","#34D399","Reading"],["L","#FBBF24","Listening"],["Overall","#fff","Overall"]].map(([k,c,n]) => (
                        <Line key={k} type="monotone" dataKey={k} stroke={c} strokeWidth={k==="Overall"?1.5:2} dot={{ r: 4, fill: c }} strokeDasharray={k==="Overall"?"5 5":undefined} name={n} />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                  <div style={{ display: "flex", gap: 16, marginTop: 12, justifyContent: "center", flexWrap: "wrap" }}>
                    {[["S","#38BDF8","Speaking"],["W","#A78BFA","Writing"],["R","#34D399","Reading"],["L","#FBBF24","Listening"],["Overall","#fff","Overall"]].map(([k,c,n]) => (
                      <div key={k} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 20, height: 2, background: c, borderRadius: 1 }}></div>
                        <span style={{ color: "#64748B", fontSize: 11 }}>{n}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Table */}
                <div style={{ background: "#0F1929", border: "1px solid #1E293B", borderRadius: 14, overflow: "hidden" }}>
                  <div style={{ padding: "14px 20px", borderBottom: "1px solid #1E293B", fontWeight: 700, fontSize: 13 }}>Session History</div>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid #1E293B" }}>
                        <th style={{ textAlign: "left", padding: "10px 20px", color: "#475569", fontWeight: 600, fontSize: 11 }}>Date</th>
                        {[["S","#38BDF8"],["W","#A78BFA"],["R","#34D399"],["L","#FBBF24"]].map(([z,c]) => (
                          <th key={z} style={{ textAlign: "center", padding: "10px 16px", color: c, fontWeight: 700, fontSize: 11 }}>{ZONE_NAME[z]}</th>
                        ))}
                        <th style={{ textAlign: "center", padding: "10px 16px", color: "#94A3B8", fontWeight: 700, fontSize: 11 }}>Overall</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...sessionsWithOverall].reverse().map((s, i) => (
                        <tr key={i} style={{ borderBottom: "1px solid #0F172A" }}>
                          <td style={{ padding: "10px 20px", color: "#64748B", fontSize: 12 }}>{s.date}</td>
                          {['S','W','R','L'].map(z => (
                            <td key={z} style={{ textAlign: "center", padding: "10px 16px", fontWeight: 700, color: s[z] != null ? scoreColor(s[z]) : '#475569' }}>{s[z] ?? '–'}</td>
                          ))}
                          <td style={{ textAlign: "center", padding: "10px 16px", fontWeight: 800, color: s.Overall != null ? scoreColor(s.Overall) : '#475569' }}>{s.Overall ?? '–'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* ───── QUESTION BANK ───── */}
        {tab === "qbank" && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Question Bank</div>
              <p style={{ color: "#64748B", fontSize: 13, margin: 0 }}>Practice questions for the highest-priority PTE tasks. Write your answer and send it to the AI Scorer.</p>
            </div>

            {/* Task selector */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
              {qTaskTabs.map(t => (
                <button key={t.id} className="qtab" onClick={() => { setQTask(t.id); setQAnswers({}); setQRevealed({}); setQSelected({}); }} style={qTask===t.id ? { background: "#0EA5E9", borderColor: "#0EA5E9", color: "#fff" } : {}}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>

            {/* Tip */}
            <div style={{ background: "#1A130A", border: "1px solid #92400E", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 12, color: "#D97706", lineHeight: 1.7 }}>
              💡 {qTask === "write_essay" && "Structure: Intro (topic + position) → Body 1 (argument + example) → Body 2 (argument/counterpoint + example) → Conclusion. Use discourse markers: Furthermore, However, In conclusion, Consequently..."}
              {qTask === "summarize_written" && "Write exactly ONE sentence. Must be 5–75 words. Avoid 'This passage is about...' — instead start with the subject directly. Use complex structure: 'Although X..., the text demonstrates that Y..., highlighting Z.'"}
              {qTask === "read_aloud" && "Read at 70–80 wpm. Chunk at commas/periods. Stress nouns and verbs (content words). Don't stress articles, prepositions, conjunctions. Record yourself, then paste the transcript to the AI Scorer."}
              {qTask === "rw_fitb" && "Check part of speech first (is it noun/verb/adj?), then check grammar (does it fit the structure?), then collocation (does it naturally pair with surrounding words?). Eliminate wrong answers systematically."}
              {qTask === "write_dictation" && "In the real exam you hear the sentence once. Every word & spelling = points. Practise: read the sentence once, cover it, type from memory. Check your spelling carefully before submitting."}
            </div>

            {/* FITB questions */}
            {qTask === "rw_fitb" && SAMPLE_QS.rw_fitb.map((q, qi) => (
              <div key={qi} style={{ background: "#0F1929", border: "1px solid #1E293B", borderRadius: 14, padding: "20px", marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: "#34D399", fontWeight: 700, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>R&W Fill in the Blanks #{qi+1}</div>
                <p style={{ color: "#CBD5E1", lineHeight: 1.9, fontSize: 14, margin: "0 0 16px 0" }}>
                  {q.text.split(/\[A\]|\[B\]/).map((part, i) => (
                    <span key={i}>
                      {part}
                      {i < q.blanks.length && (
                        <select className="select-blank" value={qSelected[`${qi}-${i}`]||""} onChange={e => setQSelected(p => ({...p, [`${qi}-${i}`]: e.target.value}))}>
                          <option value="">select word</option>
                          {q.blanks[i].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      )}
                    </span>
                  ))}
                </p>
                {qRevealed[qi] && (
                  <div style={{ background: "#052E1C", border: "1px solid #064E3B", borderRadius: 8, padding: "10px 14px", marginBottom: 8 }}>
                    <span style={{ color: "#34D399", fontSize: 12, fontWeight: 700 }}>Answers: </span>
                    {q.answers.map((a, i) => <span key={i} style={{ background: "#064E3B", color: "#6EE7B7", borderRadius: 4, padding: "2px 10px", fontSize: 12, marginLeft: 6 }}>Blank {i+1}: {a}</span>)}
                  </div>
                )}
                <button className="reveal-btn" onClick={() => setQRevealed(p => ({...p, [qi]: !p[qi]}))}>
                  {qRevealed[qi] ? "Hide answers" : "Reveal answers"}
                </button>
              </div>
            ))}

            {/* Write Dictation */}
            {qTask === "write_dictation" && SAMPLE_QS.write_dictation.map((q, qi) => (
              <div key={qi} style={{ background: "#0F1929", border: "1px solid #1E293B", borderRadius: 14, padding: "20px", marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: "#FBBF24", fontWeight: 700, marginBottom: 10, textTransform: "uppercase" }}>Write From Dictation #{qi+1}</div>
                <div style={{ background: "#1A130A", border: "1px solid #92400E", borderRadius: 8, padding: "12px 16px", marginBottom: 14, fontSize: 13, color: "#D97706" }}>
                  🎧 In the real exam you would hear this sentence once. Practice: read it below once, then cover it and type from memory.
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <button className="reveal-btn" style={{ fontSize: 13 }} onClick={() => setQRevealed(p => ({...p, [qi]: !p[qi]}))}>
                    {qRevealed[qi] ? "Hide sentence" : "👁 Show sentence (for study)"}
                  </button>
                  {qRevealed[qi] && <span style={{ color: "#E2E8F0", fontSize: 14, fontStyle: "italic" }}>"{q.prompt}"</span>}
                </div>
                <textarea className="input-field" rows={3} placeholder="Type exactly what you hear..." value={qAnswers[qi]||""} onChange={e => setQAnswers(p => ({...p, [qi]: e.target.value}))} />
                <button className="send-to-scorer" onClick={() => { setUserText(qAnswers[qi]||""); setScorerTask("write_dictation"); setTab("scorer"); }}>→ Send to AI Scorer</button>
              </div>
            ))}

            {/* Other tasks (essay, summarize, read aloud) */}
            { ["write_essay","summarize_written","read_aloud"].includes(qTask) && SAMPLE_QS[qTask]?.map((q, qi) => (
              <div key={qi} style={{ background: "#0F1929", border: "1px solid #1E293B", borderRadius: 14, padding: "20px", marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div style={{ fontSize: 11, color: "#38BDF8", fontWeight: 700, textTransform: "uppercase" }}>Question #{qi+1} · {q.type}</div>
                  <div style={{ fontSize: 11, background: "#1E293B", color: "#64748B", borderRadius: 4, padding: "2px 8px" }}>{q.range}</div>
                </div>
                <div style={{ background: "#080E1A", borderRadius: 10, padding: "14px 16px", marginBottom: 14, color: "#E2E8F0", fontSize: 14, lineHeight: 1.8, border: "1px solid #1E293B" }}>
                  {q.prompt}
                </div>
                <textarea
                  className="input-field"
                  rows={qTask === "write_essay" ? 8 : 4}
                  placeholder={qTask === "write_essay" ? "Write your essay here (200–300 words)..." : qTask === "summarize_written" ? "Write ONE sentence summarizing the text above (5–75 words)..." : "Record yourself reading this aloud, then paste the transcript here..."}
                  value={qAnswers[qi]||""}
                  onChange={e => setQAnswers(p => ({...p, [qi]: e.target.value}))}
                />
                {qTask === "write_essay" && (qAnswers[qi]||"").trim() && (
                  <div style={{ fontSize: 12, marginTop: 5, color: wc(qAnswers[qi]||"") < 200 ? "#F87171" : wc(qAnswers[qi]||"") > 300 ? "#FBBF24" : "#34D399" }}>
                    {wc(qAnswers[qi]||"")} words {wc(qAnswers[qi]||"") < 200 ? "— too short!" : wc(qAnswers[qi]||"") > 300 ? "— too long!" : "✓"}
                  </div>
                )}
                {qTask === "summarize_written" && (qAnswers[qi]||"").trim() && (
                  <div style={{ fontSize: 12, marginTop: 5, color: "#64748B" }}>
                    {wc(qAnswers[qi]||"")} words {(qAnswers[qi]||"").trim().split(".").filter(s=>s.trim()).length > 1 ? <span style={{color:"#F87171"}}>⚠ Must be 1 sentence!</span> : ""}
                  </div>
                )}
                <button className="send-to-scorer" onClick={() => { setUserText(qAnswers[qi]||""); setScorerTask(qTask === "read_aloud" ? "read_aloud" : qTask); setTab("scorer"); }}>→ Send to AI Scorer</button>
              </div>
            ))}

            <div style={{ marginTop: 24 }}>
              <AIQuestionBank />
            </div>
          </div>
        )}

        {tab === "mock" && <MockTestSystem />}

        {/* ───── SPEAKING ZONE ───── */}
        {tab === "speaking" && (
          <div>
            <div style={{ display: "flex", gap: 6, marginBottom: 20, background: "#0A1222", borderRadius: 10, padding: 4 }}>
              {[
                { id: "read_aloud",  label: "📖 Read Aloud",       weight: "15%" },
                { id: "repeat",      label: "🔁 Repeat Sentence",  weight: "13%" },
                { id: "describe",    label: "🖼 Describe Image",   weight: "10%" },
                { id: "retell",      label: "🎧 Re-tell Lecture",  weight: "8%"  },
              ].map(t => (
                <button key={t.id} onClick={() => setSpeakingTab(t.id)} style={{
                  flex: 1, padding: "8px 4px", border: "none", borderRadius: 8, cursor: "pointer",
                  fontSize: 12, fontWeight: 700, fontFamily: "inherit", transition: "all .15s",
                  background: speakingTab === t.id ? "#38BDF820" : "transparent",
                  color: speakingTab === t.id ? "#38BDF8" : "#475569",
                  borderBottom: speakingTab === t.id ? "2px solid #38BDF8" : "2px solid transparent",
                }}>
                  {t.label}<br /><span style={{ fontSize: 10, fontWeight: 400, color: "#64748B" }}>{t.weight}</span>
                </button>
              ))}
            </div>
            {speakingTab === "read_aloud" && <ReadAloudPanel />}
            {speakingTab === "repeat"     && <RepeatSentencePanel />}
            {speakingTab === "describe"   && <DescribeImagePanel />}
            {speakingTab === "retell"     && <RetellLecturePanel />}
          </div>
        )}

        {/* ───── WRITING ZONE ───── */}
        {tab === "writing" && (
          <div>
            <div style={{ display: "flex", gap: 6, marginBottom: 20, background: "#0A1222", borderRadius: 10, padding: 4 }}>
              {[
                { id: "essay",      label: "✍️ Write Essay",           weight: "24%" },
                { id: "summarize",  label: "📝 Summarize Written Text", weight: "15%" },
              ].map(t => (
                <button key={t.id} onClick={() => setWritingTab(t.id)} style={{
                  flex: 1, padding: "8px 4px", border: "none", borderRadius: 8, cursor: "pointer",
                  fontSize: 12, fontWeight: 700, fontFamily: "inherit", transition: "all .15s",
                  background: writingTab === t.id ? "#A78BFA20" : "transparent",
                  color: writingTab === t.id ? "#A78BFA" : "#475569",
                  borderBottom: writingTab === t.id ? "2px solid #A78BFA" : "2px solid transparent",
                }}>
                  {t.label}<br /><span style={{ fontSize: 10, fontWeight: 400, color: "#64748B" }}>{t.weight}</span>
                </button>
              ))}
            </div>
            {writingTab === "essay"     && <WritingPanel />}
            {writingTab === "summarize" && <SummarizeWrittenPanel />}
          </div>
        )}

        {/* ───── READING ZONE ───── */}
        {tab === "reading" && (
          <div>
            <div style={{ display: "flex", gap: 6, marginBottom: 20, background: "#0A1222", borderRadius: 10, padding: 4 }}>
              {[
                { id: "rw_fitb",   label: "📖 R&W Fill Blanks",     weight: "18%" },
                { id: "reorder",   label: "🔀 Reorder Paragraph",   weight: "13%" },
                { id: "dropdown",  label: "▼ Fill Blanks Dropdown", weight: "10%" },
                { id: "general",   label: "📚 Reading Practice",    weight: "" },
              ].map(t => (
                <button key={t.id} onClick={() => setReadingTab(t.id)} style={{
                  flex: 1, padding: "8px 4px", border: "none", borderRadius: 8, cursor: "pointer",
                  fontSize: 12, fontWeight: 700, fontFamily: "inherit", transition: "all .15s",
                  background: readingTab === t.id ? "#34D39920" : "transparent",
                  color: readingTab === t.id ? "#34D399" : "#475569",
                  borderBottom: readingTab === t.id ? "2px solid #34D399" : "2px solid transparent",
                }}>
                  {t.label}<br /><span style={{ fontSize: 10, fontWeight: 400, color: "#64748B" }}>{t.weight}</span>
                </button>
              ))}
            </div>
            {readingTab === "rw_fitb"  && <RWFillBlanksPanel />}
            {readingTab === "reorder"  && <ReorderPanel />}
            {readingTab === "dropdown" && <DropdownFillBlanksPanel />}
            {readingTab === "general"  && <ReadingPanel />}
          </div>
        )}

        {/* ───── LISTENING ZONE ───── */}
        {tab === "listening" && (
          <div>
            <div style={{ display: "flex", gap: 6, marginBottom: 20, background: "#0A1222", borderRadius: 10, padding: 4 }}>
              {[
                { id: "dictation",  label: "✍️ Write Dictation",     weight: "22%" },
                { id: "summarize",  label: "🎧 Summarize Spoken",    weight: "14%" },
                { id: "typein",     label: "⌨️ Fill Blanks (Type)",   weight: "12%" },
                { id: "general",    label: "📻 Listening Practice",  weight: "" },
              ].map(t => (
                <button key={t.id} onClick={() => setListeningTab(t.id)} style={{
                  flex: 1, padding: "8px 4px", border: "none", borderRadius: 8, cursor: "pointer",
                  fontSize: 12, fontWeight: 700, fontFamily: "inherit", transition: "all .15s",
                  background: listeningTab === t.id ? "#FBBF2420" : "transparent",
                  color: listeningTab === t.id ? "#FBBF24" : "#475569",
                  borderBottom: listeningTab === t.id ? "2px solid #FBBF24" : "2px solid transparent",
                }}>
                  {t.label}<br /><span style={{ fontSize: 10, fontWeight: 400, color: "#64748B" }}>{t.weight}</span>
                </button>
              ))}
            </div>
            {listeningTab === "dictation" && <WriteDictationPanel />}
            {listeningTab === "summarize" && <SummarizeSpeechPanel />}
            {listeningTab === "typein"    && <TypeInFillBlanksPanel />}
            {listeningTab === "general"   && <ListeningPanel />}
          </div>
        )}
        {tab === "planner" && <StudyPlanner />}
        {tab === "analytics" && <AnalyticsDashboard />}
        {tab === "game" && <GamificationPanel />}
        {tab === "prod" && <ProductionReadinessPanel />}

      </div>
    </div>
  );
}
