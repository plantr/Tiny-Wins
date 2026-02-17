import React, { useEffect } from "react";
import { StyleSheet, Text, View, Pressable, Platform, ScrollView, Dimensions } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CHART_WIDTH = SCREEN_WIDTH - 96;
const CHART_HEIGHT = 160;
const NUM_POINTS = 12;

function GrowthChart() {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(500, withTiming(1, { duration: 1500, easing: Easing.out(Easing.cubic) }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
    overflow: "hidden" as const,
  }));

  const bars: { height: number; month: string }[] = [];
  for (let i = 0; i < NUM_POINTS; i++) {
    const ratio = Math.pow(1.01, (i + 1) * 30);
    const normalizedH = (ratio - 1) / (Math.pow(1.01, 365) - 1);
    bars.push({
      height: Math.max(normalizedH * CHART_HEIGHT, 8),
      month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i],
    });
  }

  return (
    <View style={chartStyles.container}>
      <View style={chartStyles.chart}>
        <Animated.View style={[chartStyles.barsWrap, animatedStyle]}>
          <View style={chartStyles.barsRow}>
            {bars.map((bar, i) => (
              <View key={i} style={chartStyles.barCol}>
                <View style={chartStyles.barTrack}>
                  <LinearGradient
                    colors={["#FF3B7F", "#FF8C42"]}
                    start={{ x: 0, y: 1 }}
                    end={{ x: 0, y: 0 }}
                    style={[chartStyles.barFill, { height: bar.height }]}
                  />
                </View>
              </View>
            ))}
          </View>
        </Animated.View>
      </View>
      <View style={chartStyles.labels}>
        {bars.map((bar, i) => (
          <Text key={i} style={chartStyles.label}>{bar.month}</Text>
        ))}
      </View>
    </View>
  );
}

const COMPOUND_FACTS = [
  { value: "1%", label: "daily improvement", icon: "trending-up", color: "#4ADE80" },
  { value: "37x", label: "better in one year", icon: "rocket", color: "#FF8C42" },
  { value: "365", label: "small wins", icon: "checkmark-done", color: "#4DA6FF" },
];

export default function OnePercentScreen() {
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
          <Text style={styles.stepText}>Step 4 of 4</Text>
        </View>

        <Text style={styles.title}>1% Better{"\n"}Every Day</Text>
        <Text style={styles.subtitle}>
          Small improvements compound. If you get 1% better each day,
          you'll be 37 times better by the end of the year.
        </Text>

        <View style={styles.chartCard}>
          <Text style={styles.chartLabel}>Your growth over 1 year</Text>
          <GrowthChart />
        </View>

        <View style={styles.factsRow}>
          {COMPOUND_FACTS.map((fact) => (
            <View key={fact.label} style={styles.factCard}>
              <Ionicons name={fact.icon as any} size={20} color={fact.color} />
              <Text style={styles.factValue}>{fact.value}</Text>
              <Text style={styles.factLabel}>{fact.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.quoteCard}>
          <Ionicons name="bookmark" size={16} color={Colors.accent} />
          <Text style={styles.quoteText}>
            "Habits are the compound interest of self-improvement."
          </Text>
          <Text style={styles.quoteAuthor}>- James Clear</Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 + bottomPadding }]}>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push("/(onboarding)/ready");
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
          <Text style={styles.buttonText}>Almost there</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFF" />
        </Pressable>
        <View style={styles.dots}>
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={[styles.dot, styles.dotActive]} />
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
  chartCard: {
    backgroundColor: Colors.surface, borderRadius: 20, padding: 20, marginBottom: 20,
  },
  chartLabel: {
    fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.textSecondary, marginBottom: 16,
  },
  factsRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  factCard: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: 16, padding: 14,
    alignItems: "center", gap: 6,
  },
  factValue: { fontFamily: "Inter_700Bold", fontSize: 22, color: Colors.text },
  factLabel: { fontFamily: "Inter_400Regular", fontSize: 10, color: Colors.textSecondary, textAlign: "center" },
  quoteCard: {
    backgroundColor: Colors.surface, borderRadius: 16, padding: 20, gap: 8,
    borderLeftWidth: 3, borderLeftColor: Colors.accent,
  },
  quoteText: {
    fontFamily: "Inter_500Medium", fontSize: 14, color: Colors.text, lineHeight: 22,
    fontStyle: "italic",
  },
  quoteAuthor: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textMuted },
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

const chartStyles = StyleSheet.create({
  container: { gap: 8 },
  chart: { height: CHART_HEIGHT, justifyContent: "flex-end" },
  barsWrap: { height: "100%" },
  barsRow: {
    flexDirection: "row", alignItems: "flex-end", height: "100%", gap: 6,
  },
  barCol: { flex: 1, justifyContent: "flex-end", height: "100%" },
  barTrack: { justifyContent: "flex-end" },
  barFill: { borderRadius: 4, width: "100%" },
  labels: { flexDirection: "row", gap: 6 },
  label: {
    flex: 1, fontFamily: "Inter_400Regular", fontSize: 8, color: Colors.textMuted,
    textAlign: "center",
  },
});
