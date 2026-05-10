import { useEffect, useRef, useState } from "react";
import QUESTIONS from "../../data/summarizeSpeechQuestions";
import { callClaudeScore } from "../../utils/claudeScorer";
import useScoreTracker from "../../hooks/useScoreTracker";

const TIMER_SECONDS = 10 * 60; // 10 minutes — official PTE Summarize Spoken Text

function fmt(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export default function SummarizeSpeechPanel() {
  const [idx, setIdx]       = useState(0);
  const [phase, setPhase]   = useState("ready"); // ready | playing | writing | submitted
  const [answer, setAnswer] = useState("");
  const [scored, setScored] = useState(null);
  const [scoring, setScoring] = useState(false);
  const [timerSec, setTimerSec] = useState(TIMER_SECONDS);
  const [showStrategy, setShowStrategy] = useState(false);
  const { addPracticeScore } = useScoreTracker();
  const timerRef = useRef(null);
  const q = QUESTIONS[idx];

  const wc = answer.trim().split(/\s+/).filter(Boolean).length;
  const inRange = wc >= 50 && wc <= 70;

  useEffect(() => () => {
    clearInterval(timerRef.current);
    window.speechSynthesis?.cancel();
  }, []);

  const startTimer = () => {
    setTimerSec(TIMER_SECONDS);
    timerRef.current = setInterval(() => {
      setTimerSec(s => {
        if (s <= 1) { clearInterval(timerRef.current); return 0; }
        return s - 1;
      });
    }, 1000);
  };

  const playAudio = () => {
    if (phase !== "ready") return; // ONE play only — official PTE
    setPhase("playing");
    window.speechSynthesis?.cancel();
    const utt = new SpeechSynthesisUtterance(q.audio);
    utt.rate = 0.87;
    utt.onend = () => { setPhase("writing"); startTimer(); };
    utt.onerror = () => { setPhase("writing"); startTimer(); };
    window.speechSynthesis?.speak(utt);
  };

  const submit = async () => {
    if (scoring || scored) return;
    clearInterval(timerRef.current);
    setScoring(true);
    try {
      const result = await callClaudeScore({ skill: "summarize_spoken", question: q.audio, answer });
      setScored(result);
      if (result?.overall) addPracticeScore("L", result.overall);
    } catch {
      const form = inRange ? 1 : 0;
      const fallback = {
        overall: Math.round(50 + form * 10 + (wc > 0 ? 10 : 0)),
        band: "Upper Intermediate",
        content: wc >= 40 ? 2 : 1, form, vocabulary: 1, spelling: 1,
        fix_now: ["Ensure you cover the main idea of the lecture, not just details", "Stay within 50–70 words — Form = 0 outside this range"],
        strategy: "Write keywords during playback; start summary: 'The lecture discusses…' to anchor your response.",
      };
      setScored(fallback);
      addPracticeScore("L", fallback.overall);
    }
    setScoring(false);
    setPhase("submitted");
  };

  const next = () => {
    clearInterval(timerRef.current);
    window.speechSynthesis?.cancel();
    setIdx(i => (i + 1) % QUESTIONS.length);
    setPhase("ready"); setAnswer(""); setScored(null); setScoring(false);
    setTimerSec(TIMER_SECONDS); setShowStrategy(false);
  };

  const timerColor = timerSec > 180 ? "#34D399" : timerSec > 60 ? "#FBBF24" : "#F87171";
  const wcColor = wc === 0 ? "#475569" : inRange ? "#34D399" : wc < 50 ? "#FBBF24" : "#F87171";

  const scoreColor = (v, max) => v === max ? "#34D399" : v === 0 ? "#F87171" : "#FBBF24";

  return (
    <div style={{ background: "#0F1929", border: "1px solid #1E293B", borderRadius: 12, padding: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>Summarize Spoken Text</div>
          <div style={{ color: "#64748B", fontSize: 13 }}>Listen ONCE · write 50–70 word summary · 10 minutes · Listening only</div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {phase === "writing" && (
            <div style={{ fontWeight: 800, fontSize: 18, color: timerColor, fontVariantNumeric: "tabular-nums" }}>
              {fmt(timerSec)}
            </div>
          )}
          <div style={{ color: "#475569", fontSize: 12 }}>{idx + 1} / {QUESTIONS.length}</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        <span className="pill">{q.difficulty}</span>
        <span className="pill">{q.title}</span>
        <span className="pill">14% of score</span>
      </div>

      {/* Official rules */}
      <div style={{ background: "#0C1B35", border: "1px solid #1D4ED830", borderRadius: 8, padding: "8px 14px", marginBottom: 14, fontSize: 12, color: "#60A5FA" }}>
        ⚠ <strong>One play only — no replay in real PTE.</strong> Write 50–70 words. Timer: 10 min. Form = 0 if outside word range.
      </div>

      {/* Audio player */}
      <div style={{ background: "#080E1A", borderRadius: 10, padding: 14, marginBottom: 14 }}>
        <div style={{ fontWeight: 700, marginBottom: 6 }}>{q.title}</div>
        <div style={{ color: "#64748B", fontSize: 13, marginBottom: 10 }}>
          {phase === "ready" && "Press Play — you will hear the lecture once only. Take mental notes."}
          {phase === "playing" && "🎧 Playing… listen carefully and note keywords."}
          {phase === "writing" && "✅ Audio complete — write your 50–70 word summary below."}
          {phase === "submitted" && "Submitted."}
        </div>
        {phase === "ready" && (
          <button className="btn-primary" style={{ padding: "8px 20px" }} onClick={playAudio}>
            ▶ Play Lecture (once only)
          </button>
        )}
        {phase === "playing" && (
          <div style={{ color: "#38BDF8", fontSize: 13, fontWeight: 700 }}>⏵ Playing… do not type yet.</div>
        )}
      </div>

      {/* Answer area */}
      {(phase === "writing" || phase === "submitted") && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <div style={{ fontSize: 12, color: "#94A3B8" }}>Write your summary (50–70 words):</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: wcColor }}>
              {wc} words {inRange ? "✓" : wc < 50 ? `— need ${50 - wc} more` : `— ${wc - 70} over limit`}
            </div>
          </div>
          <textarea
            className="input-field"
            rows={5}
            placeholder="The lecture discusses… The speaker explains… Key points include…"
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            disabled={!!scored}
            style={{ resize: "vertical" }}
          />
        </div>
      )}

      {/* Score result */}
      {scored && (
        <div style={{ background: "#071226", borderRadius: 10, padding: 14, marginBottom: 14 }}>
          <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 10 }}>
            Score: <span style={{ color: scored.overall >= 79 ? "#34D399" : scored.overall >= 65 ? "#FBBF24" : "#F87171" }}>{scored.overall}</span>
            {scored.band && <span style={{ fontSize: 12, color: "#64748B", marginLeft: 8 }}>{scored.band}</span>}
          </div>

          {/* 4 official dimensions */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
            {[
              ["Content", scored.content, 2],
              ["Form", scored.form, 1],
              ["Vocabulary", scored.vocabulary, 2],
              ["Spelling", scored.spelling, 2],
            ].map(([label, val, max]) => (
              <div key={label} style={{ background: "#0A1222", borderRadius: 8, padding: "8px 12px", textAlign: "center", minWidth: 72 }}>
                <div style={{ fontSize: 10, color: "#64748B", fontWeight: 700 }}>{label}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: scoreColor(val, max), marginTop: 2 }}>{val ?? "–"}/{max}</div>
              </div>
            ))}
            <div style={{ background: "#0A1222", borderRadius: 8, padding: "8px 12px", textAlign: "center", minWidth: 72 }}>
              <div style={{ fontSize: 10, color: "#64748B", fontWeight: 700 }}>Total Raw</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#CBD5E1", marginTop: 2 }}>
                {(scored.content || 0) + (scored.form || 0) + (scored.vocabulary || 0) + (scored.spelling || 0)}/7
              </div>
            </div>
          </div>

          {scored.fix_now?.length > 0 && (
            <ul style={{ paddingLeft: 18, color: "#94A3B8", fontSize: 12, lineHeight: 1.8, margin: 0, marginBottom: 10 }}>
              {scored.fix_now.map((f, i) => <li key={i}>{f}</li>)}
            </ul>
          )}

          {scored.strategy && (
            <div style={{ background: "#0C1B35", border: "1px solid #1D4ED830", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#60A5FA" }}>
              💡 {scored.strategy}
            </div>
          )}
        </div>
      )}

      {/* Strategy toggle */}
      <div style={{ marginBottom: 12 }}>
        <button className="reveal-btn" onClick={() => setShowStrategy(v => !v)}>
          {showStrategy ? "Hide strategy" : "📋 Show Summarize Spoken Text strategy"}
        </button>
        {showStrategy && (
          <div style={{ marginTop: 8, background: "#052E1C", border: "1px solid #064E3B", borderRadius: 8, padding: "10px 14px" }}>
            <div style={{ fontSize: 11, color: "#34D399", fontWeight: 700, marginBottom: 6 }}>PTE SUMMARIZE SPOKEN TEXT — STRATEGY</div>
            <ul style={{ paddingLeft: 18, margin: 0, color: "#6EE7B7", fontSize: 12, lineHeight: 1.9 }}>
              <li>Write 2-3 keywords per main point during listening (on scratch paper in real exam).</li>
              <li>Start writing immediately after audio ends — do not wait.</li>
              <li>Open: "The lecture discusses…" or "The speaker explains…"</li>
              <li>Cover: topic + 2-3 key points. Avoid minor details.</li>
              <li>Aim for 60-65 words — safely inside the 50-70 Form = 1 zone.</li>
              <li>Paraphrase the lecture; do not copy exact phrases.</li>
              <li>No replay in PTE — train without replaying even in practice.</li>
            </ul>
            <div style={{ marginTop: 8, fontSize: 11, color: "#34D399", fontWeight: 700 }}>SCORING (max 7 pts):</div>
            <div style={{ fontSize: 12, color: "#6EE7B7", marginTop: 4, lineHeight: 1.8 }}>
              Content 0-2 · Form 0-1 (50-70 words) · Vocabulary 0-2 · Spelling 0-2
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {phase === "writing" && !scored && (
          <button
            className="btn-primary"
            style={{ padding: "8px 20px", opacity: (!inRange || scoring) ? 0.5 : 1 }}
            onClick={submit}
            disabled={scoring}
          >
            {scoring ? "Scoring…" : "Submit for AI Score"}
          </button>
        )}
        {phase === "writing" && !inRange && wc > 0 && !scored && (
          <div style={{ fontSize: 11, color: "#FBBF24" }}>
            {wc < 50 ? `${50 - wc} more words needed` : `${wc - 70} words over limit`}
          </div>
        )}
        <button className="qtab" onClick={next}>Next ▶</button>
      </div>
    </div>
  );
}
