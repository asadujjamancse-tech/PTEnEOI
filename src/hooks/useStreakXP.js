/**
 * useStreakXP.js — Daily study streak and XP level system
 *
 * Streak logic:
 *  - Studying on consecutive calendar days increments the streak
 *  - Missing a day resets the streak to 1
 *  - Streak bonus XP is awarded on top of the base amount (min(streak*5, 50))
 *
 * XP and levels:
 *  - LEVEL_THRESHOLDS defines cumulative XP needed for each level (1–11)
 *  - Level 11 = "PTE 90" — the top achievement
 *  - addXP(amount, reason) is called from any component after a practice action
 *
 * Storage: localStorage keys pte_streak_v1 and pte_xp_v1
 *
 * Usage:
 *   const { currentStreak, totalXP, level, addXP } = useStreakXP()
 *   addXP(20, "AI Scorer")  // call after any scored action
 */
import { useState, useCallback } from "react";

const STREAK_KEY = "pte_streak_v1";
const XP_KEY = "pte_xp_v1";
const LEVEL_THRESHOLDS = [0, 100, 250, 500, 900, 1400, 2100, 3000, 4200, 5700, 7500];

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function loadData() {
  try {
    const streak = JSON.parse(localStorage.getItem(STREAK_KEY) || "{}");
    const xp = JSON.parse(localStorage.getItem(XP_KEY) || "{}");
    return { streak, xp };
  } catch {
    return { streak: {}, xp: {} };
  }
}

function computeLevel(totalXP) {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVEL_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

function xpForLevel(level) {
  return LEVEL_THRESHOLDS[Math.min(level, LEVEL_THRESHOLDS.length - 1)] || 0;
}

export default function useStreakXP() {
  const [data, setData] = useState(loadData);

  const streakData = data.streak;
  const xpData = data.xp;

  const currentStreak = streakData.streak || 0;
  const lastDay = streakData.lastDay || null;
  const totalXP = xpData.total || 0;
  const level = computeLevel(totalXP);
  const nextLevelXP = xpForLevel(level);
  const prevLevelXP = xpForLevel(level - 1);
  const levelProgress = nextLevelXP > prevLevelXP
    ? Math.round(((totalXP - prevLevelXP) / (nextLevelXP - prevLevelXP)) * 100)
    : 100;

  const addXP = useCallback((amount, reason = "") => {
    const today = todayStr();
    setData(prev => {
      const s = { ...prev.streak };
      const x = { ...prev.xp };

      // Update streak
      if (s.lastDay !== today) {
        const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
        if (s.lastDay === yesterday) {
          s.streak = (s.streak || 0) + 1;
        } else if (!s.lastDay) {
          s.streak = 1;
        } else {
          s.streak = 1; // streak broken
        }
        s.lastDay = today;
        // Streak bonus XP
        if (s.streak > 1) amount += Math.min(s.streak * 5, 50);
      }

      // Update XP
      x.total = (x.total || 0) + amount;
      const log = x.log || [];
      log.push({ day: today, amount, reason });
      if (log.length > 200) log.shift();
      x.log = log;

      localStorage.setItem(STREAK_KEY, JSON.stringify(s));
      localStorage.setItem(XP_KEY, JSON.stringify(x));

      return { streak: s, xp: x };
    });
  }, []);

  const todayXP = (() => {
    const today = todayStr();
    return (xpData.log || []).filter(e => e.day === today).reduce((s, e) => s + e.amount, 0);
  })();

  return {
    currentStreak,
    totalXP,
    todayXP,
    level,
    levelProgress,
    nextLevelXP,
    prevLevelXP,
    addXP,
    lastDay,
  };
}

export { LEVEL_THRESHOLDS, computeLevel };
