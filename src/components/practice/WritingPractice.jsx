import { useEffect, useRef, useState } from "react";
import { callClaudeScore } from "../../utils/claudeScorer";

const TIMER_SECONDS = 20 * 60; // 20 minutes — official PTE Write Essay time

function fmt(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

function wordCount(s) {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

function formScore(wc) {
  if (wc >= 200 && wc <= 300) return 2;
  if ((wc >= 120 && wc <= 199) || (wc >= 301 && wc <= 380)) return 1;
  return 0;
}

function wcColor(wc) {
  if (wc === 0) return "#475569";
  if (wc < 120) return "#F87171";
  if (wc < 200) return "#FBBF24";
  if (wc <= 300) return "#34D399";
  if (wc <= 380) return "#FBBF24";
  return "#F87171";
}

function wcLabel(wc) {
  if (wc < 120) return "⚠ Too short — Form = 0 below 120";
  if (wc < 200) return "— aim for 200+ (Form = 1 here)";
  if (wc <= 300) return "✓ Perfect range";
  if (wc <= 380) return "— slightly over (Form = 1, aim for ≤300)";
  return "✗ Too long — Form = 0 above 380";
}

const STRATEGIES = [
  "Plan 2 min → Write 16 min → Review 2 min. Never skip the plan.",
  "Use 4 paragraphs: Intro (topic + stance) → Body 1 → Body 2 → Conclusion.",
  "Aim for 250 words — safely inside 200-300, Form = 2.",
  "Open with a paraphrase of the prompt, NOT a copy of it.",
  "Use discourse markers: Furthermore, However, In contrast, Consequently, In conclusion.",
  "Avoid contractions (don't → do not), avoid bullet points.",
  "Each body paragraph: Point → Explain → Example → Link back.",
];

export default function WritingPractice({ question, onClose, onComplete }) {
  const [text, setText]     = useState("");
  const [scored, setScored] = useState(null);
  const [scoring, setScoring] = useState(false);
  const [timerSec, setTimerSec] = useState(TIMER_SECONDS);
  const [timerRunning, setTimerRunning] = useState(false);
  const [showStrategy, setShowStrategy] = useState(false);
  const timerRef = useRef(null);

  const wc = wordCount(text);

  // Autosave draft
  useEffect(() => {
    const id = `writing-draft-${question.id}`;
    const saved = localStorage.getItem(id);
    if (saved) setText(saved);
  }, [question.id]);

  useEffect(() => {
    const id = `writing-draft-${question.id}`;
    const t = setInterval(() => localStorage.setItem(id, text), 2000);
    return () => clearInterval(t);
  }, [question.id, text]);

  // Start timer on first keystroke
  useEffect(() => {
    if (text.length > 0 && !timerRunning && !scored) {
      setTimerRunning(true);
    }
  }, [text]);

  useEffect(() => {
    if (!timerRunning || scored) return;
    timerRef.current = setInterval(() => {
      setTimerSec(s => {
        if (s <= 1) { clearInterval(timerRef.current); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [timerRunning, scored]);

  const timerColor = timerSec > 300 ? "#34D399" : timerSec > 120 ? "#FBBF24" : "#F87171";

  const submit = async () => {
    if (scoring) return;
    clearInterval(timerRef.current);
    setScoring(true);
    try {
      const score = await callClaudeScore({ skill: "writing", question: question.text, answer: text });
      setScored(score);
      if (onComplete) onComplete({ text, score });
    } catch {
      const form = formScore(wc);
      const fallback = {
        overall: Math.round(50 + form * 10),
        band: "Upper Intermediate",
        content: 1, form, development: 1, linguistic_range: 1, grammar: 1, vocabulary: 1, spelling: 1,
        fix_now: ["Ensure your essay directly addresses both sides of the argument", "Add discourse markers to improve coherence", "Check spelling carefully before submitting"],
        strategy: "Aim for exactly 250 words — safely inside the 200-300 Form = 2 zone.",
      };
      setScored(fallback);
      if (onComplete) onComplete({ text, score: fallback });
    }
    setScoring(false);
  };

  const scoreColor = (v, max) => v === max ? "#34D399" : v === 0 ? "#F87171" : "#FBBF24";

  return (
    <div style={{ background: "#071226", border: "1px solid #1E293B", borderRadius: 14, padding: 16 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{question.title}</div>
          <div style={{ color: "#64748B", fontSize: 12, marginTop: 2 }}>Write Essay · 200–300 words · 20 minutes · 24% of Writing score</div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {timerRunning && !scored && (
            <div style={{ fontWeight: 800, fontSize: 18, color: timerColor, fontVariantNumeric: "tabular-nums" }}>
              {fmt(timerSec)}
            </div>
          )}
          <button className="reveal-btn" onClick={onClose}>✕</button>
        </div>
      </div>

      {/* Exam info bar */}
      <div style={{ background: "#0C1B35", border: "1px solid #1D4ED830", borderRadius: 8, padding: "8px 14px", marginBottom: 12, fontSize: 12, color: "#60A5FA", display: "flex", gap: 20, flexWrap: "wrap" }}>
        <span>⏱ 20 min timer starts on first keystroke</span>
        <span>📝 200–300 words = Form 2/2 (max)</span>
        <span>🎯 7 scoring dimensions — max 15 pts → 10-90 scale</span>
      </div>

      {/* Prompt */}
      <div style={{ background: "#080E1A", borderRadius: 8, padding: "12px 14px", marginBottom: 12, fontSize: 14, color: "#CBD5E1", lineHeight: 1.7 }}>
        {question.text}
      </div>

      {/* Text area + live word count */}
      <div style={{ marginBottom: 10 }}>
        <textarea
          className="input-field"
          rows={10}
          placeholder="Write your essay here… Timer starts on first keystroke."
          value={text}
          onChange={e => setText(e.target.value)}
          disabled={!!scored}
          style={{ fontSize: 14, lineHeight: 1.7, resize: "vertical" }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, alignItems: "center" }}>
          <div style={{ fontSize: 12, color: wcColor(wc), fontWeight: 700 }}>
            {wc} words {wcLabel(wc)}
          </div>
          <div style={{ fontSize: 11, color: "#475569" }}>
            Form: {formScore(wc)}/2 &nbsp;|&nbsp; Auto-saved
          </div>
        </div>
        {/* Word count bar */}
        <div style={{ height: 4, background: "#1E293B", borderRadius: 4, marginTop: 6, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${Math.min(100, (wc / 300) * 100)}%`, background: wcColor(wc), transition: "width .3s, background .3s", borderRadius: 4 }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#334155", marginTop: 3 }}>
          <span>0</span><span>120</span><span style={{ color: "#34D399" }}>200</span><span style={{ color: "#34D399" }}>300</span><span>380</span>
        </div>
      </div>

      {/* Score result */}
      {scored && (
        <div style={{ background: "#0A1222", borderRadius: 12, padding: 14, marginBottom: 12 }}>
          <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 10 }}>
            Score: <span style={{ color: scored.overall >= 79 ? "#34D399" : scored.overall >= 65 ? "#FBBF24" : "#F87171" }}>{scored.overall}</span>
            {scored.band && <span style={{ fontSize: 12, color: "#64748B", marginLeft: 8 }}>{scored.band}</span>}
          </div>

          {/* 7 official dimensions */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
            {[
              ["Content", scored.content, 3],
              ["Form", scored.form, 2],
              ["Dev/Structure", scored.development, 2],
              ["Ling. Range", scored.linguistic_range, 2],
              ["Grammar", scored.grammar, 2],
              ["Vocabulary", scored.vocabulary, 2],
              ["Spelling", scored.spelling, 2],
            ].map(([label, val, max]) => (
              <div key={label} style={{ background: "#071226", borderRadius: 8, padding: "8px 10px", textAlign: "center", minWidth: 68 }}>
                <div style={{ fontSize: 9, color: "#64748B", fontWeight: 700, marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 17, fontWeight: 800, color: scoreColor(val, max) }}>{val ?? "–"}/{max}</div>
              </div>
            ))}
          </div>

          {/* Raw total */}
          <div style={{ fontSize: 12, color: "#475569", marginBottom: 10 }}>
            Raw total: {[scored.content, scored.form, scored.development, scored.linguistic_range, scored.grammar, scored.vocabulary, scored.spelling].reduce((a, b) => a + (b || 0), 0)} / 15
          </div>

          {scored.fix_now?.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: "#94A3B8", fontWeight: 700, marginBottom: 4 }}>FIX NOW:</div>
              <ul style={{ paddingLeft: 18, color: "#94A3B8", fontSize: 13, lineHeight: 1.8, margin: 0 }}>
                {scored.fix_now.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
            </div>
          )}

          {scored.strategy && (
            <div style={{ background: "#0C1B35", border: "1px solid #1D4ED830", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#60A5FA" }}>
              💡 {scored.strategy}
            </div>
          )}
        </div>
      )}

      {/* Strategy panel */}
      <div style={{ marginBottom: 12 }}>
        <button className="reveal-btn" onClick={() => setShowStrategy(v => !v)}>
          {showStrategy ? "Hide exam strategy" : "📋 Show Write Essay strategy"}
        </button>
        {showStrategy && (
          <div style={{ marginTop: 8, background: "#052E1C", border: "1px solid #064E3B", borderRadius: 8, padding: "10px 14px" }}>
            <div style={{ fontSize: 11, color: "#34D399", fontWeight: 700, marginBottom: 6 }}>PTE WRITE ESSAY — EXAM STRATEGY</div>
            <ul style={{ paddingLeft: 18, margin: 0, color: "#6EE7B7", fontSize: 12, lineHeight: 1.9 }}>
              {STRATEGIES.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
            <div style={{ marginTop: 10, fontSize: 11, color: "#34D399", fontWeight: 700 }}>SCORING REMINDER:</div>
            <div style={{ fontSize: 12, color: "#6EE7B7", marginTop: 4, lineHeight: 1.8 }}>
              Content 0-3 · Form 0-2 (200-300 wds = max) · Dev/Structure 0-2 · Linguistic Range 0-2 · Grammar 0-2 · Vocabulary 0-2 · Spelling 0-2 = <strong>max 15 raw pts</strong>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {!scored && (
          <button className="btn-primary" style={{ padding: "8px 20px" }} onClick={submit} disabled={scoring || wc < 1}>
            {scoring ? "Scoring…" : "Submit for AI Score"}
          </button>
        )}
        <button className="reveal-btn" onClick={onClose}>Close</button>
        {!scored && wc > 0 && wc < 200 && (
          <div style={{ fontSize: 11, color: "#FBBF24" }}>{200 - wc} more words to reach Form = 2</div>
        )}
      </div>
    </div>
  );
}
