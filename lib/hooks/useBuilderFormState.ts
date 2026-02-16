import { useState } from 'react';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { buildCustomFrequency } from '@/lib/utils/frequency';
import { useFormFocus } from '@/lib/hooks/useFormFocus';
import { COLOR_OPTIONS } from '@/components/shared/constants';
import { CueType } from '@/lib/habits-context';

export const STEPS = [
  { id: "identity", title: "identity link", subtitle: "who do you want to become?" },
  { id: "habit", title: "your habit", subtitle: "what will you do?" },
  { id: "intention", title: "implementation intention", subtitle: "when and where?" },
  { id: "stacking", title: "habit stacking", subtitle: "pair it with an existing routine" },
  { id: "versions", title: "the 2-minute rule", subtitle: "start so easy you can't say no" },
  { id: "summary", title: "your habit plan", subtitle: "review and create" },
];

interface Habit {
  id: string;
  title: string;
  [key: string]: any;
}

interface UseBuilderFormStateParams {
  selectedAreaIds: string[];
  habits: Habit[];
  addHabit: (habit: any) => void;
  accentColor: string;
}

export function useBuilderFormState({
  selectedAreaIds,
  habits,
  addHabit,
  accentColor,
}: UseBuilderFormStateParams) {
  // Navigation state
  const [step, setStep] = useState(0);

  // Identity step state
  const [identityAreaId, setIdentityAreaId] = useState(selectedAreaIds[0] || "");
  const [customIdentity, setCustomIdentity] = useState("");

  // Habit step state
  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState("fitness");
  const [colorIdx, setColorIdx] = useState(0);
  const [goal, setGoal] = useState("1");
  const [unit, setUnit] = useState("times");
  const [frequency, setFrequency] = useState("Daily");
  const [customInterval, setCustomInterval] = useState("1");
  const [customPeriod, setCustomPeriod] = useState<"days" | "weeks">("weeks");
  const [customDays, setCustomDays] = useState<string[]>([]);

  // Intention step state
  const [intentionBehaviour, setIntentionBehaviour] = useState("");
  const [intentionTime, setIntentionTime] = useState("");
  const [intentionLocation, setIntentionLocation] = useState("");
  const [timeMode, setTimeMode] = useState<"any" | "specific">("any");
  const [reminderHour, setReminderHour] = useState("7");
  const [reminderMinute, setReminderMinute] = useState("00");
  const [reminderPeriod, setReminderPeriod] = useState<"AM" | "PM">("AM");

  // Stacking step state
  const [stackAnchor, setStackAnchor] = useState("");

  // Versions step state
  const [twoMinVersion, setTwoMinVersion] = useState("");
  const [standardVersion, setStandardVersion] = useState("");
  const [stretchVersion, setStretchVersion] = useState("");
  const [cueType, setCueType] = useState<CueType>("time");

  // Form focus management
  const { inputBorder, focusProps } = useFormFocus(accentColor);

  // Day toggling with haptics
  const toggleDay = (day: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCustomDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  // Derived values
  const resolvedFrequency = frequency === "Custom"
    ? buildCustomFrequency(customInterval, customPeriod, customDays)
    : frequency;
  const selectedColor = COLOR_OPTIONS[colorIdx];
  const currentStep = STEPS[step];
  const progress = (step + 1) / STEPS.length;

  // Validation logic
  const canProceed = () => {
    if (step === 0) return identityAreaId !== "" || customIdentity.trim().length > 0;
    if (step === 1) return title.trim().length > 0;
    if (step === 2) return intentionBehaviour.trim().length > 0;
    return true;
  };

  // Navigation handlers
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

  // Habit creation handler
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

  return {
    // Navigation state
    step,
    currentStep,
    progress,
    // Identity step
    identityAreaId,
    setIdentityAreaId,
    customIdentity,
    setCustomIdentity,
    // Habit step
    title,
    setTitle,
    icon,
    setIcon,
    colorIdx,
    setColorIdx,
    goal,
    setGoal,
    unit,
    setUnit,
    frequency,
    setFrequency,
    customInterval,
    setCustomInterval,
    customPeriod,
    setCustomPeriod,
    customDays,
    toggleDay,
    // Intention step
    intentionBehaviour,
    setIntentionBehaviour,
    intentionTime,
    setIntentionTime,
    intentionLocation,
    setIntentionLocation,
    timeMode,
    setTimeMode,
    reminderHour,
    setReminderHour,
    reminderMinute,
    setReminderMinute,
    reminderPeriod,
    setReminderPeriod,
    // Stacking step
    stackAnchor,
    setStackAnchor,
    // Versions step
    twoMinVersion,
    setTwoMinVersion,
    standardVersion,
    setStandardVersion,
    stretchVersion,
    setStretchVersion,
    cueType,
    setCueType,
    // Derived values
    selectedColor,
    resolvedFrequency,
    inputBorder,
    focusProps,
    // Actions
    canProceed,
    handleNext,
    handleBack,
    handleCreate,
  };
}
