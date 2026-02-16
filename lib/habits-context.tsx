import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getTodayStr } from "@/lib/utils/date";

export interface ImplementationIntention {
  behaviour: string;
  time: string;
  location: string;
}

export interface HabitVersions {
  twoMin: string;
  standard: string;
  stretch?: string;
}

export type VersionLevel = "twoMin" | "standard" | "stretch";
export type CueType = "time" | "after-habit" | "location";

export interface Habit {
  id: string;
  title: string;
  icon: string;
  iconColor: string;
  gradientColors: readonly [string, string, ...string[]];
  goal: number;
  unit: string;
  frequency: string;
  current: number;
  streak: number;
  bestStreak: number;
  weekData: number[];
  createdAt: number;
  identityAreaId?: string;
  implementationIntention?: ImplementationIntention;
  stackAnchor?: string;
  versions?: HabitVersions;
  currentVersion?: VersionLevel;
  cueType?: CueType;
  cueTime?: string;
  reminderTime?: string;
  environmentActions?: string[];
  isGuided?: boolean;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string;
  status: "done" | "missed" | "partial";
  evidenceNote?: string;
  evidenceImage?: string;
  frictionReason?: string;
  reflection?: string;
  timestamp: number;
}

export interface ReviewLog {
  id: string;
  weekStart: string;
  whatWorked: string;
  whatDidnt: string;
  lawFailed?: "obvious" | "attractive" | "easy" | "satisfying";
  adjustments: string[];
  habitRatings: Record<string, number>;
  timestamp: number;
}

interface HabitsContextValue {
  habits: Habit[];
  addHabit: (habit: Omit<Habit, "id" | "current" | "streak" | "bestStreak" | "weekData" | "createdAt">) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  removeHabit: (id: string) => void;
  completeHabit: (habitId: string, evidenceNote?: string, reflection?: string, evidenceImage?: string) => void;
  uncompleteHabit: (habitId: string) => void;
  logMissed: (habitId: string, frictionReason?: string) => void;
  incrementHabit: (habitId: string) => void;
  logs: HabitLog[];
  getLogsForDate: (date: string) => HabitLog[];
  getLogsForHabit: (habitId: string) => HabitLog[];
  reviews: ReviewLog[];
  addReview: (review: Omit<ReviewLog, "id" | "timestamp">) => void;
  isLoaded: boolean;
}

const HABITS_KEY = "tinywins_habits";
const LOGS_KEY = "tinywins_logs";
const REVIEWS_KEY = "tinywins_reviews";

// EXTRACTED to @/lib/utils/date.ts
// function getTodayStr() {
//   const d = new Date();
//   return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
// }

function generateId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

const DEFAULT_HABITS: Habit[] = [];

const HabitsContext = createContext<HabitsContextValue | null>(null);

