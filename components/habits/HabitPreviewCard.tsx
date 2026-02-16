import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { ColorOption } from "@/components/shared/constants";

interface HabitPreviewCardProps {
  title: string;
  icon: string;
  selectedColor: ColorOption;
  currentProgress: string;
  goal: string;
  unit: string;
}

export default function HabitPreviewCard({
  title,
  icon,
  selectedColor,
  currentProgress,
  goal,
  unit,
}: HabitPreviewCardProps) {
  return (
    <View style={styles.previewContainer}>
      <View style={styles.previewCard}>
        <LinearGradient
          colors={selectedColor.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.previewHeader}>
          <View style={styles.previewIconCircle}>
            <Ionicons name={icon as any} size={18} color={selectedColor.color} />
          </View>
          <Text style={styles.previewTitle}>{title || "habit name"}</Text>
        </View>
        <View style={styles.previewBottom}>
          <Text style={styles.previewGoal}>
            {currentProgress} of {goal || "1"}
          </Text>
          <Text style={styles.previewUnit}>{unit}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  previewContainer: {
    marginBottom: 28,
  },
  previewCard: {
    width: "100%",
    height: 180,
    borderRadius: 20,
    overflow: "hidden",
    padding: 16,
    justifyContent: "space-between",
  },
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  previewIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  previewTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: "#FFFFFF",
    flexShrink: 1,
  },
  previewBottom: {
    alignItems: "flex-start",
  },
  previewGoal: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    color: "#FFFFFF",
  },
  previewUnit: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
  },
});
