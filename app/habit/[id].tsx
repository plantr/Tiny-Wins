import React, { useEffect, useMemo, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Platform,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, Feather } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  Easing,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/lib/theme-context";
import { useHabits, VersionLevel } from "@/lib/habits-context";
import { IDENTITY_AREAS } from "@/lib/identity-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const DAYS_SHORT = ["M", "T", "W", "T", "F", "S", "S"];

function AnimatedWeekBar({ value, maxValue, index, color }: { value: number; maxValue: number; index: number; color: string }) {
  const { colors } = useTheme();
  const height = useSharedValue(0);

  useEffect(() => {
    const targetHeight = maxValue > 0 ? (value / maxValue) * 100 : 0;
    height.value = withTiming(targetHeight, { duration: 400, easing: Easing.out(Easing.cubic) });
  }, [value, maxValue]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: `${height.value}%`,
  }));

  return (
    <View style={weekStyles.barCol}>
      <View style={[weekStyles.barTrack, { backgroundColor: colors.surfaceLight }]}>
        <Animated.View style={[weekStyles.barFill, animatedStyle, { backgroundColor: color }]} />
      </View>
      <Text style={[weekStyles.dayLabel, { color: colors.textMuted }]}>{DAYS_SHORT[index]}</Text>
    </View>
  );
}

function VersionSelector({
  versions,
  currentVersion,
  color,
  onSelect,
}: {
  versions: { twoMin: string; standard: string; stretch?: string };
  currentVersion: VersionLevel;
  color: string;
  onSelect: (v: VersionLevel) => void;
}) {
  const { colors } = useTheme();
  const levels: { key: VersionLevel; label: string; value: string; dotColor: string }[] = [
    { key: "twoMin", label: "2 min", value: versions.twoMin, dotColor: colors.accentCyan },
    { key: "standard", label: "Standard", value: versions.standard, dotColor: color },
  ];
  if (versions.stretch) {
    levels.push({ key: "stretch", label: "Stretch", value: versions.stretch, dotColor: colors.accentYellow });
  }

  return (
    <View style={versionStyles.container}>
      {levels.map((level, i) => {
        const isActive = currentVersion === level.key;
        return (
          <React.Fragment key={level.key}>
            {i > 0 && <View style={[versionStyles.connector, { backgroundColor: colors.cardBorder }]} />}
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onSelect(level.key);
              }}
              style={[
                versionStyles.item,
                { backgroundColor: colors.surfaceLight },
                isActive && { backgroundColor: level.dotColor + "15", borderColor: level.dotColor, borderWidth: 1.5 },
              ]}
            >
              <View style={[versionStyles.dot, { backgroundColor: level.dotColor }]} />
              <View style={versionStyles.itemText}>
                <Text style={[versionStyles.itemLabel, { color: isActive ? level.dotColor : colors.textSecondary }]}>
                  {level.label}
                </Text>
                <Text style={[versionStyles.itemValue, { color: colors.text }]} numberOfLines={1}>
                  {level.value}
                </Text>
              </View>
              {isActive && <Ionicons name="checkmark-circle" size={18} color={level.dotColor} />}
            </Pressable>
          </React.Fragment>
        );
      })}
    </View>
  );
}

