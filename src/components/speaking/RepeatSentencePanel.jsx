import { useRef, useState } from "react";
import SENTENCES from "../../data/repeatSentenceQuestions";
import useScoreTracker from "../../hooks/useScoreTracker";
import useLocalStorage from "../../hooks/useLocalStorage";

function compareWords(ref, attempt) {
  const refWords = ref.toLowerCase().replace(/[^a-z\s]/g, "").split(/\s+/).filter(Boolean);
  const attWords = attempt.toLowerCase().replace(/[^a-z\s]/g, "").split(/\s+/).filter(Boolean);
  let matches = 0;
  attWords.forEach(w => { if (refWords.includes(w)) matches++; });
  return Math.round((matches / refWords.length) * 100);
}

export default function RepeatSentencePanel() {
  const [idx, setIdx] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [played, setPlayed] = useState(false);
  const [recording, setRecording] = useState(false);
  const [scored, setScored] = useState(null);
  const [history, setHistory] = useLocalStorage("pte_repeat_history", []);
  const { addPracticeScore } = useScoreTracker();
  const recognitionRef = useRef(null);
  const q = SENTENCES[idx];

  const playAudio = () => {
    if (played) return;
    window.speechSynthesis?.cancel();
    const utt = new SpeechSynthesisUtterance(q.text);
    utt.rate = 0.9;
    utt.onend = () => setPlayed(true);
    window.speechSynthesis?.speak(utt);
  };

  const startRecord = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("Speech recognition not supported in this browser. Use Chrome."); return; }
    const rec = new SR();
    rec.lang = "en-AU";
    rec.interimResults = false;
    rec.onresult = (e) => setTranscript(e.results[0][0].transcript);
    rec.onend = () => setRecording(false);
    rec.start();
    recognitionRef.current = rec;
    setRecording(true);
    setTranscript("");
    setScored(null);
  };

  const submit = () => {
    const accuracy = compareWords(q.text, transcript);
    const overall = Math.round(30 + accuracy * 0.6);
    const result = { accuracy, overall, fluency: Math.min(5, Math.round(accuracy / 20)), pronunciation: Math.min(5, Math.round(accuracy / 22)) };
    setScored(result);
    setHistory(h => [{ id: q.id, text: q.text, transcript, accuracy, date: new Date().toISOString().slice(0, 10) }, ...h].slice(0, 50));
    addPracticeScore("S", overall);
  };

  const next = () => {
    setIdx(i => (i + 1) % SENTENCES.length);
    setTranscript(""); setPlayed(false); setScored(null); setRecording(false);
  };

  const prev = () => {
    setIdx(i => (i - 1 + SENTENCES.length) % SENTENCES.length);
    setTranscript(""); setPlayed(false); setScored(null); setRecording(false);
  };

  return (
    <div style={{ background: "#0F1929", border: "1px solid #1E293B", borderRadius: 12, padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>Repeat Sentence</div>
          <div style={{ color: "#64748B", fontSize: 13 }}>Listen once, then repeat verbatim. Scores Speaking + Listening.</div>
        </div>
        <div style={{ color: "#475569", fontSize: 12 }}>{idx + 1} / {SENTENCES.length}</div>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        <span className="pill">{q.difficulty}</span>
        <span className="pill">13% of score</span>
      </div>

      <div style={{ background: "#080E1A", borderRadius: 10, padding: 14, marginBottom: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ color: "#64748B", fontSize: 13 }}>Press Play — listen once only, then record your response.</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button className="btn-primary" style={{ padding: "8px 20px" }} onClick={playAudio} disabled={played}>
            {played ? "Played" : "▶ Play"}
          </button>
          {played && !recording && (
            <button className="btn-primary" style={{ padding: "8px 20px", background: "#A78BFA" }} onClick={startRecord}>
              🎙 Record
            </button>
          )}
          {recording && (
            <button className="btn-primary" style={{ padding: "8px 20px", background: "#475569" }} onClick={() => { recognitionRef.current?.stop(); }}>
              ■ Stop
            </button>
          )}
          <div style={{ color: recording ? "#38BDF8" : played ? "#34D399" : "#475569", fontSize: 12 }}>
            {recording ? "Listening…" : played && !transcript ? "Record your response" : played ? "Done" : "Press Play first"}
          </div>
        </div>

        {transcript && (
          <div>
            <div style={{ fontSize: 11, color: "#64748B", marginBottom: 4 }}>Your transcript:</div>
            <textarea className="input-field" rows={2} value={transcript} onChange={e => setTranscript(e.target.value)} />
          </div>
        )}
      </div>

      {transcript && !scored && (
        <button className="btn-primary" style={{ padding: "8px 20px", marginBottom: 12 }} onClick={submit}>Submit for Score</button>
      )}

      {scored && (
        <div style={{ background: "#071226", borderRadius: 10, padding: 14, marginBottom: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 10 }}>Result</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {[["Accuracy", scored.accuracy + "%", "#38BDF8"], ["Fluency", scored.fluency + "/5", "#A78BFA"], ["Pronunciation", scored.pronunciation + "/5", "#34D399"]].map(([l, v, c]) => (
              <div key={l} style={{ background: "#0A1828", borderRadius: 8, padding: 10, textAlign: "center" }}>
                <div style={{ fontSize: 11, color: c, fontWeight: 700 }}>{l}</div>
                <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 10, background: "#0A1222", borderRadius: 8, padding: 10 }}>
            <div style={{ fontSize: 12, color: "#64748B", marginBottom: 4 }}>Original sentence:</div>
            <div style={{ fontSize: 13, color: "#E2E8F0", lineHeight: 1.6 }}>{q.text}</div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        <button className="qtab" onClick={prev}>◀ Prev</button>
        <button className="qtab" onClick={next}>Next ▶</button>
        {scored && <button className="btn-primary" style={{ padding: "7px 14px", fontSize: 12 }} onClick={next}>Next Question →</button>}
      </div>

      {history.length > 0 && (
        <div style={{ marginTop: 16, color: "#475569", fontSize: 12 }}>{history.length} attempts recorded · Best: {Math.max(...history.map(h => h.accuracy))}% accuracy</div>
      )}
    </div>
  );
}
