import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme, WEEK_START_INDEX } from "@/lib/theme-context";
import { useHabits } from "@/lib/habits-context";
import { getTodayStr } from "@/lib/utils/date";

const ALL_DAYS = [
  { label: "S", full: "Sun", jsDay: 0 },
  { label: "M", full: "Mon", jsDay: 1 },
  { label: "T", full: "Tue", jsDay: 2 },
  { label: "W", full: "Wed", jsDay: 3 },
  { label: "T", full: "Thu", jsDay: 4 },
  { label: "F", full: "Fri", jsDay: 5 },
  { label: "S", full: "Sat", jsDay: 6 },
];

export function DaySelector() {
  const todayJsDay = new Date().getDay();
  const { colors, weekStartDay } = useTheme();
  const { habits, logs } = useHabits();
  const startIdx = WEEK_START_INDEX[weekStartDay];
  const orderedDays = [...ALL_DAYS.slice(startIdx), ...ALL_DAYS.slice(0, startIdx)];
  const today = getTodayStr();
  const todayLogs = logs.filter((l) => l.date === today);
  const completedCount = todayLogs.filter((l) => l.status === "done").length;

  return (
    <View style={dayStyles.container}>
      {orderedDays.map((day, index) => {
        const isToday = day.jsDay === todayJsDay;
        const todayPosition = orderedDays.findIndex((d) => d.jsDay === todayJsDay);
        const isPast = index < todayPosition;

        return (
          <View key={`${day.jsDay}-${index}`} style={dayStyles.dayItem}>
            <View
              style={[
                dayStyles.circle,
                { borderColor: colors.surfaceLight },
                isToday && { borderColor: colors.accent, borderWidth: 2, backgroundColor: colors.accent + "10" },
              ]}
            >
              <Text
                style={[
                  dayStyles.dayLabel,
                  { color: colors.textMuted },
                  isToday && { color: colors.accent, fontFamily: "Inter_700Bold" },
                  isPast && { color: colors.textSecondary },
                ]}
              >
                {day.label}
              </Text>
            </View>
            {isToday && habits.length > 0 && (
              <View style={[dayStyles.progressDot, { backgroundColor: completedCount >= habits.length ? colors.accentCyan : colors.accent }]} />
            )}
          </View>
        );
      })}
    </View>
  );
}

const dayStyles = StyleSheet.create({
  container: {
    flexDirection: "row", justifyContent: "space-between", marginBottom: 20,
  },
  dayItem: { alignItems: "center", gap: 6 },
  circle: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: "center", justifyContent: "center", borderWidth: 1.5,
  },
  dayLabel: { fontFamily: "Inter_500Medium", fontSize: 13 },
  progressDot: { width: 5, height: 5, borderRadius: 2.5 },
});
