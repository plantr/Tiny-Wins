import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Platform,
  Switch,
  Modal,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useTheme, WEEK_START_OPTIONS, WeekStartDay } from "@/lib/theme-context";
import { usePremium } from "@/lib/premium-context";
import { useHabits } from "@/lib/habits-context";

function SettingsRow({
  icon,
  iconColor,
  label,
  value,
  onPress,
  rightElement,
}: {
  icon: string;
  iconColor: string;
  label: string;
  value?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
}) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={() => {
        if (onPress) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }
      }}
      style={({ pressed }) => [
        rowStyles.container,
        { backgroundColor: colors.surface, opacity: pressed && onPress ? 0.8 : 1 },
      ]}
    >
      <View style={[rowStyles.iconWrap, { backgroundColor: iconColor + "18" }]}>
        <Ionicons name={icon as any} size={18} color={iconColor} />
      </View>
      <Text style={[rowStyles.label, { color: colors.text }]}>{label}</Text>
      <View style={rowStyles.right}>
        {rightElement ? (
          rightElement
        ) : value ? (
          <Text style={[rowStyles.value, { color: colors.textSecondary }]}>{value}</Text>
        ) : null}
        {onPress && !rightElement && (
          <Feather name="chevron-right" size={16} color={colors.textMuted} />
        )}
      </View>
    </Pressable>
  );
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={sectionStyles.container}>
      <Text style={[sectionStyles.title, { color: colors.textSecondary }]}>{title}</Text>
      <View style={[sectionStyles.card, { backgroundColor: colors.surface }]}>
        {children}
      </View>
    </View>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark, toggleTheme, mode, weekStartDay, setWeekStartDay } = useTheme();
  const { isPremium, isFeatureLocked } = usePremium();
  const { habits, logs, reviews } = useHabits();
  const topPadding = Platform.OS === "web" ? 67 : 0;
  const bottomPadding = Platform.OS === "web" ? 34 : 0;

  const [changelogVisible, setChangelogVisible] = useState(false);

  const handleResetOnboarding = async () => {
    await AsyncStorage.removeItem("onboarding_completed");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace("/(onboarding)/welcome");
  };

  const handleBackupData = async () => {
    if (isFeatureLocked("data_backup")) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      router.push({ pathname: "/paywall", params: { trigger: "premium_feature" } });
      return;
    }
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const backupData = {
        version: "1.0.0",
        exportedAt: new Date().toISOString(),
        habits,
        logs,
        reviews,
      };
      const json = JSON.stringify(backupData, null, 2);
      if (Platform.OS === "web") {
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `tinywins_backup_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const fileUri = FileSystem.documentDirectory + `tinywins_backup_${new Date().toISOString().slice(0, 10)}.json`;
        await FileSystem.writeAsStringAsync(fileUri, json, { encoding: FileSystem.EncodingType.UTF8 });
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(fileUri, { mimeType: "application/json", dialogTitle: "Save Backup" });
        }
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      Alert.alert("Backup Failed", "Something went wrong creating your backup. Please try again.");
    }
  };

  const handleExportHistory = async () => {
    if (isFeatureLocked("export_history")) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      router.push({ pathname: "/paywall", params: { trigger: "premium_feature" } });
      return;
    }
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const habitMap = new Map(habits.map((h) => [h.id, h.title]));
      const csvRows = [
        ["Date", "Habit", "Status", "Evidence Note", "Friction Reason", "Reflection"].join(","),
        ...logs.map((log) => {
          const habitName = (habitMap.get(log.habitId) || "Unknown").replace(/,/g, ";");
          const note = (log.evidenceNote || "").replace(/,/g, ";").replace(/\n/g, " ");
          const friction = (log.frictionReason || "").replace(/,/g, ";").replace(/\n/g, " ");
          const reflection = (log.reflection || "").replace(/,/g, ";").replace(/\n/g, " ");
          return [log.date, habitName, log.status, note, friction, reflection].join(",");
        }),
      ];
      const csv = csvRows.join("\n");
      if (Platform.OS === "web") {
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `tinywins_history_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const fileUri = FileSystem.documentDirectory + `tinywins_history_${new Date().toISOString().slice(0, 10)}.csv`;
        await FileSystem.writeAsStringAsync(fileUri, csv, { encoding: FileSystem.EncodingType.UTF8 });
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(fileUri, { mimeType: "text/csv", dialogTitle: "Export History" });
        }
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      Alert.alert("Export Failed", "Something went wrong exporting your history. Please try again.");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topPadding }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 + bottomPadding }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <Text style={[styles.title, { color: colors.text }]}>settings</Text>
        </View>

        <View style={styles.themePreview}>
          <LinearGradient
            colors={isDark ? ["#1A1A25", "#0A0A0F"] : ["#FFFFFF", "#F2F2F7"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.themePreviewGradient}
          />
          <View style={styles.themePreviewContent}>
            <View style={styles.themeModeRow}>
              <Pressable
                onPress={() => {
                  if (isDark) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    toggleTheme();
                  }
                }}
                style={[
                  styles.themePill,
                  !isDark && styles.themePillActive,
                  { borderColor: !isDark ? colors.accent : colors.cardBorder },
                ]}
              >
                <Ionicons name="sunny" size={18} color={!isDark ? colors.accent : colors.textMuted} />
                <Text style={[styles.themePillText, { color: !isDark ? colors.accent : colors.textMuted }]}>
                  Light
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  if (!isDark) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    toggleTheme();
                  }
                }}
                style={[
                  styles.themePill,
                  isDark && styles.themePillActive,
                  { borderColor: isDark ? colors.accent : colors.cardBorder },
                ]}
              >
                <Ionicons name="moon" size={18} color={isDark ? colors.accent : colors.textMuted} />
                <Text style={[styles.themePillText, { color: isDark ? colors.accent : colors.textMuted }]}>
                  Dark
                </Text>
              </Pressable>
            </View>
            <Text style={[styles.themeLabel, { color: colors.textSecondary }]}>
              {isDark ? "Dark mode active" : "Light mode active"}
            </Text>
          </View>
        </View>


        <SettingsSection title="General">
          <SettingsRow
            icon="notifications-outline"
            iconColor="#FF3B7F"
            label="Notifications"
            value="On"
            onPress={() => {}}
          />
          <View style={[rowStyles.divider, { backgroundColor: colors.cardBorder }]} />
          <SettingsRow
            icon="calendar-outline"
            iconColor="#7B61FF"
            label="Week Starts On"
            value={weekStartDay}
            onPress={() => {
              const currentIdx = WEEK_START_OPTIONS.indexOf(weekStartDay);
              const nextIdx = (currentIdx + 1) % WEEK_START_OPTIONS.length;
              setWeekStartDay(WEEK_START_OPTIONS[nextIdx]);
            }}
          />
        </SettingsSection>

        <SettingsSection title="Data">
          <SettingsRow
            icon="cloud-upload-outline"
            iconColor="#00E5C3"
            label="Cloud Backup"
            value="Soon"
            onPress={() => {}}
          />
          <View style={[rowStyles.divider, { backgroundColor: colors.cardBorder }]} />
          <SettingsRow
            icon="download-outline"
            iconColor="#4DA6FF"
            label="Export History"
            value="Soon"
            onPress={() => {}}
          />
        </SettingsSection>

        <SettingsSection title="About">
          <SettingsRow
            icon="heart-outline"
            iconColor="#FF6B9D"
            label="Rate Tiny Wins"
            onPress={() => {}}
          />
          <View style={[rowStyles.divider, { backgroundColor: colors.cardBorder }]} />
          <SettingsRow
            icon="information-circle-outline"
            iconColor={colors.textSecondary}
            label="Version"
            value="1.0.0"
            onPress={() => setChangelogVisible(true)}
          />
        </SettingsSection>

        <Pressable
          onPress={handleResetOnboarding}
          style={({ pressed }) => [
            styles.resetButton,
            { backgroundColor: colors.surface, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Ionicons name="refresh-outline" size={18} color={colors.textSecondary} />
          <Text style={[styles.resetText, { color: colors.textSecondary }]}>
            Replay Onboarding
          </Text>
        </Pressable>
      </ScrollView>

      <Modal visible={changelogVisible} transparent animationType="slide" onRequestClose={() => setChangelogVisible(false)}>
        <Pressable style={clStyles.overlay} onPress={() => setChangelogVisible(false)}>
          <Pressable style={[clStyles.sheet, { backgroundColor: colors.surface }]} onPress={() => {}}>
            <View style={clStyles.handle} />
            <View style={clStyles.headerRow}>
              <Ionicons name="document-text" size={20} color={colors.accent} />
              <Text style={[clStyles.title, { color: colors.text }]}>changelog</Text>
              <Pressable onPress={() => setChangelogVisible(false)} style={[clStyles.closeBtn, { backgroundColor: colors.surfaceLight }]}>
                <Ionicons name="close" size={18} color={colors.textSecondary} />
              </Pressable>
            </View>
            <Text style={[clStyles.subtitle, { color: colors.textSecondary }]}>
              what's new in tiny wins
            </Text>

            <ScrollView style={clStyles.list} showsVerticalScrollIndicator={false}>
              {CHANGELOG.length === 0 ? (
                <View style={{ alignItems: "center", paddingVertical: 32, gap: 10 }}>
                  <Ionicons name="time-outline" size={32} color={colors.textMuted} />
                  <Text style={{ fontFamily: "Inter_500Medium", fontSize: 14, color: colors.textMuted, textAlign: "center" }}>
                    no updates yet
                  </Text>
                </View>
              ) : (
                CHANGELOG.map((entry, idx) => (
                  <View key={entry.version} style={clStyles.entry}>
                    <View style={clStyles.entryTrack}>
                      <View style={[clStyles.entryDot, { backgroundColor: idx === 0 ? colors.accent : colors.textMuted }]} />
                      {idx < CHANGELOG.length - 1 && (
                        <View style={[clStyles.entryLine, { backgroundColor: colors.cardBorder }]} />
                      )}
                    </View>
                    <View style={[clStyles.entryCard, { backgroundColor: colors.surfaceLight }]}>
                      <View style={clStyles.entryHeader}>
                        <Text style={[clStyles.entryVersion, { color: idx === 0 ? colors.accent : colors.text }]}>
                          v{entry.version}
                        </Text>
                        {idx === 0 && (
                          <View style={[clStyles.latestBadge, { backgroundColor: colors.accent + "20" }]}>
                            <Text style={[clStyles.latestText, { color: colors.accent }]}>latest</Text>
                          </View>
                        )}
                        <Text style={[clStyles.entryDate, { color: colors.textMuted }]}>{entry.date}</Text>
                      </View>
                      {entry.changes.map((change, ci) => (
                        <View key={ci} style={clStyles.changeRow}>
                          <Ionicons
                            name={change.type === "added" ? "add-circle" : change.type === "improved" ? "arrow-up-circle" : "construct"}
                            size={14}
                            color={change.type === "added" ? "#00E5C3" : change.type === "improved" ? "#7B61FF" : "#FF8C42"}
                          />
                          <Text style={[clStyles.changeText, { color: colors.textSecondary }]}>{change.text}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const CHANGELOG: { version: string; date: string; changes: { type: "added" | "improved" | "fixed"; text: string }[] }[] = [];

const clStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  sheet: {
    borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24,
    maxHeight: "80%",
  },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.2)", alignSelf: "center", marginBottom: 20,
  },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  title: { fontFamily: "Inter_700Bold", fontSize: 20, flex: 1 },
  closeBtn: {
    width: 34, height: 34, borderRadius: 17,
    alignItems: "center", justifyContent: "center",
  },
  subtitle: { fontFamily: "Inter_400Regular", fontSize: 14, marginBottom: 16 },
  list: { maxHeight: 450 },
  entry: { flexDirection: "row", gap: 12 },
  entryTrack: { alignItems: "center", width: 14, paddingTop: 2 },
  entryDot: { width: 10, height: 10, borderRadius: 5 },
  entryLine: { width: 2, flex: 1, marginTop: 4, borderRadius: 1 },
  entryCard: {
    flex: 1, borderRadius: 14, padding: 14, marginBottom: 12,
  },
  entryHeader: {
    flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10,
  },
  entryVersion: { fontFamily: "Inter_700Bold", fontSize: 16 },
  latestBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  latestText: { fontFamily: "Inter_600SemiBold", fontSize: 10 },
  entryDate: { fontFamily: "Inter_400Regular", fontSize: 12, marginLeft: "auto" },
  changeRow: { flexDirection: "row", alignItems: "flex-start", gap: 8, marginBottom: 6 },
  changeText: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 18, flex: 1 },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
  },
  themePreview: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 28,
  },
  themePreviewGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  themePreviewContent: {
    padding: 24,
    alignItems: "center",
    gap: 16,
  },
  themeModeRow: {
    flexDirection: "row",
    gap: 12,
  },
  themePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  themePillActive: {
    borderWidth: 2,
  },
  themePillText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
  themeLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 24,
  },
  resetText: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
  },
  upgradeCard: {
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 24,
  },
  upgradeContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 18,
  },
  upgradeLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  upgradeTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: "#FFF",
  },
  upgradeDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  premiumBadgeText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
});

const sectionStyles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  title: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
    marginBottom: 10,
    marginLeft: 4,
  },
  card: {
    borderRadius: 16,
    overflow: "hidden",
  },
});

const rowStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 12,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontFamily: "Inter_500Medium",
    fontSize: 15,
    flex: 1,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  value: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 58,
  },
});

const lockStyles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    color: "#FFD700",
    textTransform: "uppercase" as const,
  },
});
