import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  TextInput,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useTheme } from "@/lib/theme-context";
import { useHabits } from "@/lib/habits-context";
import { buildCustomFrequency, DAYS_LIST } from "@/lib/utils/frequency";

const ICON_OPTIONS: { name: string; label: string }[] = [
  { name: "water", label: "Water" },
  { name: "fitness", label: "Exercise" },
  { name: "book", label: "Reading" },
  { name: "leaf", label: "Meditation" },
  { name: "walk", label: "Walking" },
  { name: "bed", label: "Sleep" },
  { name: "nutrition", label: "Nutrition" },
  { name: "musical-notes", label: "Music" },
  { name: "code-slash", label: "Coding" },
  { name: "pencil", label: "Writing" },
  { name: "barbell", label: "Gym" },
  { name: "bicycle", label: "Cycling" },
];

const COLOR_OPTIONS: { color: string; gradient: readonly [string, string, ...string[]] }[] = [
  { color: "#FF3B7F", gradient: ["#FF3B7F", "#FF6B9D", "#FF8CB0"] },
  { color: "#FF8C42", gradient: ["#FF8C42", "#FFB347", "#FFCF70"] },
  { color: "#7B61FF", gradient: ["#7B61FF", "#9B87FF", "#B8A5FF"] },
  { color: "#00E5C3", gradient: ["#00E5C3", "#00C4A7", "#00A88B"] },
  { color: "#FFD600", gradient: ["#FFD600", "#FFE34D", "#FFF080"] },
  { color: "#FF6B9D", gradient: ["#FF6B9D", "#FF3B7F", "#7B61FF"] },
  { color: "#4DA6FF", gradient: ["#4DA6FF", "#2D8CFF", "#0066FF"] },
  { color: "#FF4D6A", gradient: ["#FF4D6A", "#FF8C42", "#00E5C3"] },
];

const FREQUENCY_OPTIONS = ["Daily", "Weekdays", "Weekends", "3x per week", "Custom"];
const UNIT_OPTIONS = ["times", "minutes", "hours", "glasses", "pages", "steps", "visits"];

