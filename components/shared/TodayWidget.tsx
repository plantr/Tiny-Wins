import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useTheme } from "@/lib/theme-context";
import { useHabits } from "@/lib/habits-context";
import { getTodayStr } from "@/lib/utils/date";

const RING_SIZE = 80;
const RING_STROKE = 6;

export function TodayWidget() {
  const { colors } = useTheme();
  const { habits, logs } = useHabits();
  const today = getTodayStr();
  const todayLogs = logs.filter((l) => l.date === today);
  const completedIds = new Set(todayLogs.filter((l) => l.status === "done").map((l) => l.habitId));
  const completedCount = completedIds.size;
  const totalCount = habits.length;
  const progress = totalCount > 0 ? completedCount / totalCount : 0;
  const pct = Math.round(progress * 100);

  const progressAnim = useSharedValue(0);
  useEffect(() => {
    progressAnim.value = withTiming(progress, { duration: 800, easing: Easing.out(Easing.cubic) });
  }, [progress]);

  const bestStreak = habits.reduce((max, h) => Math.max(max, h.streak), 0);
  const totalCompletionsToday = todayLogs.filter((l) => l.status === "done").length;

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "good morning" : hour < 17 ? "good afternoon" : "good evening";

  const ringAnimStyle = useAnimatedStyle(() => {
    const deg = progressAnim.value * 360;
    return { transform: [{ rotate: `${deg}deg` }] };
  });

  if (totalCount === 0) return null;

  const allDone = completedCount >= totalCount;

  return (
    <View style={[widgetStyles.container, { backgroundColor: colors.surface }]}>
      <LinearGradient
        colors={allDone ? ["#00E5C320", "#00E5C305"] : [colors.accent + "12", colors.accentPurple + "08"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={widgetStyles.topRow}>
        <View style={widgetStyles.greetingCol}>
          <Text style={[widgetStyles.greeting, { color: colors.textSecondary }]}>{greeting}</Text>
          <Text style={[widgetStyles.widgetTitle, { color: colors.text }]}>
            {allDone ? "all habits done!" : `${completedCount} of ${totalCount} done`}
          </Text>
        </View>
        <View style={widgetStyles.ringContainer}>
          <View style={[widgetStyles.ringTrack, { borderColor: colors.surfaceLight }]} />
          <View style={widgetStyles.ringProgress}>
            {Array.from({ length: 36 }).map((_, i) => {
              const angle = (i / 36) * 360 - 90;
              const rad = (angle * Math.PI) / 180;
              const r = (RING_SIZE - RING_STROKE) / 2;
              const cx = RING_SIZE / 2 + r * Math.cos(rad);
              const cy = RING_SIZE / 2 + r * Math.sin(rad);
              const filled = i / 36 < progress;
              return (
                <View
                  key={i}
                  style={[
                    widgetStyles.ringDot,
                    {
                      left: cx - RING_STROKE / 2,
                      top: cy - RING_STROKE / 2,
                      backgroundColor: filled
                        ? allDone ? "#00E5C3" : colors.accent
                        : colors.surfaceLight,
                    },
                  ]}
                />
              );
            })}
          </View>
          <View style={widgetStyles.ringCenter}>
            <Text style={[widgetStyles.ringPct, { color: allDone ? "#00E5C3" : colors.text }]}>{pct}%</Text>
          </View>
        </View>
      </View>

      <View style={widgetStyles.statsRow}>
        <View style={[widgetStyles.statItem, { backgroundColor: colors.surfaceLight + "80" }]}>
          <Ionicons name="flame" size={14} color="#FF8C42" />
          <Text style={[widgetStyles.statValue, { color: colors.text }]}>{bestStreak}</Text>
          <Text style={[widgetStyles.statLabel, { color: colors.textMuted }]}>best streak</Text>
        </View>
        <View style={[widgetStyles.statItem, { backgroundColor: colors.surfaceLight + "80" }]}>
          <Ionicons name="checkmark-circle" size={14} color="#00E5C3" />
          <Text style={[widgetStyles.statValue, { color: colors.text }]}>{totalCompletionsToday}</Text>
          <Text style={[widgetStyles.statLabel, { color: colors.textMuted }]}>completed</Text>
        </View>
        <View style={[widgetStyles.statItem, { backgroundColor: colors.surfaceLight + "80" }]}>
          <Ionicons name="hourglass-outline" size={14} color={colors.accentPurple} />
          <Text style={[widgetStyles.statValue, { color: colors.text }]}>{totalCount - completedCount}</Text>
          <Text style={[widgetStyles.statLabel, { color: colors.textMuted }]}>remaining</Text>
        </View>
      </View>

      {habits.length > 0 && (
        <View style={widgetStyles.habitDots}>
          {habits.map((h) => {
            const done = completedIds.has(h.id);
            return (
              <View key={h.id} style={widgetStyles.habitDotItem}>
                <View
                  style={[
                    widgetStyles.habitDot,
                    { backgroundColor: done ? h.iconColor : colors.surfaceLight, borderColor: done ? h.iconColor : colors.textMuted + "40" },
                  ]}
                >
                  {done && <Ionicons name="checkmark" size={8} color="#FFF" />}
                </View>
                <Text style={[widgetStyles.habitDotLabel, { color: done ? colors.textSecondary : colors.textMuted }]} numberOfLines={1}>
                  {h.title}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const widgetStyles = StyleSheet.create({
  container: {
    borderRadius: 20, padding: 18, marginBottom: 16, overflow: "hidden",
  },
  topRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16,
  },
  greetingCol: { flex: 1, marginRight: 16 },
  greeting: { fontFamily: "Inter_400Regular", fontSize: 13, marginBottom: 4 },
  widgetTitle: { fontFamily: "Inter_700Bold", fontSize: 20 },
  ringContainer: {
    width: RING_SIZE, height: RING_SIZE, position: "relative",
  },
  ringTrack: {
    position: "absolute", width: RING_SIZE, height: RING_SIZE,
    borderRadius: RING_SIZE / 2, borderWidth: RING_STROKE, opacity: 0.3,
  },
  ringProgress: {
    position: "absolute", width: RING_SIZE, height: RING_SIZE,
  },
  ringDot: {
    position: "absolute", width: RING_STROKE, height: RING_STROKE,
    borderRadius: RING_STROKE / 2,
  },
  ringCenter: {
    position: "absolute", width: RING_SIZE, height: RING_SIZE,
    alignItems: "center", justifyContent: "center",
  },
  ringPct: { fontFamily: "Inter_700Bold", fontSize: 16 },
  statsRow: {
    flexDirection: "row", gap: 8, marginBottom: 14,
  },
  statItem: {
    flex: 1, flexDirection: "column", alignItems: "center",
    paddingVertical: 10, borderRadius: 12, gap: 4,
  },
  statValue: { fontFamily: "Inter_700Bold", fontSize: 18 },
  statLabel: { fontFamily: "Inter_400Regular", fontSize: 10 },
  habitDots: {
    flexDirection: "row", flexWrap: "wrap", gap: 10,
  },
  habitDotItem: {
    flexDirection: "row", alignItems: "center", gap: 5,
  },
  habitDot: {
    width: 16, height: 16, borderRadius: 8,
    alignItems: "center", justifyContent: "center", borderWidth: 1.5,
  },
  habitDotLabel: { fontFamily: "Inter_500Medium", fontSize: 11, maxWidth: 70 },
});
