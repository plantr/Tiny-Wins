import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Platform,
  TextInput,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/lib/theme-context";
import { useHabits } from "@/lib/habits-context";
import { getWeekStartDate } from "@/lib/utils/date";

const FOUR_LAWS = [
  { key: "obvious" as const, label: "Make it Obvious", icon: "eye", color: "#4DA6FF", tip: "Use implementation intentions. Stack habits. Design your environment so cues are visible." },
  { key: "attractive" as const, label: "Make it Attractive", icon: "heart", color: "#FF6B9D", tip: "Use temptation bundling. Join a culture where your desired behavior is normal." },
  { key: "easy" as const, label: "Make it Easy", icon: "flash", color: "#00E5C3", tip: "Reduce friction. Use the 2-minute rule. Automate and prime your environment." },
  { key: "satisfying" as const, label: "Make it Satisfying", icon: "star", color: "#FFD600", tip: "Track your habits. Never miss twice. Use reward substitution." },
];

// EXTRACTED to @/lib/utils/date.ts
// function getWeekStart() {
//   const now = new Date();
//   const day = now.getDay();
//   const diff = now.getDate() - day + (day === 0 ? -6 : 1);
//   const monday = new Date(now.setDate(diff));
//   return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, "0")}-${String(monday.getDate()).padStart(2, "0")}`;
// }

