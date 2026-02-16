import React from "react";
import { StyleSheet, Text, View, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ColorOption } from "@/components/shared/constants";

interface VersionsStepProps {
  title: string;
  twoMinVersion: string;
  setTwoMinVersion: (text: string) => void;
  standardVersion: string;
  setStandardVersion: (text: string) => void;
  stretchVersion: string;
  setStretchVersion: (text: string) => void;
  selectedColor: ColorOption;
  inputBorder: (field: string) => object;
  focusProps: (field: string) => object;
  colors: any;
}

export function VersionsStep({
  title,
  twoMinVersion,
  setTwoMinVersion,
  standardVersion,
  setStandardVersion,
  stretchVersion,
  setStretchVersion,
  selectedColor,
  inputBorder,
  focusProps,
  colors,
}: VersionsStepProps) {
  return (
    <View style={styles.content}>
      <View style={[styles.conceptBox, { backgroundColor: colors.surfaceLight }]}>
        <Ionicons name="timer" size={18} color={colors.accentCyan} />
        <Text style={[styles.conceptText, { color: colors.textSecondary }]}>
          Make it so easy you can't say no. A new habit should take less than two minutes. Master showing up before optimizing.
        </Text>
      </View>

      <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
        2-Minute Version (start here)
      </Text>
      <View style={[styles.inputWrap, { backgroundColor: colors.surfaceLight }, inputBorder("twoMin")]}>
        <TextInput
          style={[styles.textInput, { color: colors.text }]}
          placeholder="e.g. Put on running shoes"
          placeholderTextColor={colors.textMuted}
          value={twoMinVersion}
          onChangeText={setTwoMinVersion}
          maxLength={60}
          {...focusProps("twoMin")}
        />
      </View>

      <Text style={[styles.fieldLabel, { color: colors.textSecondary, marginTop: 16 }]}>
        Standard Version
      </Text>
      <View style={[styles.inputWrap, { backgroundColor: colors.surfaceLight }, inputBorder("standard")]}>
        <TextInput
          style={[styles.textInput, { color: colors.text }]}
          placeholder={title || "Your regular habit"}
          placeholderTextColor={colors.textMuted}
          value={standardVersion}
          onChangeText={setStandardVersion}
          maxLength={60}
          {...focusProps("standard")}
        />
      </View>

      <Text style={[styles.fieldLabel, { color: colors.textSecondary, marginTop: 16 }]}>
        Stretch Version (optional)
      </Text>
      <View style={[styles.inputWrap, { backgroundColor: colors.surfaceLight }, inputBorder("stretch")]}>
        <TextInput
          style={[styles.textInput, { color: colors.text }]}
          placeholder="e.g. Run a 5K"
          placeholderTextColor={colors.textMuted}
          value={stretchVersion}
          onChangeText={setStretchVersion}
          maxLength={60}
          {...focusProps("stretch")}
        />
      </View>

      {twoMinVersion ? (
        <View style={[styles.scalingPreview, { borderColor: colors.cardBorder }]}>
          <View style={styles.scalingRow}>
            <View style={[styles.scalingDot, { backgroundColor: colors.accentCyan }]} />
            <Text style={[styles.scalingLabel, { color: colors.accentCyan }]}>2 min</Text>
            <Text style={[styles.scalingText, { color: colors.text }]}>{twoMinVersion}</Text>
          </View>
          <View style={[styles.scalingLine, { backgroundColor: colors.cardBorder }]} />
          <View style={styles.scalingRow}>
            <View style={[styles.scalingDot, { backgroundColor: colors.accent }]} />
            <Text style={[styles.scalingLabel, { color: colors.accent }]}>Std</Text>
            <Text style={[styles.scalingText, { color: colors.text }]}>{standardVersion || title}</Text>
          </View>
          {stretchVersion ? (
            <>
              <View style={[styles.scalingLine, { backgroundColor: colors.cardBorder }]} />
              <View style={styles.scalingRow}>
                <View style={[styles.scalingDot, { backgroundColor: colors.accentYellow }]} />
                <Text style={[styles.scalingLabel, { color: colors.accentYellow }]}>S+</Text>
                <Text style={[styles.scalingText, { color: colors.text }]}>{stretchVersion}</Text>
              </View>
            </>
          ) : null}
        </View>
      ) : null}
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
  scalingPreview: {
    borderRadius: 14, padding: 16, marginTop: 20, borderWidth: 1,
  },
  scalingRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  scalingDot: { width: 8, height: 8, borderRadius: 4 },
  scalingLabel: { fontFamily: "Inter_600SemiBold", fontSize: 11, width: 30 },
  scalingText: { fontFamily: "Inter_500Medium", fontSize: 14, flex: 1 },
  scalingLine: { width: 1, height: 16, marginLeft: 4, marginVertical: 4 },
});
