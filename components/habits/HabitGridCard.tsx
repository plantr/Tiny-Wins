import React, { useEffect } from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
  withTiming,
  withSequence,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useTheme } from "@/lib/theme-context";
import { Habit } from "@/lib/habits-context";
import { IDENTITY_AREAS } from "@/lib/identity-context";

const CARD_GAP = 12;

export interface HabitGridCardProps {
  habit: Habit;
  index: number;
  isCompleted: boolean;
  onComplete: (id: string) => void;
  onUncomplete: (id: string) => void;
}

export function HabitGridCard({
  habit,
  index,
  isCompleted,
  onComplete,
  onUncomplete,
}: HabitGridCardProps) {
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