export default function ReviewScreen() {
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "web" ? 67 : 0;
  const bottomPadding = Platform.OS === "web" ? 34 : 0;
  const { colors } = useTheme();
  const { habits, logs, reviews, addReview } = useHabits();

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [whatWorked, setWhatWorked] = useState("");
  const [whatDidnt, setWhatDidnt] = useState("");
  const [selectedLaw, setSelectedLaw] = useState<typeof FOUR_LAWS[0]["key"] | undefined>();
  const [ratings, setRatings] = useState<Record<string, number>>({});

  const weekStart = getWeekStartDate();
  const weekLogs = logs.filter((l) => l.date >= weekStart);
  const completedThisWeek = weekLogs.filter((l) => l.status === "done").length;
  const missedThisWeek = weekLogs.filter((l) => l.status === "missed").length;

  const habitScores = habits.map((h) => {
    const habitWeekLogs = weekLogs.filter((l) => l.habitId === h.id);
    const done = habitWeekLogs.filter((l) => l.status === "done").length;
    return { habit: h, done, total: 7 };
  });

  const existingReview = reviews.find((r) => r.weekStart === weekStart);

  const missedHabits = weekLogs
    .filter((l) => l.status === "missed" && l.frictionReason)
    .reduce<Record<string, string[]>>((acc, l) => {
      if (!acc[l.habitId]) acc[l.habitId] = [];
      if (l.frictionReason) acc[l.habitId].push(l.frictionReason);
      return acc;
    }, {});

  const handleSubmitReview = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addReview({
      weekStart,
      whatWorked,
      whatDidnt,
      lawFailed: selectedLaw,
      adjustments: [],
      habitRatings: ratings,
    });
    setShowReviewModal(false);
    setWhatWorked("");
    setWhatDidnt("");
    setSelectedLaw(undefined);
    setRatings({});
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topPadding }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 + bottomPadding }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <Text style={[styles.title, { color: colors.text }]}>review</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Reflect on your week with the 4 Laws
          </Text>
        </View>

        {!existingReview && (
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setShowReviewModal(true);
            }}
            style={({ pressed }) => [styles.reviewBtn, { opacity: pressed ? 0.85 : 1 }]}
          >
            <LinearGradient
              colors={[colors.accentPurple, colors.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
            <Ionicons name="create" size={20} color="#FFF" />
            <Text style={styles.reviewBtnText}>write weekly review</Text>
          </Pressable>
        )}

        <View style={[styles.scorecardWrap, { backgroundColor: colors.surface }]}>
          <Text style={[styles.scorecardTitle, { color: colors.text }]}>this week's scorecard</Text>
          <View style={styles.scorecardStats}>
            <View style={styles.scoreStat}>
              <Ionicons name="checkmark-circle" size={20} color={colors.accentCyan} />
              <Text style={[styles.scoreValue, { color: colors.text }]}>{completedThisWeek}</Text>
              <Text style={[styles.scoreLabel, { color: colors.textMuted }]}>completed</Text>
            </View>
            <View style={[styles.scoreDivider, { backgroundColor: colors.cardBorder }]} />
            <View style={styles.scoreStat}>
              <Ionicons name="close-circle" size={20} color={colors.accent} />
              <Text style={[styles.scoreValue, { color: colors.text }]}>{missedThisWeek}</Text>
              <Text style={[styles.scoreLabel, { color: colors.textMuted }]}>missed</Text>
            </View>
            <View style={[styles.scoreDivider, { backgroundColor: colors.cardBorder }]} />
            <View style={styles.scoreStat}>
              <Ionicons name="flame" size={20} color="#FF8C42" />
              <Text style={[styles.scoreValue, { color: colors.text }]}>
                {habits.reduce((max, h) => Math.max(max, h.streak), 0)}
              </Text>
              <Text style={[styles.scoreLabel, { color: colors.textMuted }]}>best streak</Text>
            </View>
          </View>

          {habitScores.length > 0 && (
            <View style={styles.habitScores}>
              {habitScores.map(({ habit, done, total }) => (
                <View key={habit.id} style={styles.habitScoreRow}>
                  <View style={[styles.habitScoreIcon, { backgroundColor: habit.iconColor + "18" }]}>
                    <Ionicons name={habit.icon as any} size={14} color={habit.iconColor} />
                  </View>
                  <Text style={[styles.habitScoreName, { color: colors.text }]} numberOfLines={1}>
                    {habit.title}
                  </Text>
                  <View style={[styles.habitScoreBar, { backgroundColor: colors.surfaceLight }]}>
                    <View
                      style={[styles.habitScoreFill, { width: `${(done / total) * 100}%`, backgroundColor: habit.iconColor }]}
                    />
                  </View>
                  <Text style={[styles.habitScoreCount, { color: colors.textSecondary }]}>{done}/{total}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.lawsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>the 4 laws</Text>
          <Text style={[styles.sectionDesc, { color: colors.textSecondary }]}>
            When a habit fails, diagnose which law broke down
          </Text>
          {FOUR_LAWS.map((law) => (
            <View key={law.key} style={[styles.lawCard, { backgroundColor: colors.surface }]}>
              <View style={styles.lawHeader}>
                <View style={[styles.lawIconWrap, { backgroundColor: law.color + "15" }]}>
                  <Ionicons name={law.icon as any} size={18} color={law.color} />
                </View>
                <Text style={[styles.lawTitle, { color: colors.text }]}>{law.label}</Text>
              </View>
              <Text style={[styles.lawTip, { color: colors.textSecondary }]}>{law.tip}</Text>
            </View>
          ))}
        </View>

        {reviews.length > 0 && (
          <View style={styles.pastSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>review history</Text>
            {reviews.slice().reverse().slice(0, 4).map((review) => (
              <View key={review.id} style={[styles.pastCard, { backgroundColor: colors.surface }]}>
                <Text style={[styles.pastDate, { color: colors.textMuted }]}>Week of {review.weekStart}</Text>
                {review.whatWorked && (
                  <Text style={[styles.pastText, { color: colors.textSecondary }]}>
                    Worked: {review.whatWorked}
                  </Text>
                )}
                {review.lawFailed && (
                  <View style={styles.pastLawBadge}>
                    <Text style={[styles.pastLawText, { color: colors.accent }]}>
                      Focus: {FOUR_LAWS.find((l) => l.key === review.lawFailed)?.label}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

      </ScrollView>

      <Modal visible={showReviewModal} transparent animationType="slide">
        <View style={modalStyles.overlay}>
          <View style={[modalStyles.sheet, { backgroundColor: colors.surface }]}>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <View style={modalStyles.handle} />
              <Text style={[modalStyles.title, { color: colors.text }]}>weekly review</Text>
              <Text style={[modalStyles.subtitle, { color: colors.textSecondary }]}>
                Week of {weekStart}
              </Text>

              <Text style={[modalStyles.label, { color: colors.textSecondary }]}>what worked this week?</Text>
              <TextInput
                style={[modalStyles.input, { backgroundColor: colors.surfaceLight, color: colors.text }]}
                placeholder="e.g. Morning routine was consistent..."
                placeholderTextColor={colors.textMuted}
                value={whatWorked}
                onChangeText={setWhatWorked}
                multiline
                maxLength={200}
              />

              <Text style={[modalStyles.label, { color: colors.textSecondary }]}>what didn't work?</Text>
              <TextInput
                style={[modalStyles.input, { backgroundColor: colors.surfaceLight, color: colors.text }]}
                placeholder="e.g. Skipped reading after work..."
                placeholderTextColor={colors.textMuted}
                value={whatDidnt}
                onChangeText={setWhatDidnt}
                multiline
                maxLength={200}
              />

              <Text style={[modalStyles.label, { color: colors.textSecondary }]}>which law broke down?</Text>
              <View style={modalStyles.lawOptions}>
                {FOUR_LAWS.map((law) => (
                  <Pressable
                    key={law.key}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelectedLaw(law.key);
                    }}
                    style={[
                      modalStyles.lawOption,
                      { backgroundColor: colors.surfaceLight },
                      selectedLaw === law.key && { backgroundColor: law.color + "20", borderColor: law.color },
                    ]}
                  >
                    <Ionicons name={law.icon as any} size={16} color={selectedLaw === law.key ? law.color : colors.textMuted} />
                    <Text style={[modalStyles.lawOptionText, { color: selectedLaw === law.key ? law.color : colors.textMuted }]}>
                      {law.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <View style={modalStyles.actions}>
                <Pressable
                  onPress={() => setShowReviewModal(false)}
                  style={[modalStyles.cancelBtn, { backgroundColor: colors.surfaceLight }]}
                >
                  <Text style={[modalStyles.cancelText, { color: colors.textSecondary }]}>Cancel</Text>
                </Pressable>
                <Pressable onPress={handleSubmitReview} style={modalStyles.submitBtn}>
                  <LinearGradient
                    colors={[colors.accentPurple, colors.accent]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFill}
                  />
                  <Text style={modalStyles.submitText}>save review</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20 },
  header: { marginBottom: 20 },
  title: { fontFamily: "Inter_700Bold", fontSize: 28, marginBottom: 4 },
  subtitle: { fontFamily: "Inter_400Regular", fontSize: 14 },
  scorecardWrap: { borderRadius: 20, padding: 20, marginBottom: 24 },
  scorecardTitle: { fontFamily: "Inter_600SemiBold", fontSize: 16, marginBottom: 16 },
  scorecardStats: { flexDirection: "row", alignItems: "center", justifyContent: "space-around", marginBottom: 20 },
  scoreStat: { alignItems: "center", gap: 4 },
  scoreValue: { fontFamily: "Inter_700Bold", fontSize: 24 },
  scoreLabel: { fontFamily: "Inter_400Regular", fontSize: 11 },
  scoreDivider: { width: 1, height: 40 },
  habitScores: { gap: 10 },
  habitScoreRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  habitScoreIcon: { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  habitScoreName: { fontFamily: "Inter_500Medium", fontSize: 13, width: 80 },
  habitScoreBar: { flex: 1, height: 6, borderRadius: 3, overflow: "hidden" },
  habitScoreFill: { height: "100%", borderRadius: 3 },
  habitScoreCount: { fontFamily: "Inter_500Medium", fontSize: 12, width: 30, textAlign: "right" },
  lawsSection: { marginBottom: 24 },
  sectionTitle: { fontFamily: "Inter_600SemiBold", fontSize: 18, marginBottom: 6 },
  sectionDesc: { fontFamily: "Inter_400Regular", fontSize: 13, marginBottom: 14 },
  lawCard: { borderRadius: 14, padding: 14, marginBottom: 8 },
  lawHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 6 },
  lawIconWrap: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  lawTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  lawTip: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 19 },
  pastSection: { marginBottom: 24 },
  pastCard: { borderRadius: 14, padding: 14, marginBottom: 8 },
  pastDate: { fontFamily: "Inter_500Medium", fontSize: 12, marginBottom: 6 },
  pastText: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 19 },
  pastLawBadge: { marginTop: 8 },
  pastLawText: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  reviewBtn: {
    height: 52, borderRadius: 16, overflow: "hidden",
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 20,
  },
  reviewBtnText: { fontFamily: "Inter_700Bold", fontSize: 16, color: "#FFF" },
});

const modalStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: "85%" },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.2)", alignSelf: "center", marginBottom: 20,
  },
  title: { fontFamily: "Inter_700Bold", fontSize: 22, marginBottom: 4 },
  subtitle: { fontFamily: "Inter_400Regular", fontSize: 14, marginBottom: 20 },
  label: { fontFamily: "Inter_600SemiBold", fontSize: 14, marginBottom: 8, marginTop: 12 },
  input: {
    borderRadius: 14, padding: 14, fontFamily: "Inter_500Medium", fontSize: 15,
    minHeight: 70, textAlignVertical: "top" as const,
    borderWidth: 0, outlineStyle: "none" as any,
  },
  lawOptions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  lawOption: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12,
    borderWidth: 1.5, borderColor: "transparent",
  },
  lawOptionText: { fontFamily: "Inter_500Medium", fontSize: 12 },
  actions: { flexDirection: "row", gap: 10, marginTop: 24, paddingBottom: 20 },
  cancelBtn: {
    flex: 1, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center",
  },
  cancelText: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
  submitBtn: {
    flex: 2, height: 48, borderRadius: 14, overflow: "hidden",
    alignItems: "center", justifyContent: "center",
  },
  submitText: { fontFamily: "Inter_700Bold", fontSize: 15, color: "#FFF" },
});
