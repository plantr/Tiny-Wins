import React from "react";
import { StyleSheet, Text, View, Pressable, Modal } from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useTheme } from "@/lib/theme-context";

export interface AddHabitChoiceModalProps {
  visible: boolean;
  onClose: () => void;
}

export function AddHabitChoiceModal({
  visible,
  onClose,
}: AddHabitChoiceModalProps) {
  const { colors } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable accessible={false} style={choiceStyles.overlay} onPress={onClose}>
        <Pressable accessible={false} style={[choiceStyles.sheet, { backgroundColor: colors.surface }]} onPress={(e) => e?.stopPropagation?.()}>
          <View style={choiceStyles.handle} />
          <Text testID="choice-modal-title" style={[choiceStyles.title, { color: colors.text }]}>create a habit</Text>
          <Pressable
            testID="choice-quick-add"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onClose();
              router.push("/add-habit");
            }}
            style={({ pressed }) => [
              choiceStyles.option,
              { backgroundColor: colors.surfaceLight, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <View style={[choiceStyles.optionIcon, { backgroundColor: colors.accent + "18" }]}>
              <Ionicons name="flash" size={22} color={colors.accent} />
            </View>
            <View style={choiceStyles.optionText}>
              <Text style={[choiceStyles.optionTitle, { color: colors.text }]}>quick add</Text>
              <Text style={[choiceStyles.optionDesc, { color: colors.textSecondary }]}>
                Simple form to add a habit fast
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.textMuted} />
          </Pressable>
          <Pressable
            testID="choice-guided-builder"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onClose();
              router.push("/guided-builder");
            }}
            style={({ pressed }) => [
              choiceStyles.option,
              { backgroundColor: colors.surfaceLight, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <View style={[choiceStyles.optionIcon, { backgroundColor: colors.accentPurple + "18" }]}>
              <Ionicons name="compass" size={22} color={colors.accentPurple} />
            </View>
            <View style={choiceStyles.optionText}>
              <Text style={[choiceStyles.optionTitle, { color: colors.text }]}>guided builder</Text>
              <Text style={[choiceStyles.optionDesc, { color: colors.textSecondary }]}>
                Step-by-step using Atomic Habits principles
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.textMuted} />
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const choiceStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.2)", alignSelf: "center", marginBottom: 20,
  },
  title: { fontFamily: "Inter_700Bold", fontSize: 20, marginBottom: 16 },
  option: {
    flexDirection: "row", alignItems: "center", gap: 14,
    borderRadius: 16, padding: 16, marginBottom: 10,
  },
  optionIcon: {
    width: 44, height: 44, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
  },
  optionText: { flex: 1 },
  optionTitle: { fontFamily: "Inter_600SemiBold", fontSize: 16, marginBottom: 2 },
  optionDesc: { fontFamily: "Inter_400Regular", fontSize: 13 },
});
