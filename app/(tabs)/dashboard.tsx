import React, { useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useTheme } from "@/lib/theme-context";
import { useHabits, Habit } from "@/lib/habits-context";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function getDaysInMonth(month: number, year: number): number {
  return new Date(year, month + 1, 0).getDate();
}

interface MonthRow {
  month: number;
  days: number;
  completions: boolean[];
}

type CellState = "completed" | "missed" | "future" | "hidden";

interface MonthCell {
  state: CellState;
}

function generateYearData(completedDates: Set<string>): { month: number; cells: MonthCell[] }[] {
  const now = new Date();
  const year = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentDay = now.getDate();

  const rows: { month: number; cells: MonthCell[] }[] = [];
  for (let m = 0; m < 12; m++) {
    const daysInMonth = getDaysInMonth(m, year);
    const cells: MonthCell[] = [];
    for (let d = 0; d < 31; d++) {
      if (d >= daysInMonth) {
        cells.push({ state: "hidden" });
      } else if (m > currentMonth || (m === currentMonth && d >= currentDay)) {
        cells.push({ state: "future" });
      } else {
        const dateStr = `${year}-${String(m + 1).padStart(2, "0")}-${String(d + 1).padStart(2, "0")}`;
        cells.push({ state: completedDates.has(dateStr) ? "completed" : "missed" });
      }
    }
    rows.push({ month: m, cells });
  }
  return rows;
}


function HeatmapGrid({ color, completedDates }: { color: string; completedDates: Set<string> }) {
  const { colors } = useTheme();
  const data = useMemo(() => generateYearData(completedDates), [completedDates]);

  return (
    <View style={gridStyles.container}>
      {data.map((row) => (
        <View key={row.month} style={gridStyles.row}>
          <Text style={[gridStyles.monthLabel, { color: colors.textMuted }]}>{MONTH_LABELS[row.month]}</Text>
          <View style={gridStyles.cellsRow}>
            {row.cells.map((cell, dayIdx) => (
              <View
                key={dayIdx}
                style={[
                  gridStyles.cell,
                  {
                    backgroundColor:
                      cell.state === "hidden"
                        ? "transparent"
                        : cell.state === "completed"
                        ? color
                        : cell.state === "future"
                        ? colors.surfaceLight + "30"
                        : colors.surfaceLight,
                  },
                ]}
              />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

function HabitHeatmapCard({ habit }: { habit: Habit }) {
  const { colors } = useTheme();
  const { getLogsForHabit, incrementHabit } = useHabits();

  const logs = getLogsForHabit(habit.id);
  const completedDates = useMemo(() => {
    const dates = new Set<string>();
    logs.forEach((l) => {
      if (l.status === "done") dates.add(l.date);
    });
    return dates;
  }, [logs]);

  const isCompletedToday = habit.current >= habit.goal;

  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push({ pathname: "/habit/[id]", params: { id: habit.id } });
      }}
      style={[cardStyles.container, { backgroundColor: colors.surface }]}
    >
      <View style={cardStyles.header}>
        <View style={cardStyles.headerLeft}>
          <View style={[cardStyles.iconWrap, { backgroundColor: habit.iconColor + "20" }]}>
            <Ionicons name={habit.icon as any} size={16} color={habit.iconColor} />
          </View>
          <View style={cardStyles.textWrap}>
            <Text style={[cardStyles.name, { color: colors.text }]}>{habit.title}</Text>
            <Text style={[cardStyles.description, { color: colors.textSecondary }]} numberOfLines={1}>
              {habit.current}/{habit.goal} {habit.unit} today
            </Text>
          </View>
        </View>
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            incrementHabit(habit.id);
          }}
          style={({ pressed }) => [
            cardStyles.checkButton,
            {
              backgroundColor: isCompletedToday ? habit.iconColor : habit.iconColor + "30",
              transform: [{ scale: pressed ? 0.9 : 1 }],
            },
          ]}
        >
          <Ionicons
            name="checkmark"
            size={18}
            color={isCompletedToday ? "#000" : habit.iconColor}
          />
        </Pressable>
      </View>
      <HeatmapGrid color={habit.iconColor} completedDates={completedDates} />
    </Pressable>
  );
}

function EmptyState() {
  const { colors } = useTheme();
  return (
    <View style={emptyStyles.container}>
      <Ionicons name="grid-outline" size={48} color={colors.textMuted} />
      <Text style={[emptyStyles.title, { color: colors.textSecondary }]}>no habits yet</Text>
      <Text style={[emptyStyles.subtitle, { color: colors.textMuted }]}>
        add your first habit to see your progress here
      </Text>
    </View>
  );
}

export default function DashboardScreen() {
  const { colors } = useTheme();
  const { habits } = useHabits();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "web" ? 67 : 0;
  const bottomPadding = Platform.OS === "web" ? 34 : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topPadding }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 + bottomPadding }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <View style={{ width: 36 }} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>dashboard</Text>
          <View style={{ width: 36 }} />
        </View>

        {habits.length === 0 ? (
          <EmptyState />
        ) : (
          habits.map((habit) => (
            <HabitHeatmapCard key={habit.id} habit={habit} />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, gap: 12 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    marginBottom: 8, paddingHorizontal: 4,
  },
  headerTitle: { fontFamily: "Inter_700Bold", fontSize: 18 },
});

const emptyStyles = StyleSheet.create({
  container: {
    alignItems: "center", justifyContent: "center",
    paddingVertical: 80, gap: 10,
  },
  title: { fontFamily: "Inter_600SemiBold", fontSize: 18 },
  subtitle: { fontFamily: "Inter_400Regular", fontSize: 14, textAlign: "center", paddingHorizontal: 40 },
});

const cardStyles = StyleSheet.create({
  container: { borderRadius: 16, padding: 14, gap: 12 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  iconWrap: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  textWrap: { flex: 1 },
  name: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
  description: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 1 },
  checkButton: {
    width: 32, height: 32, borderRadius: 10,
    alignItems: "center", justifyContent: "center", marginLeft: 8,
  },
});

const gridStyles = StyleSheet.create({
  container: { gap: 2 },
  row: { flexDirection: "row", alignItems: "center", gap: 0 },
  monthLabel: { fontFamily: "Inter_400Regular", fontSize: 8, width: 22 },
  cellsRow: { flex: 1, flexDirection: "row", gap: 1.5 },
  cell: { flex: 1, aspectRatio: 1, borderRadius: 2, maxWidth: 9, maxHeight: 9 },
});
