import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Pressable, Platform, ScrollView, TextInput } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useIdentity, IDENTITY_AREAS } from "@/lib/identity-context";

function IdentityChip({
  item,
  selected,
  onToggle,
}: {
  item: typeof IDENTITY_AREAS[0];
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onToggle();
      }}
      style={({ pressed }) => [
        chipStyles.chip,
        selected && { backgroundColor: item.color + "25", borderColor: item.color },
        { transform: [{ scale: pressed ? 0.96 : 1 }] },
      ]}
    >
      <Ionicons
        name={item.icon as any}
        size={18}
        color={selected ? item.color : Colors.textMuted}
      />
      <Text style={[chipStyles.label, selected && { color: item.color }]}>
        {item.label}
      </Text>
      {selected && (
        <Ionicons name="checkmark-circle" size={18} color={item.color} />
      )}
    </Pressable>
  );
}

export default function IdentityScreen() {
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "web" ? 67 : 0;
  const bottomPadding = Platform.OS === "web" ? 34 : 0;
  const { selectedAreaIds, setSelectedAreaIds, identityStatement, setIdentityStatement } = useIdentity();
  const [selected, setSelected] = useState<string[]>(selectedAreaIds);
  const [statement, setStatement] = useState(identityStatement);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = prev.includes(id) ? prev.filter((i) => i !== id) : prev.length < 3 ? [...prev, id] : prev;
      return next;
    });
  };

  const headerOpacity = useSharedValue(0);
  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 500 });
  }, []);
  const headerStyle = useAnimatedStyle(() => ({ opacity: headerOpacity.value }));

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedAreaIds(selected);
    if (statement.trim()) {
      setIdentityStatement(statement.trim());
    } else {
      const areas = IDENTITY_AREAS.filter((a) => selected.includes(a.id));
      const auto = areas.map((a) => a.label.toLowerCase()).join(", ");
      setIdentityStatement(`I am the kind of person who is ${auto}.`);
    }
    router.push("/(onboarding)/four-laws");
  };

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </Pressable>

        <Animated.View style={headerStyle}>
          <View style={styles.stepBadge}>
            <Text style={styles.stepText}>Step 1 of 4</Text>
          </View>

          <Text style={styles.title}>Who do you{"\n"}want to become?</Text>
          <Text style={styles.subtitle}>
            Atomic Habits teaches us that lasting change starts with identity.
            Instead of "I want to run," say "I am a runner."
          </Text>

          <View style={styles.conceptCard}>
            <View style={styles.conceptIcon}>
              <Ionicons name="person" size={20} color={Colors.accent} />
            </View>
            <View style={styles.conceptText}>
              <Text style={styles.conceptTitle}>Identity-Based Habits</Text>
              <Text style={styles.conceptDesc}>
                Focus on who you wish to become, not what you want to achieve.
                Every action is a vote for the type of person you want to be.
              </Text>
            </View>
          </View>
        </Animated.View>

        <View style={styles.statementSection}>
          <Text style={styles.selectLabel}>Your identity statement</Text>
          <View style={styles.statementInputWrap}>
            <Text style={styles.statementPrefix}>I am the kind of person who</Text>
            <TextInput
              style={styles.statementInput}
              placeholder="e.g. takes care of their body"
              placeholderTextColor={Colors.textMuted}
              value={statement}
              onChangeText={setStatement}
              multiline
              maxLength={120}
            />
          </View>
        </View>

        <Text style={styles.selectLabel}>I want to be... (pick up to 3)</Text>
        <View style={styles.chipsContainer}>
          {IDENTITY_AREAS.map((item) => (
            <IdentityChip
              key={item.id}
              item={item}
              selected={selected.includes(item.id)}
              onToggle={() => toggle(item.id)}
            />
          ))}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 + bottomPadding }]}>
        <Pressable
          onPress={handleContinue}
          style={({ pressed }) => [
            styles.button,
            selected.length === 0 && styles.buttonDisabled,
            { transform: [{ scale: pressed ? 0.97 : 1 }] },
          ]}
          disabled={selected.length === 0}
        >
          <LinearGradient
            colors={selected.length > 0 ? ["#FF3B7F", "#FF6B9D"] : [Colors.surfaceLight, Colors.surfaceLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
          <Text style={[styles.buttonText, selected.length === 0 && { color: Colors.textMuted }]}>
            Continue
          </Text>
          <Ionicons name="arrow-forward" size={20} color={selected.length > 0 ? "#FFF" : Colors.textMuted} />
        </Pressable>
        <View style={styles.dots}>
          <View style={styles.dot} />
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
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
  scrollContent: { paddingHorizontal: 28, paddingBottom: 220 },
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
  title: { fontFamily: "Inter_700Bold", fontSize: 30, color: Colors.text, lineHeight: 38, marginBottom: 12 },
  subtitle: { fontFamily: "Inter_400Regular", fontSize: 15, color: Colors.textSecondary, lineHeight: 23, marginBottom: 24 },
  conceptCard: {
    backgroundColor: Colors.surface, borderRadius: 16, padding: 16,
    flexDirection: "row", gap: 14, marginBottom: 28,
  },
  conceptIcon: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: Colors.accent + "15", alignItems: "center", justifyContent: "center",
  },
  conceptText: { flex: 1 },
  conceptTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.text, marginBottom: 4 },
  conceptDesc: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },
  selectLabel: { fontFamily: "Inter_600SemiBold", fontSize: 16, color: Colors.text, marginBottom: 14 },
  chipsContainer: { gap: 10, marginBottom: 28 },
  statementSection: { marginBottom: 20 },
  statementInputWrap: {
    backgroundColor: Colors.surface, borderRadius: 16, padding: 16,
    borderLeftWidth: 3, borderLeftColor: Colors.accent,
  },
  statementPrefix: {
    fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.accent, marginBottom: 8,
  },
  statementInput: {
    fontFamily: "Inter_500Medium", fontSize: 15, color: Colors.text, lineHeight: 22,
    minHeight: 44, padding: 0,
  },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: 28, gap: 20, backgroundColor: Colors.background },
  button: {
    height: 56, borderRadius: 16, overflow: "hidden",
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { fontFamily: "Inter_600SemiBold", fontSize: 17, color: "#FFF" },
  dots: { flexDirection: "row", justifyContent: "center", gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.surfaceLight },
  dotActive: { backgroundColor: Colors.accent, width: 24 },
});

const chipStyles = StyleSheet.create({
  chip: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: Colors.surface, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 16,
    borderWidth: 1.5, borderColor: "transparent",
  },
  label: { flex: 1, fontFamily: "Inter_500Medium", fontSize: 15, color: Colors.textSecondary },
});
