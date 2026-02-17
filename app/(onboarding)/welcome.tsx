import React, { useEffect } from "react";
import { StyleSheet, Text, View, Pressable, Platform, Image } from "react-native";
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
  Easing,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "web" ? 67 : 0;
  const bottomPadding = Platform.OS === "web" ? 34 : 0;

  const logoScale = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const subtitleOpacity = useSharedValue(0);
  const quoteOpacity = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);

  useEffect(() => {
    logoScale.value = withDelay(200, withSpring(1, { damping: 10 }));
    titleOpacity.value = withDelay(500, withTiming(1, { duration: 600 }));
    subtitleOpacity.value = withDelay(800, withTiming(1, { duration: 600 }));
    quoteOpacity.value = withDelay(1100, withTiming(1, { duration: 600 }));
    buttonOpacity.value = withDelay(1400, withTiming(1, { duration: 600 }));
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }));
  const titleStyle = useAnimatedStyle(() => ({ opacity: titleOpacity.value }));
  const subtitleStyle = useAnimatedStyle(() => ({ opacity: subtitleOpacity.value }));
  const quoteStyle = useAnimatedStyle(() => ({ opacity: quoteOpacity.value }));
  const buttonStyle = useAnimatedStyle(() => ({ opacity: buttonOpacity.value }));

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      <View style={[styles.content, { paddingTop: insets.top + 60 }]}>
        <Animated.View style={[styles.logoWrap, logoStyle]}>
          <Image
            source={require("@/assets/images/icon-source.jpg")}
            style={styles.logoImage}
          />
        </Animated.View>

        <Animated.Text style={[styles.title, titleStyle]}>
          Tiny Wins
        </Animated.Text>

        <Animated.Text style={[styles.subtitle, subtitleStyle]}>
          Build habits that last a lifetime,{"\n"}one small step at a time.
        </Animated.Text>

        <Animated.View style={[styles.quoteCard, quoteStyle]}>
          <Ionicons name="bookmark" size={18} color={Colors.accent} style={styles.quoteIcon} />
          <Text style={styles.quoteText}>
            "You do not rise to the level of your goals.{"\n"}You fall to the level of your systems."
          </Text>
          <Text style={styles.quoteAuthor}>- James Clear, Atomic Habits</Text>
        </Animated.View>
      </View>

      <Animated.View style={[styles.footer, { paddingBottom: insets.bottom + 20 + bottomPadding }, buttonStyle]}>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push("/(onboarding)/identity");
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
          <Text style={styles.buttonText}>Begin Your Journey</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFF" />
        </Pressable>

        <View style={styles.dots}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 32,
  },
  logoWrap: {
    marginBottom: 28,
  },
  logoImage: {
    width: 88,
    height: 88,
    borderRadius: 22,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 36,
    color: Colors.text,
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 40,
  },
  quoteCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    width: "100%",
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent,
  },
  quoteIcon: {
    marginBottom: 10,
  },
  quoteText: {
    fontFamily: "Inter_500Medium",
    fontSize: 15,
    color: Colors.text,
    lineHeight: 24,
    fontStyle: "italic",
  },
  quoteAuthor: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 12,
  },
  footer: {
    paddingHorizontal: 32,
    gap: 20,
  },
  button: {
    height: 56,
    borderRadius: 16,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  buttonText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 17,
    color: "#FFF",
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.surfaceLight,
  },
  dotActive: {
    backgroundColor: Colors.accent,
    width: 24,
  },
});
