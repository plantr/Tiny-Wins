import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { IDENTITY_AREAS } from "@/lib/identity-context";
import { ColorOption } from "@/components/shared/constants";

interface SummaryStepProps {
  title: string;
  icon: string;
  selectedColor: ColorOption;
  identityAreaId: string;
  customIdentity: string;
  intentionBehaviour: string;
  intentionTime: string;
  intentionLocation: string;
  stackAnchor: string;
  twoMinVersion: string;
  goal: string;
  unit: string;
  resolvedFrequency: string;
  colors: any;
}

export function SummaryStep({
  title,
  icon,
  selectedColor,
  identityAreaId,
  customIdentity,
  intentionBehaviour,
  intentionTime,
  intentionLocation,
  stackAnchor,
  twoMinVersion,
  goal,
  unit,
  resolvedFrequency,
  colors,
}: SummaryStepProps) {
  const area = IDENTITY_AREAS.find((a) => a.id === identityAreaId);

  return (
    <View style={styles.content}>
      <View style={[styles.summaryCard, { backgroundColor: colors.surfaceLight }]}>
        <LinearGradient
          colors={selectedColor.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        />
        <View style={styles.header}>
          <View style={styles.iconWrap}>
            <Ionicons name={icon as any} size={24} color={selectedColor.color} />
          </View>
          <Text style={styles.titleText}>{title || "Your Habit"}</Text>
        </View>
      </View>

      {(area || (identityAreaId === "custom" && customIdentity.trim())) && (
        <View style={[styles.summaryRow, { backgroundColor: colors.surfaceLight }]}>
          <Ionicons name="person" size={16} color={area ? area.color : colors.accent} />
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>identity:</Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            {area ? area.label : customIdentity.trim()}
          </Text>
        </View>
      )}

      {intentionBehaviour ? (
        <View style={[styles.summaryRow, { backgroundColor: colors.surfaceLight }]}>
          <Ionicons name="location" size={16} color={colors.accentOrange} />
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>when:</Text>
          <Text style={[styles.summaryValue, { color: colors.text }]} numberOfLines={2}>
            {intentionBehaviour}{intentionTime ? ` at ${intentionTime}` : ""}{intentionLocation ? ` in ${intentionLocation}` : ""}
          </Text>
        </View>
      ) : null}

      {stackAnchor ? (
        <View style={[styles.summaryRow, { backgroundColor: colors.surfaceLight }]}>
          <Ionicons name="link" size={16} color={colors.accentPurple} />
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>after:</Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>{stackAnchor}</Text>
        </View>
      ) : null}

      {twoMinVersion ? (
        <View style={[styles.summaryRow, { backgroundColor: colors.surfaceLight }]}>
          <Ionicons name="timer" size={16} color={colors.accentCyan} />
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>start:</Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>{twoMinVersion}</Text>
        </View>
      ) : null}

      <View style={[styles.summaryRow, { backgroundColor: colors.surfaceLight }]}>
        <Ionicons name="repeat" size={16} color={colors.accent} />
        <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>target:</Text>
        <Text style={[styles.summaryValue, { color: colors.text }]}>{goal} {unit} / {resolvedFrequency}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: 0 },
  summaryCard: {
    borderRadius: 20, overflow: "hidden", marginBottom: 16, height: 120,
    justifyContent: "flex-end",
  },
  gradient: { ...StyleSheet.absoluteFillObject, opacity: 0.8 },
  header: {
    flexDirection: "row", alignItems: "center", gap: 12, padding: 20,
  },
  iconWrap: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.25)", alignItems: "center", justifyContent: "center",
  },
  titleText: { fontFamily: "Inter_700Bold", fontSize: 22, color: "#FFF" },
  summaryRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    borderRadius: 12, padding: 14, marginBottom: 8,
  },
  summaryLabel: { fontFamily: "Inter_500Medium", fontSize: 13 },
  summaryValue: { fontFamily: "Inter_600SemiBold", fontSize: 14, flex: 1 },
});
