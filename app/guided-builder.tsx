import React, { useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Platform,
  TextInput,
  Dimensions,
  KeyboardAvoidingView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, Feather } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  SlideInRight,
  SlideOutLeft,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useTheme } from "@/lib/theme-context";
import { useHabits, CueType } from "@/lib/habits-context";
import { useIdentity, IDENTITY_AREAS } from "@/lib/identity-context";
import { buildCustomFrequency, DAYS_LIST } from "@/lib/utils/frequency";

const SCREEN_WIDTH = Dimensions.get("window").width;

const STEPS = [
  { id: "identity", title: "identity link", subtitle: "who do you want to become?" },
  { id: "habit", title: "your habit", subtitle: "what will you do?" },
  { id: "intention", title: "implementation intention", subtitle: "when and where?" },
  { id: "stacking", title: "habit stacking", subtitle: "pair it with an existing routine" },
  { id: "versions", title: "the 2-minute rule", subtitle: "start so easy you can't say no" },
  { id: "summary", title: "your habit plan", subtitle: "review and create" },
];

const ICON_OPTIONS = [
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

const COLOR_OPTIONS = [
  { color: "#FF3B7F", gradient: ["#FF3B7F", "#FF6B9D", "#FF8CB0"] as const },
  { color: "#FF8C42", gradient: ["#FF8C42", "#FFB347", "#FFCF70"] as const },
  { color: "#7B61FF", gradient: ["#7B61FF", "#9B87FF", "#B8A5FF"] as const },
  { color: "#00E5C3", gradient: ["#00E5C3", "#00C4A7", "#00A88B"] as const },
  { color: "#FFD600", gradient: ["#FFD600", "#FFE34D", "#FFF080"] as const },
  { color: "#FF6B9D", gradient: ["#FF6B9D", "#FF3B7F", "#7B61FF"] as const },
  { color: "#4DA6FF", gradient: ["#4DA6FF", "#2D8CFF", "#0066FF"] as const },
  { color: "#FF4D6A", gradient: ["#FF4D6A", "#FF8C42", "#00E5C3"] as const },
];

const UNIT_OPTIONS = ["times", "minutes", "hours", "glasses", "pages", "steps", "visits"];

export default function GuidedBuilderScreen() {
  const { colors } = useTheme();
  const { addHabit, habits } = useHabits();
  const { selectedAreaIds } = useIdentity();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "web" ? 67 : 0;
  const bottomPadding = Platform.OS === "web" ? 34 : 0;

  const [step, setStep] = useState(0);
  const [identityAreaId, setIdentityAreaId] = useState(selectedAreaIds[0] || "");
  const [customIdentity, setCustomIdentity] = useState("");
  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState("fitness");
  const [colorIdx, setColorIdx] = useState(0);
  const [goal, setGoal] = useState("1");
  const [unit, setUnit] = useState("times");
  const [frequency, setFrequency] = useState("Daily");
  const [customInterval, setCustomInterval] = useState("1");
  const [customPeriod, setCustomPeriod] = useState<"days" | "weeks">("weeks");
  const [customDays, setCustomDays] = useState<string[]>([]);

  const toggleDay = (day: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCustomDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const resolvedFrequency = frequency === "Custom" ? buildCustomFrequency(customInterval, customPeriod, customDays) : frequency;
  const [intentionBehaviour, setIntentionBehaviour] = useState("");
  const [intentionTime, setIntentionTime] = useState("");
  const [intentionLocation, setIntentionLocation] = useState("");
  const [timeMode, setTimeMode] = useState<"any" | "specific">("any");
  const [reminderHour, setReminderHour] = useState("7");
  const [reminderMinute, setReminderMinute] = useState("00");
  const [reminderPeriod, setReminderPeriod] = useState<"AM" | "PM">("AM");
  const [stackAnchor, setStackAnchor] = useState("");
  const [twoMinVersion, setTwoMinVersion] = useState("");
  const [standardVersion, setStandardVersion] = useState("");
  const [stretchVersion, setStretchVersion] = useState("");
  const [cueType, setCueType] = useState<CueType>("time");
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const selectedColor = COLOR_OPTIONS[colorIdx];
  const currentStep = STEPS[step];
  const progress = (step + 1) / STEPS.length;

  const inputBorder = (field: string) =>
    focusedField === field ? { borderColor: colors.accent } : {};
  const focusProps = (field: string) => ({
    onFocus: () => setFocusedField(field),
    onBlur: () => setFocusedField(null),
  });

  const canProceed = () => {
    if (step === 0) return identityAreaId !== "" || customIdentity.trim().length > 0;
    if (step === 1) return title.trim().length > 0;
    if (step === 2) return intentionBehaviour.trim().length > 0;
    return true;
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (step === 1 && !standardVersion) {
        setStandardVersion(title.trim());
      }
      if (step === 1 && !intentionBehaviour) {
        setIntentionBehaviour(title.trim());
      }
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setStep(step - 1);
    } else {
      router.back();
    }
  };

  const handleCreate = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addHabit({
      title: title.trim(),
      icon,
      iconColor: selectedColor.color,
      gradientColors: selectedColor.gradient,
      goal: parseInt(goal) || 1,
      unit,
      frequency: resolvedFrequency,
      identityAreaId: identityAreaId === "custom" ? customIdentity.trim() : (identityAreaId || undefined),
      implementationIntention: intentionBehaviour ? {
        behaviour: intentionBehaviour,
        time: timeMode === "specific" ? `${reminderHour}:${reminderMinute} ${reminderPeriod}` : intentionTime,
        location: intentionLocation,
      } : undefined,
      reminderTime: timeMode === "specific" ? `${reminderHour}:${reminderMinute} ${reminderPeriod}` : undefined,
      stackAnchor: stackAnchor || undefined,
      versions: twoMinVersion ? {
        twoMin: twoMinVersion,
        standard: standardVersion || title.trim(),
        stretch: stretchVersion || undefined,
      } : undefined,
      currentVersion: "twoMin",
      cueType,
      isGuided: true,
    });
    router.back();
  };

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <View style={stepStyles.content}>
            <View style={[stepStyles.conceptBox, { backgroundColor: colors.surfaceLight }]}>
              <Ionicons name="person" size={18} color={colors.accent} />
              <Text style={[stepStyles.conceptText, { color: colors.textSecondary }]}>
                True behavior change is identity change. Start with who you wish to become.
              </Text>
            </View>
            <Text style={[stepStyles.fieldLabel, { color: colors.textSecondary }]}>
              This habit will support my identity as...
            </Text>
            <View style={stepStyles.chipGrid}>
              {IDENTITY_AREAS.map((area) => (
                <Pressable
                  key={area.id}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setIdentityAreaId(area.id);
                  }}
                  style={[
                    stepStyles.chip,
                    { backgroundColor: colors.surfaceLight },
                    identityAreaId === area.id && { backgroundColor: area.color + "20", borderColor: area.color },
                  ]}
                >
                  <Ionicons name={area.icon as any} size={16} color={identityAreaId === area.id ? area.color : colors.textMuted} />
                  <Text
                    style={[
                      stepStyles.chipText,
                      { color: colors.textMuted },
                      identityAreaId === area.id && { color: area.color },
                    ]}
                  >
                    {area.label}
                  </Text>
                </Pressable>
              ))}
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setIdentityAreaId("custom");
                }}
                style={[
                  stepStyles.chip,
                  { backgroundColor: colors.surfaceLight },
                  identityAreaId === "custom" && { backgroundColor: colors.accent + "20", borderColor: colors.accent },
                ]}
              >
                <Ionicons name="add-circle" size={16} color={identityAreaId === "custom" ? colors.accent : colors.textMuted} />
                <Text
                  style={[
                    stepStyles.chipText,
                    { color: colors.textMuted },
                    identityAreaId === "custom" && { color: colors.accent },
                  ]}
                >
                  custom
                </Text>
              </Pressable>
            </View>
            {identityAreaId === "custom" && (
              <View style={[stepStyles.inputWrap, { backgroundColor: colors.surfaceLight, marginTop: 14 }, inputBorder("customIdentity")]}>
                <TextInput
                  style={[stepStyles.textInput, { color: colors.text }]}
                  placeholder="e.g. a disciplined person, a good parent"
                  placeholderTextColor={colors.textMuted}
                  value={customIdentity}
                  onChangeText={setCustomIdentity}
                  maxLength={40}
                  autoFocus
                  {...focusProps("customIdentity")}
                />
              </View>
            )}
          </View>
        );

      case 1:
        return (
          <View style={stepStyles.content}>
            <Text style={[stepStyles.fieldLabel, { color: colors.textSecondary }]}>habit name</Text>
            <View style={[stepStyles.inputWrap, { backgroundColor: colors.surfaceLight }, inputBorder("title")]}>
              <TextInput
                style={[stepStyles.textInput, { color: colors.text }]}
                placeholder="e.g. Read, Meditate, Run..."
                placeholderTextColor={colors.textMuted}
                value={title}
                onChangeText={setTitle}
                maxLength={30}
                autoFocus
                {...focusProps("title")}
              />
            </View>

            <Text style={[stepStyles.fieldLabel, { color: colors.textSecondary, marginTop: 20 }]}>icon</Text>
            <View style={stepStyles.iconGrid}>
              {ICON_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.name}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setIcon(opt.name);
                  }}
                  style={[
                    stepStyles.iconBtn,
                    { backgroundColor: colors.surfaceLight },
                    icon === opt.name && { borderColor: selectedColor.color, borderWidth: 2 },
                  ]}
                >
                  <Ionicons name={opt.name as any} size={20} color={icon === opt.name ? selectedColor.color : colors.textMuted} />
                </Pressable>
              ))}
            </View>

            <Text style={[stepStyles.fieldLabel, { color: colors.textSecondary, marginTop: 20 }]}>color</Text>
            <View style={stepStyles.colorRow}>
              {COLOR_OPTIONS.map((opt, idx) => (
                <Pressable
                  key={opt.color}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setColorIdx(idx);
                  }}
                  style={[stepStyles.colorBtn, idx === colorIdx && { borderWidth: 2.5, borderColor: opt.color }]}
                >
                  <LinearGradient colors={opt.gradient} style={stepStyles.colorSwatch} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
                </Pressable>
              ))}
            </View>

            <Text style={[stepStyles.fieldLabel, { color: colors.textSecondary, marginTop: 20 }]}>frequency</Text>
            <View style={stepStyles.frequencyRow}>
              {["Daily", "Weekdays", "Weekends", "3x per week", "Custom"].map((f) => (
                <Pressable
                  key={f}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setFrequency(f); }}
                  style={[
                    stepStyles.frequencyPill,
                    { backgroundColor: colors.surfaceLight },
                    f === frequency && { backgroundColor: selectedColor.color + "20", borderColor: selectedColor.color },
                  ]}
                >
                  <Text style={[stepStyles.frequencyText, { color: colors.textMuted }, f === frequency && { color: selectedColor.color }]}>
                    {f}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={[stepStyles.fieldLabel, { color: colors.textSecondary, marginTop: 20 }]}>
              {frequency === "Weekdays" ? "weekday target" : frequency === "Weekends" ? "weekend target" : frequency === "3x per week" ? "per-session target" : frequency === "Custom" ? "per-session target" : "daily target"}
            </Text>
            <View style={[stepStyles.targetRow, { backgroundColor: colors.surfaceLight }]}>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  const v = Math.max(1, (parseInt(goal) || 1) - 1);
                  setGoal(v.toString());
                }}
                style={stepStyles.targetBtn}
              >
                <Feather name="minus" size={20} color={colors.textSecondary} />
              </Pressable>
              <View style={stepStyles.targetCenter}>
                <TextInput
                  style={[stepStyles.targetInput, { color: colors.text }]}
                  value={goal}
                  onChangeText={(t) => setGoal(t.replace(/[^0-9]/g, ""))}
                  keyboardType="number-pad"
                  maxLength={4}
                />
              </View>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  const v = (parseInt(goal) || 0) + 1;
                  setGoal(v.toString());
                }}
                style={stepStyles.targetBtn}
              >
                <Feather name="plus" size={20} color={colors.textSecondary} />
              </Pressable>
            </View>

            <View style={[stepStyles.unitRow, { marginTop: 20 }]}>
              {UNIT_OPTIONS.map((u) => (
                <Pressable
                  key={u}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setUnit(u); }}
                  style={[
                    stepStyles.unitPill,
                    { backgroundColor: colors.surface },
                    u === unit && { backgroundColor: selectedColor.color + "20", borderColor: selectedColor.color },
                  ]}
                >
                  <Text style={[stepStyles.unitText, { color: colors.textMuted }, u === unit && { color: selectedColor.color }]}>{u}</Text>
                </Pressable>
              ))}
            </View>

            {frequency === "Custom" && (
              <View style={[stepStyles.customPanel, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
                <View style={stepStyles.customRow}>
                  <Text style={[stepStyles.customLabel, { color: colors.textSecondary }]}>repeat every</Text>
                  <View style={[stepStyles.customIntervalWrap, { backgroundColor: colors.surfaceLight }]}>
                    <Pressable
                      onPress={() => {
                        const v = Math.max(1, (parseInt(customInterval) || 1) - 1);
                        setCustomInterval(v.toString());
                      }}
                      style={stepStyles.customIntervalBtn}
                    >
                      <Ionicons name="remove" size={18} color={colors.textMuted} />
                    </Pressable>
                    <TextInput
                      style={[stepStyles.customIntervalInput, { color: colors.text }]}
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
                      style={stepStyles.customIntervalBtn}
                    >
                      <Ionicons name="add" size={18} color={colors.textMuted} />
                    </Pressable>
                  </View>
                  <View style={stepStyles.customPeriodRow}>
                    {(["days", "weeks"] as const).map((p) => (
                      <Pressable
                        key={p}
                        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setCustomPeriod(p); }}
                        style={[
                          stepStyles.customPeriodPill,
                          { backgroundColor: colors.surfaceLight },
                          p === customPeriod && { backgroundColor: selectedColor.color + "20", borderColor: selectedColor.color },
                        ]}
                      >
                        <Text style={[stepStyles.customPeriodText, { color: colors.textMuted }, p === customPeriod && { color: selectedColor.color }]}>
                          {p}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {customPeriod === "weeks" && (
                  <View style={stepStyles.customDaysSection}>
                    <Text style={[stepStyles.customLabel, { color: colors.textSecondary, marginBottom: 10 }]}>on these days</Text>
                    <View style={stepStyles.customDaysRow}>
                      {DAYS_LIST.map((day) => (
                        <Pressable
                          key={day}
                          onPress={() => toggleDay(day)}
                          style={[
                            stepStyles.customDayBtn,
                            { backgroundColor: colors.surfaceLight },
                            customDays.includes(day) && { backgroundColor: selectedColor.color + "20", borderColor: selectedColor.color },
                          ]}
                        >
                          <Text style={[stepStyles.customDayText, { color: colors.textMuted }, customDays.includes(day) && { color: selectedColor.color }]}>
                            {day}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                )}

                <View style={[stepStyles.customSummaryBar, { backgroundColor: colors.surfaceLight }]}>
                  <Ionicons name="calendar-outline" size={14} color={selectedColor.color} />
                  <Text style={[stepStyles.customSummaryText, { color: colors.text }]}>{buildCustomFrequency(customInterval, customPeriod, customDays)}</Text>
                </View>
              </View>
            )}
          </View>
        );

      case 2:
        return (
          <View style={stepStyles.content}>
            <View style={[stepStyles.conceptBox, { backgroundColor: colors.surfaceLight }]}>
              <Ionicons name="location" size={18} color={colors.accentOrange} />
              <Text style={[stepStyles.conceptText, { color: colors.textSecondary }]}>
                "I will [BEHAVIOR] at [TIME] in [LOCATION]." People who make a specific plan are more likely to follow through.
              </Text>
            </View>

            <Text style={[stepStyles.fieldLabel, { color: colors.textSecondary }]}>I will...</Text>
            <View style={[stepStyles.inputWrap, { backgroundColor: colors.surfaceLight }, inputBorder("behaviour")]}>
              <TextInput
                style={[stepStyles.textInput, { color: colors.text }]}
                placeholder={`e.g. ${title || "meditate for 10 minutes"}`}
                placeholderTextColor={colors.textMuted}
                value={intentionBehaviour}
                onChangeText={setIntentionBehaviour}
                maxLength={60}
                {...focusProps("behaviour")}
              />
            </View>

            <Text style={[stepStyles.fieldLabel, { color: colors.textSecondary, marginTop: 16 }]}>at...</Text>
            <View style={stepStyles.timeModeRow}>
              <Pressable
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setTimeMode("any"); }}
                style={[
                  stepStyles.timeModePill,
                  { backgroundColor: colors.surfaceLight },
                  timeMode === "any" && { backgroundColor: selectedColor.color + "20", borderColor: selectedColor.color },
                ]}
              >
                <Ionicons name="time-outline" size={14} color={timeMode === "any" ? selectedColor.color : colors.textMuted} />
                <Text style={[stepStyles.timeModeText, { color: timeMode === "any" ? selectedColor.color : colors.textMuted }]}>any time</Text>
              </Pressable>
              <Pressable
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setTimeMode("specific"); }}
                style={[
                  stepStyles.timeModePill,
                  { backgroundColor: colors.surfaceLight },
                  timeMode === "specific" && { backgroundColor: selectedColor.color + "20", borderColor: selectedColor.color },
                ]}
              >
                <Ionicons name="alarm-outline" size={14} color={timeMode === "specific" ? selectedColor.color : colors.textMuted} />
                <Text style={[stepStyles.timeModeText, { color: timeMode === "specific" ? selectedColor.color : colors.textMuted }]}>specific time</Text>
              </Pressable>
            </View>

            {timeMode === "any" ? (
              <View style={[stepStyles.inputWrap, { backgroundColor: colors.surfaceLight, marginTop: 10 }, inputBorder("time")]}>
                <TextInput
                  style={[stepStyles.textInput, { color: colors.text }]}
                  placeholder="e.g. after lunch, in the morning"
                  placeholderTextColor={colors.textMuted}
                  value={intentionTime}
                  onChangeText={setIntentionTime}
                  maxLength={30}
                  {...focusProps("time")}
                />
              </View>
            ) : (
              <View style={[stepStyles.timePickerWrap, { backgroundColor: colors.surfaceLight, borderColor: colors.cardBorder }]}>
                <View style={stepStyles.timePickerRow}>
                  <View style={[stepStyles.timeInputBox, { backgroundColor: colors.surface }]}>
                    <TextInput
                      style={[stepStyles.timeInputText, { color: colors.text }]}
                      value={reminderHour}
                      onChangeText={(t) => {
                        const n = t.replace(/[^0-9]/g, "");
                        if (n === "" || (parseInt(n) >= 1 && parseInt(n) <= 12)) setReminderHour(n);
                      }}
                      keyboardType="number-pad"
                      maxLength={2}
                      {...focusProps("reminderHour")}
                    />
                    <Text style={[stepStyles.timeInputLabel, { color: colors.textMuted }]}>hour</Text>
                  </View>
                  <Text style={[stepStyles.timeColon, { color: colors.textMuted }]}>:</Text>
                  <View style={[stepStyles.timeInputBox, { backgroundColor: colors.surface }]}>
                    <TextInput
                      style={[stepStyles.timeInputText, { color: colors.text }]}
                      value={reminderMinute}
                      onChangeText={(t) => {
                        const n = t.replace(/[^0-9]/g, "");
                        if (n === "" || (parseInt(n) >= 0 && parseInt(n) <= 59)) setReminderMinute(n.length === 1 && parseInt(n) > 5 ? `0${n}` : n);
                      }}
                      keyboardType="number-pad"
                      maxLength={2}
                      {...focusProps("reminderMinute")}
                    />
                    <Text style={[stepStyles.timeInputLabel, { color: colors.textMuted }]}>min</Text>
                  </View>
                  <View style={stepStyles.periodToggle}>
                    <Pressable
                      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setReminderPeriod("AM"); }}
                      style={[
                        stepStyles.periodBtn,
                        { backgroundColor: colors.surface },
                        reminderPeriod === "AM" && { backgroundColor: selectedColor.color + "20" },
                      ]}
                    >
                      <Text style={[stepStyles.periodText, { color: colors.textMuted }, reminderPeriod === "AM" && { color: selectedColor.color }]}>AM</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setReminderPeriod("PM"); }}
                      style={[
                        stepStyles.periodBtn,
                        { backgroundColor: colors.surface },
                        reminderPeriod === "PM" && { backgroundColor: selectedColor.color + "20" },
                      ]}
                    >
                      <Text style={[stepStyles.periodText, { color: colors.textMuted }, reminderPeriod === "PM" && { color: selectedColor.color }]}>PM</Text>
                    </Pressable>
                  </View>
                </View>
                <View style={[stepStyles.reminderNote, { backgroundColor: colors.surface }]}>
                  <Ionicons name="notifications-outline" size={13} color={selectedColor.color} />
                  <Text style={[stepStyles.reminderNoteText, { color: colors.textSecondary }]}>
                    reminder at {reminderHour || "7"}:{reminderMinute || "00"} {reminderPeriod}
                  </Text>
                </View>
              </View>
            )}

            <Text style={[stepStyles.fieldLabel, { color: colors.textSecondary, marginTop: 16 }]}>in...</Text>
            <View style={[stepStyles.inputWrap, { backgroundColor: colors.surfaceLight }, inputBorder("location")]}>
              <TextInput
                style={[stepStyles.textInput, { color: colors.text }]}
                placeholder="e.g. my bedroom, at the park"
                placeholderTextColor={colors.textMuted}
                value={intentionLocation}
                onChangeText={setIntentionLocation}
                maxLength={40}
                {...focusProps("location")}
              />
            </View>

            <View style={[stepStyles.previewBox, { backgroundColor: colors.surface, borderLeftColor: colors.accentOrange }]}>
              <Text style={[stepStyles.previewText, { color: colors.text }]}>
                I will{" "}
                <Text style={{ color: colors.accentOrange }}>
                  {intentionBehaviour || "[behavior]"}
                </Text>
                {" "}at{" "}
                <Text style={{ color: colors.accentPurple }}>
                  {timeMode === "specific" ? `${reminderHour || "7"}:${reminderMinute || "00"} ${reminderPeriod}` : (intentionTime || "[time]")}
                </Text>
                {" "}in{" "}
                <Text style={{ color: colors.accentCyan }}>
                  {intentionLocation || "[location]"}
                </Text>
                .
              </Text>
            </View>
          </View>
        );

      case 3:
        return (
          <View style={stepStyles.content}>
            <View style={[stepStyles.conceptBox, { backgroundColor: colors.surfaceLight }]}>
              <Ionicons name="link" size={18} color={colors.accentPurple} />
              <Text style={[stepStyles.conceptText, { color: colors.textSecondary }]}>
                Pair your new habit with something you already do. "After [CURRENT HABIT], I will [NEW HABIT]."
              </Text>
            </View>

            {habits.length > 0 ? (
              <>
                <Text style={[stepStyles.fieldLabel, { color: colors.textSecondary }]}>pick an existing habit</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                  {habits.map((h) => (
                    <Pressable
                      key={h.id}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setStackAnchor(stackAnchor === h.title ? "" : h.title);
                      }}
                      style={[
                        stepStyles.chip,
                        { backgroundColor: colors.surfaceLight },
                        stackAnchor === h.title && { backgroundColor: colors.accentPurple + "20", borderColor: colors.accentPurple },
                      ]}
                    >
                      <Ionicons name={h.icon as any} size={14} color={stackAnchor === h.title ? colors.accentPurple : colors.textMuted} />
                      <Text
                        style={[
                          stepStyles.chipText,
                          { color: colors.textMuted },
                          stackAnchor === h.title && { color: colors.accentPurple },
                        ]}
                      >
                        {h.title}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <Text style={[stepStyles.fieldLabel, { color: colors.textSecondary }]}>or type a custom anchor</Text>
              </>
            ) : (
              <Text style={[stepStyles.fieldLabel, { color: colors.textSecondary }]}>after I...</Text>
            )}
            <View style={[stepStyles.inputWrap, { backgroundColor: colors.surfaceLight }, inputBorder("stackAnchor")]}>
              <TextInput
                style={[stepStyles.textInput, { color: colors.text }]}
                placeholder="e.g. pour my morning coffee"
                placeholderTextColor={colors.textMuted}
                value={stackAnchor}
                onChangeText={setStackAnchor}
                maxLength={60}
                {...focusProps("stackAnchor")}
              />
            </View>

            {stackAnchor ? (
              <View style={[stepStyles.previewBox, { backgroundColor: colors.surface, borderLeftColor: colors.accentPurple }]}>
                <Text style={[stepStyles.previewText, { color: colors.text }]}>
                  After I{" "}
                  <Text style={{ color: colors.accentPurple }}>{stackAnchor}</Text>
                  , I will{" "}
                  <Text style={{ color: colors.accentOrange }}>{intentionBehaviour || title}</Text>
                  .
                </Text>
              </View>
            ) : null}

            <Text style={[stepStyles.skipNote, { color: colors.textMuted }]}>
              This step is optional. You can skip it and add a stack anchor later.
            </Text>
          </View>
        );

      case 4:
        return (
          <View style={stepStyles.content}>
            <View style={[stepStyles.conceptBox, { backgroundColor: colors.surfaceLight }]}>
              <Ionicons name="timer" size={18} color={colors.accentCyan} />
              <Text style={[stepStyles.conceptText, { color: colors.textSecondary }]}>
                Make it so easy you can't say no. A new habit should take less than two minutes. Master showing up before optimizing.
              </Text>
            </View>

            <Text style={[stepStyles.fieldLabel, { color: colors.textSecondary }]}>
              2-Minute Version (start here)
            </Text>
            <View style={[stepStyles.inputWrap, { backgroundColor: colors.surfaceLight }, inputBorder("twoMin")]}>
              <TextInput
                style={[stepStyles.textInput, { color: colors.text }]}
                placeholder="e.g. Put on running shoes"
                placeholderTextColor={colors.textMuted}
                value={twoMinVersion}
                onChangeText={setTwoMinVersion}
                maxLength={60}
                {...focusProps("twoMin")}
              />
            </View>

            <Text style={[stepStyles.fieldLabel, { color: colors.textSecondary, marginTop: 16 }]}>
              Standard Version
            </Text>
            <View style={[stepStyles.inputWrap, { backgroundColor: colors.surfaceLight }, inputBorder("standard")]}>
              <TextInput
                style={[stepStyles.textInput, { color: colors.text }]}
                placeholder={title || "Your regular habit"}
                placeholderTextColor={colors.textMuted}
                value={standardVersion}
                onChangeText={setStandardVersion}
                maxLength={60}
                {...focusProps("standard")}
              />
            </View>

            <Text style={[stepStyles.fieldLabel, { color: colors.textSecondary, marginTop: 16 }]}>
              Stretch Version (optional)
            </Text>
            <View style={[stepStyles.inputWrap, { backgroundColor: colors.surfaceLight }, inputBorder("stretch")]}>
              <TextInput
                style={[stepStyles.textInput, { color: colors.text }]}
                placeholder="e.g. Run a 5K"
                placeholderTextColor={colors.textMuted}
                value={stretchVersion}
                onChangeText={setStretchVersion}
                maxLength={60}
                {...focusProps("stretch")}
              />
            </View>

            {twoMinVersion ? (
              <View style={[stepStyles.scalingPreview, { borderColor: colors.cardBorder }]}>
                <View style={stepStyles.scalingRow}>
                  <View style={[stepStyles.scalingDot, { backgroundColor: colors.accentCyan }]} />
                  <Text style={[stepStyles.scalingLabel, { color: colors.accentCyan }]}>2 min</Text>
                  <Text style={[stepStyles.scalingText, { color: colors.text }]}>{twoMinVersion}</Text>
                </View>
                <View style={[stepStyles.scalingLine, { backgroundColor: colors.cardBorder }]} />
                <View style={stepStyles.scalingRow}>
                  <View style={[stepStyles.scalingDot, { backgroundColor: colors.accent }]} />
                  <Text style={[stepStyles.scalingLabel, { color: colors.accent }]}>Std</Text>
                  <Text style={[stepStyles.scalingText, { color: colors.text }]}>{standardVersion || title}</Text>
                </View>
                {stretchVersion ? (
                  <>
                    <View style={[stepStyles.scalingLine, { backgroundColor: colors.cardBorder }]} />
                    <View style={stepStyles.scalingRow}>
                      <View style={[stepStyles.scalingDot, { backgroundColor: colors.accentYellow }]} />
                      <Text style={[stepStyles.scalingLabel, { color: colors.accentYellow }]}>S+</Text>
                      <Text style={[stepStyles.scalingText, { color: colors.text }]}>{stretchVersion}</Text>
                    </View>
                  </>
                ) : null}
              </View>
            ) : null}
          </View>
        );

      case 5:
        const area = IDENTITY_AREAS.find((a) => a.id === identityAreaId);
        return (
          <View style={stepStyles.content}>
            <View style={[stepStyles.summaryCard, { backgroundColor: colors.surfaceLight }]}>
              <LinearGradient
                colors={selectedColor.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={summaryStyles.gradient}
              />
              <View style={summaryStyles.header}>
                <View style={summaryStyles.iconWrap}>
                  <Ionicons name={icon as any} size={24} color={selectedColor.color} />
                </View>
                <Text style={summaryStyles.title}>{title || "Your Habit"}</Text>
              </View>
            </View>

            {(area || (identityAreaId === "custom" && customIdentity.trim())) && (
              <View style={[stepStyles.summaryRow, { backgroundColor: colors.surfaceLight }]}>
                <Ionicons name="person" size={16} color={area ? area.color : colors.accent} />
                <Text style={[stepStyles.summaryLabel, { color: colors.textSecondary }]}>identity:</Text>
                <Text style={[stepStyles.summaryValue, { color: colors.text }]}>
                  {area ? area.label : customIdentity.trim()}
                </Text>
              </View>
            )}

            {intentionBehaviour ? (
              <View style={[stepStyles.summaryRow, { backgroundColor: colors.surfaceLight }]}>
                <Ionicons name="location" size={16} color={colors.accentOrange} />
                <Text style={[stepStyles.summaryLabel, { color: colors.textSecondary }]}>when:</Text>
                <Text style={[stepStyles.summaryValue, { color: colors.text }]} numberOfLines={2}>
                  {intentionBehaviour}{intentionTime ? ` at ${intentionTime}` : ""}{intentionLocation ? ` in ${intentionLocation}` : ""}
                </Text>
              </View>
            ) : null}

            {stackAnchor ? (
              <View style={[stepStyles.summaryRow, { backgroundColor: colors.surfaceLight }]}>
                <Ionicons name="link" size={16} color={colors.accentPurple} />
                <Text style={[stepStyles.summaryLabel, { color: colors.textSecondary }]}>after:</Text>
                <Text style={[stepStyles.summaryValue, { color: colors.text }]}>{stackAnchor}</Text>
              </View>
            ) : null}

            {twoMinVersion ? (
              <View style={[stepStyles.summaryRow, { backgroundColor: colors.surfaceLight }]}>
                <Ionicons name="timer" size={16} color={colors.accentCyan} />
                <Text style={[stepStyles.summaryLabel, { color: colors.textSecondary }]}>start:</Text>
                <Text style={[stepStyles.summaryValue, { color: colors.text }]}>{twoMinVersion}</Text>
              </View>
            ) : null}

            <View style={[stepStyles.summaryRow, { backgroundColor: colors.surfaceLight }]}>
              <Ionicons name="repeat" size={16} color={colors.accent} />
              <Text style={[stepStyles.summaryLabel, { color: colors.textSecondary }]}>target:</Text>
              <Text style={[stepStyles.summaryValue, { color: colors.text }]}>{goal} {unit} / {resolvedFrequency}</Text>
            </View>
          </View>
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

const stepStyles = StyleSheet.create({
  content: { gap: 0 },
  conceptBox: {
    flexDirection: "row", alignItems: "flex-start", gap: 12,
    borderRadius: 14, padding: 14, marginBottom: 20,
  },
  conceptText: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 20, flex: 1 },
  fieldLabel: { fontFamily: "Inter_600SemiBold", fontSize: 14, marginBottom: 8 },
  inputWrap: { borderRadius: 14, overflow: "hidden", borderWidth: 1.5, borderColor: "transparent" },
  textInput: { fontFamily: "Inter_500Medium", fontSize: 16, paddingHorizontal: 16, paddingVertical: 14 },
  chipGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12,
    borderWidth: 1.5, borderColor: "transparent",
  },
  chipText: { fontFamily: "Inter_500Medium", fontSize: 13 },
  iconGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  iconBtn: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: "transparent",
  },
  colorRow: { flexDirection: "row", gap: 12, flexWrap: "wrap" },
  colorBtn: {
    width: 36, height: 36, borderRadius: 18, padding: 3,
    borderWidth: 2, borderColor: "transparent",
  },
  colorSwatch: { flex: 1, borderRadius: 15 },
  goalRow: { flexDirection: "row", gap: 12 },
  targetRow: {
    flexDirection: "row", alignItems: "center",
    borderRadius: 16, height: 52,
  },
  targetBtn: { width: 52, height: 52, alignItems: "center", justifyContent: "center" },
  targetCenter: { flex: 1, alignItems: "center", justifyContent: "center" },
  targetInput: { fontFamily: "Inter_700Bold", fontSize: 22, textAlign: "center", width: "100%", paddingVertical: 0 },
  unitRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  unitPill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, borderWidth: 1.5, borderColor: "transparent" },
  unitText: { fontFamily: "Inter_500Medium", fontSize: 13 },
  frequencyRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  frequencyPill: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12,
    borderWidth: 1.5, borderColor: "transparent",
  },
  frequencyText: { fontFamily: "Inter_500Medium", fontSize: 13 },
  customPanel: {
    marginTop: 14, borderRadius: 16, borderWidth: 1, padding: 16, gap: 16,
  },
  customRow: {
    flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 10,
  },
  customLabel: { fontFamily: "Inter_500Medium", fontSize: 13 },
  customIntervalWrap: {
    flexDirection: "row", alignItems: "center", borderRadius: 12, overflow: "hidden",
  },
  customIntervalBtn: {
    width: 36, height: 36, alignItems: "center", justifyContent: "center",
  },
  customIntervalInput: {
    fontFamily: "Inter_700Bold", fontSize: 16, textAlign: "center", width: 36, paddingVertical: 6,
  },
  customPeriodRow: { flexDirection: "row", gap: 6 },
  customPeriodPill: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, borderWidth: 1.5, borderColor: "transparent",
  },
  customPeriodText: { fontFamily: "Inter_500Medium", fontSize: 13 },
  customDaysSection: { marginTop: 2 },
  customDaysRow: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  customDayBtn: {
    width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center",
    borderWidth: 1.5, borderColor: "transparent",
  },
  customDayText: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  customSummaryBar: {
    flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10,
  },
  customSummaryText: { fontFamily: "Inter_500Medium", fontSize: 13 },
  timeModeRow: { flexDirection: "row", gap: 8, marginTop: 8 },
  timeModePill: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12,
    borderWidth: 1.5, borderColor: "transparent",
  },
  timeModeText: { fontFamily: "Inter_500Medium", fontSize: 13 },
  timePickerWrap: {
    marginTop: 10, borderRadius: 16, borderWidth: 1, padding: 16, gap: 12,
  },
  timePickerRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
  },
  timeInputBox: {
    borderRadius: 12, padding: 10, alignItems: "center", minWidth: 64,
  },
  timeInputText: {
    fontFamily: "Inter_700Bold", fontSize: 28, textAlign: "center", width: 50, paddingVertical: 2,
  },
  timeInputLabel: { fontFamily: "Inter_400Regular", fontSize: 11, marginTop: 2 },
  timeColon: { fontFamily: "Inter_700Bold", fontSize: 28, marginBottom: 14 },
  periodToggle: { gap: 4, marginLeft: 6 },
  periodBtn: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, alignItems: "center",
  },
  periodText: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  reminderNote: {
    flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
  },
  reminderNoteText: { fontFamily: "Inter_500Medium", fontSize: 12 },
  previewBox: {
    borderRadius: 14, padding: 16, marginTop: 20, borderLeftWidth: 3,
  },
  previewText: { fontFamily: "Inter_500Medium", fontSize: 15, lineHeight: 22 },
  skipNote: { fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 20, textAlign: "center" },
  scalingPreview: {
    borderRadius: 14, padding: 16, marginTop: 20, borderWidth: 1,
  },
  scalingRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  scalingDot: { width: 8, height: 8, borderRadius: 4 },
  scalingLabel: { fontFamily: "Inter_600SemiBold", fontSize: 11, width: 30 },
  scalingText: { fontFamily: "Inter_500Medium", fontSize: 14, flex: 1 },
  scalingLine: { width: 1, height: 16, marginLeft: 4, marginVertical: 4 },
  summaryCard: {
    borderRadius: 20, overflow: "hidden", marginBottom: 16, height: 120,
    justifyContent: "flex-end",
  },
  summaryRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    borderRadius: 12, padding: 14, marginBottom: 8,
  },
  summaryLabel: { fontFamily: "Inter_500Medium", fontSize: 13 },
  summaryValue: { fontFamily: "Inter_600SemiBold", fontSize: 14, flex: 1 },
});

const summaryStyles = StyleSheet.create({
  gradient: { ...StyleSheet.absoluteFillObject, opacity: 0.8 },
  header: {
    flexDirection: "row", alignItems: "center", gap: 12, padding: 20,
  },
  iconWrap: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.25)", alignItems: "center", justifyContent: "center",
  },
  title: { fontFamily: "Inter_700Bold", fontSize: 22, color: "#FFF" },
});
