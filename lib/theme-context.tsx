import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { darkTheme, lightTheme, ThemeColors } from "@/constants/colors";

type ThemeMode = "dark" | "light";

export type WeekStartDay = "Sunday" | "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday";

export const WEEK_START_OPTIONS: WeekStartDay[] = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const WEEK_START_INDEX: Record<WeekStartDay, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

interface ThemeContextValue {
  mode: ThemeMode;
  colors: ThemeColors;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
  weekStartDay: WeekStartDay;
  setWeekStartDay: (day: WeekStartDay) => void;
}

const THEME_STORAGE_KEY = "app_theme_mode";
const WEEK_START_KEY = "app_week_start_day";

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>("dark");
  const [weekStartDay, setWeekStartDayState] = useState<WeekStartDay>("Monday");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(THEME_STORAGE_KEY),
      AsyncStorage.getItem(WEEK_START_KEY),
    ]).then(([storedTheme, storedWeekStart]) => {
      if (storedTheme === "light" || storedTheme === "dark") {
        setMode(storedTheme);
      }
      if (storedWeekStart && WEEK_START_OPTIONS.includes(storedWeekStart as WeekStartDay)) {
        setWeekStartDayState(storedWeekStart as WeekStartDay);
      }
      setLoaded(true);
    });
  }, []);

  const setTheme = useCallback((newMode: ThemeMode) => {
    setMode(newMode);
    AsyncStorage.setItem(THEME_STORAGE_KEY, newMode);
  }, []);

  const toggleTheme = useCallback(() => {
    setMode((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      AsyncStorage.setItem(THEME_STORAGE_KEY, next);
      return next;
    });
  }, []);

  const setWeekStartDay = useCallback((day: WeekStartDay) => {
    setWeekStartDayState(day);
    AsyncStorage.setItem(WEEK_START_KEY, day);
  }, []);

  const value = useMemo(() => ({
    mode,
    colors: mode === "dark" ? darkTheme : lightTheme,
    isDark: mode === "dark",
    toggleTheme,
    setTheme,
    weekStartDay,
    setWeekStartDay,
  }), [mode, weekStartDay, toggleTheme, setTheme, setWeekStartDay]);

  if (!loaded) return null;

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
