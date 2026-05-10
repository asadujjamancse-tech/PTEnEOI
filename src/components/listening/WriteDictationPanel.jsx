import { useState } from "react";
import QUESTIONS from "../../data/writeDictationQuestions";
import useScoreTracker from "../../hooks/useScoreTracker";

function scoreWords(reference, attempt) {
  const refWords = reference.toLowerCase().replace(/[^a-z\s]/g, "").split(/\s+/).filter(Boolean);
  const attWords = attempt.toLowerCase().replace(/[^a-z\s]/g, "").split(/\s+/).filter(Boolean);
  let correct = 0;
  const refCopy = [...refWords];
  attWords.forEach(w => {
    const i = refCopy.indexOf(w);
    if (i >= 0) { correct++; refCopy.splice(i, 1); }
  });
  return { correct, total: refWords.length, pct: Math.round((correct / refWords.length) * 100) };
}

export default function WriteDictationPanel() {
  const [idx, setIdx] = useState(0);
  const [played, setPlayed] = useState(false);
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { addPracticeScore } = useScoreTracker();
  const q = QUESTIONS[idx];

  const playOnce = () => {
    if (played) return;
    window.speechSynthesis?.cancel();
    const utt = new SpeechSynthesisUtterance(q.text);
    utt.rate = 0.85;
    utt.pitch = 1;
    utt.onend = () => setPlayed(true);
    window.speechSynthesis?.speak(utt);
  };

  const submit = () => {
    setSubmitted(true);
    const { pct } = scoreWords(q.text, answer);
    const overall = Math.round(40 + pct * 0.5);
    addPracticeScore("L", overall);
  };

  const next = () => {
    setIdx(i => (i + 1) % QUESTIONS.length);
    setPlayed(false); setAnswer(""); setSubmitted(false);
  };

  const result = submitted ? scoreWords(q.text, answer) : null;

  const highlightWords = () => {
    const refWords = q.text.toLowerCase().replace(/[^a-z\s]/g, "").split(/\s+/);
    const attWords = answer.toLowerCase().replace(/[^a-z\s]/g, "").split(/\s+/);
    const original = q.text.split(/\s+/);
    const attCopy = [...attWords];
    return original.map((word, i) => {
      const clean = word.toLowerCase().replace(/[^a-z]/g, "");
      const j = attCopy.indexOf(clean);
      const found = j >= 0;
      if (found) attCopy.splice(j, 1);
      return (
        <span key={i} style={{ color: found ? "#34D399" : "#F87171", marginRight: 4, fontWeight: found ? 500 : 700 }}>
          {word}
        </span>
      );
    });
  };

  return (
    <div style={{ background: "#0F1929", border: "1px solid #1E293B", borderRadius: 12, padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>Write From Dictation</div>
          <div style={{ color: "#64748B", fontSize: 13 }}>Listen once, then type every word exactly. Scores Listening + Writing.</div>
        </div>
        <div style={{ color: "#475569", fontSize: 12 }}>{idx + 1} / {QUESTIONS.length}</div>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        <span className="pill">{q.difficulty}</span>
        <span className="pill">22% of score — highest weight!</span>
      </div>

      <div style={{ background: "#080E1A", borderRadius: 10, padding: 14, marginBottom: 16 }}>
        <div style={{ color: "#64748B", fontSize: 13, marginBottom: 10 }}>Press Play — you will hear the sentence once only.</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button className="btn-primary" style={{ padding: "8px 20px" }} onClick={playOnce} disabled={played}>
            {played ? "Played (once only)" : "▶ Play Audio"}
          </button>
          <div style={{ color: played ? "#34D399" : "#475569", fontSize: 12 }}>
            {played ? "Now type exactly what you heard below." : "Press Play to begin."}
          </div>
        </div>
      </div>

      {played && (
        <div style={{ marginBottom: 14 }}>
          <textarea
            className="input-field"
            rows={3}
            placeholder="Type every word exactly as you heard it…"
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            disabled={submitted}
            style={{ fontSize: 15 }}
          />
        </div>
      )}

      {submitted && result && (
        <div style={{ background: "#071226", borderRadius: 10, padding: 14, marginBottom: 14 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>
            <span style={{ color: result.pct >= 80 ? "#34D399" : result.pct >= 60 ? "#FBBF24" : "#F87171" }}>
              {result.correct}/{result.total} words correct ({result.pct}%)
            </span>
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.8 }}>{highlightWords()}</div>
          <div style={{ marginTop: 10, background: "#0A1222", borderRadius: 8, padding: 10 }}>
            <div style={{ fontSize: 11, color: "#64748B", marginBottom: 4 }}>Your answer:</div>
            <div style={{ fontSize: 13, color: "#94A3B8" }}>{answer}</div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        {played && !submitted && answer.trim() && (
          <button className="btn-primary" style={{ padding: "8px 20px" }} onClick={submit}>Submit</button>
        )}
        <button className="qtab" onClick={next}>Next ▶</button>
      </div>
    </div>
  );
}
