import { useEffect, useRef, useState } from "react";
import RETELL_QS from "../../data/retellQuestions";
import { callClaudeScore } from "../../utils/claudeScorer";
import { generateMockScore } from "../../utils/readAloudScorer";
import useScoreTracker from "../../hooks/useScoreTracker";

export default function RetellLecturePanel() {
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState("intro"); // intro | playing | noting | prep | recording | done
  const [timer, setTimer] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [score, setScore] = useState(null);
  const [scoring, setScoring] = useState(false);
  const { addPracticeScore } = useScoreTracker();
  const recognitionRef = useRef(null);
  const transcriptRef = useRef("");
  const timerRef = useRef(null);
  const q = RETELL_QS[idx];

  useEffect(() => () => { clearInterval(timerRef.current); window.speechSynthesis?.cancel(); }, []);

  const playLecture = () => {
    setPhase("playing");
    window.speechSynthesis?.cancel();
    const utt = new SpeechSynthesisUtterance(q.audio);
    utt.rate = 0.88;
    utt.onend = () => { setPhase("noting"); startPrepTimer(); };
    window.speechSynthesis?.speak(utt);
  };

  const startPrepTimer = () => {
    setTimer(10);
    timerRef.current = setInterval(() => {
      setTimer(t => {
        if (t <= 1) { clearInterval(timerRef.current); startRecording(); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  const startRecording = () => {
    setPhase("recording");
    setTimer(40);
    transcriptRef.current = "";
    timerRef.current = setInterval(() => {
      setTimer(t => {
        if (t <= 1) { clearInterval(timerRef.current); stopRecording(); return 0; }
        return t - 1;
      });
    }, 1000);

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) {
      const rec = new SR();
      rec.continuous = true;
      rec.interimResults = false;
      rec.onresult = (e) => {
        for (let i = e.resultIndex; i < e.results.length; i++) {
          if (e.results[i].isFinal) transcriptRef.current += e.results[i][0].transcript + " ";
        }
      };
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
    const text = transcriptRef.current.trim() || transcript;
    try {
      const result = await callClaudeScore({ skill: "read_aloud", question: q.audio, answer: text || "No response recorded." });
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
    setIdx(i => (i + 1) % RETELL_QS.length);
    setPhase("intro"); setTimer(0); setTranscript(""); setScore(null); setScoring(false);
    transcriptRef.current = ""; clearInterval(timerRef.current); window.speechSynthesis?.cancel();
  };

  const phaseLabel = { intro: "Ready", playing: "Lecture playing…", noting: `Note-taking — ${timer}s`, recording: `Recording — ${timer}s left`, done: "Done" };
  const phaseColor = { playing: "#38BDF8", noting: "#FBBF24", recording: "#F87171", done: "#34D399" };

  return (
    <div style={{ background: "#0F1929", border: "1px solid #1E293B", borderRadius: 12, padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>Re-tell Lecture</div>
          <div style={{ color: "#64748B", fontSize: 13 }}>Listen to a lecture, take notes, then re-tell in 40 seconds.</div>
        </div>
        <div style={{ color: "#475569", fontSize: 12 }}>{idx + 1} / {RETELL_QS.length}</div>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        <span className="pill">{q.difficulty}</span>
        <span className="pill">Dual: Speaking + Listening</span>
        {phase !== "intro" && <span style={{ background: "#1E293B", color: phaseColor[phase] || "#94A3B8", borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700 }}>{phaseLabel[phase]}</span>}
      </div>

      <div style={{ background: "#080E1A", borderRadius: 10, padding: 14, marginBottom: 14 }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>{q.title}</div>
        {phase === "intro" && <div style={{ color: "#64748B", fontSize: 13 }}>Press Play to hear the lecture. Take notes below. You will have 10s to prepare then 40s to re-tell.</div>}
        {phase === "playing" && <div style={{ color: "#38BDF8", fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>▶ Playing lecture… listen carefully</div>}
        {(phase === "noting" || phase === "recording" || phase === "done") && (
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 12, color: "#64748B", marginBottom: 4 }}>Key points to cover:</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {q.keywords.map(k => <span key={k} className="pill">{k}</span>)}
            </div>
          </div>
        )}
      </div>

      {phase === "noting" && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: "#FBBF24", marginBottom: 6 }}>Take notes — recording starts in {timer}s</div>
          <textarea className="input-field" rows={3} placeholder="Note key words and ideas…" />
        </div>
      )}

      {phase === "recording" && (
        <div style={{ background: "#071226", borderRadius: 10, padding: 14, marginBottom: 14 }}>
          <div style={{ color: "#F87171", fontWeight: 700, fontSize: 14 }}>Recording… {timer}s remaining</div>
          <div style={{ color: "#94A3B8", fontSize: 12, marginTop: 6 }}>Re-tell the key points from the lecture in your own words.</div>
          <button className="btn-primary" style={{ marginTop: 10, padding: "7px 16px", background: "#475569" }} onClick={stopRecording}>■ Stop Early</button>
        </div>
      )}

      {phase === "done" && (
        <div style={{ marginBottom: 14 }}>
          {transcript && (
            <div style={{ background: "#071226", borderRadius: 10, padding: 12, marginBottom: 10 }}>
              <div style={{ fontSize: 12, color: "#64748B", marginBottom: 4 }}>Captured transcript:</div>
              <div style={{ fontSize: 13, color: "#E2E8F0", lineHeight: 1.6 }}>{transcript || "No speech detected."}</div>
            </div>
          )}
          {!score && !scoring && (
            <button className="btn-primary" style={{ padding: "8px 20px" }} onClick={submitScore}>Submit for AI Score</button>
          )}
          {scoring && <div style={{ color: "#64748B", fontSize: 13 }}>Scoring…</div>}
          {score && (
            <div style={{ background: "#071226", borderRadius: 10, padding: 14 }}>
              <div style={{ fontWeight: 700, marginBottom: 10 }}>AI Score</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                {[["Overall", score.overall], ["Fluency", score.fluency], ["Pronunciation", score.pronunciation], ["Content", score.content]].map(([l, v]) => (
                  <div key={l} style={{ background: "#0A1828", borderRadius: 8, padding: 8, textAlign: "center" }}>
                    <div style={{ fontSize: 10, color: "#64748B", fontWeight: 700 }}>{l}</div>
                    <div style={{ fontSize: 20, fontWeight: 800, marginTop: 2, color: (v >= 79 || v >= 4) ? "#34D399" : v >= 65 || v >= 3 ? "#FBBF24" : "#F87171" }}>{v ?? "–"}</div>
                  </div>
                ))}
              </div>
              {score.fix_now?.length > 0 && (
                <ul style={{ marginTop: 10, paddingLeft: 18, color: "#94A3B8", fontSize: 12, lineHeight: 1.7 }}>
                  {score.fix_now.map((f, i) => <li key={i}>{f}</li>)}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        {phase === "intro" && <button className="btn-primary" style={{ padding: "8px 20px" }} onClick={playLecture}>▶ Play Lecture</button>}
        <button className="qtab" onClick={next}>Skip / Next ▶</button>
      </div>
    </div>
  );
}
