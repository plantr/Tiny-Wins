import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { useTheme } from "@/lib/theme-context";
import { useHabits } from "@/lib/habits-context";
import { IDENTITY_AREAS } from "@/lib/identity-context";
import { buildCustomFrequency, parseCustomFrequency } from "@/lib/utils/frequency";
import { COLOR_OPTIONS } from "@/components/shared/constants";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import HabitPreviewCard from "@/components/habits/HabitPreviewCard";
import EditHabitForm from "@/components/habits/EditHabitForm";

export default function EditHabitScreen() {
  const { colors } = useTheme();
  const { habits, updateHabit, removeHabit } = useHabits();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const topPadding = Platform.OS === "web" ? 67 : 0;
  const bottomPadding = Platform.OS === "web" ? 34 : 0;

  const habit = habits.find((h) => h.id === id);
  const initColorIdx = habit ? COLOR_OPTIONS.findIndex((c) => c.color === habit.iconColor) : 0;
  const [title, setTitle] = useState(habit?.title ?? "");
  const [selectedIcon, setSelectedIcon] = useState(habit?.icon ?? "water");
  const [selectedColorIdx, setSelectedColorIdx] = useState(initColorIdx >= 0 ? initColorIdx : 0);
  const [goal, setGoal] = useState(habit?.goal?.toString() ?? "1");
  const [selectedUnit, setSelectedUnit] = useState(habit?.unit ?? "times");
  const [selectedFrequency, setSelectedFrequency] = useState(() => {
    const f = habit?.frequency ?? "Daily";
    if (["Daily", "Weekdays", "Weekends", "3x per week"].includes(f)) return f;
    return "Custom";
  });
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const initCustom = parseCustomFrequency(
    !["Daily", "Weekdays", "Weekends", "3x per week"].includes(habit?.frequency ?? "Daily")
      ? (habit?.frequency ?? "")
      : ""
  );
  const [customInterval, setCustomInterval] = useState(initCustom.interval);
  const [customPeriod, setCustomPeriod] = useState<"days" | "weeks">(initCustom.period);
  const [customDays, setCustomDays] = useState<string[]>(initCustom.days);

  const toggleDay = (day: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCustomDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const resolvedFrequency = selectedFrequency === "Custom" ? buildCustomFrequency(customInterval, customPeriod, customDays) : selectedFrequency;
  const isCustomIdentity = habit?.identityAreaId ? !IDENTITY_AREAS.find((a) => a.id === habit.identityAreaId) : false;
  const [customIdentity, setCustomIdentity] = useState(isCustomIdentity ? (habit?.identityAreaId ?? "") : "");
  const [selectedIdentityId, setSelectedIdentityId] = useState(isCustomIdentity ? "custom" : (habit?.identityAreaId ?? ""));

  const [intentionBehaviour, setIntentionBehaviour] = useState(habit?.implementationIntention?.behaviour ?? "");
  const [intentionTime, setIntentionTime] = useState(habit?.implementationIntention?.time ?? "");
  const [intentionLocation, setIntentionLocation] = useState(habit?.implementationIntention?.location ?? "");
  const [timeMode, setTimeMode] = useState<"any" | "specific">(habit?.reminderTime ? "specific" : "any");
  const parseReminder = (rt: string) => {
    const match = rt.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (match) return { h: match[1], m: match[2], p: match[3].toUpperCase() as "AM" | "PM" };
    return { h: "7", m: "00", p: "AM" as const };
  };
  const initReminder = parseReminder(habit?.reminderTime ?? "");
  const [reminderHour, setReminderHour] = useState(initReminder.h);
  const [reminderMinute, setReminderMinute] = useState(initReminder.m);
  const [reminderPeriod, setReminderPeriod] = useState<"AM" | "PM">(initReminder.p);
  const [stackAnchor, setStackAnchor] = useState(habit?.stackAnchor ?? "");
  const [twoMinVersion, setTwoMinVersion] = useState(habit?.versions?.twoMin ?? "");
  const [standardVersion, setStandardVersion] = useState(habit?.versions?.standard ?? "");
  const [stretchVersion, setStretchVersion] = useState(habit?.versions?.stretch ?? "");
  const selectedColor = COLOR_OPTIONS[selectedColorIdx] || COLOR_OPTIONS[0];
  const canSave = title.trim().length > 0 && parseInt(goal) > 0;
  const inputBorder = (field: string) => focusedField === field ? { borderColor: colors.accent } : {};
  const focusProps = (field: string) => ({ onFocus: () => setFocusedField(field), onBlur: () => setFocusedField(null) });

  const handleSave = () => {
    if (!canSave || !habit) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const resolvedIdentity = selectedIdentityId === "custom" ? customIdentity.trim() || undefined : selectedIdentityId || undefined;

    updateHabit(habit.id, {
      title: title.trim(),
      icon: selectedIcon,
      iconColor: selectedColor.color,
      gradientColors: selectedColor.gradient,
      goal: parseInt(goal) || 1,
      unit: selectedUnit,
      frequency: resolvedFrequency,
      identityAreaId: resolvedIdentity,
      implementationIntention: intentionBehaviour.trim()
        ? {
            behaviour: intentionBehaviour.trim(),
            time: timeMode === "specific" ? `${reminderHour}:${reminderMinute} ${reminderPeriod}` : intentionTime.trim(),
            location: intentionLocation.trim(),
          }
        : undefined,
      reminderTime: timeMode === "specific" ? `${reminderHour}:${reminderMinute} ${reminderPeriod}` : undefined,
      stackAnchor: stackAnchor.trim() || undefined,
      versions: twoMinVersion.trim() || standardVersion.trim()
        ? {
            twoMin: twoMinVersion.trim() || title.trim(),
            standard: standardVersion.trim() || title.trim(),
            stretch: stretchVersion.trim() || undefined,
          }
        : undefined,
    });
    router.back();
  };

  const handleDelete = () => {
    if (!habit) return;
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (!habit) return;
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    setShowDeleteModal(false);
    removeHabit(habit.id);
    router.back();
  };

  if (!habit) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ color: colors.textMuted, fontFamily: "Inter_500Medium" }}>habit not found</Text>
      </View>
    );
  }

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
            <Text style={[styles.headerTitle, { color: colors.text }]}>edit habit</Text>
            <Pressable
              onPress={handleDelete}
              style={[styles.headerButton, { backgroundColor: colors.surface }]}
            >
              <Ionicons name="trash-outline" size={20} color={"#FF3B7F"} />
            </Pressable>
          </View>

          <HabitPreviewCard
            title={title}
            icon={selectedIcon}
            selectedColor={selectedColor}
            currentProgress={habit.current.toString()}
            goal={goal}
            unit={selectedUnit}
          />

          <EditHabitForm
            title={title}
            setTitle={setTitle}
            selectedIcon={selectedIcon}
            setSelectedIcon={setSelectedIcon}
            selectedColorIdx={selectedColorIdx}
            setSelectedColorIdx={setSelectedColorIdx}
            selectedColor={selectedColor}
            goal={goal}
            setGoal={setGoal}
            selectedUnit={selectedUnit}
            setSelectedUnit={setSelectedUnit}
            selectedFrequency={selectedFrequency}
            setSelectedFrequency={setSelectedFrequency}
            customInterval={customInterval}
            setCustomInterval={setCustomInterval}
            customPeriod={customPeriod}
            setCustomPeriod={setCustomPeriod}
            customDays={customDays}
            toggleDay={toggleDay}
            selectedIdentityId={selectedIdentityId}
            setSelectedIdentityId={setSelectedIdentityId}
            customIdentity={customIdentity}
            setCustomIdentity={setCustomIdentity}
            intentionBehaviour={intentionBehaviour}
            setIntentionBehaviour={setIntentionBehaviour}
            intentionTime={intentionTime}
            setIntentionTime={setIntentionTime}
            intentionLocation={intentionLocation}
            setIntentionLocation={setIntentionLocation}
            timeMode={timeMode}
            setTimeMode={setTimeMode}
            reminderHour={reminderHour}
            setReminderHour={setReminderHour}
            reminderMinute={reminderMinute}
            setReminderMinute={setReminderMinute}
            reminderPeriod={reminderPeriod}
            setReminderPeriod={setReminderPeriod}
            stackAnchor={stackAnchor}
            setStackAnchor={setStackAnchor}
            twoMinVersion={twoMinVersion}
            setTwoMinVersion={setTwoMinVersion}
            standardVersion={standardVersion}
            setStandardVersion={setStandardVersion}
            stretchVersion={stretchVersion}
            setStretchVersion={setStretchVersion}
            inputBorder={inputBorder}
            focusProps={focusProps}
            colors={colors}
          />
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
            <Text style={styles.saveText}>save changes</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      <ConfirmationModal
        visible={showDeleteModal}
        icon="trash-outline"
        iconColor="#FF3B7F"
        title="delete habit"
        message={`are you sure you want to delete "${habit?.title}"? this can't be undone.`}
        confirmLabel="delete"
        confirmColor="#FF3B7F"
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: { fontFamily: "Inter_700Bold", fontSize: 18 },
  headerButton: {
    width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center",
  },
  bottomBar: { paddingHorizontal: 20, paddingTop: 12 },
  saveButton: {
    height: 52, borderRadius: 16, flexDirection: "row",
    alignItems: "center", justifyContent: "center", gap: 8, overflow: "hidden",
  },
  saveText: { fontFamily: "Inter_700Bold", fontSize: 16, color: "#FFF" },
});
