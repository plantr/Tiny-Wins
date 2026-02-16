import React from "react";
import { StyleSheet, Text, View, Pressable, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { IDENTITY_AREAS } from "@/lib/identity-context";

interface IdentityStepProps {
  identityAreaId: string;
  setIdentityAreaId: (id: string) => void;
  customIdentity: string;
  setCustomIdentity: (text: string) => void;
  inputBorder: (field: string) => object;
  focusProps: (field: string) => object;
  colors: any;
}

export function IdentityStep({
  identityAreaId,
  setIdentityAreaId,
  customIdentity,
  setCustomIdentity,
  inputBorder,
  focusProps,
  colors,
}: IdentityStepProps) {
  return (
    <View style={styles.content}>
      <View style={[styles.conceptBox, { backgroundColor: colors.surfaceLight }]}>
        <Ionicons name="person" size={18} color={colors.accent} />
        <Text style={[styles.conceptText, { color: colors.textSecondary }]}>
          True behavior change is identity change. Start with who you wish to become.
        </Text>
      </View>
      <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
        This habit will support my identity as...
      </Text>
      <View style={styles.chipGrid}>
        {IDENTITY_AREAS.map((area) => (
          <Pressable
            key={area.id}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setIdentityAreaId(area.id);
            }}
            style={[
              styles.chip,
              { backgroundColor: colors.surfaceLight },
              identityAreaId === area.id && { backgroundColor: area.color + "20", borderColor: area.color },
            ]}
          >
            <Ionicons name={area.icon as any} size={16} color={identityAreaId === area.id ? area.color : colors.textMuted} />
            <Text
              style={[
                styles.chipText,
                { color: colors.textMuted },
                identityAreaId === area.id && { color: area.color },
              ]}
            >
              {area.label}
            </Text>
          </Pressable>
        ))}
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setIdentityAreaId("custom");
          }}
          style={[
            styles.chip,
            { backgroundColor: colors.surfaceLight },
            identityAreaId === "custom" && { backgroundColor: colors.accent + "20", borderColor: colors.accent },
          ]}
        >
          <Ionicons name="add-circle" size={16} color={identityAreaId === "custom" ? colors.accent : colors.textMuted} />
          <Text
            style={[
              styles.chipText,
              { color: colors.textMuted },
              identityAreaId === "custom" && { color: colors.accent },
            ]}
          >
            custom
          </Text>
        </Pressable>
      </View>
      {identityAreaId === "custom" && (
        <View style={[styles.inputWrap, { backgroundColor: colors.surfaceLight, marginTop: 14 }, inputBorder("customIdentity")]}>
          <TextInput
            style={[styles.textInput, { color: colors.text }]}
            placeholder="e.g. a disciplined person, a good parent"
            placeholderTextColor={colors.textMuted}
            value={customIdentity}
            onChangeText={setCustomIdentity}
            maxLength={40}
            autoFocus
            {...focusProps("customIdentity")}
          />
        </View>
      )}
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
  chipGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12,
    borderWidth: 1.5, borderColor: "transparent",
  },
  chipText: { fontFamily: "Inter_500Medium", fontSize: 13 },
});
