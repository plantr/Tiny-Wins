import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/theme-context";
import { useIdentity, IDENTITY_AREAS } from "@/lib/identity-context";
import { useHabits } from "@/lib/habits-context";

export function IdentityBadge() {
  const { colors } = useTheme();
  const { identityStatement, getSelectedAreas } = useIdentity();
  const { habits } = useHabits();
  const selectedAreas = getSelectedAreas();

  const habitAreaIds = new Set<string>();
  habits.forEach((h) => {
    if (h.identityAreaId) habitAreaIds.add(h.identityAreaId);
  });
  const habitAreas = IDENTITY_AREAS.filter((a) => habitAreaIds.has(a.id));

  const customIdentities = habits
    .filter((h) => h.identityAreaId && !IDENTITY_AREAS.find((a) => a.id === h.identityAreaId))
    .map((h) => h.identityAreaId!);
  const uniqueCustom = [...new Set(customIdentities)];

  const allAreaIds = new Set([...selectedAreas.map((a) => a.id), ...habitAreaIds]);
  const allAreas = IDENTITY_AREAS.filter((a) => allAreaIds.has(a.id));

  if (!identityStatement && allAreas.length === 0 && uniqueCustom.length === 0) return null;

  return (
    <View style={[badgeStyles.container, { backgroundColor: colors.surface }]}>
      <LinearGradient
        colors={[colors.accent + "10", "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={badgeStyles.header}>
        <Ionicons name="sparkles" size={16} color={colors.accent} />
        <Text style={[badgeStyles.label, { color: colors.accent }]}>your identity</Text>
      </View>
      {allAreas.length > 0 && (
        <Text style={[badgeStyles.statement, { color: colors.text }]}>
          I am the kind of person who is{" "}
          {[...allAreas.map((a) => a.label.toLowerCase()), ...uniqueCustom.map((c) => c.toLowerCase())].reduce((acc, label, i, arr) => {
            if (i === 0) return label;
            if (i === arr.length - 1) return `${acc}, ${label}`;
            return `${acc}, ${label}`;
          }, "")}
          .
        </Text>
      )}
      {(allAreas.length > 0 || uniqueCustom.length > 0) ? (
        <>
          <View style={[badgeStyles.divider, { backgroundColor: colors.cardBorder }]} />
          <View style={badgeStyles.tagsRow}>
            {allAreas.map((a) => (
              <View key={a.id} style={[badgeStyles.tag, { backgroundColor: a.color + "18" }]}>
                <Ionicons name={a.icon as any} size={12} color={a.color} />
                <Text style={[badgeStyles.tagText, { color: a.color }]}>{a.label}</Text>
              </View>
            ))}
            {uniqueCustom.map((c) => (
              <View key={c} style={[badgeStyles.tag, { backgroundColor: colors.accentPurple + "18" }]}>
                <Ionicons name="person" size={12} color={colors.accentPurple} />
                <Text style={[badgeStyles.tagText, { color: colors.accentPurple }]}>{c}</Text>
              </View>
            ))}
          </View>
        </>
      ) : null}
    </View>
  );
}

const badgeStyles = StyleSheet.create({
  container: {
    borderRadius: 16, padding: 16, marginBottom: 16, overflow: "hidden",
  },
  header: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
  label: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  statement: { fontFamily: "Inter_500Medium", fontSize: 14, lineHeight: 20, marginBottom: 6 },
  becomeText: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 19, marginBottom: 10, fontStyle: "italic" as const },
  divider: { height: 1, marginBottom: 10, borderRadius: 0.5, opacity: 0.5 },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tag: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10,
  },
  tagText: { fontFamily: "Inter_500Medium", fontSize: 11 },
});
