import { useEffect, useRef, useState } from "react";
import { generateMockScore } from "../../utils/readAloudScorer";
import { callClaudeScore } from "../../utils/claudeScorer";
import { saveRecording } from "../../utils/idb";

export default function ReadAloudPractice({ question, onClose, onComplete }) {
  const [countdown, setCountdown] = useState(3);
  const [prep, setPrep] = useState(7);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [blobs, setBlobs] = useState([]);
  const [score, setScore] = useState(null);
  const chunksRef = useRef([]);
  const canvasRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);
  const audioCtxRef = useRef(null);
  const recognitionRef = useRef(null);
  const transcriptRef = useRef("");

  useEffect(() => {
    let t;
    if (countdown > 0) {
      t = setTimeout(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearTimeout(t);
  }, [countdown]);

  useEffect(() => {
    if (countdown === 0) {
      const t = setTimeout(() => setPrep(p => Math.max(0, p - 1)), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown, prep]);

  useEffect(() => {
    if (prep === 0 && !recording) {
      startRecording();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prep]);

  const drawWaveform = () => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;
    const ctx = canvas.getContext('2d');
    const bufLen = analyser.frequencyBinCount;
    const data = new Uint8Array(bufLen);
    analyser.getByteTimeDomainData(data);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const sliceWidth = canvas.width / bufLen;
    let x = 0;
    for (let i = 0; i < bufLen; i++) {
      const v = data[i] / 128.0;
      const y = (v * canvas.height) / 2;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
      x += sliceWidth;
    }
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
    animFrameRef.current = requestAnimationFrame(drawWaveform);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Wire up Web Audio API for real-time waveform
      const audioCtx = new AudioContext();
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      analyserRef.current = analyser;
      animFrameRef.current = requestAnimationFrame(drawWaveform);

      const mr = new MediaRecorder(stream);
      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioUrl(URL.createObjectURL(blob));
        setBlobs(chunksRef.current.slice());
        chunksRef.current = [];
      };
      mr.start();
      setMediaRecorder(mr);
      setRecording(true);

      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SR) {
        transcriptRef.current = "";
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
    } catch (err) {
      console.error('mic error', err);
      alert('Unable to access microphone.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setRecording(false);
    }
    // Stop the waveform animation
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    analyserRef.current = null;
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }
    // Draw flat line to indicate stopped
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    }
  };

  const submit = async () => {
    const transcript = transcriptRef.current.trim();
    let result;
    try {
      result = await callClaudeScore({ skill: 'read_aloud', question: question.text, answer: transcript || question.text });
    } catch {
      result = generateMockScore();
    }
    setScore(result);
    if (onComplete) onComplete({ audioUrl, score: result, recordingId: audioUrl });
  };

  // Persist blobs to IndexedDB on mediaRecorder stop via effect when audioUrl changes
  useEffect(() => {
    if (!audioUrl) return;
    // try to fetch blob from the URL by re-requesting it
    (async () => {
      try {
        const res = await fetch(audioUrl);
        const blob = await res.blob();
        const rid = `rec-${Date.now()}`;
        await saveRecording({ id: rid, blob, metadata: { questionId: question.id } });
        // update caller with recording id
        if (onComplete) onComplete({ audioUrl, score, recordingId: rid });
      } catch (err) {
        // ignore persistence errors
        console.error('Failed to persist recording', err);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioUrl]);

  return (
    <div style={{ background: '#071226', border: '1px solid #1E293B', borderRadius: 12, padding: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 700 }}>{question.title}</div>
          <div style={{ color: '#94A3B8', fontSize: 13 }}>{question.difficulty} · {question.source}</div>
        </div>
        <div>
          <button className="reveal-btn" onClick={onClose}>Close</button>
        </div>
      </div>

      <div style={{ marginTop: 12, background: '#080E1A', padding: 12, borderRadius: 8, border: '1px solid #0F172A' }}>
        <div style={{ color: '#E2E8F0', lineHeight: 1.7 }}>{question.text}</div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 12, alignItems: 'center' }}>
        <div style={{ fontSize: 12, color: '#94A3B8' }}>Countdown: {countdown > 0 ? countdown : 'Ready'}</div>
        <div style={{ fontSize: 12, color: '#94A3B8' }}>Prep: {prep}s</div>
        {!recording ? (
          <button className="btn-primary" onClick={startRecording}>Start Recording</button>
        ) : (
          <button className="btn-primary" onClick={stopRecording}>Stop</button>
        )}
      </div>

      <div style={{ marginTop: 12 }}>
        <canvas
          ref={canvasRef}
          width={560}
          height={56}
          style={{ width: '100%', height: 56, background: '#071026', borderRadius: 8, display: 'block' }}
        />
      </div>

      {audioUrl && (
        <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
          <audio controls src={audioUrl} />
          <button className="btn-primary" style={{ padding: '6px 16px' }} onClick={submit}>Submit for AI Score</button>
        </div>
      )}

      {score && (
        <div style={{ marginTop: 12, background: '#071226', borderRadius: 8, padding: 10 }}>
          <div style={{ fontWeight: 700 }}>Mock Scores</div>
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <div className="pill">Fluency: {score.fluency}</div>
            <div className="pill">Pronunciation: {score.pronunciation}</div>
            <div className="pill">Oral Fluency: {score.oral_fluency}</div>
            <div className="pill">Content: {score.content}</div>
          </div>
        </div>
      )}
    </div>
  );
}