export function HabitsProvider({ children }: { children: ReactNode }) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [reviews, setReviews] = useState<ReviewLog[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(HABITS_KEY),
      AsyncStorage.getItem(LOGS_KEY),
      AsyncStorage.getItem(REVIEWS_KEY),
    ]).then(([storedHabits, storedLogs, storedReviews]) => {
      if (storedHabits) {
        try { setHabits(JSON.parse(storedHabits)); } catch { setHabits(DEFAULT_HABITS); AsyncStorage.setItem(HABITS_KEY, JSON.stringify(DEFAULT_HABITS)); }
      } else {
        setHabits(DEFAULT_HABITS);
        AsyncStorage.setItem(HABITS_KEY, JSON.stringify(DEFAULT_HABITS));
      }
      if (storedLogs) {
        try { setLogs(JSON.parse(storedLogs)); } catch { setLogs([]); }
      }
      if (storedReviews) {
        try { setReviews(JSON.parse(storedReviews)); } catch { setReviews([]); }
      }
      setIsLoaded(true);
    });
  }, []);

  const persistHabits = useCallback((updated: Habit[]) => {
    setHabits(updated);
    AsyncStorage.setItem(HABITS_KEY, JSON.stringify(updated));
  }, []);

  const persistLogs = useCallback((updated: HabitLog[]) => {
    setLogs(updated);
    AsyncStorage.setItem(LOGS_KEY, JSON.stringify(updated));
  }, []);

  const persistReviews = useCallback((updated: ReviewLog[]) => {
    setReviews(updated);
    AsyncStorage.setItem(REVIEWS_KEY, JSON.stringify(updated));
  }, []);

  const addHabit = useCallback((input: Omit<Habit, "id" | "current" | "streak" | "bestStreak" | "weekData" | "createdAt">) => {
    setHabits((prev) => {
      const newHabit: Habit = {
        ...input,
        id: generateId(),
        current: 0,
        streak: 0,
        bestStreak: 0,
        weekData: [0, 0, 0, 0, 0, 0, 0],
        createdAt: Date.now(),
      };
      const updated = [...prev, newHabit];
      AsyncStorage.setItem(HABITS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateHabit = useCallback((id: string, updates: Partial<Habit>) => {
    setHabits((prev) => {
      const updated = prev.map((h) => h.id === id ? { ...h, ...updates } : h);
      AsyncStorage.setItem(HABITS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeHabit = useCallback((id: string) => {
    setHabits((prev) => {
      const updated = prev.filter((h) => h.id !== id);
      AsyncStorage.setItem(HABITS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const incrementHabit = useCallback((habitId: string) => {
    setHabits((prev) => {
      const habit = prev.find((h) => h.id === habitId);
      if (!habit) return prev;

      const newCurrent = habit.current + 1;
      const newWeekData = [...habit.weekData];
      const dayIdx = (new Date().getDay() + 6) % 7;
      newWeekData[dayIdx] = (newWeekData[dayIdx] || 0) + 1;

      const justReachedGoal = habit.current < habit.goal && newCurrent >= habit.goal;

      const updated = prev.map((h) => {
        if (h.id !== habitId) return h;
        const newStreak = justReachedGoal ? h.streak + 1 : h.streak;
        return {
          ...h,
          current: newCurrent,
          weekData: newWeekData,
          streak: newStreak,
          bestStreak: Math.max(h.bestStreak, newStreak),
        };
      });
      AsyncStorage.setItem(HABITS_KEY, JSON.stringify(updated));

      if (justReachedGoal) {
        const today = getTodayStr();
        const log: HabitLog = {
          id: generateId(),
          habitId,
          date: today,
          status: "done",
          timestamp: Date.now(),
        };
        setLogs((prevLogs) => {
          const updatedLogs = [...prevLogs, log];
          AsyncStorage.setItem(LOGS_KEY, JSON.stringify(updatedLogs));
          return updatedLogs;
        });
      }

      return updated;
    });
  }, []);

  const completeHabit = useCallback((habitId: string, evidenceNote?: string, reflection?: string, evidenceImage?: string) => {
    const today = getTodayStr();
    const log: HabitLog = {
      id: generateId(),
      habitId,
      date: today,
      status: "done",
      evidenceNote,
      evidenceImage,
      reflection,
      timestamp: Date.now(),
    };
    setLogs((prev) => {
      const updated = [...prev, log];
      AsyncStorage.setItem(LOGS_KEY, JSON.stringify(updated));
      return updated;
    });
    setHabits((prev) => {
      const updated = prev.map((h) => {
        if (h.id !== habitId) return h;
        const newStreak = h.streak + 1;
        return {
          ...h,
          current: h.goal,
          streak: newStreak,
          bestStreak: Math.max(h.bestStreak, newStreak),
        };
      });
      AsyncStorage.setItem(HABITS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const uncompleteHabit = useCallback((habitId: string) => {
    const today = getTodayStr();
    setLogs((prev) => {
      const updated = prev.filter((l) => !(l.habitId === habitId && l.date === today && l.status === "done"));
      AsyncStorage.setItem(LOGS_KEY, JSON.stringify(updated));
      return updated;
    });
    setHabits((prev) => {
      const updated = prev.map((h) => {
        if (h.id !== habitId) return h;
        const newStreak = Math.max(0, h.streak - 1);
        return { ...h, current: 0, streak: newStreak };
      });
      AsyncStorage.setItem(HABITS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const logMissed = useCallback((habitId: string, frictionReason?: string) => {
    const today = getTodayStr();
    const log: HabitLog = {
      id: generateId(),
      habitId,
      date: today,
      status: "missed",
      frictionReason,
      timestamp: Date.now(),
    };
    setLogs((prev) => {
      const updated = [...prev, log];
      AsyncStorage.setItem(LOGS_KEY, JSON.stringify(updated));
      return updated;
    });
    setHabits((prev) => {
      const updated = prev.map((h) => {
        if (h.id !== habitId) return h;
        return { ...h, streak: 0 };
      });
      AsyncStorage.setItem(HABITS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const getLogsForDate = useCallback((date: string) => {
    return logs.filter((l) => l.date === date);
  }, [logs]);

  const getLogsForHabit = useCallback((habitId: string) => {
    return logs.filter((l) => l.habitId === habitId);
  }, [logs]);

  const addReview = useCallback((input: Omit<ReviewLog, "id" | "timestamp">) => {
    const review: ReviewLog = {
      ...input,
      id: generateId(),
      timestamp: Date.now(),
    };
    setReviews((prev) => {
      const updated = [...prev, review];
      AsyncStorage.setItem(REVIEWS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const value = useMemo(() => ({
    habits,
    addHabit,
    updateHabit,
    removeHabit,
    completeHabit,
    uncompleteHabit,
    logMissed,
    incrementHabit,
    logs,
    getLogsForDate,
    getLogsForHabit,
    reviews,
    addReview,
    isLoaded,
  }), [habits, addHabit, updateHabit, removeHabit, completeHabit, uncompleteHabit, logMissed, incrementHabit, logs, getLogsForDate, getLogsForHabit, reviews, addReview, isLoaded]);

  return (
    <HabitsContext.Provider value={value}>
      {children}
    </HabitsContext.Provider>
  );
}

export function useHabits() {
  const context = useContext(HabitsContext);
  if (!context) {
    throw new Error("useHabits must be used within a HabitsProvider");
  }
  return context;
}
