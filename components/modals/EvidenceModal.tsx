import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Modal,
  TextInput,
  Image,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { useTheme } from "@/lib/theme-context";

export interface EvidenceModalProps {
  visible: boolean;
  habitTitle: string;
  onSubmit: (note: string, imageUri?: string) => void;
  onSkip: () => void;
  onClose: () => void;
}

export function EvidenceModal({
  visible,
  habitTitle,
  onSubmit,
  onSkip,
  onClose,
}: EvidenceModalProps) {
  const { colors } = useTheme();
  const [note, setNote] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") return;
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleClose = () => {
    setNote("");
    setImageUri(null);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={modalStyles.overlay}>
        <View style={[modalStyles.sheet, { backgroundColor: colors.surface }]}>
          <View style={modalStyles.handle} />
          <View style={modalStyles.headerRow}>
            <Ionicons name="sparkles" size={22} color={colors.accentCyan} />
            <Text style={[modalStyles.title, { color: colors.text }]}>evidence of identity</Text>
            <Pressable
              onPress={handleClose}
              style={[modalStyles.closeBtn, { backgroundColor: colors.surfaceLight }]}
            >
              <Feather name="x" size={18} color={colors.textSecondary} />
            </Pressable>
          </View>
          <Text style={[modalStyles.subtitle, { color: colors.textSecondary }]}>
            You just completed "{habitTitle}" - that's a vote for who you're becoming.
            Add a note or photo of what you did.
          </Text>
          <TextInput
            testID="evidence-note-input"
            style={[modalStyles.input, { backgroundColor: colors.surfaceLight, color: colors.text }]}
            placeholder="What did you do? How did it feel?"
            placeholderTextColor={colors.textMuted}
            value={note}
            onChangeText={setNote}
            multiline
            maxLength={200}
            autoFocus
          />

          {imageUri ? (
            <View style={modalStyles.imagePreviewWrap}>
              <Image source={{ uri: imageUri }} style={modalStyles.imagePreview} />
              <Pressable
                onPress={() => setImageUri(null)}
                style={[modalStyles.imageRemoveBtn, { backgroundColor: colors.surface }]}
              >
                <Feather name="x" size={14} color={colors.text} />
              </Pressable>
            </View>
          ) : (
            <View style={modalStyles.imageActions}>
              <Pressable
                onPress={pickImage}
                style={[modalStyles.imageBtn, { backgroundColor: colors.surfaceLight }]}
              >
                <Ionicons name="image-outline" size={18} color={colors.accentPurple} />
                <Text style={[modalStyles.imageBtnText, { color: colors.textSecondary }]}>gallery</Text>
              </Pressable>
              {Platform.OS !== "web" && (
                <Pressable
                  onPress={takePhoto}
                  style={[modalStyles.imageBtn, { backgroundColor: colors.surfaceLight }]}
                >
                  <Ionicons name="camera-outline" size={18} color={colors.accentCyan} />
                  <Text style={[modalStyles.imageBtnText, { color: colors.textSecondary }]}>camera</Text>
                </Pressable>
              )}
            </View>
          )}

          <View style={modalStyles.actions}>
            <Pressable testID="evidence-skip-button" onPress={() => { setNote(""); setImageUri(null); onSkip(); }} style={[modalStyles.skipBtn, { backgroundColor: colors.surfaceLight }]}>
              <Text style={[modalStyles.skipText, { color: colors.textSecondary }]}>skip</Text>
            </Pressable>
            <Pressable
              testID="evidence-submit-button"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onSubmit(note, imageUri || undefined);
                setNote("");
                setImageUri(null);
              }}
              style={modalStyles.saveBtn}
            >
              <LinearGradient
                colors={["#00E5C3", "#00B89C"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              <Ionicons name="checkmark" size={18} color="#FFF" />
              <Text style={modalStyles.saveText}>save evidence</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.2)", alignSelf: "center", marginBottom: 20,
  },
  closeBtn: {
    width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center",
    marginLeft: "auto",
  },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  title: { fontFamily: "Inter_700Bold", fontSize: 20 },
  subtitle: { fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 20, marginBottom: 16 },
  input: {
    borderRadius: 14, padding: 14, fontFamily: "Inter_500Medium", fontSize: 15,
    minHeight: 80, textAlignVertical: "top" as const,
    borderWidth: 0, outlineStyle: "none" as any,
  },
  actions: { flexDirection: "row", gap: 10, marginTop: 16 },
  skipBtn: {
    flex: 1, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center",
  },
  skipText: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
  saveBtn: {
    flex: 2, height: 48, borderRadius: 14, overflow: "hidden",
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
  },
  saveText: { fontFamily: "Inter_700Bold", fontSize: 15, color: "#FFF" },
  imageActions: {
    flexDirection: "row", gap: 10, marginTop: 12,
  },
  imageBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 12, borderRadius: 14,
  },
  imageBtnText: { fontFamily: "Inter_500Medium", fontSize: 14 },
  imagePreviewWrap: {
    marginTop: 12, borderRadius: 14, overflow: "hidden", position: "relative",
  },
  imagePreview: {
    width: "100%", height: 160, borderRadius: 14,
  },
  imageRemoveBtn: {
    position: "absolute", top: 8, right: 8,
    width: 28, height: 28, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
  },
});