export default function AddHabitScreen() {
  const { colors, isDark } = useTheme();
  const { addHabit, habits } = useHabits();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "web" ? 67 : 0;
  const bottomPadding = Platform.OS === "web" ? 34 : 0;

  const [title, setTitle] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("water");
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [goal, setGoal] = useState("1");
  const [selectedUnit, setSelectedUnit] = useState("times");
  const [selectedFrequency, setSelectedFrequency] = useState("Daily");
  const [customInterval, setCustomInterval] = useState("1");
  const [customPeriod, setCustomPeriod] = useState<"days" | "weeks">("weeks");
  const [customDays, setCustomDays] = useState<string[]>([]);
  const [stackAnchor, setStackAnchor] = useState("");
  const [showStacking, setShowStacking] = useState(false);

  const toggleDay = (day: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCustomDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const resolvedFrequency = selectedFrequency === "Custom" ? buildCustomFrequency(customInterval, customPeriod, customDays) : selectedFrequency;

  const selectedColor = COLOR_OPTIONS[selectedColorIdx];

  const canSave = title.trim().length > 0 && parseInt(goal) > 0;

  const handleSave = () => {
    if (!canSave) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addHabit({
      title: title.trim(),
      icon: selectedIcon,
      iconColor: selectedColor.color,
      gradientColors: selectedColor.gradient,
      goal: parseInt(goal) || 1,
      unit: selectedUnit,
      frequency: resolvedFrequency,
      stackAnchor: stackAnchor || undefined,
    });
    router.back();
  };

  return (
    <View style={[styles.container, { paddingTop: topPadding, backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={90}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 + bottomPadding }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
            <Pressable
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.back(); }}
              style={[styles.headerButton, { backgroundColor: colors.surface }]}
            >
              <Feather name="arrow-left" size={22} color={colors.text} />
            </Pressable>
            <Text style={[styles.headerTitle, { color: colors.text }]}>new habit</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.previewContainer}>
            <View style={styles.previewCard}>
              <LinearGradient
                colors={selectedColor.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.previewHeader}>
                <View style={styles.previewIconCircle}>
                  <Ionicons name={selectedIcon as any} size={18} color={selectedColor.color} />
                </View>
                <Text style={styles.previewTitle}>{title || "Habit name"}</Text>
              </View>
              <View style={styles.previewBottom}>
                <Text style={styles.previewGoal}>0 of {goal || "1"}</Text>
                <Text style={styles.previewUnit}>{selectedUnit}</Text>
              </View>
            </View>
          </View>

          <View style={styles.formSection}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Name</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
              <TextInput
                style={[styles.textInput, { color: colors.text }]}
                placeholder="e.g. Drink Water, Run, Read..."
                placeholderTextColor={colors.textMuted}
                value={title}
                onChangeText={setTitle}
                maxLength={30}
                autoFocus
              />
            </View>
          </View>

          <View style={styles.formSection}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Icon</Text>
            <View style={styles.iconGrid}>
              {ICON_OPTIONS.map((opt) => {
                const isSelected = opt.name === selectedIcon;
                return (
                  <Pressable
                    key={opt.name}
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedIcon(opt.name); }}
                    style={[
                      styles.iconOption,
                      { backgroundColor: colors.surface, borderColor: isSelected ? selectedColor.color : "transparent" },
                    ]}
                  >
                    <Ionicons name={opt.name as any} size={22} color={isSelected ? selectedColor.color : colors.textMuted} />
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.formSection}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Color</Text>
            <View style={styles.colorRow}>
              {COLOR_OPTIONS.map((opt, idx) => {
                const isSelected = idx === selectedColorIdx;
                return (
                  <Pressable
                    key={opt.color}
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedColorIdx(idx); }}
                    style={[styles.colorOption, isSelected && { borderWidth: 2.5, borderColor: opt.color }]}
                  >
                    <LinearGradient
                      colors={opt.gradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.colorSwatch}
                    />
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.formSection}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>target</Text>
            <View style={styles.goalRow}>
              <View style={[styles.goalInputWrap, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    const v = Math.max(1, (parseInt(goal) || 1) - 1);
                    setGoal(v.toString());
                  }}
                  style={styles.goalButton}
                >
                  <Feather name="minus" size={18} color={colors.textSecondary} />
                </Pressable>
                <TextInput
                  style={[styles.goalInput, { color: colors.text }]}
                  value={goal}
                  onChangeText={(t) => setGoal(t.replace(/[^0-9]/g, ""))}
                  keyboardType="number-pad"
                  maxLength={4}
                />
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    const v = (parseInt(goal) || 0) + 1;
                    setGoal(v.toString());
                  }}
                  style={styles.goalButton}
                >
                  <Feather name="plus" size={18} color={colors.textSecondary} />
                </Pressable>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.unitScroll}
              >
                {UNIT_OPTIONS.map((u) => (
                  <Pressable
                    key={u}
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedUnit(u); }}
                    style={[
                      styles.unitPill,
                      { backgroundColor: colors.surface },
                      u === selectedUnit && { backgroundColor: selectedColor.color + "20", borderColor: selectedColor.color },
                    ]}
                  >
                    <Text
                      style={[
                        styles.unitText,
                        { color: colors.textMuted },
                        u === selectedUnit && { color: selectedColor.color },
                      ]}
                    >
                      {u}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </View>

          <View style={styles.formSection}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Frequency</Text>
            <View style={styles.frequencyRow}>
              {FREQUENCY_OPTIONS.map((f) => (
                <Pressable
                  key={f}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedFrequency(f); }}
                  style={[
                    styles.frequencyPill,
                    { backgroundColor: colors.surface },
                    f === selectedFrequency && { backgroundColor: selectedColor.color + "20", borderColor: selectedColor.color },
                  ]}
                >
                  <Text
                    style={[
                      styles.frequencyText,
                      { color: colors.textMuted },
                      f === selectedFrequency && { color: selectedColor.color },
                    ]}
                  >
                    {f}
                  </Text>
                </Pressable>
              ))}
            </View>

            {selectedFrequency === "Custom" && (
              <View style={[styles.customPanel, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
                <View style={styles.customRow}>
                  <Text style={[styles.customLabel, { color: colors.textSecondary }]}>repeat every</Text>
                  <View style={[styles.customIntervalWrap, { backgroundColor: colors.surfaceLight }]}>
                    <Pressable
                      onPress={() => {
                        const v = Math.max(1, (parseInt(customInterval) || 1) - 1);
                        setCustomInterval(v.toString());
                      }}
                      style={styles.customIntervalBtn}
                    >
                      <Ionicons name="remove" size={18} color={colors.textMuted} />
                    </Pressable>
                    <TextInput
                      style={[styles.customIntervalInput, { color: colors.text }]}
                      value={customInterval}
                      onChangeText={(t) => setCustomInterval(t.replace(/[^0-9]/g, ""))}
                      keyboardType="number-pad"
                      maxLength={2}
                    />
                    <Pressable
                      onPress={() => {
                        const v = (parseInt(customInterval) || 0) + 1;
                        setCustomInterval(v.toString());
                      }}
                      style={styles.customIntervalBtn}
                    >
                      <Ionicons name="add" size={18} color={colors.textMuted} />
                    </Pressable>
                  </View>
                  <View style={styles.customPeriodRow}>
                    {(["days", "weeks"] as const).map((p) => (
                      <Pressable
                        key={p}
                        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setCustomPeriod(p); }}
                        style={[
                          styles.customPeriodPill,
                          { backgroundColor: colors.surfaceLight },
                          p === customPeriod && { backgroundColor: selectedColor.color + "20", borderColor: selectedColor.color },
                        ]}
                      >
                        <Text style={[styles.customPeriodText, { color: colors.textMuted }, p === customPeriod && { color: selectedColor.color }]}>
                          {p}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {customPeriod === "weeks" && (
                  <View style={styles.customDaysSection}>
                    <Text style={[styles.customLabel, { color: colors.textSecondary, marginBottom: 10 }]}>on these days</Text>
                    <View style={styles.customDaysRow}>
                      {DAYS_LIST.map((day) => (
                        <Pressable
                          key={day}
                          onPress={() => toggleDay(day)}
                          style={[
                            styles.customDayBtn,
                            { backgroundColor: colors.surfaceLight },
                            customDays.includes(day) && { backgroundColor: selectedColor.color + "20", borderColor: selectedColor.color },
                          ]}
                        >
                          <Text style={[styles.customDayText, { color: colors.textMuted }, customDays.includes(day) && { color: selectedColor.color }]}>
                            {day}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                )}

                <View style={[styles.customSummaryBar, { backgroundColor: colors.surfaceLight }]}>
                  <Ionicons name="calendar-outline" size={14} color={selectedColor.color} />
                  <Text style={[styles.customSummaryText, { color: colors.text }]}>{buildCustomFrequency(customInterval, customPeriod, customDays)}</Text>
                </View>
              </View>
            )}
          </View>

          <View style={styles.formSection}>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowStacking(!showStacking);
              }}
              style={styles.stackingHeader}
            >
              <Text style={[styles.label, { color: colors.textSecondary, marginBottom: 0 }]}>habit stacking</Text>
              <Ionicons
                name={showStacking ? "chevron-up" : "chevron-down"}
                size={18}
                color={colors.textMuted}
              />
            </Pressable>

            {showStacking && (
              <View style={{ marginTop: 12 }}>
                {habits.length > 0 ? (
                  <>
                    <Text style={[styles.stackingLabel, { color: colors.textMuted }]}>pick an existing habit</Text>
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                      {habits.map((h) => (
                        <Pressable
                          key={h.id}
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            setStackAnchor(stackAnchor === h.title ? "" : h.title);
                          }}
                          style={[
                            styles.stackChip,
                            { backgroundColor: colors.surface },
                            stackAnchor === h.title && { backgroundColor: selectedColor.color + "20", borderColor: selectedColor.color },
                          ]}
                        >
                          <Ionicons name={h.icon as any} size={14} color={stackAnchor === h.title ? selectedColor.color : colors.textMuted} />
                          <Text
                            style={[
                              styles.stackChipText,
                              { color: colors.textMuted },
                              stackAnchor === h.title && { color: selectedColor.color },
                            ]}
                          >
                            {h.title}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                    <Text style={[styles.stackingLabel, { color: colors.textMuted }]}>or type a custom anchor</Text>
                  </>
                ) : (
                  <Text style={[styles.stackingLabel, { color: colors.textMuted }]}>after I...</Text>
                )}
                <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
                  <TextInput
                    style={[styles.textInput, { color: colors.text }]}
                    placeholder="e.g. pour my morning coffee"
                    placeholderTextColor={colors.textMuted}
                    value={stackAnchor}
                    onChangeText={setStackAnchor}
                    maxLength={60}
                  />
                </View>
              </View>
            )}
          </View>
        </ScrollView>

        <View style={[styles.bottomBar, { paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 12, backgroundColor: colors.background }]}>
          <Pressable
            onPress={handleSave}
            disabled={!canSave}
            style={[styles.saveButton, { opacity: canSave ? 1 : 0.4 }]}
          >
            <LinearGradient
              colors={canSave ? [selectedColor.gradient[0], selectedColor.gradient[1]] : ["#555", "#444"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
            <Ionicons name="checkmark" size={20} color="#FFF" />
            <Text style={styles.saveText}>Create Habit</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
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
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
  },
  headerButton: {
    width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center",
  },
  previewContainer: {
    alignItems: "center",
    marginBottom: 28,
  },
  previewCard: {
    width: 160,
    height: 180,
    borderRadius: 20,
    overflow: "hidden",
    padding: 16,
    justifyContent: "space-between",
  },
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  previewIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  previewTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: "#FFFFFF",
    flexShrink: 1,
  },
  previewBottom: {
    alignItems: "flex-start",
  },
  previewGoal: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    color: "#FFFFFF",
  },
  previewUnit: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
  },
  formSection: {
    marginBottom: 24,
  },
  label: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    marginBottom: 10,
  },
  inputContainer: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  textInput: {
    fontFamily: "Inter_500Medium",
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  iconOption: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  colorRow: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    padding: 3,
    borderWidth: 2,
    borderColor: "transparent",
  },
  colorSwatch: {
    flex: 1,
    borderRadius: 17,
  },
  goalRow: {
    gap: 12,
  },
  goalInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  goalButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  goalInput: {
    flex: 1,
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    textAlign: "center",
    paddingVertical: 12,
  },
  unitScroll: {
    gap: 8,
    paddingVertical: 4,
  },
  unitPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  unitText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
  frequencyRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  frequencyPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  frequencyText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
  customPanel: {
    marginTop: 14,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 16,
  },
  customRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 10,
  },
  customLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
  customIntervalWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    overflow: "hidden",
  },
  customIntervalBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  customIntervalInput: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    textAlign: "center",
    width: 36,
    paddingVertical: 6,
  },
  customPeriodRow: {
    flexDirection: "row",
    gap: 6,
  },
  customPeriodPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  customPeriodText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
  customDaysSection: {
    marginTop: 2,
  },
  customDaysRow: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
  },
  customDayBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  customDayText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },
  customSummaryBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  customSummaryText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  saveButton: {
    height: 52,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    overflow: "hidden",
  },
  saveText: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: "#FFF",
  },
  stackingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stackingLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    marginBottom: 8,
  },
  stackChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  stackChipText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
});