export default function HabitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { habits, updateHabit, incrementHabit, getLogsForHabit } = useHabits();
  const topPadding = Platform.OS === "web" ? 67 : 0;
  const bottomPadding = Platform.OS === "web" ? 34 : 0;

  const habit = habits.find((h) => h.id === id);

  if (!habit) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }]}>
        <Text style={{ color: colors.textSecondary, fontFamily: "Inter_500Medium", fontSize: 16 }}>habit not found</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: colors.accent, fontFamily: "Inter_600SemiBold", fontSize: 15 }}>go back</Text>
        </Pressable>
      </View>
    );
  }

  const identityArea = habit.identityAreaId
    ? IDENTITY_AREAS.find((a) => a.id === habit.identityAreaId)
    : null;

  const progress = habit.current / habit.goal;
  const maxWeekValue = Math.max(...habit.weekData, 1);
  const habitLogs = getLogsForHabit(habit.id);
  const evidenceLogs = habitLogs.filter((l) => l.evidenceNote);

  const fadeIn = useSharedValue(0);
  useEffect(() => {
    fadeIn.value = withTiming(1, { duration: 400 });
  }, []);
  const fadeStyle = useAnimatedStyle(() => ({ opacity: fadeIn.value }));

  const handleVersionChange = (v: VersionLevel) => {
    updateHabit(habit.id, { currentVersion: v });
  };

  return (
    <View style={[styles.container, { paddingTop: topPadding, backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 40 + bottomPadding }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
            style={[styles.backButton, { backgroundColor: colors.surface }]}
          >
            <Feather name="arrow-left" size={22} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{habit.title}</Text>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push({ pathname: "/edit-habit", params: { id: habit.id } });
            }}
            style={styles.moreButton}
          >
            <Feather name="edit-2" size={20} color={colors.textSecondary} />
          </Pressable>
        </View>

        <Animated.View style={fadeStyle}>
          <View style={styles.heroCard}>
            <LinearGradient
              colors={habit.gradientColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroGradient}
            />
            <View style={styles.heroContent}>
              <View style={styles.heroIconWrap}>
                <Ionicons name={habit.icon as any} size={28} color="#FFF" />
              </View>
              <View style={styles.heroStats}>
                <Text style={styles.heroCurrent}>{habit.current}</Text>
                <Text style={styles.heroSeparator}>/</Text>
                <Text style={styles.heroGoal}>{habit.goal}</Text>
              </View>
              <Text style={styles.heroUnit}>{habit.unit} today</Text>
              {identityArea && (
                <View style={styles.identityTag}>
                  <Ionicons name={identityArea.icon as any} size={12} color="#FFF" />
                  <Text style={styles.identityTagText}>{identityArea.label}</Text>
                </View>
              )}
            </View>
          </View>

          {habit.implementationIntention && (
            <View style={[styles.intentionCard, { backgroundColor: colors.surface }]}>
              <View style={styles.intentionHeader}>
                <Ionicons name="location" size={16} color={colors.accentOrange} />
                <Text style={[styles.intentionTitle, { color: colors.text }]}>my intention</Text>
              </View>
              <Text style={[styles.intentionText, { color: colors.textSecondary }]}>
                I will{" "}
                <Text style={{ color: colors.accentOrange }}>{habit.implementationIntention.behaviour}</Text>
                {habit.implementationIntention.time ? (
                  <> at <Text style={{ color: colors.accentPurple }}>{habit.implementationIntention.time}</Text></>
                ) : null}
                {habit.implementationIntention.location ? (
                  <> in <Text style={{ color: colors.accentCyan }}>{habit.implementationIntention.location}</Text></>
                ) : null}
                .
              </Text>
            </View>
          )}

          {habit.stackAnchor && (
            <View style={[styles.stackCard, { backgroundColor: colors.surface }]}>
              <View style={styles.intentionHeader}>
                <Ionicons name="link" size={16} color={colors.accentPurple} />
                <Text style={[styles.intentionTitle, { color: colors.text }]}>habit stack</Text>
              </View>
              <Text style={[styles.intentionText, { color: colors.textSecondary }]}>
                After I <Text style={{ color: colors.accentPurple }}>{habit.stackAnchor}</Text>,
                I will <Text style={{ color: colors.accentOrange }}>{habit.title.toLowerCase()}</Text>.
              </Text>
            </View>
          )}

          {habit.versions && habit.currentVersion && (
            <View style={styles.versionSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>scaling level</Text>
              <VersionSelector
                versions={habit.versions}
                currentVersion={habit.currentVersion}
                color={habit.iconColor}
                onSelect={handleVersionChange}
              />
            </View>
          )}

          <View style={styles.progressSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>today's progress</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressTrack, { backgroundColor: colors.surfaceLight }]}>
                <LinearGradient
                  colors={[habit.iconColor, habit.iconColor + "80"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progressFill, { width: `${Math.min(progress * 100, 100)}%` }]}
                />
              </View>
              <Text style={[styles.progressPercent, { color: colors.textSecondary }]}>{Math.round(progress * 100)}%</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
              <Ionicons name="flame" size={20} color="#FF8C42" />
              <Text style={[styles.statValue, { color: colors.text }]}>{habit.streak}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>day streak</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
              <Ionicons name="trophy" size={20} color="#FFD600" />
              <Text style={[styles.statValue, { color: colors.text }]}>{habit.bestStreak}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>best streak</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
              <Ionicons name="calendar" size={20} color="#7B61FF" />
              <Text style={[styles.statValue, { color: colors.text }]}>{habit.frequency}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>frequency</Text>
            </View>
          </View>

          <View style={styles.weekSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>this week</Text>
            <View style={[styles.weekCard, { backgroundColor: colors.surface }]}>
              <View style={weekStyles.container}>
                {habit.weekData.map((val, i) => (
                  <AnimatedWeekBar key={i} value={val} maxValue={maxWeekValue} index={i} color={habit.iconColor} />
                ))}
              </View>
            </View>
          </View>

          {evidenceLogs.length > 0 && (
            <View style={styles.evidenceSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>recent evidence</Text>
              {evidenceLogs.slice(-3).reverse().map((log) => (
                <View key={log.id} style={[styles.evidenceItem, { backgroundColor: colors.surface }]}>
                  <Ionicons name="sparkles" size={14} color={colors.accentCyan} />
                  <View style={styles.evidenceContent}>
                    <Text style={[styles.evidenceNote, { color: colors.text }]}>{log.evidenceNote}</Text>
                    <Text style={[styles.evidenceDate, { color: colors.textMuted }]}>{log.date}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          <View style={styles.actionsSection}>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                incrementHabit(habit.id);
              }}
              style={({ pressed }) => [styles.primaryAction, { opacity: pressed ? 0.85 : 1 }]}
            >
              <LinearGradient
                colors={[habit.iconColor, habit.iconColor + "CC"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              <Ionicons name="add" size={22} color="#FFF" />
              <Text style={styles.primaryActionText}>log {habit.unit}</Text>
            </Pressable>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20,
  },
  backButton: {
    width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center",
  },
  headerTitle: { fontFamily: "Inter_700Bold", fontSize: 18 },
  moreButton: {
    width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center",
  },
  heroCard: { height: 180, borderRadius: 24, overflow: "hidden", marginBottom: 20 },
  heroGradient: { ...StyleSheet.absoluteFillObject, opacity: 0.85 },
  heroContent: { flex: 1, alignItems: "center", justifyContent: "center", gap: 6 },
  heroIconWrap: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: "rgba(0,0,0,0.2)", alignItems: "center", justifyContent: "center", marginBottom: 2,
  },
  heroStats: { flexDirection: "row", alignItems: "baseline" },
  heroCurrent: { fontFamily: "Inter_700Bold", fontSize: 44, color: "#FFF" },
  heroSeparator: { fontFamily: "Inter_400Regular", fontSize: 28, color: "rgba(255,255,255,0.5)", marginHorizontal: 4 },
  heroGoal: { fontFamily: "Inter_600SemiBold", fontSize: 28, color: "rgba(255,255,255,0.6)" },
  heroUnit: { fontFamily: "Inter_400Regular", fontSize: 14, color: "rgba(255,255,255,0.7)" },
  identityTag: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "rgba(0,0,0,0.25)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10,
  },
  identityTagText: { fontFamily: "Inter_500Medium", fontSize: 11, color: "rgba(255,255,255,0.9)" },
  intentionCard: { borderRadius: 16, padding: 16, marginBottom: 12 },
  stackCard: { borderRadius: 16, padding: 16, marginBottom: 12 },
  intentionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  intentionTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  intentionText: { fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 21 },
  versionSection: { marginBottom: 20 },
  sectionTitle: { fontFamily: "Inter_600SemiBold", fontSize: 16, marginBottom: 12 },
  progressSection: { marginBottom: 20 },
  progressBar: { flexDirection: "row", alignItems: "center", gap: 12 },
  progressTrack: { flex: 1, height: 10, borderRadius: 5, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 5 },
  progressPercent: { fontFamily: "Inter_600SemiBold", fontSize: 14, minWidth: 60, textAlign: "right" },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  statCard: { flex: 1, borderRadius: 16, padding: 14, alignItems: "center", gap: 6 },
  statValue: { fontFamily: "Inter_700Bold", fontSize: 18 },
  statLabel: { fontFamily: "Inter_400Regular", fontSize: 11, textAlign: "center" },
  weekSection: { marginBottom: 20 },
  weekCard: { borderRadius: 20, padding: 20 },
  evidenceSection: { marginBottom: 20, gap: 8 },
  evidenceItem: {
    flexDirection: "row", alignItems: "flex-start", gap: 10,
    borderRadius: 14, padding: 14,
  },
  evidenceContent: { flex: 1 },
  evidenceNote: { fontFamily: "Inter_500Medium", fontSize: 14, lineHeight: 20, marginBottom: 4 },
  evidenceDate: { fontFamily: "Inter_400Regular", fontSize: 12 },
  actionsSection: { gap: 12 },
  primaryAction: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, height: 52, borderRadius: 16, overflow: "hidden",
  },
  primaryActionText: { fontFamily: "Inter_600SemiBold", fontSize: 16, color: "#FFF" },
});

const weekStyles = StyleSheet.create({
  container: { flexDirection: "row", justifyContent: "space-between", height: 140, gap: 8 },
  barCol: { flex: 1, alignItems: "center", gap: 8 },
  barTrack: {
    flex: 1, width: "100%", borderRadius: 8, overflow: "hidden", justifyContent: "flex-end",
  },
  barFill: { width: "100%", borderRadius: 8, minHeight: 4 },
  dayLabel: { fontFamily: "Inter_500Medium", fontSize: 11 },
});

const versionStyles = StyleSheet.create({
  container: { gap: 0 },
  connector: { width: 2, height: 12, marginLeft: 19 },
  item: {
    flexDirection: "row", alignItems: "center", gap: 12,
    borderRadius: 14, padding: 14,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  itemText: { flex: 1 },
  itemLabel: { fontFamily: "Inter_600SemiBold", fontSize: 12, marginBottom: 2 },
  itemValue: { fontFamily: "Inter_500Medium", fontSize: 14 },
});
