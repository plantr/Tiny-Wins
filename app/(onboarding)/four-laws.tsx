import React, { useEffect } from "react";
import { StyleSheet, Text, View, Pressable, Platform, ScrollView } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";

const LAWS = [
  {
    number: "1st",
    title: "Make It Obvious",
    description: "Design your environment so the cues for good habits are visible and the cues for bad habits are hidden.",
    icon: "eye",
    color: "#FFD600",
    example: "Place your running shoes by the door",
  },
  {
    number: "2nd",
    title: "Make It Attractive",
    description: "Pair habits you need to do with habits you want to do. Use temptation bundling.",
    icon: "heart",
    color: "#FF3B7F",
    example: "Listen to your favorite podcast only while exercising",
  },
  {
    number: "3rd",
    title: "Make It Easy",
    description: "Reduce friction for good habits. Use the Two-Minute Rule: scale any habit down to 2 minutes.",
    icon: "flash",
    color: "#4DA6FF",
    example: '"Read before bed" becomes "read one page"',
  },
  {
    number: "4th",
    title: "Make It Satisfying",
    description: "What is rewarded is repeated. Track your habits and never break the chain.",
    icon: "trophy",
    color: "#4ADE80",
    example: "Use a habit tracker to see your streak grow",
  },
];

function LawCard({ law, index }: { law: typeof LAWS[0]; index: number }) {
  const translateY = useSharedValue(30);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(index * 150 + 300, withSpring(0, { damping: 14 }));
    opacity.value = withDelay(index * 150 + 300, withTiming(1, { duration: 400 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={animatedStyle}>
      <View style={lawStyles.card}>
        <View style={lawStyles.header}>
          <View style={[lawStyles.iconWrap, { backgroundColor: law.color + "20" }]}>
            <Ionicons name={law.icon as any} size={20} color={law.color} />
          </View>
          <View style={lawStyles.badge}>
            <Text style={[lawStyles.badgeText, { color: law.color }]}>{law.number} Law</Text>
          </View>
        </View>
        <Text style={lawStyles.title}>{law.title}</Text>
        <Text style={lawStyles.desc}>{law.description}</Text>
        <View style={[lawStyles.exampleBox, { backgroundColor: law.color + "10", borderColor: law.color + "30" }]}>
          <Ionicons name="bulb" size={14} color={law.color} />
          <Text style={[lawStyles.exampleText, { color: law.color }]}>{law.example}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

export default function FourLawsScreen() {
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "web" ? 67 : 0;
  const bottomPadding = Platform.OS === "web" ? 34 : 0;

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </Pressable>

        <View style={styles.stepBadge}>
          <Text style={styles.stepText}>Step 2 of 4</Text>
        </View>

        <Text style={styles.title}>The 4 Laws of{"\n"}Behavior Change</Text>
        <Text style={styles.subtitle}>
          Every habit follows a loop: Cue, Craving, Response, Reward.
          These four laws make the loop work for you.
        </Text>

        <View style={styles.lawsContainer}>
          {LAWS.map((law, i) => (
            <LawCard key={law.number} law={law} index={i} />
          ))}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 + bottomPadding }]}>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push("/(onboarding)/habit-stack");
          }}
          style={({ pressed }) => [
            styles.button,
            { transform: [{ scale: pressed ? 0.97 : 1 }] },
          ]}
        >
          <LinearGradient
            colors={["#FF3B7F", "#FF6B9D"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
          <Text style={styles.buttonText}>Continue</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFF" />
        </Pressable>
        <View style={styles.dots}>
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 28, paddingBottom: 180 },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: Colors.surface, alignItems: "center",
    justifyContent: "center", marginBottom: 20,
  },
  stepBadge: {
    alignSelf: "flex-start", backgroundColor: Colors.accent + "20",
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12, marginBottom: 16,
  },
  stepText: { fontFamily: "Inter_600SemiBold", fontSize: 12, color: Colors.accent },
  title: { fontFamily: "Inter_700Bold", fontSize: 28, color: Colors.text, lineHeight: 36, marginBottom: 12 },
  subtitle: { fontFamily: "Inter_400Regular", fontSize: 15, color: Colors.textSecondary, lineHeight: 23, marginBottom: 24 },
  lawsContainer: { gap: 14 },
  footer: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    paddingHorizontal: 28, gap: 20, backgroundColor: Colors.background,
  },
  button: {
    height: 56, borderRadius: 16, overflow: "hidden",
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
  },
  buttonText: { fontFamily: "Inter_600SemiBold", fontSize: 17, color: "#FFF" },
  dots: { flexDirection: "row", justifyContent: "center", gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.surfaceLight },
  dotActive: { backgroundColor: Colors.accent, width: 24 },
});

const lawStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface, borderRadius: 18, padding: 18, gap: 8,
  },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  iconWrap: {
    width: 36, height: 36, borderRadius: 11,
    alignItems: "center", justifyContent: "center",
  },
  badge: {
    backgroundColor: Colors.surfaceLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
  },
  badgeText: { fontFamily: "Inter_600SemiBold", fontSize: 11 },
  title: { fontFamily: "Inter_700Bold", fontSize: 17, color: Colors.text },
  desc: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },
  exampleBox: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, borderWidth: 1,
    marginTop: 4,
  },
  exampleText: { fontFamily: "Inter_500Medium", fontSize: 12, flex: 1 },
});
