import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Dimensions,
  Platform,
  Pressable,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, Feather } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/lib/theme-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isInRange(day: Date, start: Date | null, end: Date | null) {
  if (!start || !end) return false;
  const t = day.getTime();
  const s = start.getTime();
  const e = end.getTime();
  return t >= Math.min(s, e) && t <= Math.max(s, e);
}

function formatDateShort(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatDateLabel(start: Date | null, end: Date | null) {
  if (!start) return "Select dates";
  if (!end || isSameDay(start, end)) return formatDateShort(start);
  const s = start.getTime() < end.getTime() ? start : end;
  const e = start.getTime() < end.getTime() ? end : start;
  if (s.getFullYear() === e.getFullYear() && s.getMonth() === e.getMonth()) {
    return `${s.toLocaleDateString("en-US", { month: "short" })} ${s.getDate()} - ${e.getDate()}`;
  }
  return `${formatDateShort(s)} - ${formatDateShort(e)}`;
}

function getDaysInMonth(month: number, year: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(month: number, year: number) {
  const d = new Date(year, month, 1).getDay();
  return d === 0 ? 6 : d - 1;
}

function generateCalendarDays(month: number, year: number) {
  const daysInMonth = getDaysInMonth(month, year);
  const firstDay = getFirstDayOfMonth(month, year);
  const days: (Date | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));
  return days;
}

type SelectionMode = "single" | "range";

function CalendarPicker({
  visible,
  onClose,
  onApply,
  initialStart,
  initialEnd,
}: {
  visible: boolean;
  onClose: () => void;
  onApply: (start: Date, end: Date | null, mode: SelectionMode) => void;
  initialStart: Date | null;
  initialEnd: Date | null;
}) {
  const { colors, isDark } = useTheme();
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [mode, setMode] = useState<SelectionMode>("single");
  const [rangeStart, setRangeStart] = useState<Date | null>(initialStart);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(initialEnd);

  useEffect(() => {
    if (visible) {
      setRangeStart(initialStart);
      setRangeEnd(initialEnd);
      if (initialStart) {
        setViewMonth(initialStart.getMonth());
        setViewYear(initialStart.getFullYear());
      }
      setMode(initialEnd && initialStart && !isSameDay(initialStart, initialEnd) ? "range" : "single");
    }
  }, [visible]);

  const days = useMemo(() => generateCalendarDays(viewMonth, viewYear), [viewMonth, viewYear]);
  const monthLabel = new Date(viewYear, viewMonth).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const goToPrevMonth = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };
  const goToNextMonth = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  const handleDayPress = (day: Date) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (mode === "single") {
      setRangeStart(day);
      setRangeEnd(null);
    } else {
      if (!rangeStart || (rangeStart && rangeEnd)) {
        setRangeStart(day);
        setRangeEnd(null);
      } else {
        setRangeEnd(day);
      }
    }
  };

  const handleApply = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (rangeStart) {
      onApply(rangeStart, rangeEnd, mode);
    }
    onClose();
  };

  const handleToday = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const t = new Date();
    setRangeStart(t);
    setRangeEnd(null);
    setMode("single");
    setViewMonth(t.getMonth());
    setViewYear(t.getFullYear());
  };

  const normalizedStart = rangeStart && rangeEnd && rangeStart.getTime() > rangeEnd.getTime() ? rangeEnd : rangeStart;
  const normalizedEnd = rangeStart && rangeEnd && rangeStart.getTime() > rangeEnd.getTime() ? rangeStart : rangeEnd;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={calStyles.overlay}>
        <Pressable style={calStyles.backdrop} onPress={onClose} />
        <View style={[calStyles.sheet, { backgroundColor: colors.surface }]}>
          <View style={calStyles.handle} />

          <View style={calStyles.modeRow}>
            <Pressable
              onPress={() => { setMode("single"); setRangeEnd(null); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
              style={[calStyles.modePill, mode === "single" && { backgroundColor: colors.accent + "20" }]}
            >
              <Text style={[calStyles.modePillText, { color: mode === "single" ? colors.accent : colors.textSecondary }]}>
                Single Day
              </Text>
            </Pressable>
            <Pressable
              onPress={() => { setMode("range"); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
              style={[calStyles.modePill, mode === "range" && { backgroundColor: colors.accent + "20" }]}
            >
              <Text style={[calStyles.modePillText, { color: mode === "range" ? colors.accent : colors.textSecondary }]}>
                Date Range
              </Text>
            </Pressable>
          </View>

          <View style={calStyles.navRow}>
            <Pressable onPress={goToPrevMonth} style={calStyles.navButton}>
              <Feather name="chevron-left" size={20} color={colors.text} />
            </Pressable>
            <Text style={[calStyles.monthLabel, { color: colors.text }]}>{monthLabel}</Text>
            <Pressable onPress={goToNextMonth} style={calStyles.navButton}>
              <Feather name="chevron-right" size={20} color={colors.text} />
            </Pressable>
          </View>

          <View style={calStyles.weekdayRow}>
            {WEEKDAY_LABELS.map((w) => (
              <Text key={w} style={[calStyles.weekdayLabel, { color: colors.textMuted }]}>{w}</Text>
            ))}
          </View>

          <View style={calStyles.daysGrid}>
            {days.map((day, idx) => {
              if (!day) return <View key={`empty-${idx}`} style={calStyles.dayCell} />;
              const isToday = isSameDay(day, today);
              const isSelected = (normalizedStart && isSameDay(day, normalizedStart)) || (normalizedEnd && isSameDay(day, normalizedEnd));
              const inRange = mode === "range" && isInRange(day, normalizedStart, normalizedEnd) && !isSelected;
              const isRangeStart = normalizedStart && isSameDay(day, normalizedStart) && normalizedEnd && !isSameDay(normalizedStart, normalizedEnd);
              const isRangeEnd = normalizedEnd && isSameDay(day, normalizedEnd) && normalizedStart && !isSameDay(normalizedStart, normalizedEnd);
              const isFuture = day.getTime() > today.getTime();

              return (
                <Pressable
                  key={day.getTime()}
                  onPress={() => !isFuture && handleDayPress(day)}
                  style={[
                    calStyles.dayCell,
                    inRange && { backgroundColor: colors.accent + "12" },
                    isRangeStart && { backgroundColor: colors.accent + "12", borderTopLeftRadius: 20, borderBottomLeftRadius: 20 },
                    isRangeEnd && { backgroundColor: colors.accent + "12", borderTopRightRadius: 20, borderBottomRightRadius: 20 },
                  ]}
                >
                  <View
                    style={[
                      calStyles.dayInner,
                      isSelected && { backgroundColor: colors.accent },
                      isToday && !isSelected && { borderWidth: 1.5, borderColor: colors.accent },
                    ]}
                  >
                    <Text
                      style={[
                        calStyles.dayText,
                        { color: isFuture ? colors.textMuted : colors.text },
                        isSelected && { color: "#FFF", fontFamily: "Inter_700Bold" },
                      ]}
                    >
                      {day.getDate()}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          {rangeStart && (
            <Text style={[calStyles.selectionLabel, { color: colors.textSecondary }]}>
              {formatDateLabel(normalizedStart, normalizedEnd)}
            </Text>
          )}

          <View style={calStyles.actionRow}>
            <Pressable onPress={handleToday} style={[calStyles.todayButton, { borderColor: colors.cardBorder }]}>
              <Text style={[calStyles.todayButtonText, { color: colors.text }]}>today</Text>
            </Pressable>
            <Pressable
              onPress={handleApply}
              style={[calStyles.applyButton, { opacity: rangeStart ? 1 : 0.4 }]}
              disabled={!rangeStart}
            >
              <LinearGradient
                colors={["#FF3B7F", "#FF6B9D"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              <Text style={calStyles.applyButtonText}>Apply</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function generateBarData(startDate: Date, endDate: Date | null) {
  const gradients: readonly [string, string][] = [
    ["#7B61FF", "#FF3B7F"],
    ["#FF3B7F", "#FF6B9D"],
    ["#FF8C42", "#FF3B7F"],
    ["#FF6B9D", "#FFB347"],
    ["#00E5C3", "#00C4A7"],
    ["#FF3B7F", "#7B61FF"],
    ["#FFD600", "#FF8C42"],
  ];

  if (!endDate || isSameDay(startDate, endDate)) {
    const dayOfWeek = startDate.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const weekStart = new Date(startDate);
    weekStart.setDate(startDate.getDate() + mondayOffset);

    const days: { day: string; value: number; colors: readonly [string, string] }[] = [];
    const dayLabels = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      const seed = d.getDate() * 17 + d.getMonth() * 31;
      days.push({
        day: dayLabels[i],
        value: 20 + (seed % 65),
        colors: gradients[i % gradients.length],
      });
    }
    return days;
  }

  const s = startDate.getTime() < endDate.getTime() ? startDate : endDate;
  const e = startDate.getTime() < endDate.getTime() ? endDate : startDate;
  const diffDays = Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  if (diffDays <= 7) {
    const dayLabels = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    const days: { day: string; value: number; colors: readonly [string, string] }[] = [];
    for (let i = 0; i < diffDays; i++) {
      const d = new Date(s);
      d.setDate(s.getDate() + i);
      const seed = d.getDate() * 17 + d.getMonth() * 31;
      days.push({
        day: dayLabels[d.getDay()],
        value: 20 + (seed % 65),
        colors: gradients[i % gradients.length],
      });
    }
    return days;
  }

  const weeksCount = Math.min(Math.ceil(diffDays / 7), 8);
  const weeks: { day: string; value: number; colors: readonly [string, string] }[] = [];
  for (let i = 0; i < weeksCount; i++) {
    const d = new Date(s);
    d.setDate(s.getDate() + i * 7);
    const seed = d.getDate() * 17 + d.getMonth() * 31 + i * 13;
    weeks.push({
      day: `W${i + 1}`,
      value: 30 + (seed % 55),
      colors: gradients[i % gradients.length],
    });
  }
  return weeks;
}

function generateHabitStats(startDate: Date, endDate: Date | null) {
  const seed = startDate.getDate() * 7 + startDate.getMonth() * 13;
  return [
    { name: "Water", progress: 40 + ((seed + 3) % 50), color: "#FF3B7F", icon: "water" as const },
    { name: "Exercise", progress: 30 + ((seed + 17) % 55), color: "#FF8C42", icon: "fitness" as const },
    { name: "Reading", progress: 25 + ((seed + 29) % 60), color: "#7B61FF", icon: "book" as const },
    { name: "Meditation", progress: 50 + ((seed + 41) % 45), color: "#00E5C3", icon: "leaf" as const },
  ];
}

function AnimatedBar({ item, index, animKey }: { item: { day: string; value: number; colors: readonly [string, string] }; index: number; animKey: string }) {
  const { colors } = useTheme();
  const barHeight = useSharedValue(0);

  useEffect(() => {
    barHeight.value = 0;
    barHeight.value = withDelay(
      index * 80,
      withTiming(item.value, { duration: 600, easing: Easing.out(Easing.cubic) })
    );
  }, [animKey]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: `${barHeight.value}%`,
  }));

  return (
    <View style={barStyles.barColumn}>
      <View style={[barStyles.barTrack, { backgroundColor: colors.surfaceLight }]}>
        <Animated.View style={[barStyles.barFill, animatedStyle]}>
          <LinearGradient
            colors={[item.colors[0], item.colors[1]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          {item.value >= 70 && (
            <View style={barStyles.barLabel}>
              <Text style={[barStyles.barLabelText, { color: colors.text }]}>{item.value}%</Text>
            </View>
          )}
        </Animated.View>
      </View>
      <Text style={[barStyles.dayLabel, { color: colors.textMuted }]}>{item.day}</Text>
    </View>
  );
}

function AnimatedHabitBar({ item, index, animKey }: { item: { name: string; progress: number; color: string; icon: any }; index: number; animKey: string }) {
  const { colors } = useTheme();
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = 0;
    width.value = withDelay(
      index * 120,
      withTiming(item.progress, { duration: 600, easing: Easing.out(Easing.cubic) })
    );
  }, [animKey]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  return (
    <View style={habitStyles.habitRow}>
      <View style={habitStyles.habitInfo}>
        <View style={[habitStyles.habitIcon, { backgroundColor: item.color + '20' }]}>
          <Ionicons name={item.icon} size={16} color={item.color} />
        </View>
        <Text style={[habitStyles.habitName, { color: colors.text }]}>{item.name}</Text>
      </View>
      <View style={[habitStyles.habitBarTrack, { backgroundColor: colors.surfaceLight }]}>
        <Animated.View style={[habitStyles.habitBarFill, animatedStyle, { backgroundColor: item.color }]} />
      </View>
      <Text style={[habitStyles.habitPercent, { color: colors.textSecondary }]}>{item.progress}%</Text>
    </View>
  );
}

export default function StatsScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "web" ? 67 : 0;
  const bottomPadding = Platform.OS === "web" ? 34 : 0;
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [selectedStart, setSelectedStart] = useState<Date>(new Date());
  const [selectedEnd, setSelectedEnd] = useState<Date | null>(null);

  const animKey = useMemo(() => {
    return `${selectedStart.getTime()}-${selectedEnd?.getTime() ?? 0}`;
  }, [selectedStart, selectedEnd]);

  const barData = useMemo(() => generateBarData(selectedStart, selectedEnd), [selectedStart, selectedEnd]);
  const habitStats = useMemo(() => generateHabitStats(selectedStart, selectedEnd), [selectedStart, selectedEnd]);

  const overallProgress = useMemo(() => {
    const avg = habitStats.reduce((sum, h) => sum + h.progress, 0) / habitStats.length;
    return Math.round(avg);
  }, [habitStats]);

  const progressAnim = useSharedValue(0);
  useEffect(() => {
    progressAnim.value = 0;
    progressAnim.value = withTiming(overallProgress, { duration: 1000, easing: Easing.out(Easing.cubic) });
  }, [overallProgress]);

  const dateLabel = formatDateLabel(selectedStart, selectedEnd);
  const isRange = selectedEnd && !isSameDay(selectedStart, selectedEnd);

  const handleApply = useCallback((start: Date, end: Date | null, mode: SelectionMode) => {
    setSelectedStart(start);
    setSelectedEnd(mode === "range" ? end : null);
  }, []);

  return (
    <View style={[styles.container, { paddingTop: topPadding, backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 + bottomPadding }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <View>
            <Text style={[styles.dayText, { color: colors.textSecondary }]}>
              {isRange ? "Date range" : selectedStart.toLocaleDateString("en-US", { weekday: "long" })}
            </Text>
            <Text style={[styles.title, { color: colors.text }]}>
              {isRange ? "range stats" : "daily stats"}
            </Text>
          </View>
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setCalendarVisible(true); }}
            style={[styles.datePickerButton, { backgroundColor: colors.surface }]}
          >
            <Ionicons name="calendar" size={16} color={colors.accent} />
            <Text style={[styles.datePickerText, { color: colors.text }]} numberOfLines={1}>
              {dateLabel}
            </Text>
            <Feather name="chevron-down" size={14} color={colors.textSecondary} />
          </Pressable>
        </View>

        <View style={[styles.overviewCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.overviewLabel, { color: colors.textSecondary }]}>overview</Text>
          <View style={styles.overviewContent}>
            <View style={styles.progressCircleContainer}>
              <View style={styles.progressCircleOuter}>
                <LinearGradient
                  colors={["#FF3B7F", "#FF8C42", "#FFD600"]}
                  start={{ x: 0, y: 1 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.progressGradient}
                />
                <View style={[styles.progressCircleInner, { backgroundColor: colors.surface }]}>
                  <View style={styles.progressDot} />
                </View>
              </View>
              <View style={styles.progressGlow} />
            </View>
            <View style={styles.overviewRight}>
              <Text style={[styles.percentText, { color: colors.text }]}>{overallProgress}%</Text>
              <Text style={[styles.overallText, { color: colors.textSecondary }]}>overall progress</Text>
            </View>
          </View>
        </View>

        <View style={[styles.chartCard, { backgroundColor: colors.surface }]}>
          <View style={styles.chartHeader}>
            <View style={styles.yAxis}>
              {["100%", "80%", "60%", "40%", "20%"].map((label) => (
                <Text key={label} style={[styles.yLabel, { color: colors.textMuted }]}>{label}</Text>
              ))}
            </View>
            <View style={styles.barsContainer}>
              {barData.map((item, i) => (
                <AnimatedBar key={`${animKey}-${i}`} item={item} index={i} animKey={animKey} />
              ))}
            </View>
          </View>
        </View>

        <View style={styles.habitStatsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>habit based stats</Text>
          <View style={[styles.habitStatsCard, { backgroundColor: colors.surface }]}>
            {habitStats.map((item, i) => (
              <AnimatedHabitBar key={`${animKey}-${item.name}`} item={item} index={i} animKey={animKey} />
            ))}
          </View>
        </View>
      </ScrollView>

      <CalendarPicker
        visible={calendarVisible}
        onClose={() => setCalendarVisible(false)}
        onApply={handleApply}
        initialStart={selectedStart}
        initialEnd={selectedEnd}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 24,
  },
  dayText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    marginBottom: 4,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
  },
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    maxWidth: 180,
  },
  datePickerText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    flexShrink: 1,
  },
  overviewCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  overviewLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    marginBottom: 20,
  },
  overviewContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
  },
  progressCircleContainer: {
    width: 100,
    height: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  progressCircleOuter: {
    width: 90,
    height: 90,
    borderRadius: 45,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  progressGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  progressCircleInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 4,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
  },
  progressGlow: {
    position: "absolute",
    bottom: -10,
    width: 80,
    height: 40,
    borderRadius: 40,
    backgroundColor: "rgba(255, 140, 66, 0.15)",
  },
  overviewRight: {
    flex: 1,
  },
  percentText: {
    fontFamily: "Inter_700Bold",
    fontSize: 48,
  },
  overallText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    marginTop: 2,
  },
  chartCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  chartHeader: {
    flexDirection: "row",
    height: 200,
  },
  yAxis: {
    justifyContent: "space-between",
    paddingRight: 8,
    paddingVertical: 4,
  },
  yLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
  },
  barsContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
  },
  habitStatsSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    marginBottom: 16,
  },
  habitStatsCard: {
    borderRadius: 20,
    padding: 16,
    gap: 16,
  },
});

