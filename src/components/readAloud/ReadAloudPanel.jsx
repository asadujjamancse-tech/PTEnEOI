import { useEffect, useMemo, useState } from "react";
import INITIAL_READALOUD from "../../data/readAloudQuestions";
import { useReadAloudStorage } from "../../hooks/useReadAloudStorage";
import useScoreTracker from "../../hooks/useScoreTracker";
import ReadAloudPractice from "./ReadAloudPractice";

const PAGE_SIZE = 8;

export default function ReadAloudPanel() {
  const { bookmarks, toggleBookmark, history, addHistory, progress, markCompleted, setLast } = useReadAloudStorage();
  const { addPracticeScore } = useScoreTracker();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState({ difficulty: "All", bookmarked: false, practiced: false });
  const [active, setActive] = useState(null);

  const list = useMemo(() => INITIAL_READALOUD, []);

  const filtered = useMemo(() => {
    let out = list.filter(q => !query || (q.title + q.text + q.tags.join(' ')).toLowerCase().includes(query.toLowerCase()));
    if (filter.difficulty !== "All") out = out.filter(q => q.difficulty === filter.difficulty);
    if (filter.bookmarked) out = out.filter(q => bookmarks[q.id]);
    if (filter.practiced) out = out.filter(q => progress?.completed?.[q.id]);
    return out;
  }, [list, query, filter, bookmarks, progress]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages]);

  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div style={{ background: "#0F1929", border: "1px solid #1E293B", borderRadius: 12, padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>Read Aloud — Practice</div>
          <div style={{ color: "#64748B", fontSize: 13 }}>Search, filter, bookmark, and practise short passages.</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input className="input-field" style={{ width: 220 }} placeholder="Search passages, tags..." value={query} onChange={e => setQuery(e.target.value)} />
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
        <select className="input-field" value={filter.difficulty} onChange={e => setFilter(f => ({ ...f, difficulty: e.target.value }))}>
          <option>All</option>
          <option>Easy</option>
          <option>Medium</option>
          <option>Hard</option>
        </select>
        <button className="qtab" onClick={() => setFilter(f => ({ ...f, bookmarked: !f.bookmarked }))} style={filter.bookmarked ? { background: "#0EA5E9", color: "#fff" } : {}}>🔖 Bookmarked</button>
        <button className="qtab" onClick={() => setFilter(f => ({ ...f, practiced: !f.practiced }))} style={filter.practiced ? { background: "#0EA5E9", color: "#fff" } : {}}>📈 Practiced</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
        {pageItems.map(q => (
          <div key={q.id} className="task-card" style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{q.title}</div>
                <div style={{ fontSize: 12, color: "#64748B", marginTop: 6 }}>{q.text.slice(0, 140)}{q.text.length > 140 ? '…' : ''}</div>
                <div style={{ marginTop: 8 }}>
                  <span className="pill">{q.difficulty}</span>
                  {q.tags.map(t => <span key={t} className="pill">{t}</span>)}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ marginBottom: 6 }}>{q.appearedCount} seen</div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="reveal-btn" onClick={() => { setActive(q); setLast(q.id); }}>▶ Practice</button>
                  <button className="reveal-btn" onClick={() => toggleBookmark(q.id)}>{bookmarks[q.id] ? '★' : '☆'}</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
        <div style={{ color: "#94A3B8" }}>{filtered.length} passages</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button className="qtab" onClick={() => setPage(p => Math.max(1, p - 1))}>◀ Prev</button>
          <div style={{ color: "#94A3B8" }}>Page {page}/{totalPages}</div>
          <button className="qtab" onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next ▶</button>
        </div>
      </div>

      {active && (
        <div style={{ marginTop: 18 }}>
          <ReadAloudPractice question={active} onClose={() => setActive(null)} onComplete={(rec) => { addHistory({ id: active.id, recording: rec }); markCompleted(active.id); if (rec?.score?.overall) addPracticeScore('S', rec.score.overall); }} />
        </div>
      )}
    </div>
  );
}
