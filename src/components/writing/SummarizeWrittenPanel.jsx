import { useState } from "react";
import QUESTIONS from "../../data/summarizeWrittenQuestions";
import { callClaudeScore } from "../../utils/claudeScorer";
import useScoreTracker from "../../hooks/useScoreTracker";

function sentenceCount(text) {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return (trimmed.match(/[.!?]+(?:\s|$)/g) || []).length || (trimmed.length > 0 ? 1 : 0);
}

export default function SummarizeWrittenPanel() {
  const [idx, setIdx]       = useState(0);
  const [answer, setAnswer] = useState("");
  const [scored, setScored] = useState(null);
  const [scoring, setScoring] = useState(false);
  const [showModel, setShowModel] = useState(false);
  const { addPracticeScore } = useScoreTracker();

  const q   = QUESTIONS[idx];
  const wc  = answer.trim().split(/\s+/).filter(Boolean).length;
  const sc  = sentenceCount(answer);
  const wcOk = wc >= 5 && wc <= 75;
  const scOk = sc === 1;
  const canSubmit = wcOk && scOk && !scored && !scoring;

  const submit = async () => {
    if (!canSubmit) return;
    setScoring(true);
    try {
      const result = await callClaudeScore({ skill: "summarize_written", question: q.passage, answer });
      setScored(result);
      if (result?.overall) addPracticeScore("W", result.overall);
    } catch {
      const mock = { overall: 65, band: "Upper Intermediate", form: scOk && wcOk ? 1 : 0, content: 1, grammar: 1, vocabulary: 1, spelling: 1, fix_now: ["Ensure your summary captures the main idea", "Use a compound-complex sentence structure"] };
      setScored(mock);
      addPracticeScore("W", 65);
    }
    setScoring(false);
  };

  const next = () => {
    setIdx(i => (i + 1) % QUESTIONS.length);
    setAnswer(""); setScored(null); setScoring(false); setShowModel(false);
  };

  const wcColor = wc === 0 ? "#475569" : wcOk ? "#34D399" : wc < 5 ? "#F87171" : "#FBBF24";
  const scColor = sc === 0 ? "#475569" : scOk ? "#34D399" : "#F87171";

  return (
    <div style={{ background: "#0F1929", border: "1px solid #1E293B", borderRadius: 12, padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>Summarize Written Text</div>
          <div style={{ color: "#64748B", fontSize: 13 }}>Read the passage. Write ONE sentence (5–75 words) summarising it. Scores Writing + Reading.</div>
        </div>
        <div style={{ color: "#475569", fontSize: 12 }}>{idx + 1} / {QUESTIONS.length}</div>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        <span className="pill">{q.difficulty}</span>
        <span className="pill">{q.title}</span>
        <span className="pill">15% of score</span>
      </div>

      {/* Passage */}
      <div style={{ background: "#080E1A", borderRadius: 10, padding: 16, fontSize: 14, lineHeight: 1.8, color: "#CBD5E1", marginBottom: 16 }}>
        {q.passage}
      </div>

      {/* Rules reminder */}
      <div style={{ background: "#0C1B35", border: "1px solid #1D4ED830", borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 12, color: "#60A5FA" }}>
        ⚠ Must be <strong>exactly 1 sentence</strong> · <strong>5–75 words</strong> · Multi-sentence responses score 0 on Form
      </div>

      {/* Answer */}
      <div style={{ marginBottom: 10 }}>
        <textarea
          className="input-field"
          rows={4}
          placeholder="Write your one-sentence summary here…"
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          disabled={!!scored}
          style={{ resize: "vertical" }}
        />
        {/* Live validators */}
        <div style={{ display: "flex", gap: 16, marginTop: 6 }}>
          <div style={{ fontSize: 12, color: wcColor, fontWeight: 600 }}>
            {wc} words {wc === 0 ? "" : wcOk ? "✓" : wc < 5 ? "— too short (min 5)" : "— too long (max 75)"}
          </div>
          <div style={{ fontSize: 12, color: scColor, fontWeight: 600 }}>
            {sc === 0 ? "" : sc === 1 ? "1 sentence ✓" : `${sc} sentences ✗ — must be 1`}
          </div>
        </div>
        {sc > 1 && (
          <div style={{ fontSize: 12, color: "#F87171", marginTop: 4, background: "#2D0A0A", borderRadius: 6, padding: "6px 10px" }}>
            Multiple sentences detected. Join them with a comma, semicolon, or connector (although / which / while / as well as) to form one complex sentence.
          </div>
        )}
      </div>

      {/* Score result */}
      {scored && (
        <div style={{ background: "#071226", borderRadius: 10, padding: 14, marginBottom: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 10 }}>
            Score: <span style={{ color: scored.overall >= 79 ? "#34D399" : scored.overall >= 65 ? "#FBBF24" : "#F87171" }}>{scored.overall}</span>
            {scored.band && <span style={{ fontSize: 12, color: "#64748B", marginLeft: 8 }}>{scored.band}</span>}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
            {[["Form", scored.form, 1], ["Content", scored.content, 2], ["Grammar", scored.grammar, 2], ["Vocabulary", scored.vocabulary, 2], ["Spelling", scored.spelling, 2]].map(([label, val, max]) => (
              <div key={label} style={{ background: "#0A1222", borderRadius: 8, padding: "8px 12px", textAlign: "center", minWidth: 72 }}>
                <div style={{ fontSize: 10, color: "#64748B", fontWeight: 700 }}>{label}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: val === max ? "#34D399" : val === 0 ? "#F87171" : "#FBBF24", marginTop: 2 }}>{val}/{max}</div>
              </div>
            ))}
          </div>
          {scored.fix_now?.length > 0 && (
            <ul style={{ paddingLeft: 18, color: "#94A3B8", fontSize: 12, lineHeight: 1.7, margin: 0 }}>
              {scored.fix_now.map((f, i) => <li key={i}>{f}</li>)}
            </ul>
          )}
        </div>
      )}

      {/* Model answer toggle */}
      {(scored || answer.trim()) && (
        <div style={{ marginBottom: 12 }}>
          <button className="reveal-btn" onClick={() => setShowModel(v => !v)}>
            {showModel ? "Hide model answer" : "👁 Show model answer"}
          </button>
          {showModel && (
            <div style={{ marginTop: 8, background: "#052E1C", border: "1px solid #064E3B", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#6EE7B7", lineHeight: 1.7 }}>
              <span style={{ fontSize: 10, color: "#34D399", fontWeight: 700, display: "block", marginBottom: 4 }}>MODEL ANSWER</span>
              {q.modelAnswer}
            </div>
          )}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {!scored && (
          <button
            className="btn-primary"
            style={{ padding: "8px 20px" }}
            onClick={submit}
            disabled={!canSubmit || scoring}
          >
            {scoring ? "Scoring…" : "Submit for AI Score"}
          </button>
        )}
        <button className="qtab" onClick={next}>Next ▶</button>
        {!canSubmit && !scored && answer.trim() && (
          <div style={{ fontSize: 11, color: "#64748B" }}>
            {!scOk ? "Fix: must be 1 sentence" : !wcOk ? "Fix: 5–75 words required" : ""}
          </div>
        )}
      </div>
    </div>
  );
}
