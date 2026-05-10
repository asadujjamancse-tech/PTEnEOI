import React, { useState } from "react";

export default function AITutorChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Ask for PTE strategy, feedback, weak-skill drills, or question explanations." },
  ]);
  const [loading, setLoading] = useState(false);

  async function send() {
    if (!input.trim() || loading) return;
    const next = [...messages, { role: "user", content: input.trim() }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const response = await fetch("/api/openai/tutor-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await response.json();
      setMessages([...next, { role: "assistant", content: data.reply || localReply(input) }]);
    } catch (error) {
      setMessages([...next, { role: "assistant", content: localReply(input) }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ position: "fixed", right: 18, bottom: 18, zIndex: 200 }}>
      {open && (
        <div style={{ width: 340, maxWidth: "calc(100vw - 36px)", height: 440, background: "#0A1222", border: "1px solid #334155", borderRadius: 14, boxShadow: "0 20px 60px rgba(0,0,0,.45)", display: "flex", flexDirection: "column", overflow: "hidden", marginBottom: 10 }}>
          <div style={{ padding: "12px 14px", borderBottom: "1px solid #1E293B", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div><div style={{ color: "#fff", fontWeight: 800, fontSize: 13 }}>AI Tutor</div><div style={{ color: "#64748B", fontSize: 11 }}>OpenAI-backed, local fallback</div></div>
            <button onClick={() => setOpen(false)} style={{ background: "transparent", border: "none", color: "#94A3B8", cursor: "pointer", fontSize: 18 }}>x</button>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} style={{ alignSelf: message.role === "user" ? "flex-end" : "flex-start", maxWidth: "85%", background: message.role === "user" ? "#0EA5E9" : "#0F1929", color: "#fff", border: "1px solid #1E293B", borderRadius: 12, padding: "8px 10px", fontSize: 12, lineHeight: 1.5 }}>
                {message.content}
              </div>
            ))}
            {loading && <div style={{ color: "#64748B", fontSize: 12 }}>Thinking...</div>}
          </div>
          <div style={{ padding: 10, borderTop: "1px solid #1E293B", display: "flex", gap: 8 }}>
            <input value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") send(); }} placeholder="Ask your PTE tutor..." style={{ flex: 1, background: "#0F1929", border: "1px solid #334155", borderRadius: 10, color: "#fff", padding: "9px 10px", outline: "none" }} />
            <button onClick={send} style={{ background: "#0EA5E9", border: "none", color: "#fff", fontWeight: 800, borderRadius: 10, padding: "0 12px", cursor: "pointer" }}>Send</button>
          </div>
        </div>
      )}
      <button onClick={() => setOpen((value) => !value)} style={{ background: "#0EA5E9", color: "#fff", border: "1px solid #38BDF8", borderRadius: 999, padding: "12px 16px", fontWeight: 800, cursor: "pointer", boxShadow: "0 10px 30px rgba(14,165,233,.35)" }}>
        AI Tutor
      </button>
    </div>
  );
}

function localReply(input) {
  const text = input.toLowerCase();
  if (text.includes("essay")) return "For essays, protect Form first: 200-300 words, four paragraphs, clear opinion, and controlled sentence length. Then improve grammar and vocabulary.";
  if (text.includes("repeat")) return "Repeat Sentence improves Speaking and Listening together. Train meaning chunks, not word-by-word memory, and keep speaking even if you miss words.";
  if (text.includes("reading")) return "For Reading, prioritise R&W Fill in the Blanks, then Reorder Paragraph. Check part of speech before meaning.";
  return "Focus on the highest ROI task for your weakest skill today, then do one short review set for mistakes from yesterday.";
}
