import { useMemo, useState } from "react";
import LISTENING_QS from "../../data/listeningQuestions";
import usePracticeStorage from "../../hooks/usePracticeStorage";
import ListeningPractice from "./ListeningPractice";

const PAGE_SIZE = 8;

export default function ListeningPanel() {
  const { bookmarks, toggleBookmark, history, addHistory, progress, markCompleted, setLast } = usePracticeStorage('listening');
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState({ difficulty: "All", bookmarked: false, practiced: false });
  const [active, setActive] = useState(null);

  const filtered = useMemo(() => LISTENING_QS.filter(q => (!query || (q.title + q.text + q.tags.join(' ')).toLowerCase().includes(query.toLowerCase()))
    && (filter.difficulty === 'All' || q.difficulty === filter.difficulty)
    && (!filter.bookmarked || bookmarks[q.id])
    && (!filter.practiced || progress?.completed?.[q.id])
  ), [query, filter, bookmarks, progress]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div style={{ background: '#0F1929', border: '1px solid #1E293B', borderRadius: 12, padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>Listening Practice</div>
          <div style={{ color: '#64748B', fontSize: 13 }}>Audio prompts with typed-response questions.</div>
        </div>
        <input className="input-field" style={{ width: 240 }} placeholder="Search prompts..." value={query} onChange={e => setQuery(e.target.value)} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        {pageItems.map(q => (
          <div key={q.id} className="task-card">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 700 }}>{q.title}</div>
                <div style={{ color: '#64748B', marginTop: 6 }}>{q.text.slice(0, 140)}{q.text.length > 140 ? '…' : ''}</div>
                <div style={{ marginTop: 8 }}>{q.tags.map(t => <span key={t} className="pill">{t}</span>)}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ marginBottom: 8 }}>{q.appearedCount} seen</div>
                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                  <button className="reveal-btn" onClick={() => { setActive(q); setLast(q.id); }}>▶ Practice</button>
                  <button className="reveal-btn" onClick={() => toggleBookmark(q.id)}>{bookmarks[q.id] ? '★' : '☆'}</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
        <div style={{ color: '#94A3B8' }}>{filtered.length} prompts</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="qtab" onClick={() => setPage(p => Math.max(1, p - 1))}>◀ Prev</button>
          <div style={{ color: '#94A3B8' }}>Page {page}/{totalPages}</div>
          <button className="qtab" onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next ▶</button>
        </div>
      </div>

      {active && <div style={{ marginTop: 12 }}><ListeningPractice question={active} onClose={() => setActive(null)} onComplete={(res) => { addHistory({ id: active.id, result: res }); markCompleted(active.id); }} /></div>}
    </div>
  );
}
