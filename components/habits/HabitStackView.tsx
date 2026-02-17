import React from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useTheme } from "@/lib/theme-context";
import { Habit } from "@/lib/habits-context";
import { formatTime } from "@/lib/utils/time";

export interface HabitStackViewProps {
  habits: Habit[];
  completedIds: Set<string>;
  onComplete: (id: string) => void;
  onUncomplete: (id: string) => void;
}

export function HabitStackView({
  habits,
  completedIds,
  onComplete,
  onUncomplete,
}: HabitStackViewProps) {
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
            testID={`habit-stack-${habit.id}`}
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
