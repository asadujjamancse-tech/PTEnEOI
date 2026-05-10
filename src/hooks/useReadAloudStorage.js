import useLocalStorage from "./useLocalStorage";

// Keys required by the spec
const BOOKMARKS_KEY = "pte_ra_bookmarks_v1";
const HISTORY_KEY = "pte_ra_history_v1";
const PROGRESS_KEY = "pte_ra_progress_v1";

export function useReadAloudStorage() {
  const [bookmarks, setBookmarks] = useLocalStorage(BOOKMARKS_KEY, {});
  const [history, setHistory] = useLocalStorage(HISTORY_KEY, []);
  const [progress, setProgress] = useLocalStorage(PROGRESS_KEY, { last: null, completed: {} });

  const toggleBookmark = (id) => {
    setBookmarks(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const addHistory = (entry) => {
    setHistory(prev => [{ ...entry, ts: new Date().toISOString() }, ...prev].slice(0, 500));
  };

  const markCompleted = (id) => {
    setProgress(p => ({ ...p, completed: { ...(p.completed || {}), [id]: true } }));
  };

  const setLast = (id) => {
    setProgress(p => ({ ...p, last: id }));
  };

  return { bookmarks, toggleBookmark, history, addHistory, progress, markCompleted, setLast };
}

export default useReadAloudStorage;
