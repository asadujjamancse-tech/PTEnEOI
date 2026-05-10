import useLocalStorage from "./useLocalStorage";

export function usePracticeStorage(zone) {
  const ks = zone.toLowerCase().slice(0,3).replace(/[^a-z]/g,'');
  const bookmarksKey = `pte_${ks}_bookmarks_v1`;
  const historyKey = `pte_${ks}_history_v1`;
  const progressKey = `pte_${ks}_progress_v1`;

  const [bookmarks, setBookmarks] = useLocalStorage(bookmarksKey, {});
  const [history, setHistory] = useLocalStorage(historyKey, []);
  const [progress, setProgress] = useLocalStorage(progressKey, { last: null, completed: {} });

  const toggleBookmark = (id) => setBookmarks(p => ({ ...p, [id]: !p[id] }));
  const addHistory = (entry) => setHistory(p => [{ ...entry, ts: new Date().toISOString() }, ...p].slice(0, 500));
  const markCompleted = (id) => setProgress(p => ({ ...p, completed: { ...(p.completed || {}), [id]: true } }));
  const setLast = (id) => setProgress(p => ({ ...p, last: id }));

  return { bookmarks, toggleBookmark, history, addHistory, progress, markCompleted, setLast };
}

export default usePracticeStorage;
