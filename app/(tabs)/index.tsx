import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useTheme } from "@/lib/theme-context";
import { useHabits } from "@/lib/habits-context";
import { getTodayStr } from "@/lib/utils/date";
import { usePremium } from "@/lib/premium-context";
import { TodayWidget } from "@/components/shared/TodayWidget";
import { IdentityBadge } from "@/components/shared/IdentityBadge";
import { DaySelector } from "@/components/habits/DaySelector";
import { HabitGridCard } from "@/components/habits/HabitGridCard";
import { HabitStackView } from "@/components/habits/HabitStackView";
import { EvidenceModal } from "@/components/modals/EvidenceModal";
import { AddHabitChoiceModal } from "@/components/modals/AddHabitChoiceModal";
import { RemindersModal } from "@/components/modals/RemindersModal";
import ConfirmationModal from "@/components/modals/ConfirmationModal";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function TodayScreen() {
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "web" ? 67 : 0;
  const bottomPadding = Platform.OS === "web" ? 34 : 0;
  const { colors } = useTheme();
  const { habits, completeHabit, uncompleteHabit, logs } = useHabits();
  const { canCreateHabit } = usePremium();

  const today = getTodayStr();
  const todayLogs = logs.filter((l) => l.date === today);
  const completedIds = new Set(todayLogs.filter((l) => l.status === "done").map((l) => l.habitId));

  const [evidenceModal, setEvidenceModal] = useState<{ visible: boolean; habitId: string; habitTitle: string }>({
    visible: false,
    habitId: "",
    habitTitle: "",
  });
  const [addChoiceVisible, setAddChoiceVisible] = useState(false);
  const [remindersVisible, setRemindersVisible] = useState(false);
  const [viewMode, setViewMode] = useState<"cards" | "stacks">("cards");
  const [uncompleteModal, setUncompleteModal] = useState<{ visible: boolean; habitId: string; habitTitle: string }>({
    visible: false,
    habitId: "",
    habitTitle: "",
  });

  const completedCount = completedIds.size;
  const totalCount = habits.length;

  const now = new Date();
  const monthYear = `${MONTHS[now.getMonth()]} ${now.getFullYear()}`;

  const handleComplete = useCallback((habitId: string) => {
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;
    setEvidenceModal({ visible: true, habitId, habitTitle: habit.title });
  }, [habits]);

  const handleEvidenceSubmit = useCallback((note: string, imageUri?: string) => {
    completeHabit(evidenceModal.habitId, note.trim() || undefined, undefined, imageUri);
    setEvidenceModal({ visible: false, habitId: "", habitTitle: "" });
  }, [evidenceModal.habitId, completeHabit]);

  const handleEvidenceSkip = useCallback(() => {
    completeHabit(evidenceModal.habitId);
    setEvidenceModal({ visible: false, habitId: "", habitTitle: "" });
  }, [evidenceModal.habitId, completeHabit]);

  const handleEvidenceClose = useCallback(() => {
    setEvidenceModal({ visible: false, habitId: "", habitTitle: "" });
  }, []);

  const handleUncompleteRequest = useCallback((habitId: string) => {
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;
    setUncompleteModal({ visible: true, habitId, habitTitle: habit.title });
  }, [habits]);

  const handleUncompleteConfirm = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    uncompleteHabit(uncompleteModal.habitId);
    setUncompleteModal({ visible: false, habitId: "", habitTitle: "" });
  }, [uncompleteModal.habitId, uncompleteHabit]);

  const handleUncompleteCancel = useCallback(() => {
    setUncompleteModal({ visible: false, habitId: "", habitTitle: "" });
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
            <Text style={[styles.dateLabel, { color: colors.textMuted }]}>{monthYear}</Text>
            <Text testID="today-screen-title" style={[styles.title, { color: colors.text }]}>daily activity</Text>
          </View>
          <View style={styles.headerButtons}>
            <Pressable
              testID="today-add-habit-button"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                if (!canCreateHabit(habits.length)) {
                  router.push({ pathname: "/paywall", params: { trigger: "habit_limit" } });
                  return;
                }
                setAddChoiceVisible(true);
              }}
              style={[styles.headerBtn, { backgroundColor: "#00E5C3" }]}
            >
              <Ionicons name="add" size={30} color="#FFF" />
            </Pressable>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setRemindersVisible(true);
              }}
              style={styles.bellBtn}
            >
              <LinearGradient
                colors={["#FF3B7F", "#FF6B9D"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <Ionicons name="notifications" size={18} color="#FFF" />
            </Pressable>
          </View>
        </View>

        <DaySelector />

        <TodayWidget />

        <IdentityBadge />

        {habits.length > 0 && (
          <View style={[styles.insightCard, { backgroundColor: colors.surface }]}>
            <LinearGradient
              colors={[colors.accentPurple + "08", "transparent"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <Ionicons name="bulb" size={18} color={colors.accentYellow} />
            <Text style={[styles.insightText, { color: colors.textSecondary }]}>
              {completedCount >= totalCount && totalCount > 0
                ? "Every completed habit is a vote for your new identity. Keep casting those votes!"
                : completedCount > 0
                  ? `You've built ${completedCount} piece${completedCount > 1 ? "s" : ""} of evidence for who you're becoming today.`
                  : "Start with the 2-minute version of any habit. Show up, then optimize."}
            </Text>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text testID="today-habits-section" style={[styles.sectionTitle, { color: colors.text }]}>your habits</Text>
            {habits.length > 0 && (
              <View style={[styles.viewToggle, { backgroundColor: colors.surface }]}>
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setViewMode("cards");
                  }}
                  style={[
                    styles.toggleBtn,
                    viewMode === "cards" && { backgroundColor: colors.surfaceLight },
                  ]}
                >
                  <Ionicons name="grid" size={16} color={viewMode === "cards" ? colors.text : colors.textMuted} />
                </Pressable>
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setViewMode("stacks");
                  }}
                  style={[
                    styles.toggleBtn,
                    viewMode === "stacks" && { backgroundColor: colors.surfaceLight },
                  ]}
                >
                  <Ionicons name="git-branch" size={16} color={viewMode === "stacks" ? colors.text : colors.textMuted} />
                </Pressable>
              </View>
            )}
          </View>
          {habits.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
              <Ionicons name="add-circle-outline" size={36} color={colors.textMuted} />
              <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>no habits yet</Text>
              <Text style={[styles.emptyDesc, { color: colors.textMuted }]}>
                Tap + to create your first habit
              </Text>
            </View>
          ) : viewMode === "cards" ? (
            <View style={styles.habitsGrid}>
              {habits.map((habit, i) => (
                <HabitGridCard
                  key={habit.id}
                  habit={habit}
                  index={i}
                  isCompleted={completedIds.has(habit.id)}
                  onComplete={handleComplete}
                  onUncomplete={handleUncompleteRequest}
                />
              ))}
            </View>
          ) : (
            <HabitStackView
              habits={habits}
              completedIds={completedIds}
              onComplete={handleComplete}
              onUncomplete={handleUncompleteRequest}
            />
          )}
        </View>

      </ScrollView>

      <EvidenceModal
        visible={evidenceModal.visible}
        habitTitle={evidenceModal.habitTitle}
        onSubmit={handleEvidenceSubmit}
        onSkip={handleEvidenceSkip}
        onClose={handleEvidenceClose}
      />

      <AddHabitChoiceModal
        visible={addChoiceVisible}
        onClose={() => setAddChoiceVisible(false)}
      />

      <RemindersModal
        visible={remindersVisible}
        onClose={() => setRemindersVisible(false)}
      />

      <ConfirmationModal
        visible={uncompleteModal.visible}
        icon="arrow-undo"
        iconColor="#FF3B7F"
        title="undo completion"
        message={`are you sure you want to unmark "${uncompleteModal.habitTitle}" as done?`}
        confirmLabel="undo"
        confirmColor="#FF3B7F"
        onConfirm={handleUncompleteConfirm}
        onCancel={handleUncompleteCancel}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 },
  dateLabel: { fontFamily: "Inter_400Regular", fontSize: 14, marginBottom: 4 },
  title: { fontFamily: "Inter_700Bold", fontSize: 28 },
  headerButtons: { flexDirection: "row", gap: 10, marginTop: 6 },
  headerBtn: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  bellBtn: { width: 42, height: 42, borderRadius: 14, overflow: "hidden", alignItems: "center", justifyContent: "center" },
  section: { marginBottom: 16 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  sectionTitle: { fontFamily: "Inter_600SemiBold", fontSize: 18 },
  viewToggle: { flexDirection: "row", borderRadius: 10, padding: 3, gap: 2 },
  toggleBtn: { width: 32, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  habitsGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 12 },
  emptyState: { borderRadius: 20, padding: 32, alignItems: "center", gap: 8 },
  emptyTitle: { fontFamily: "Inter_600SemiBold", fontSize: 16 },
  emptyDesc: { fontFamily: "Inter_400Regular", fontSize: 14, textAlign: "center" },
  insightCard: { borderRadius: 16, padding: 16, marginBottom: 24, overflow: "hidden", flexDirection: "row", alignItems: "flex-start", gap: 12 },
  insightText: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 20, flex: 1 },
});
