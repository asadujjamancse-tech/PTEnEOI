import useLocalStorage from "./useLocalStorage";

const KEY = 'pte_score_tracker_v1';

const SEED = [
  { date: "2026-05-01", S: 68, W: 65, R: 70, L: 66 },
  { date: "2026-05-04", S: 72, W: 69, R: 74, L: 70 },
  { date: "2026-05-07", S: 88, W: 85, R: 79, L: 83 },
];

export function useScoreTracker() {
  const [sessions, setSessions] = useLocalStorage(KEY, SEED);

  const addPracticeScore = (zone, score) => {
    if (!score || score < 1) return;
    const today = new Date().toISOString().slice(0, 10);
    setSessions(prev => {
      const arr = [...prev];
      const idx = arr.findIndex(s => s.date === today);
      if (idx >= 0) {
        const s = { ...arr[idx] };
        // Rolling average weighted toward existing score
        s[zone] = s[zone] != null
          ? Math.round((s[zone] * 2 + score) / 3)
          : score;
        arr[idx] = s;
      } else {
        arr.push({ date: today, [zone]: score });
      }
      return arr.sort((a, b) => a.date.localeCompare(b.date));
    });
  };

  return { sessions, setSessions, addPracticeScore };
}

export default useScoreTracker;
