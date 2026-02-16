import React from "react";
import { StyleSheet, Text, View, Pressable, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Habit } from "@/lib/habits-context";

interface StackingStepProps {
  habits: Habit[];
  stackAnchor: string;
  setStackAnchor: (anchor: string) => void;
  intentionBehaviour: string;
  title: string;
  inputBorder: (field: string) => object;
  focusProps: (field: string) => object;
  colors: any;
}

export function StackingStep({
  habits,
  stackAnchor,
  setStackAnchor,
  intentionBehaviour,
  title,
  inputBorder,
  focusProps,
  colors,
}: StackingStepProps) {
  return (
    <View style={styles.content}>
      <View style={[styles.conceptBox, { backgroundColor: colors.surfaceLight }]}>
        <Ionicons name="link" size={18} color={colors.accentPurple} />
        <Text style={[styles.conceptText, { color: colors.textSecondary }]}>
          Pair your new habit with something you already do. "After [CURRENT HABIT], I will [NEW HABIT]."
        </Text>
      </View>

      {habits.length > 0 ? (
        <>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>pick an existing habit</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            {habits.map((h) => (
              <Pressable
                key={h.id}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setStackAnchor(stackAnchor === h.title ? "" : h.title);
                }}
                style={[
                  styles.chip,
                  { backgroundColor: colors.surfaceLight },
                  stackAnchor === h.title && { backgroundColor: colors.accentPurple + "20", borderColor: colors.accentPurple },
                ]}
              >
                <Ionicons name={h.icon as any} size={14} color={stackAnchor === h.title ? colors.accentPurple : colors.textMuted} />
                <Text
                  style={[
                    styles.chipText,
                    { color: colors.textMuted },
                    stackAnchor === h.title && { color: colors.accentPurple },
                  ]}
                >
                  {h.title}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>or type a custom anchor</Text>
        </>
      ) : (
        <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>after I...</Text>
      )}
      <View style={[styles.inputWrap, { backgroundColor: colors.surfaceLight }, inputBorder("stackAnchor")]}>
        <TextInput
          style={[styles.textInput, { color: colors.text }]}
          placeholder="e.g. pour my morning coffee"
          placeholderTextColor={colors.textMuted}
          value={stackAnchor}
          onChangeText={setStackAnchor}
          maxLength={60}
          {...focusProps("stackAnchor")}
        />
      </View>

      {stackAnchor ? (
        <View style={[styles.previewBox, { backgroundColor: colors.surface, borderLeftColor: colors.accentPurple }]}>
          <Text style={[styles.previewText, { color: colors.text }]}>
            After I{" "}
            <Text style={{ color: colors.accentPurple }}>{stackAnchor}</Text>
            , I will{" "}
            <Text style={{ color: colors.accentOrange }}>{intentionBehaviour || title}</Text>
            .
          </Text>
        </View>
      ) : null}

      <Text style={[styles.skipNote, { color: colors.textMuted }]}>
        This step is optional. You can skip it and add a stack anchor later.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: 0 },
  conceptBox: {
    flexDirection: "row", alignItems: "flex-start", gap: 12,
    borderRadius: 14, padding: 14, marginBottom: 20,
  },
  conceptText: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 20, flex: 1 },
  fieldLabel: { fontFamily: "Inter_600SemiBold", fontSize: 14, marginBottom: 8 },
  inputWrap: { borderRadius: 14, overflow: "hidden", borderWidth: 1.5, borderColor: "transparent" },
  textInput: { fontFamily: "Inter_500Medium", fontSize: 16, paddingHorizontal: 16, paddingVertical: 14 },
  chip: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12,
    borderWidth: 1.5, borderColor: "transparent",
  },
  chipText: { fontFamily: "Inter_500Medium", fontSize: 13 },
  previewBox: {
    borderRadius: 14, padding: 16, marginTop: 20, borderLeftWidth: 3,
  },
  previewText: { fontFamily: "Inter_500Medium", fontSize: 15, lineHeight: 22 },
  skipNote: { fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 20, textAlign: "center" },
});
