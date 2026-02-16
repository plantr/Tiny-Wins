import React from "react";
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
import { useTheme } from "@/lib/theme-context";
import { useHabits } from "@/lib/habits-context";
import { useIdentity } from "@/lib/identity-context";
import { useBuilderFormState, STEPS } from "@/lib/hooks/useBuilderFormState";
import { IdentityStep } from "@/components/habits/builder/IdentityStep";
import { HabitStep } from "@/components/habits/builder/HabitStep";
import { IntentionStep } from "@/components/habits/builder/IntentionStep";
import { StackingStep } from "@/components/habits/builder/StackingStep";
import { VersionsStep } from "@/components/habits/builder/VersionsStep";
import { SummaryStep } from "@/components/habits/builder/SummaryStep";

export default function GuidedBuilderScreen() {
  const { colors } = useTheme();
  const { addHabit, habits } = useHabits();
  const { selectedAreaIds } = useIdentity();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "web" ? 67 : 0;
  const bottomPadding = Platform.OS === "web" ? 34 : 0;

  const {
    step, currentStep, progress,
    identityAreaId, setIdentityAreaId, customIdentity, setCustomIdentity,
    title, setTitle, icon, setIcon, colorIdx, setColorIdx,
    goal, setGoal, unit, setUnit,
    frequency, setFrequency, customInterval, setCustomInterval,
    customPeriod, setCustomPeriod, customDays, toggleDay,
    intentionBehaviour, setIntentionBehaviour, intentionTime, setIntentionTime,
    intentionLocation, setIntentionLocation,
    timeMode, setTimeMode, reminderHour, setReminderHour,
    reminderMinute, setReminderMinute, reminderPeriod, setReminderPeriod,
    stackAnchor, setStackAnchor,
    twoMinVersion, setTwoMinVersion, standardVersion, setStandardVersion,
    stretchVersion, setStretchVersion, cueType, setCueType,
    selectedColor, resolvedFrequency, inputBorder, focusProps,
    canProceed, handleNext, handleBack, handleCreate,
  } = useBuilderFormState({ selectedAreaIds, habits, addHabit, accentColor: colors.accent });

  const renderStepContent = () => {
    const commonProps = { colors, selectedColor, inputBorder, focusProps };

    switch (step) {
      case 0:
        return (
          <IdentityStep
            {...commonProps}
            identityAreaId={identityAreaId}
            setIdentityAreaId={setIdentityAreaId}
            customIdentity={customIdentity}
            setCustomIdentity={setCustomIdentity}
          />
        );

      case 1:
        return (
          <HabitStep
            {...commonProps}
            title={title}
            setTitle={setTitle}
            icon={icon}
            setIcon={setIcon}
            colorIdx={colorIdx}
            setColorIdx={setColorIdx}
            goal={goal}
            setGoal={setGoal}
            unit={unit}
            setUnit={setUnit}
            frequency={frequency}
            setFrequency={setFrequency}
            customInterval={customInterval}
            setCustomInterval={setCustomInterval}
            customPeriod={customPeriod}
            setCustomPeriod={setCustomPeriod}
            customDays={customDays}
            toggleDay={toggleDay}
          />
        );

      case 2:
        return (
          <IntentionStep
            {...commonProps}
            title={title}
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
          />
        );

      case 3:
        return (
          <StackingStep
            {...commonProps}
            habits={habits}
            stackAnchor={stackAnchor}
            setStackAnchor={setStackAnchor}
            intentionBehaviour={intentionBehaviour}
            title={title}
          />
        );

      case 4:
        return (
          <VersionsStep
            {...commonProps}
            title={title}
            twoMinVersion={twoMinVersion}
            setTwoMinVersion={setTwoMinVersion}
            standardVersion={standardVersion}
            setStandardVersion={setStandardVersion}
            stretchVersion={stretchVersion}
            setStretchVersion={setStretchVersion}
          />
        );

      case 5:
        return (
          <SummaryStep
            {...commonProps}
            title={title}
            icon={icon}
            identityAreaId={identityAreaId}
            customIdentity={customIdentity}
            intentionBehaviour={intentionBehaviour}
            intentionTime={intentionTime}
            intentionLocation={intentionLocation}
            stackAnchor={stackAnchor}
            twoMinVersion={twoMinVersion}
            goal={goal}
            unit={unit}
            resolvedFrequency={resolvedFrequency}
          />
        );

      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { paddingTop: topPadding, backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={90}
      >
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <Pressable
            onPress={handleBack}
            style={[styles.headerButton, { backgroundColor: colors.surface }]}
          >
            <Feather name={step === 0 ? "x" : "arrow-left"} size={22} color={colors.text} />
          </Pressable>
          <View style={styles.progressContainer}>
            <View style={[styles.progressTrack, { backgroundColor: colors.surfaceLight }]}>
              <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: colors.accent }]} />
            </View>
            <Text style={[styles.stepIndicator, { color: colors.textMuted }]}>
              {step + 1}/{STEPS.length}
            </Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 + bottomPadding }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[styles.stepTitle, { color: colors.text }]}>{currentStep.title}</Text>
          <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>{currentStep.subtitle}</Text>
          {renderStepContent()}
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 12, backgroundColor: colors.background }]}>
          {step === STEPS.length - 1 ? (
            <Pressable
              onPress={handleCreate}
              style={({ pressed }) => [styles.nextBtn, { opacity: pressed ? 0.85 : 1 }]}
            >
              <LinearGradient
                colors={["#00E5C3", "#00B89C"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              <Ionicons name="checkmark" size={20} color="#FFF" />
              <Text style={styles.nextBtnText}>create habit</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={handleNext}
              disabled={!canProceed()}
              style={({ pressed }) => [styles.nextBtn, { opacity: canProceed() ? (pressed ? 0.85 : 1) : 0.4 }]}
            >
              <LinearGradient
                colors={canProceed() ? [selectedColor.gradient[0], selectedColor.gradient[1]] : [colors.surfaceLight, colors.surfaceLight]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              <Text style={[styles.nextBtnText, !canProceed() && { color: colors.textMuted }]}>
                {step === 3 || step === 4 ? "Next (or skip)" : "Next"}
              </Text>
              <Feather name="arrow-right" size={18} color={canProceed() ? "#FFF" : colors.textMuted} />
            </Pressable>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, marginBottom: 10,
  },
  headerButton: {
    width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center",
  },
  progressContainer: {
    flex: 1, flexDirection: "row", alignItems: "center", gap: 10, marginHorizontal: 16,
  },
  progressTrack: { flex: 1, height: 4, borderRadius: 2, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 2 },
  stepIndicator: { fontFamily: "Inter_500Medium", fontSize: 12, width: 30 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 24 },
  stepTitle: { fontFamily: "Inter_700Bold", fontSize: 26, marginBottom: 6 },
  stepSubtitle: { fontFamily: "Inter_400Regular", fontSize: 15, marginBottom: 24 },
  footer: { paddingHorizontal: 20, paddingTop: 12 },
  nextBtn: {
    height: 52, borderRadius: 16, overflow: "hidden",
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
  },
  nextBtnText: { fontFamily: "Inter_700Bold", fontSize: 16, color: "#FFF" },
});