const barStyles = StyleSheet.create({
  barColumn: {
    alignItems: "center",
    flex: 1,
    gap: 8,
  },
  barTrack: {
    flex: 1,
    width: 28,
    borderRadius: 14,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  barFill: {
    width: "100%",
    borderRadius: 14,
    overflow: "hidden",
    minHeight: 10,
  },
  barLabel: {
    position: "absolute",
    top: 6,
    alignSelf: "center",
  },
  barLabelText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 9,
  },
  dayLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
  },
});

const habitStyles = StyleSheet.create({
  habitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  habitInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: 100,
  },
  habitIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  habitName: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
  habitBarTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  habitBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  habitPercent: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    width: 36,
    textAlign: "right",
  },
});

const calStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === "web" ? 34 : 40,
    paddingTop: 12,
    maxHeight: "85%",
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(128,128,128,0.4)",
    alignSelf: "center",
    marginBottom: 16,
  },
  modeRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
    justifyContent: "center",
  },
  modePill: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
  },
  modePillText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  monthLabel: {
    fontFamily: "Inter_700Bold",
    fontSize: 17,
  },
  weekdayRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  weekdayLabel: {
    flex: 1,
    textAlign: "center",
    fontFamily: "Inter_500Medium",
    fontSize: 12,
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  dayInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  dayText: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
  },
  selectionLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    textAlign: "center",
    marginTop: 12,
    marginBottom: 4,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  todayButton: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  todayButtonText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
  applyButton: {
    flex: 2,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  applyButtonText: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
    color: "#FFF",
  },
});
