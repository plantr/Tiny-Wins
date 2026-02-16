import React from "react";
import { StyleSheet, Text, View, Pressable, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/lib/theme-context";

export interface ConfirmationModalProps {
  visible: boolean;
  icon: string;
  iconColor: string;
  title: string;
  message: string;
  confirmLabel: string;
  confirmColor: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmationModal({
  visible,
  icon,
  iconColor,
  title,
  message,
  confirmLabel,
  confirmColor,
  cancelLabel = "cancel",
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  const { colors } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          <View style={[styles.modalIconWrap, { backgroundColor: `${iconColor}20` }]}>
            <Ionicons name={icon as any} size={24} color={iconColor} />
          </View>
          <Text style={[styles.modalTitle, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.modalMessage, { color: colors.textSecondary }]}>
            {message}
          </Text>
          <View style={styles.modalActions}>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onCancel();
              }}
              style={[styles.modalBtn, { backgroundColor: colors.surfaceLight }]}
            >
              <Text style={[styles.modalBtnText, { color: colors.text }]}>{cancelLabel}</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onConfirm();
              }}
              style={[styles.modalBtn, { backgroundColor: confirmColor }]}
            >
              <Text style={[styles.modalBtnText, { color: "#FFF" }]}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  modalContent: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
  },
  modalIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  modalTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    marginBottom: 8,
  },
  modalMessage: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  modalBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modalBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
});
