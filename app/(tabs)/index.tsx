import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Platform,
  Modal,
  TextInput,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, Feather } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  withSequence,
  Easing,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useTheme, WEEK_START_INDEX } from "@/lib/theme-context";
import { useHabits, Habit } from "@/lib/habits-context";
import { useIdentity, IDENTITY_AREAS } from "@/lib/identity-context";
import { formatTime } from "@/lib/utils/time";
import { getTodayStr } from "@/lib/utils/date";
import { usePremium } from "@/lib/premium-context";

const CARD_GAP = 12;
const RING_SIZE = 80;
const RING_STROKE = 6;

const ALL_DAYS = [
  { label: "S", full: "Sun", jsDay: 0 },
  { label: "M", full: "Mon", jsDay: 1 },
  { label: "T", full: "Tue", jsDay: 2 },
  { label: "W", full: "Wed", jsDay: 3 },
  { label: "T", full: "Thu", jsDay: 4 },
  { label: "F", full: "Fri", jsDay: 5 },
  { label: "S", full: "Sat", jsDay: 6 },
];

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// EXTRACTED to @/lib/utils/date.ts
// function getTodayStr() {
//   const d = new Date();
//   return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
// }

function TodayWidget() {
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

function IdentityBadge() {
  const { colors } = useTheme();
  const { identityStatement, getSelectedAreas } = useIdentity();
  const { habits } = useHabits();
  const selectedAreas = getSelectedAreas();

  const habitAreaIds = new Set<string>();
  habits.forEach((h) => {
    if (h.identityAreaId) habitAreaIds.add(h.identityAreaId);
  });
  const habitAreas = IDENTITY_AREAS.filter((a) => habitAreaIds.has(a.id));

  const customIdentities = habits
    .filter((h) => h.identityAreaId && !IDENTITY_AREAS.find((a) => a.id === h.identityAreaId))
    .map((h) => h.identityAreaId!);
  const uniqueCustom = [...new Set(customIdentities)];

  const allAreaIds = new Set([...selectedAreas.map((a) => a.id), ...habitAreaIds]);
  const allAreas = IDENTITY_AREAS.filter((a) => allAreaIds.has(a.id));

  if (!identityStatement && allAreas.length === 0 && uniqueCustom.length === 0) return null;

  return (
    <View style={[badgeStyles.container, { backgroundColor: colors.surface }]}>
      <LinearGradient
        colors={[colors.accent + "10", "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={badgeStyles.header}>
        <Ionicons name="sparkles" size={16} color={colors.accent} />
        <Text style={[badgeStyles.label, { color: colors.accent }]}>your identity</Text>
      </View>
      {allAreas.length > 0 && (
        <Text style={[badgeStyles.statement, { color: colors.text }]}>
          I am the kind of person who is{" "}
          {[...allAreas.map((a) => a.label.toLowerCase()), ...uniqueCustom.map((c) => c.toLowerCase())].reduce((acc, label, i, arr) => {
            if (i === 0) return label;
            if (i === arr.length - 1) return `${acc}, ${label}`;
            return `${acc}, ${label}`;
          }, "")}
          .
        </Text>
      )}
      {(allAreas.length > 0 || uniqueCustom.length > 0) ? (
        <>
          <View style={[badgeStyles.divider, { backgroundColor: colors.cardBorder }]} />
          <View style={badgeStyles.tagsRow}>
            {allAreas.map((a) => (
              <View key={a.id} style={[badgeStyles.tag, { backgroundColor: a.color + "18" }]}>
                <Ionicons name={a.icon as any} size={12} color={a.color} />
                <Text style={[badgeStyles.tagText, { color: a.color }]}>{a.label}</Text>
              </View>
            ))}
            {uniqueCustom.map((c) => (
              <View key={c} style={[badgeStyles.tag, { backgroundColor: colors.accentPurple + "18" }]}>
                <Ionicons name="person" size={12} color={colors.accentPurple} />
                <Text style={[badgeStyles.tagText, { color: colors.accentPurple }]}>{c}</Text>
              </View>
            ))}
          </View>
        </>
      ) : null}
    </View>
  );
}

function DaySelector() {
  const todayJsDay = new Date().getDay();
  const { colors, weekStartDay } = useTheme();
  const { habits, logs } = useHabits();
  const startIdx = WEEK_START_INDEX[weekStartDay];
  const orderedDays = [...ALL_DAYS.slice(startIdx), ...ALL_DAYS.slice(0, startIdx)];
  const today = getTodayStr();
  const todayLogs = logs.filter((l) => l.date === today);
  const completedCount = todayLogs.filter((l) => l.status === "done").length;

  return (
    <View style={dayStyles.container}>
      {orderedDays.map((day, index) => {
        const isToday = day.jsDay === todayJsDay;
        const todayPosition = orderedDays.findIndex((d) => d.jsDay === todayJsDay);
        const isPast = index < todayPosition;

        return (
          <View key={`${day.jsDay}-${index}`} style={dayStyles.dayItem}>
            <View
              style={[
                dayStyles.circle,
                { borderColor: colors.surfaceLight },
                isToday && { borderColor: colors.accent, borderWidth: 2, backgroundColor: colors.accent + "10" },
              ]}
            >
              <Text
                style={[
                  dayStyles.dayLabel,
                  { color: colors.textMuted },
                  isToday && { color: colors.accent, fontFamily: "Inter_700Bold" },
                  isPast && { color: colors.textSecondary },
                ]}
              >
                {day.label}
              </Text>
            </View>
            {isToday && habits.length > 0 && (
              <View style={[dayStyles.progressDot, { backgroundColor: completedCount >= habits.length ? colors.accentCyan : colors.accent }]} />
            )}
          </View>
        );
      })}
    </View>
  );
}

function HabitGridCard({
  habit,
  index,
  isCompleted,
  onComplete,
  onUncomplete,
}: {
  habit: Habit;
  index: number;
  isCompleted: boolean;
  onComplete: (id: string) => void;
  onUncomplete: (id: string) => void;
}) {
  const { colors } = useTheme();
  const scale = useSharedValue(0.85);
  const opacity = useSharedValue(0);
  const checkScale = useSharedValue(1);

  useEffect(() => {
    scale.value = withDelay(index * 100, withSpring(1, { damping: 14, stiffness: 120 }));
    opacity.value = withDelay(index * 100, withTiming(1, { duration: 400 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  const handlePress = () => {
    if (isCompleted) {
      onUncomplete(habit.id);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      checkScale.value = withSequence(
        withTiming(1.4, { duration: 100 }),
        withSpring(1, { damping: 8 })
      );
      onComplete(habit.id);
    }
  };

  const progress = habit.goal > 0 ? Math.min(habit.current / habit.goal, 1) : 0;
  const identityArea = habit.identityAreaId
    ? IDENTITY_AREAS.find((a) => a.id === habit.identityAreaId)
    : null;

  return (
    <Animated.View style={[cardStyles.wrapper, animatedStyle]}>
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push({ pathname: "/habit/[id]", params: { id: habit.id } });
        }}
        style={({ pressed }) => [
          cardStyles.card,
          { opacity: pressed ? 0.9 : 1 },
          isCompleted && { opacity: 0.7 },
        ]}
      >
        <LinearGradient
          colors={habit.gradientColors as unknown as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={cardStyles.gradient}
        />
        <View style={cardStyles.topRow}>
          <View style={cardStyles.iconLabel}>
            <View style={cardStyles.iconWrap}>
              <Ionicons name={habit.icon as any} size={16} color="#FFF" />
            </View>
            <Text style={cardStyles.habitTitle} numberOfLines={1}>{habit.title}</Text>
          </View>
          <Animated.View style={checkStyle}>
            <Pressable onPress={handlePress} hitSlop={12} style={cardStyles.checkBtn}>
              {isCompleted ? (
                <Ionicons name="checkmark-circle" size={22} color="#FFF" />
              ) : (
                <Ionicons name="ellipse-outline" size={22} color="rgba(255,255,255,0.5)" />
              )}
            </Pressable>
          </Animated.View>
        </View>

        <View style={cardStyles.bottomSection}>
          {identityArea && (
            <View style={cardStyles.identityTag}>
              <Ionicons name={identityArea.icon as any} size={10} color="rgba(255,255,255,0.85)" />
              <Text style={cardStyles.identityText}>{identityArea.label}</Text>
            </View>
          )}
          {habit.stackAnchor && (
            <View style={cardStyles.stackTag}>
              <Ionicons name="link" size={10} color="rgba(255,255,255,0.85)" />
              <Text style={cardStyles.stackText}>after {habit.stackAnchor}</Text>
            </View>
          )}
          <View style={cardStyles.statsRow}>
            <Text style={cardStyles.current}>{habit.current} of {habit.goal}</Text>
            {habit.streak > 0 && (
              <View style={cardStyles.streakRow}>
                <Ionicons name="flame" size={12} color="rgba(255,255,255,0.85)" />
                <Text style={cardStyles.streakText}>{habit.streak}</Text>
              </View>
            )}
          </View>
          <Text style={cardStyles.unit}>{habit.unit}</Text>
          <View style={cardStyles.progressTrack}>
            <View style={[cardStyles.progressFill, { width: `${Math.max(progress * 100, 4)}%` }]} />
          </View>
        </View>

        {habit.versions && habit.currentVersion && (
          <View style={cardStyles.versionTag}>
            <Text style={cardStyles.versionText}>
              {habit.currentVersion === "twoMin" ? "2 min" : habit.currentVersion === "stretch" ? "stretch" : "standard"}
            </Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

function HabitStackView({
  habits,
  completedIds,
  onComplete,
  onUncomplete,
}: {
  habits: Habit[];
  completedIds: Set<string>;
  onComplete: (id: string) => void;
  onUncomplete: (id: string) => void;
}) {
  const { colors } = useTheme();

  const habitsByTitle = new Map<string, Habit>();
  habits.forEach((h) => habitsByTitle.set(h.title.toLowerCase(), h));

  const childOf = new Map<string, string>();
  habits.forEach((h) => {
    if (h.stackAnchor) {
      const anchor = h.stackAnchor.toLowerCase();
      const parent = habitsByTitle.get(anchor);
      if (parent) {
        childOf.set(h.id, parent.id);
      }
    }
  });

  const roots: Habit[] = [];
  const childrenMap = new Map<string, Habit[]>();

  habits.forEach((h) => {
    const parentId = childOf.get(h.id);
    if (parentId) {
      const list = childrenMap.get(parentId) || [];
      list.push(h);
      childrenMap.set(parentId, list);
    } else {
      roots.push(h);
    }
  });

  const flattenChain = (habit: Habit): Habit[] => {
    const children = childrenMap.get(habit.id) || [];
    const result: Habit[] = [habit];
    children.forEach((child) => {
      result.push(...flattenChain(child));
    });
    return result;
  };

  const unstacked = roots.filter((h) => {
    const children = childrenMap.get(h.id) || [];
    return !h.stackAnchor && children.length === 0;
  });
  const chainRoots = roots.filter((h) => {
    const children = childrenMap.get(h.id) || [];
    return h.stackAnchor || children.length > 0;
  });

  const renderChainItem = (habit: Habit, isLast: boolean, orderNum: number) => {
    const isCompleted = completedIds.has(habit.id);
    const progress = habit.goal > 0 ? Math.min(habit.current / habit.goal, 1) : 0;
    const cueText = habit.stackAnchor || "";
    const rawTime = habit.reminderTime || habit.implementationIntention?.time || habit.cueTime || "";
    const isValidTime = rawTime && /^\d{1,2}:\d{2}/.test(rawTime);
    const displayTime = isValidTime
      ? (/[ap]m/i.test(rawTime) ? rawTime : formatTime(rawTime))
      : "";

    return (
      <View key={habit.id} style={stackViewStyles.chainItem}>
        <View style={stackViewStyles.chainTimeline}>
          <View style={[stackViewStyles.chainDot, { backgroundColor: habit.gradientColors[0] }]} />
          {!isLast && (
            <View style={[stackViewStyles.chainConnector, { backgroundColor: colors.cardBorder }]} />
          )}
        </View>
        <View style={stackViewStyles.chainContent}>
          {displayTime ? (
            <Text style={[stackViewStyles.chainTime, { color: colors.textMuted }]}>
              {displayTime}
            </Text>
          ) : null}
          {cueText ? (
            <View style={stackViewStyles.cueRow}>
              <Ionicons name="link" size={12} color={colors.textMuted} />
              <Text style={[stackViewStyles.cueText, { color: colors.textMuted }]}>{cueText}</Text>
            </View>
          ) : null}
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push({ pathname: "/habit/[id]", params: { id: habit.id } });
            }}
            style={({ pressed }) => [
              stackViewStyles.chainCard,
              { borderColor: habit.gradientColors[0] + "40", backgroundColor: colors.surface, opacity: pressed ? 0.85 : 1 },
              isCompleted && { opacity: 0.55 },
            ]}
          >
            <View style={stackViewStyles.chainCardRow}>
              <View style={[stackViewStyles.chainIcon, { backgroundColor: habit.gradientColors[0] + "20" }]}>
                <Ionicons name={habit.icon as any} size={16} color={habit.gradientColors[0]} />
              </View>
              <Text style={[stackViewStyles.chainCardTitle, { color: colors.text }]} numberOfLines={2}>
                {habit.title}
              </Text>
              <Pressable
                onPress={() => {
                  if (isCompleted) {
                    onUncomplete(habit.id);
                  } else {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    onComplete(habit.id);
                  }
                }}
                hitSlop={12}
                style={stackViewStyles.checkWrap}
              >
                {isCompleted ? (
                  <Ionicons name="checkmark-circle" size={22} color={habit.gradientColors[0]} />
                ) : (
                  <Ionicons name="ellipse-outline" size={22} color={colors.textMuted} />
                )}
              </Pressable>
            </View>
          </Pressable>
        </View>
      </View>
    );
  };

  const renderStandaloneItem = (habit: Habit) => {
    const isCompleted = completedIds.has(habit.id);
    const progress = habit.goal > 0 ? Math.min(habit.current / habit.goal, 1) : 0;

    return (
      <Pressable
        key={habit.id}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push({ pathname: "/habit/[id]", params: { id: habit.id } });
        }}
        style={({ pressed }) => [
          stackViewStyles.standaloneCard,
          { backgroundColor: colors.surface, opacity: pressed ? 0.85 : 1 },
          isCompleted && { opacity: 0.55 },
        ]}
      >
        <View style={stackViewStyles.cardTop}>
          <View style={[stackViewStyles.iconCircle, { backgroundColor: habit.gradientColors[0] + "20" }]}>
            <Ionicons name={habit.icon as any} size={16} color={habit.gradientColors[0]} />
          </View>
          <View style={stackViewStyles.cardInfo}>
            <Text style={[stackViewStyles.cardTitle, { color: colors.text }]} numberOfLines={1}>
              {habit.title}
            </Text>
            <View style={stackViewStyles.cardMeta}>
              <Text style={[stackViewStyles.cardProgress, { color: colors.textSecondary }]}>
                {habit.current} of {habit.goal} {habit.unit}
              </Text>
              {habit.streak > 0 && (
                <View style={stackViewStyles.miniStreak}>
                  <Ionicons name="flame" size={11} color={colors.accentOrange} />
                  <Text style={[stackViewStyles.miniStreakText, { color: colors.accentOrange }]}>{habit.streak}</Text>
                </View>
              )}
            </View>
          </View>
          <Pressable
            onPress={() => {
              if (isCompleted) {
                onUncomplete(habit.id);
              } else {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onComplete(habit.id);
              }
            }}
            hitSlop={12}
            style={stackViewStyles.checkWrap}
          >
            {isCompleted ? (
              <Ionicons name="checkmark-circle" size={24} color={habit.gradientColors[0]} />
            ) : (
              <Ionicons name="ellipse-outline" size={24} color={colors.textMuted} />
            )}
          </Pressable>
        </View>
        <View style={stackViewStyles.barTrack}>
          <View style={[stackViewStyles.barFill, { width: `${Math.max(progress * 100, 3)}%`, backgroundColor: habit.gradientColors[0] }]} />
        </View>
      </Pressable>
    );
  };

  return (
    <View style={stackViewStyles.container}>
      {chainRoots.length > 0 && (
        <View style={{ marginBottom: 20 }}>
          <View style={stackViewStyles.sectionHeader}>
            <Ionicons name="git-branch" size={16} color={colors.accentPurple} />
            <Text style={[stackViewStyles.sectionLabel, { color: colors.accentPurple }]}>habit chains</Text>
          </View>
          {chainRoots.map((root) => {
            const chain = flattenChain(root);
            return (
              <View key={root.id} style={stackViewStyles.chainGroup}>
                {chain.map((h, idx) =>
                  renderChainItem(h, idx === chain.length - 1, idx + 1)
                )}
              </View>
            );
          })}
        </View>
      )}

      {unstacked.length > 0 && (
        <View>
          {chainRoots.length > 0 && (
            <View style={stackViewStyles.sectionHeader}>
              <Ionicons name="apps" size={16} color={colors.textMuted} />
              <Text style={[stackViewStyles.sectionLabel, { color: colors.textMuted }]}>standalone</Text>
            </View>
          )}
          {unstacked.map((h) => renderStandaloneItem(h))}
        </View>
      )}

      {chainRoots.length === 0 && unstacked.length === 0 && (
        <View style={[stackViewStyles.emptyHint, { backgroundColor: colors.surface }]}>
          <Ionicons name="link" size={24} color={colors.textMuted} />
          <Text style={[stackViewStyles.emptyText, { color: colors.textMuted }]}>
            stack your habits together using the habit stacking option when creating habits
          </Text>
        </View>
      )}
    </View>
  );
}

function EvidenceModal({
  visible,
  habitTitle,
  onSubmit,
  onSkip,
  onClose,
}: {
  visible: boolean;
  habitTitle: string;
  onSubmit: (note: string, imageUri?: string) => void;
  onSkip: () => void;
  onClose: () => void;
}) {
  const { colors } = useTheme();
  const [note, setNote] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") return;
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleClose = () => {
    setNote("");
    setImageUri(null);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={modalStyles.overlay}>
        <View style={[modalStyles.sheet, { backgroundColor: colors.surface }]}>
          <View style={modalStyles.handle} />
          <View style={modalStyles.headerRow}>
            <Ionicons name="sparkles" size={22} color={colors.accentCyan} />
            <Text style={[modalStyles.title, { color: colors.text }]}>evidence of identity</Text>
            <Pressable
              onPress={handleClose}
              style={[modalStyles.closeBtn, { backgroundColor: colors.surfaceLight }]}
            >
              <Feather name="x" size={18} color={colors.textSecondary} />
            </Pressable>
          </View>
          <Text style={[modalStyles.subtitle, { color: colors.textSecondary }]}>
            You just completed "{habitTitle}" - that's a vote for who you're becoming.
            Add a note or photo of what you did.
          </Text>
          <TextInput
            style={[modalStyles.input, { backgroundColor: colors.surfaceLight, color: colors.text }]}
            placeholder="What did you do? How did it feel?"
            placeholderTextColor={colors.textMuted}
            value={note}
            onChangeText={setNote}
            multiline
            maxLength={200}
            autoFocus
          />

          {imageUri ? (
            <View style={modalStyles.imagePreviewWrap}>
              <Image source={{ uri: imageUri }} style={modalStyles.imagePreview} />
              <Pressable
                onPress={() => setImageUri(null)}
                style={[modalStyles.imageRemoveBtn, { backgroundColor: colors.surface }]}
              >
                <Feather name="x" size={14} color={colors.text} />
              </Pressable>
            </View>
          ) : (
            <View style={modalStyles.imageActions}>
              <Pressable
                onPress={pickImage}
                style={[modalStyles.imageBtn, { backgroundColor: colors.surfaceLight }]}
              >
                <Ionicons name="image-outline" size={18} color={colors.accentPurple} />
                <Text style={[modalStyles.imageBtnText, { color: colors.textSecondary }]}>gallery</Text>
              </Pressable>
              {Platform.OS !== "web" && (
                <Pressable
                  onPress={takePhoto}
                  style={[modalStyles.imageBtn, { backgroundColor: colors.surfaceLight }]}
                >
                  <Ionicons name="camera-outline" size={18} color={colors.accentCyan} />
                  <Text style={[modalStyles.imageBtnText, { color: colors.textSecondary }]}>camera</Text>
                </Pressable>
              )}
            </View>
          )}

          <View style={modalStyles.actions}>
            <Pressable onPress={() => { setNote(""); setImageUri(null); onSkip(); }} style={[modalStyles.skipBtn, { backgroundColor: colors.surfaceLight }]}>
              <Text style={[modalStyles.skipText, { color: colors.textSecondary }]}>skip</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onSubmit(note, imageUri || undefined);
                setNote("");
                setImageUri(null);
              }}
              style={modalStyles.saveBtn}
            >
              <LinearGradient
                colors={["#00E5C3", "#00B89C"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              <Ionicons name="checkmark" size={18} color="#FFF" />
              <Text style={modalStyles.saveText}>save evidence</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function AddHabitChoiceModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { colors } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={choiceStyles.overlay} onPress={onClose}>
        <Pressable style={[choiceStyles.sheet, { backgroundColor: colors.surface }]} onPress={(e) => e.stopPropagation()}>
          <View style={choiceStyles.handle} />
          <Text style={[choiceStyles.title, { color: colors.text }]}>create a habit</Text>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onClose();
              router.push("/add-habit");
            }}
            style={({ pressed }) => [
              choiceStyles.option,
              { backgroundColor: colors.surfaceLight, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <View style={[choiceStyles.optionIcon, { backgroundColor: colors.accent + "18" }]}>
              <Ionicons name="flash" size={22} color={colors.accent} />
            </View>
            <View style={choiceStyles.optionText}>
              <Text style={[choiceStyles.optionTitle, { color: colors.text }]}>quick add</Text>
              <Text style={[choiceStyles.optionDesc, { color: colors.textSecondary }]}>
                Simple form to add a habit fast
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.textMuted} />
          </Pressable>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onClose();
              router.push("/guided-builder");
            }}
            style={({ pressed }) => [
              choiceStyles.option,
              { backgroundColor: colors.surfaceLight, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <View style={[choiceStyles.optionIcon, { backgroundColor: colors.accentPurple + "18" }]}>
              <Ionicons name="compass" size={22} color={colors.accentPurple} />
            </View>
            <View style={choiceStyles.optionText}>
              <Text style={[choiceStyles.optionTitle, { color: colors.text }]}>guided builder</Text>
              <Text style={[choiceStyles.optionDesc, { color: colors.textSecondary }]}>
                Step-by-step using Atomic Habits principles
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.textMuted} />
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function RemindersModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { colors } = useTheme();
  const { habits, updateHabit } = useHabits();

  const HOURS = Array.from({ length: 24 }, (_, i) => {
    const h = i % 12 === 0 ? 12 : i % 12;
    const ampm = i < 12 ? "am" : "pm";
    return { label: `${h}:00 ${ampm}`, value: `${String(i).padStart(2, "0")}:00` };
  });

  const habitsWithReminders = habits.filter((h) => h.reminderTime);
  const habitsWithoutReminders = habits.filter((h) => !h.reminderTime);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={reminderStyles.overlay} onPress={onClose}>
        <Pressable style={[reminderStyles.sheet, { backgroundColor: colors.surface }]} onPress={() => {}}>
          <View style={reminderStyles.handle} />
          <View style={reminderStyles.headerRow}>
            <Ionicons name="notifications" size={20} color="#FF3B7F" />
            <Text style={[reminderStyles.title, { color: colors.text }]}>reminders</Text>
            <Pressable onPress={onClose} style={[reminderStyles.closeBtn, { backgroundColor: colors.surfaceLight }]}>
              <Ionicons name="close" size={18} color={colors.textSecondary} />
            </Pressable>
          </View>
          <Text style={[reminderStyles.subtitle, { color: colors.textSecondary }]}>
            set daily reminder times for your habits
          </Text>

          <ScrollView style={reminderStyles.list} showsVerticalScrollIndicator={false}>
            {habits.length === 0 && (
              <View style={reminderStyles.emptyState}>
                <Ionicons name="notifications-off-outline" size={32} color={colors.textMuted} />
                <Text style={[reminderStyles.emptyText, { color: colors.textMuted }]}>
                  add habits first to set reminders
                </Text>
              </View>
            )}

            {habitsWithReminders.length > 0 && (
              <View style={{ marginBottom: 16 }}>
                <Text style={[reminderStyles.sectionLabel, { color: colors.textMuted }]}>active reminders</Text>
                {habitsWithReminders.map((habit) => (
                  <View key={habit.id} style={[reminderStyles.habitRow, { backgroundColor: colors.surfaceLight }]}>
                    <View style={[reminderStyles.habitIcon, { backgroundColor: habit.gradientColors[0] + "20" }]}>
                      <Ionicons name={habit.icon as any} size={18} color={habit.gradientColors[0]} />
                    </View>
                    <View style={reminderStyles.habitInfo}>
                      <Text style={[reminderStyles.habitName, { color: colors.text }]}>{habit.title}</Text>
                      <View style={reminderStyles.timeRow}>
                        <Ionicons name="time-outline" size={13} color="#FF3B7F" />
                        <Text style={[reminderStyles.timeText, { color: "#FF3B7F" }]}>{formatTime(habit.reminderTime!)}</Text>
                      </View>
                    </View>
                    <Pressable
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        updateHabit(habit.id, { reminderTime: undefined });
                      }}
                      style={[reminderStyles.removeBtn, { backgroundColor: "#FF3B7F15" }]}
                    >
                      <Ionicons name="notifications-off" size={16} color="#FF3B7F" />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}

            {habitsWithoutReminders.length > 0 && (
              <View>
                <Text style={[reminderStyles.sectionLabel, { color: colors.textMuted }]}>
                  {habitsWithReminders.length > 0 ? "no reminder set" : "your habits"}
                </Text>
                {habitsWithoutReminders.map((habit) => (
                  <ReminderHabitRow key={habit.id} habit={habit} hours={HOURS} />
                ))}
              </View>
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function ReminderHabitRow({ habit, hours }: { habit: Habit; hours: { label: string; value: string }[] }) {
  const { colors } = useTheme();
  const { updateHabit } = useHabits();
  const [showPicker, setShowPicker] = useState(false);

  return (
    <View>
      <View style={[reminderStyles.habitRow, { backgroundColor: colors.surfaceLight }]}>
        <View style={[reminderStyles.habitIcon, { backgroundColor: habit.gradientColors[0] + "20" }]}>
          <Ionicons name={habit.icon as any} size={18} color={habit.gradientColors[0]} />
        </View>
        <View style={reminderStyles.habitInfo}>
          <Text style={[reminderStyles.habitName, { color: colors.text }]}>{habit.title}</Text>
          <Text style={[reminderStyles.noReminderText, { color: colors.textMuted }]}>no reminder</Text>
        </View>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowPicker(!showPicker);
          }}
          style={[reminderStyles.addBtn, { backgroundColor: colors.accent + "18" }]}
        >
          <Ionicons name={showPicker ? "chevron-up" : "notifications-outline"} size={16} color={colors.accent} />
        </Pressable>
      </View>
      {showPicker && (
        <View style={[reminderStyles.pickerGrid, { backgroundColor: colors.surfaceLight }]}>
          {hours.map((h) => (
            <Pressable
              key={h.value}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                updateHabit(habit.id, { reminderTime: h.value });
                setShowPicker(false);
              }}
              style={[reminderStyles.timeSlot, { backgroundColor: colors.surface }]}
            >
              <Text style={[reminderStyles.timeSlotText, { color: colors.text }]}>{h.label}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

// EXTRACTED to @/lib/utils/time.ts
// function formatTime(time24: string): string {
//   const [hStr, mStr] = time24.split(":");
//   const h = parseInt(hStr, 10);
//   const ampm = h < 12 ? "am" : "pm";
//   const h12 = h % 12 === 0 ? 12 : h % 12;
//   return `${h12}:${mStr} ${ampm}`;
// }

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
            <Text style={[styles.title, { color: colors.text }]}>daily activity</Text>
          </View>
          <View style={styles.headerButtons}>
            <Pressable
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
            <Text style={[styles.sectionTitle, { color: colors.text }]}>your habits</Text>
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

      <Modal
        visible={uncompleteModal.visible}
        transparent
        animationType="fade"
        onRequestClose={handleUncompleteCancel}
      >
        <Pressable style={confirmStyles.overlay} onPress={handleUncompleteCancel}>
          <Pressable style={[confirmStyles.card, { backgroundColor: colors.surface }]} onPress={() => {}}>
            <View style={[confirmStyles.iconWrap, { backgroundColor: "#FF3B7F15" }]}>
              <Ionicons name="arrow-undo" size={24} color="#FF3B7F" />
            </View>
            <Text style={[confirmStyles.title, { color: colors.text }]}>undo completion</Text>
            <Text style={[confirmStyles.message, { color: colors.textSecondary }]}>
              are you sure you want to unmark "{uncompleteModal.habitTitle}" as done?
            </Text>
            <View style={confirmStyles.buttons}>
              <Pressable onPress={handleUncompleteCancel} style={[confirmStyles.btn, { backgroundColor: colors.surfaceLight }]}>
                <Text style={[confirmStyles.btnText, { color: colors.textSecondary }]}>cancel</Text>
              </Pressable>
              <Pressable onPress={handleUncompleteConfirm} style={[confirmStyles.btn, { backgroundColor: "#FF3B7F20" }]}>
                <Text style={[confirmStyles.btnText, { color: "#FF3B7F" }]}>undo</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20 },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24,
  },
  dateLabel: { fontFamily: "Inter_400Regular", fontSize: 14, marginBottom: 4 },
  title: { fontFamily: "Inter_700Bold", fontSize: 28 },
  headerButtons: { flexDirection: "row", gap: 10, marginTop: 6 },
  headerBtn: {
    width: 42, height: 42, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
  },
  bellBtn: {
    width: 42, height: 42, borderRadius: 14, overflow: "hidden",
    alignItems: "center", justifyContent: "center",
  },
  section: { marginBottom: 16 },
  sectionHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14,
  },
  sectionTitle: { fontFamily: "Inter_600SemiBold", fontSize: 18 },
  viewToggle: {
    flexDirection: "row", borderRadius: 10, padding: 3, gap: 2,
  },
  toggleBtn: {
    width: 32, height: 28, borderRadius: 8,
    alignItems: "center", justifyContent: "center",
  },
  habitsGrid: {
    flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between",
    rowGap: CARD_GAP,
  },
  emptyState: {
    borderRadius: 20, padding: 32, alignItems: "center", gap: 8,
  },
  emptyTitle: { fontFamily: "Inter_600SemiBold", fontSize: 16 },
  emptyDesc: { fontFamily: "Inter_400Regular", fontSize: 14, textAlign: "center" },
  insightCard: {
    borderRadius: 16, padding: 16, marginBottom: 24, overflow: "hidden",
    flexDirection: "row", alignItems: "flex-start", gap: 12,
  },
  insightText: {
    fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 20, flex: 1,
  },
});

const cardStyles = StyleSheet.create({
  wrapper: { width: "48%" },
  card: {
    width: "100%", height: 170, borderRadius: 20, overflow: "hidden",
    padding: 14, justifyContent: "space-between",
  },
  gradient: { ...StyleSheet.absoluteFillObject },
  topRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start",
  },
  iconLabel: { flexDirection: "row", alignItems: "center", gap: 6, flex: 1 },
  iconWrap: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.2)", alignItems: "center", justifyContent: "center",
  },
  habitTitle: {
    fontFamily: "Inter_600SemiBold", fontSize: 14, color: "#FFF", flex: 1,
  },
  checkBtn: { padding: 2 },
  bottomSection: { gap: 4 },
  identityTag: {
    flexDirection: "row", alignItems: "center", gap: 4,
    alignSelf: "flex-start",
    backgroundColor: "rgba(0,0,0,0.2)", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8,
    marginBottom: 2,
  },
  identityText: { fontFamily: "Inter_500Medium", fontSize: 10, color: "rgba(255,255,255,0.85)" },
  statsRow: { flexDirection: "row", alignItems: "baseline", gap: 8 },
  current: { fontFamily: "Inter_700Bold", fontSize: 22, color: "#FFF" },
  streakRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  streakText: { fontFamily: "Inter_600SemiBold", fontSize: 12, color: "rgba(255,255,255,0.85)" },
  unit: { fontFamily: "Inter_400Regular", fontSize: 12, color: "rgba(255,255,255,0.7)" },
  progressTrack: {
    height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.2)", overflow: "hidden", marginTop: 4,
  },
  progressFill: { height: "100%", borderRadius: 2, backgroundColor: "rgba(255,255,255,0.8)" },
  versionTag: {
    position: "absolute", top: 40, right: 12,
    backgroundColor: "rgba(0,0,0,0.25)", paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6,
  },
  versionText: { fontFamily: "Inter_500Medium", fontSize: 9, color: "rgba(255,255,255,0.8)" },
  stackTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  stackText: {
    fontFamily: "Inter_400Regular",
    fontSize: 9,
    color: "rgba(255,255,255,0.7)",
  },
});

const stackViewStyles = StyleSheet.create({
  container: {},
  sectionHeader: {
    flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12,
  },
  sectionLabel: { fontFamily: "Inter_600SemiBold", fontSize: 12, textTransform: "lowercase" as const },
  chainGroup: {
    marginBottom: 16,
  },
  chainItem: { flexDirection: "row", minHeight: 72 },
  chainTimeline: { alignItems: "center", width: 14, marginLeft: 3 },
  chainTime: { fontFamily: "Inter_500Medium", fontSize: 10, marginBottom: 4 },
  chainDot: { width: 10, height: 10, borderRadius: 5, marginTop: 16 },
  chainConnector: { width: 2, flex: 1, marginTop: 4, marginBottom: -8, borderRadius: 1 },
  chainContent: { flex: 1, paddingLeft: 12, paddingBottom: 10 },
  cueRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 },
  cueText: { fontFamily: "Inter_400Regular", fontSize: 12 },
  chainCard: {
    borderRadius: 12, padding: 12,
    flexDirection: "row", alignItems: "center",
    borderWidth: 1,
  },
  chainCardRow: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  chainIcon: { width: 30, height: 30, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  chainCardTitle: { fontFamily: "Inter_500Medium", fontSize: 13, flex: 1 },
  checkWrap: { padding: 4 },
  standaloneCard: {
    borderRadius: 14, padding: 14, marginBottom: 8,
  },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconCircle: {
    width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center",
  },
  cardInfo: { flex: 1 },
  cardTitle: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
  cardMeta: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 3 },
  cardProgress: { fontFamily: "Inter_400Regular", fontSize: 12 },
  miniStreak: { flexDirection: "row", alignItems: "center", gap: 2 },
  miniStreakText: { fontFamily: "Inter_600SemiBold", fontSize: 11 },
  barTrack: {
    height: 3, borderRadius: 1.5, backgroundColor: "rgba(255,255,255,0.08)",
    overflow: "hidden", marginTop: 10,
  },
  barFill: { height: "100%", borderRadius: 1.5 },
  emptyHint: {
    borderRadius: 14, padding: 24, alignItems: "center", gap: 10,
  },
  emptyText: { fontFamily: "Inter_400Regular", fontSize: 13, textAlign: "center", lineHeight: 19 },
});

const badgeStyles = StyleSheet.create({
  container: {
    borderRadius: 16, padding: 16, marginBottom: 16, overflow: "hidden",
  },
  header: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
  label: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  statement: { fontFamily: "Inter_500Medium", fontSize: 14, lineHeight: 20, marginBottom: 6 },
  becomeText: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 19, marginBottom: 10, fontStyle: "italic" as const },
  divider: { height: 1, marginBottom: 10, borderRadius: 0.5, opacity: 0.5 },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tag: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10,
  },
  tagText: { fontFamily: "Inter_500Medium", fontSize: 11 },
});

const dayStyles = StyleSheet.create({
  container: {
    flexDirection: "row", justifyContent: "space-between", marginBottom: 20,
  },
  dayItem: { alignItems: "center", gap: 6 },
  circle: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: "center", justifyContent: "center", borderWidth: 1.5,
  },
  dayLabel: { fontFamily: "Inter_500Medium", fontSize: 13 },
  progressDot: { width: 5, height: 5, borderRadius: 2.5 },
});

const modalStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.2)", alignSelf: "center", marginBottom: 20,
  },
  closeBtn: {
    width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center",
    marginLeft: "auto",
  },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  title: { fontFamily: "Inter_700Bold", fontSize: 20 },
  subtitle: { fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 20, marginBottom: 16 },
  input: {
    borderRadius: 14, padding: 14, fontFamily: "Inter_500Medium", fontSize: 15,
    minHeight: 80, textAlignVertical: "top" as const,
    borderWidth: 0, outlineStyle: "none" as any,
  },
  actions: { flexDirection: "row", gap: 10, marginTop: 16 },
  skipBtn: {
    flex: 1, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center",
  },
  skipText: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
  saveBtn: {
    flex: 2, height: 48, borderRadius: 14, overflow: "hidden",
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
  },
  saveText: { fontFamily: "Inter_700Bold", fontSize: 15, color: "#FFF" },
  imageActions: {
    flexDirection: "row", gap: 10, marginTop: 12,
  },
  imageBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 12, borderRadius: 14,
  },
  imageBtnText: { fontFamily: "Inter_500Medium", fontSize: 14 },
  imagePreviewWrap: {
    marginTop: 12, borderRadius: 14, overflow: "hidden", position: "relative",
  },
  imagePreview: {
    width: "100%", height: 160, borderRadius: 14,
  },
  imageRemoveBtn: {
    position: "absolute", top: 8, right: 8,
    width: 28, height: 28, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
  },
});

const choiceStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.2)", alignSelf: "center", marginBottom: 20,
  },
  title: { fontFamily: "Inter_700Bold", fontSize: 20, marginBottom: 16 },
  option: {
    flexDirection: "row", alignItems: "center", gap: 14,
    borderRadius: 16, padding: 16, marginBottom: 10,
  },
  optionIcon: {
    width: 44, height: 44, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
  },
  optionText: { flex: 1 },
  optionTitle: { fontFamily: "Inter_600SemiBold", fontSize: 16, marginBottom: 2 },
  optionDesc: { fontFamily: "Inter_400Regular", fontSize: 13 },
});

const confirmStyles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center", alignItems: "center", padding: 40,
  },
  card: {
    width: "100%", maxWidth: 320, borderRadius: 20, padding: 24, alignItems: "center",
  },
  iconWrap: {
    width: 52, height: 52, borderRadius: 26,
    alignItems: "center", justifyContent: "center", marginBottom: 16,
  },
  title: { fontFamily: "Inter_700Bold", fontSize: 18, marginBottom: 8 },
  message: { fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 20, textAlign: "center", marginBottom: 20 },
  buttons: { flexDirection: "row", gap: 10, width: "100%" },
  btn: {
    flex: 1, height: 44, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
  },
  btnText: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
});

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

const reminderStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  sheet: {
    borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24,
    maxHeight: "80%",
  },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.2)", alignSelf: "center", marginBottom: 20,
  },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  title: { fontFamily: "Inter_700Bold", fontSize: 20, flex: 1 },
  closeBtn: {
    width: 34, height: 34, borderRadius: 17,
    alignItems: "center", justifyContent: "center",
  },
  subtitle: { fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 20, marginBottom: 16 },
  list: { maxHeight: 400 },
  sectionLabel: {
    fontFamily: "Inter_600SemiBold", fontSize: 11, textTransform: "uppercase",
    letterSpacing: 0.8, marginBottom: 10,
  },
  habitRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    padding: 14, borderRadius: 14, marginBottom: 8,
  },
  habitIcon: {
    width: 36, height: 36, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
  },
  habitInfo: { flex: 1, gap: 2 },
  habitName: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  timeRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  timeText: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  noReminderText: { fontFamily: "Inter_400Regular", fontSize: 12 },
  removeBtn: {
    width: 34, height: 34, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
  },
  addBtn: {
    width: 34, height: 34, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
  },
  pickerGrid: {
    flexDirection: "row", flexWrap: "wrap", gap: 6,
    padding: 12, borderRadius: 14, marginBottom: 8, marginTop: -4,
  },
  timeSlot: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
  },
  timeSlotText: { fontFamily: "Inter_500Medium", fontSize: 12 },
  emptyState: {
    alignItems: "center", gap: 10, paddingVertical: 32,
  },
  emptyText: { fontFamily: "Inter_400Regular", fontSize: 14 },
});
