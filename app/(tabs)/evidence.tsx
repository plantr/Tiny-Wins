import React, { useState, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Platform,
  Image,
  Pressable,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useTheme } from "@/lib/theme-context";
import { useHabits, Habit, HabitLog } from "@/lib/habits-context";
import { useIdentity, IDENTITY_AREAS } from "@/lib/identity-context";

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return "today";
  if (date.toDateString() === yesterday.toDateString()) return "yesterday";
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }).toLowerCase();
}

function formatTimestamp(ts: number) {
  const d = new Date(ts);
  const h = d.getHours();
  const m = d.getMinutes();
  const ampm = h < 12 ? "am" : "pm";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

function groupLogsByDate(logs: HabitLog[]) {
  const groups: Record<string, HabitLog[]> = {};
  logs.forEach((log) => {
    if (!groups[log.date]) groups[log.date] = [];
    groups[log.date].push(log);
  });
  return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
}

export default function EvidenceScreen() {
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "web" ? 67 : 0;
  const bottomPadding = Platform.OS === "web" ? 34 : 0;
  const { colors } = useTheme();
  const { habits, logs } = useHabits();
  const { getSelectedAreas } = useIdentity();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);

  const evidenceLogs = useMemo(() => logs.filter((l) => l.status === "done"), [logs]);
  const totalVotes = evidenceLogs.length;
  const selectedAreas = getSelectedAreas();

  const habitsWithEvidence = useMemo(() => {
    return habits.filter((h) => evidenceLogs.some((l) => l.habitId === h.id));
  }, [habits, evidenceLogs]);

  const filteredHabits = useMemo(() => {
    if (!searchQuery.trim()) return habitsWithEvidence;
    const q = searchQuery.toLowerCase().trim();
    return habitsWithEvidence.filter((h) => h.title.toLowerCase().includes(q));
  }, [habitsWithEvidence, searchQuery]);

  const filteredLogs = useMemo(() => {
    if (selectedHabitId) {
      return evidenceLogs.filter((l) => l.habitId === selectedHabitId);
    }
    return evidenceLogs;
  }, [evidenceLogs, selectedHabitId]);

  const grouped = groupLogsByDate(filteredLogs);

  const selectedHabit = selectedHabitId ? habits.find((h) => h.id === selectedHabitId) : null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topPadding }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 + bottomPadding }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <Text style={[styles.title, { color: colors.text }]}>evidence</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            every action is a vote for your identity
          </Text>
        </View>

        <View style={[styles.searchBar, { backgroundColor: colors.surface }]}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="search habits..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={(t) => {
              setSearchQuery(t);
              if (t.trim()) setSelectedHabitId(null);
            }}
          />
          {(searchQuery || selectedHabitId) && (
            <Pressable
              onPress={() => {
                setSearchQuery("");
                setSelectedHabitId(null);
              }}
            >
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </Pressable>
          )}
        </View>

        {!selectedHabitId && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipsScroll}
            contentContainerStyle={styles.chipsContainer}
          >
            <Pressable
              onPress={() => setSelectedHabitId(null)}
              style={[
                styles.chip,
                {
                  backgroundColor: !selectedHabitId ? colors.accent + "20" : colors.surface,
                  borderColor: !selectedHabitId ? colors.accent : "transparent",
                  borderWidth: 1,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: !selectedHabitId ? colors.accent : colors.textSecondary },
                ]}
              >
                all ({totalVotes})
              </Text>
            </Pressable>
            {filteredHabits.map((habit) => {
              const count = evidenceLogs.filter((l) => l.habitId === habit.id).length;
              return (
                <Pressable
                  key={habit.id}
                  onPress={() => setSelectedHabitId(habit.id)}
                  style={[styles.chip, { backgroundColor: colors.surface }]}
                >
                  <Ionicons name={habit.icon as any} size={14} color={habit.gradientColors[0]} />
                  <Text style={[styles.chipText, { color: colors.textSecondary }]}>{habit.title}</Text>
                  <View style={[styles.chipBadge, { backgroundColor: habit.gradientColors[0] + "25" }]}>
                    <Text style={[styles.chipBadgeText, { color: habit.gradientColors[0] }]}>{count}</Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        )}

        {selectedHabit && (
          <Animated.View entering={FadeIn.duration(300)}>
            <View style={[styles.selectedHeader, { backgroundColor: colors.surface }]}>
              <LinearGradient
                colors={[...(selectedHabit.gradientColors as unknown as string[]).slice(0, 2).map(c => c + "15"), "transparent"] as [string, string, ...string[]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.selectedTop}>
                <Pressable
                  onPress={() => setSelectedHabitId(null)}
                  style={[styles.backBtn, { backgroundColor: colors.surfaceLight }]}
                >
                  <Ionicons name="chevron-back" size={18} color={colors.text} />
                </Pressable>
                <View style={[styles.selectedIcon, { backgroundColor: selectedHabit.gradientColors[0] + "20" }]}>
                  <Ionicons name={selectedHabit.icon as any} size={22} color={selectedHabit.gradientColors[0]} />
                </View>
                <View style={styles.selectedInfo}>
                  <Text style={[styles.selectedTitle, { color: colors.text }]}>{selectedHabit.title}</Text>
                  <Text style={[styles.selectedCount, { color: colors.textSecondary }]}>
                    {filteredLogs.length} evidence entr{filteredLogs.length === 1 ? "y" : "ies"}
                  </Text>
                </View>
              </View>

              <View style={styles.selectedStats}>
                <View style={[styles.miniStat, { backgroundColor: colors.surfaceLight + "80" }]}>
                  <Ionicons name="flame" size={14} color="#FF8C42" />
                  <Text style={[styles.miniStatVal, { color: colors.text }]}>{selectedHabit.streak}</Text>
                  <Text style={[styles.miniStatLabel, { color: colors.textMuted }]}>streak</Text>
                </View>
                <View style={[styles.miniStat, { backgroundColor: colors.surfaceLight + "80" }]}>
                  <Ionicons name="trophy" size={14} color="#FFD700" />
                  <Text style={[styles.miniStatVal, { color: colors.text }]}>{selectedHabit.bestStreak}</Text>
                  <Text style={[styles.miniStatLabel, { color: colors.textMuted }]}>best</Text>
                </View>
                <View style={[styles.miniStat, { backgroundColor: colors.surfaceLight + "80" }]}>
                  <Ionicons name="checkmark-done" size={14} color={colors.accentCyan} />
                  <Text style={[styles.miniStatVal, { color: colors.text }]}>{filteredLogs.length}</Text>
                  <Text style={[styles.miniStatLabel, { color: colors.textMuted }]}>total</Text>
                </View>
              </View>
            </View>
          </Animated.View>
        )}

        {!selectedHabitId && (
          <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
            <LinearGradient
              colors={[colors.accentCyan + "10", "transparent"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.summaryTop}>
              <Text style={[styles.voteCount, { color: colors.text }]}>{totalVotes}</Text>
              <Text style={[styles.voteLabel, { color: colors.textSecondary }]}>
                total votes for{"\n"}your new identity
              </Text>
            </View>
            {selectedAreas.length > 0 && (
              <View style={styles.areaBreakdown}>
                {selectedAreas.map((area) => {
                  const areaHabits = habits.filter((h) => h.identityAreaId === area.id).map((h) => h.id);
                  const areaVotes = evidenceLogs.filter((l) => areaHabits.includes(l.habitId)).length;
                  return (
                    <View key={area.id} style={styles.areaRow}>
                      <View style={[styles.areaDot, { backgroundColor: area.color }]} />
                      <Text style={[styles.areaLabel, { color: colors.textSecondary }]}>{area.label}</Text>
                      <Text style={[styles.areaCount, { color: area.color }]}>{areaVotes}</Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {grouped.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
            <Ionicons name="sparkles-outline" size={36} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>
              {selectedHabitId ? "no evidence for this habit yet" : "no evidence yet"}
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.textMuted }]}>
              complete habits and add notes to build your identity proof
            </Text>
          </View>
        ) : (
          <View style={styles.timeline}>
            {grouped.map(([date, dateLogs], groupIdx) => (
              <Animated.View
                key={date}
                entering={Platform.OS !== "web" ? FadeInDown.delay(groupIdx * 60).duration(300) : undefined}
              >
                <View style={styles.dateGroup}>
                  <View style={styles.dateHeader}>
                    <View style={[styles.dateDot, { backgroundColor: colors.accent }]} />
                    <Text style={[styles.dateLabel, { color: colors.text }]}>{formatDate(date)}</Text>
                    <View style={[styles.dateLine, { backgroundColor: colors.cardBorder }]} />
                    <Text style={[styles.dateCount, { color: colors.textMuted }]}>
                      {dateLogs.length} vote{dateLogs.length > 1 ? "s" : ""}
                    </Text>
                  </View>

                  {dateLogs.map((log, logIdx) => {
                    const habit = habits.find((h) => h.id === log.habitId);
                    if (!habit) return null;
                    const area = habit.identityAreaId
                      ? IDENTITY_AREAS.find((a) => a.id === habit.identityAreaId)
                      : null;
                    const hasContent = log.evidenceNote || log.evidenceImage;

                    return (
                      <View key={`${log.habitId}-${log.timestamp}`} style={styles.timelineItem}>
                        <View style={styles.timelineTrack}>
                          <View style={[styles.timelineDot, { backgroundColor: habit.gradientColors[0] }]} />
                          {logIdx < dateLogs.length - 1 && (
                            <View style={[styles.timelineConnector, { backgroundColor: colors.cardBorder }]} />
                          )}
                        </View>

                        <View style={[styles.evidenceCard, { backgroundColor: colors.surface }]}>
                          <View style={styles.evidenceHeader}>
                            <View style={[styles.evidenceIcon, { backgroundColor: habit.gradientColors[0] + "18" }]}>
                              <Ionicons name={habit.icon as any} size={16} color={habit.gradientColors[0]} />
                            </View>
                            <View style={styles.evidenceInfo}>
                              {!selectedHabitId && (
                                <Text style={[styles.evidenceHabit, { color: colors.text }]}>{habit.title}</Text>
                              )}
                              <View style={styles.evidenceMetaRow}>
                                <Ionicons name="time-outline" size={11} color={colors.textMuted} />
                                <Text style={[styles.evidenceTime, { color: colors.textMuted }]}>
                                  {formatTimestamp(log.timestamp)}
                                </Text>
                                {area && (
                                  <View style={[styles.evidenceArea, { backgroundColor: area.color + "15" }]}>
                                    <Text style={[styles.evidenceAreaText, { color: area.color }]}>{area.label}</Text>
                                  </View>
                                )}
                              </View>
                            </View>
                            <Ionicons name="checkmark-circle" size={18} color={colors.accentCyan} />
                          </View>

                          {log.evidenceImage && (
                            <Image
                              source={{ uri: log.evidenceImage }}
                              style={styles.evidenceImage}
                              resizeMode="cover"
                            />
                          )}

                          {log.evidenceNote && (
                            <View style={[styles.noteContainer, { backgroundColor: colors.surfaceLight + "60" }]}>
                              <Ionicons name="document-text-outline" size={14} color={colors.textMuted} style={{ marginTop: 2 }} />
                              <Text style={[styles.evidenceNote, { color: colors.textSecondary }]}>
                                {log.evidenceNote}
                              </Text>
                            </View>
                          )}

                          {!hasContent && (
                            <View style={styles.noContentRow}>
                              <Ionicons name="checkmark" size={13} color={colors.textMuted} />
                              <Text style={[styles.noContentText, { color: colors.textMuted }]}>completed</Text>
                            </View>
                          )}
                        </View>
                      </View>
                    );
                  })}
                </View>
              </Animated.View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20 },
  header: { marginBottom: 16 },
  title: { fontFamily: "Inter_700Bold", fontSize: 28, marginBottom: 4 },
  subtitle: { fontFamily: "Inter_400Regular", fontSize: 14 },

  searchBar: {
    flexDirection: "row", alignItems: "center", gap: 10,
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1, fontFamily: "Inter_500Medium", fontSize: 15,
    padding: 0, borderWidth: 0, outlineStyle: "none" as any,
  },

  chipsScroll: { marginBottom: 16 },
  chipsContainer: { gap: 8, paddingRight: 20 },
  chip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
  },
  chipText: { fontFamily: "Inter_500Medium", fontSize: 13 },
  chipBadge: {
    paddingHorizontal: 6, paddingVertical: 1, borderRadius: 8, minWidth: 20, alignItems: "center",
  },
  chipBadgeText: { fontFamily: "Inter_700Bold", fontSize: 11 },

  selectedHeader: {
    borderRadius: 20, padding: 18, marginBottom: 16, overflow: "hidden",
  },
  selectedTop: {
    flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14,
  },
  backBtn: {
    width: 32, height: 32, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
  },
  selectedIcon: {
    width: 42, height: 42, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
  },
  selectedInfo: { flex: 1 },
  selectedTitle: { fontFamily: "Inter_700Bold", fontSize: 18 },
  selectedCount: { fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 2 },
  selectedStats: { flexDirection: "row", gap: 8 },
  miniStat: {
    flex: 1, flexDirection: "column", alignItems: "center",
    paddingVertical: 10, borderRadius: 12, gap: 3,
  },
  miniStatVal: { fontFamily: "Inter_700Bold", fontSize: 18 },
  miniStatLabel: { fontFamily: "Inter_400Regular", fontSize: 10 },

  summaryCard: {
    borderRadius: 20, padding: 20, marginBottom: 20, overflow: "hidden",
  },
  summaryTop: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 16 },
  voteCount: { fontFamily: "Inter_700Bold", fontSize: 40 },
  voteLabel: { fontFamily: "Inter_500Medium", fontSize: 14, lineHeight: 20 },
  areaBreakdown: { gap: 8 },
  areaRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  areaDot: { width: 8, height: 8, borderRadius: 4 },
  areaLabel: { fontFamily: "Inter_500Medium", fontSize: 13, flex: 1 },
  areaCount: { fontFamily: "Inter_700Bold", fontSize: 16 },

  emptyState: {
    borderRadius: 16, padding: 32, alignItems: "center", gap: 8,
  },
  emptyTitle: { fontFamily: "Inter_600SemiBold", fontSize: 16 },
  emptyDesc: { fontFamily: "Inter_400Regular", fontSize: 14, textAlign: "center" },

  timeline: { gap: 0 },
  dateGroup: { marginBottom: 20 },
  dateHeader: {
    flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12,
  },
  dateDot: { width: 8, height: 8, borderRadius: 4 },
  dateLabel: { fontFamily: "Inter_700Bold", fontSize: 14 },
  dateLine: { flex: 1, height: StyleSheet.hairlineWidth },
  dateCount: { fontFamily: "Inter_400Regular", fontSize: 12 },

  timelineItem: {
    flexDirection: "row", gap: 12, marginLeft: 3,
  },
  timelineTrack: {
    alignItems: "center", width: 14,
  },
  timelineDot: {
    width: 10, height: 10, borderRadius: 5, marginTop: 16,
  },
  timelineConnector: {
    width: 2, flex: 1, marginTop: 4, marginBottom: -8, borderRadius: 1,
  },

  evidenceCard: {
    flex: 1, borderRadius: 14, padding: 14, marginBottom: 10,
  },
  evidenceHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  evidenceIcon: {
    width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center",
  },
  evidenceInfo: { flex: 1, gap: 3 },
  evidenceHabit: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  evidenceMetaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  evidenceTime: { fontFamily: "Inter_400Regular", fontSize: 11 },
  evidenceArea: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 6 },
  evidenceAreaText: { fontFamily: "Inter_500Medium", fontSize: 10 },

  evidenceImage: {
    width: "100%", height: 200, borderRadius: 12, marginTop: 12,
  },

  noteContainer: {
    flexDirection: "row", gap: 8, marginTop: 12,
    padding: 12, borderRadius: 10,
  },
  evidenceNote: {
    fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 19,
    flex: 1, fontStyle: "italic" as const,
  },

  noContentRow: {
    flexDirection: "row", alignItems: "center", gap: 4, marginTop: 8,
  },
  noContentText: { fontFamily: "Inter_400Regular", fontSize: 12 },
});
