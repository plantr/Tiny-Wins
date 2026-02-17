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

const STACK_ITEMS = [
  { time: "6:00 AM", existing: "Wake up", new: "Drink a glass of water", icon: "water", color: "#4DA6FF" },
  { time: "6:05 AM", existing: "After drinking water", new: "Meditate for 2 minutes", icon: "leaf", color: "#FFD600" },
  { time: "6:10 AM", existing: "After meditation", new: "Write 3 things I'm grateful for", icon: "pencil", color: "#C77DFF" },
  { time: "7:00 AM", existing: "Morning coffee", new: "Read for 10 minutes", icon: "book", color: "#FF8C42" },
  { time: "6:00 PM", existing: "Get home from work", new: "Exercise for 15 minutes", icon: "fitness", color: "#4ADE80" },
];

function StackItem({ item, index }: { item: typeof STACK_ITEMS[0]; index: number }) {
  const translateX = useSharedValue(-40);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateX.value = withDelay(index * 120 + 300, withSpring(0, { damping: 14 }));
    opacity.value = withDelay(index * 120 + 300, withTiming(1, { duration: 400 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={animatedStyle}>
      <View style={stackStyles.item}>
        <View style={stackStyles.timeline}>
          <Text style={stackStyles.time}>{item.time}</Text>
          <View style={[stackStyles.dot, { backgroundColor: item.color }]} />
          {index < STACK_ITEMS.length - 1 && <View style={stackStyles.line} />}
        </View>
        <View style={stackStyles.content}>
          <View style={stackStyles.existingRow}>
            <Ionicons name="link" size={12} color={Colors.textMuted} />
            <Text style={stackStyles.existingText}>{item.existing}</Text>
          </View>
          <View style={[stackStyles.newCard, { borderColor: item.color + "40" }]}>
            <View style={[stackStyles.newIcon, { backgroundColor: item.color + "20" }]}>
              <Ionicons name={item.icon as any} size={16} color={item.color} />
            </View>
            <Text style={stackStyles.newText}>{item.new}</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

export default function HabitStackScreen() {
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
          <Text style={styles.stepText}>Step 3 of 4</Text>
        </View>

        <Text style={styles.title}>Habit Stacking</Text>
        <Text style={styles.subtitle}>
          Link new habits to existing ones using the formula:{"\n"}
          "After I [current habit], I will [new habit]."
        </Text>

        <View style={styles.formulaCard}>
          <Text style={styles.formulaLabel}>The Formula</Text>
          <Text style={styles.formulaText}>
            After I{" "}
            <Text style={{ color: Colors.textSecondary }}>[CURRENT HABIT]</Text>
            , I will{" "}
            <Text style={{ color: Colors.accent }}>[NEW HABIT]</Text>
            .
          </Text>
        </View>

        <Text style={styles.exampleLabel}>Example morning stack</Text>
        <View style={styles.stackContainer}>
          {STACK_ITEMS.map((item, i) => (
            <StackItem key={item.time} item={item} index={i} />
          ))}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 + bottomPadding }]}>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push("/(onboarding)/one-percent");
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
          <View style={styles.dot} />
          <View style={[styles.dot, styles.dotActive]} />
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
  formulaCard: {
    backgroundColor: Colors.surface, borderRadius: 16, padding: 20,
    marginBottom: 28, borderLeftWidth: 3, borderLeftColor: Colors.accent,
  },
  formulaLabel: {
    fontFamily: "Inter_600SemiBold", fontSize: 12, color: Colors.textMuted,
    textTransform: "uppercase" as const, letterSpacing: 1, marginBottom: 10,
  },
  formulaText: { fontFamily: "Inter_600SemiBold", fontSize: 16, color: Colors.text, lineHeight: 26 },
  exampleLabel: { fontFamily: "Inter_600SemiBold", fontSize: 16, color: Colors.text, marginBottom: 16 },
  stackContainer: { gap: 0 },
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

const stackStyles = StyleSheet.create({
  item: { flexDirection: "row", minHeight: 80 },
  timeline: { width: 60, alignItems: "center" },
  time: { fontFamily: "Inter_500Medium", fontSize: 10, color: Colors.textMuted, marginBottom: 6 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  line: { width: 2, flex: 1, backgroundColor: Colors.surfaceLight, marginTop: 4 },
  content: { flex: 1, paddingLeft: 12, paddingBottom: 16 },
  existingRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 },
  existingText: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textMuted },
  newCard: {
    backgroundColor: Colors.surface, borderRadius: 12, padding: 12,
    flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1,
  },
  newIcon: { width: 30, height: 30, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  newText: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.text, flex: 1 },
});
