import React, { useEffect } from "react";
import { StyleSheet, Text, View, Pressable, Platform } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  withSequence,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";

const PRINCIPLES = [
  { icon: "person", label: "Identity-based habits", color: "#FF3B7F" },
  { icon: "layers", label: "The 4 Laws of Change", color: "#FFD600" },
  { icon: "git-merge", label: "Habit stacking", color: "#C77DFF" },
  { icon: "trending-up", label: "1% daily improvement", color: "#4ADE80" },
];

export default function ReadyScreen() {
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "web" ? 67 : 0;
  const bottomPadding = Platform.OS === "web" ? 34 : 0;

  const checkScale = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const listOpacity = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);

  useEffect(() => {
    checkScale.value = withDelay(200, withSpring(1, { damping: 8 }));
    titleOpacity.value = withDelay(600, withTiming(1, { duration: 500 }));
    listOpacity.value = withDelay(900, withTiming(1, { duration: 500 }));
    buttonOpacity.value = withDelay(1200, withTiming(1, { duration: 500 }));
  }, []);

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));
  const titleStyle = useAnimatedStyle(() => ({ opacity: titleOpacity.value }));
  const listStyle = useAnimatedStyle(() => ({ opacity: listOpacity.value }));
  const buttonStyle = useAnimatedStyle(() => ({ opacity: buttonOpacity.value }));

  const handleGetStarted = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await AsyncStorage.setItem("onboarding_completed", "true");
    router.replace("/(tabs)");
  };

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      <View style={[styles.content, { paddingTop: insets.top + 60 }]}>
        <Animated.View style={[styles.checkCircle, checkStyle]}>
          <LinearGradient
            colors={["#4ADE80", "#22C55E"]}
            style={styles.checkGradient}
          >
            <Ionicons name="checkmark" size={48} color="#FFF" />
          </LinearGradient>
        </Animated.View>

        <Animated.Text style={[styles.title, titleStyle]}>
          You're all set!
        </Animated.Text>
        <Animated.Text style={[styles.subtitle, titleStyle]}>
          You've learned the core principles of building atomic habits.
          Now it's time to put them into action.
        </Animated.Text>

        <Animated.View style={[styles.principlesList, listStyle]}>
          <Text style={styles.recapLabel}>What you've learned</Text>
          {PRINCIPLES.map((p, i) => (
            <View key={p.label} style={styles.principleRow}>
              <View style={[styles.principleIcon, { backgroundColor: p.color + "20" }]}>
                <Ionicons name={p.icon as any} size={18} color={p.color} />
              </View>
              <Text style={styles.principleText}>{p.label}</Text>
              <Ionicons name="checkmark-circle" size={20} color={p.color} />
            </View>
          ))}
        </Animated.View>
      </View>

      <Animated.View style={[styles.footer, { paddingBottom: insets.bottom + 20 + bottomPadding }, buttonStyle]}>
        <Pressable
          onPress={handleGetStarted}
          style={({ pressed }) => [
            styles.button,
            { transform: [{ scale: pressed ? 0.97 : 1 }] },
          ]}
        >
          <LinearGradient
            colors={["#FF3B7F", "#FF8C42"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
          <Ionicons name="flame" size={22} color="#FFF" />
          <Text style={styles.buttonText}>Start Building Habits</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, alignItems: "center", paddingHorizontal: 32 },
  checkCircle: { marginBottom: 28 },
  checkGradient: {
    width: 96, height: 96, borderRadius: 48,
    alignItems: "center", justifyContent: "center",
  },
  title: {
    fontFamily: "Inter_700Bold", fontSize: 32, color: Colors.text,
    textAlign: "center", marginBottom: 12,
  },
  subtitle: {
    fontFamily: "Inter_400Regular", fontSize: 15, color: Colors.textSecondary,
    textAlign: "center", lineHeight: 23, marginBottom: 36,
  },
  principlesList: { width: "100%", gap: 12 },
  recapLabel: {
    fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.textMuted,
    textTransform: "uppercase" as const, letterSpacing: 1, marginBottom: 4,
  },
  principleRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: Colors.surface, borderRadius: 14, padding: 14,
  },
  principleIcon: {
    width: 36, height: 36, borderRadius: 11,
    alignItems: "center", justifyContent: "center",
  },
  principleText: {
    flex: 1, fontFamily: "Inter_500Medium", fontSize: 14, color: Colors.text,
  },
  footer: { paddingHorizontal: 32 },
  button: {
    height: 56, borderRadius: 16, overflow: "hidden",
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
  },
  buttonText: { fontFamily: "Inter_600SemiBold", fontSize: 17, color: "#FFF" },
});
