import React from "react";
import { StyleSheet, Text, View, Pressable, TextInput } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { ICON_OPTIONS, COLOR_OPTIONS, UNIT_OPTIONS, ColorOption } from "@/components/shared/constants";
import { DAYS_LIST, buildCustomFrequency } from "@/lib/utils/frequency";

interface HabitStepProps {
  title: string;
  setTitle: (text: string) => void;
  icon: string;
  setIcon: (icon: string) => void;
  colorIdx: number;
  setColorIdx: (idx: number) => void;
  goal: string;
  setGoal: (goal: string) => void;
  unit: string;
  setUnit: (unit: string) => void;
  frequency: string;
  setFrequency: (freq: string) => void;
  customInterval: string;
  setCustomInterval: (interval: string) => void;
  customPeriod: "days" | "weeks";
  setCustomPeriod: (period: "days" | "weeks") => void;
  customDays: string[];
  toggleDay: (day: string) => void;
  selectedColor: ColorOption;
  inputBorder: (field: string) => object;
  focusProps: (field: string) => object;
  colors: any;
}

export function HabitStep({
  title,
  setTitle,
  icon,
  setIcon,
  colorIdx,
  setColorIdx,
  goal,
  setGoal,
  unit,
  setUnit,
  frequency,
  setFrequency,
  customInterval,
  setCustomInterval,
  customPeriod,
  setCustomPeriod,
  customDays,
  toggleDay,
  selectedColor,
  inputBorder,
  focusProps,
  colors,
}: HabitStepProps) {
  return (
    <View style={styles.content}>
      <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>habit name</Text>
      <View style={[styles.inputWrap, { backgroundColor: colors.surfaceLight }, inputBorder("title")]}>
        <TextInput
          style={[styles.textInput, { color: colors.text }]}
          placeholder="e.g. Read, Meditate, Run..."
          placeholderTextColor={colors.textMuted}
          value={title}
          onChangeText={setTitle}
          maxLength={30}
          autoFocus
          {...focusProps("title")}
        />
      </View>

      <Text style={[styles.fieldLabel, { color: colors.textSecondary, marginTop: 20 }]}>icon</Text>
      <View style={styles.iconGrid}>
        {ICON_OPTIONS.map((opt) => (
          <Pressable
            key={opt.name}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setIcon(opt.name);
            }}
            style={[
              styles.iconBtn,
              { backgroundColor: colors.surfaceLight },
              icon === opt.name && { borderColor: selectedColor.color, borderWidth: 2 },
            ]}
          >
            <Ionicons name={opt.name as any} size={20} color={icon === opt.name ? selectedColor.color : colors.textMuted} />
          </Pressable>
        ))}
      </View>

      <Text style={[styles.fieldLabel, { color: colors.textSecondary, marginTop: 20 }]}>color</Text>
      <View style={styles.colorRow}>
        {COLOR_OPTIONS.map((opt, idx) => (
          <Pressable
            key={opt.color}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setColorIdx(idx);
            }}
            style={[styles.colorBtn, idx === colorIdx && { borderWidth: 2.5, borderColor: opt.color }]}
          >
            <LinearGradient colors={opt.gradient} style={styles.colorSwatch} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
          </Pressable>
        ))}
      </View>

      <Text style={[styles.fieldLabel, { color: colors.textSecondary, marginTop: 20 }]}>frequency</Text>
      <View style={styles.frequencyRow}>
        {["Daily", "Weekdays", "Weekends", "3x per week", "Custom"].map((f) => (
          <Pressable
            key={f}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setFrequency(f); }}
            style={[
              styles.frequencyPill,
              { backgroundColor: colors.surfaceLight },
              f === frequency && { backgroundColor: selectedColor.color + "20", borderColor: selectedColor.color },
            ]}
          >
            <Text style={[styles.frequencyText, { color: colors.textMuted }, f === frequency && { color: selectedColor.color }]}>
              {f}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={[styles.fieldLabel, { color: colors.textSecondary, marginTop: 20 }]}>
        {frequency === "Weekdays" ? "weekday target" : frequency === "Weekends" ? "weekend target" : frequency === "3x per week" ? "per-session target" : frequency === "Custom" ? "per-session target" : "daily target"}
      </Text>
      <View style={[styles.targetRow, { backgroundColor: colors.surfaceLight }]}>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            const v = Math.max(1, (parseInt(goal) || 1) - 1);
            setGoal(v.toString());
          }}
          style={styles.targetBtn}
        >
          <Feather name="minus" size={20} color={colors.textSecondary} />
        </Pressable>
        <View style={styles.targetCenter}>
          <TextInput
            style={[styles.targetInput, { color: colors.text }]}
            value={goal}
            onChangeText={(t) => setGoal(t.replace(/[^0-9]/g, ""))}
            keyboardType="number-pad"
            maxLength={4}
          />
        </View>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            const v = (parseInt(goal) || 0) + 1;
            setGoal(v.toString());
          }}
          style={styles.targetBtn}
        >
          <Feather name="plus" size={20} color={colors.textSecondary} />
        </Pressable>
      </View>

      <View style={[styles.unitRow, { marginTop: 20 }]}>
        {UNIT_OPTIONS.map((u) => (
          <Pressable
            key={u}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setUnit(u); }}
            style={[
              styles.unitPill,
              { backgroundColor: colors.surface },
              u === unit && { backgroundColor: selectedColor.color + "20", borderColor: selectedColor.color },
            ]}
          >
            <Text style={[styles.unitText, { color: colors.textMuted }, u === unit && { color: selectedColor.color }]}>{u}</Text>
          </Pressable>
        ))}
      </View>

      {frequency === "Custom" && (
        <View style={[styles.customPanel, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
          <View style={styles.customRow}>
            <Text style={[styles.customLabel, { color: colors.textSecondary }]}>repeat every</Text>
            <View style={[styles.customIntervalWrap, { backgroundColor: colors.surfaceLight }]}>
              <Pressable
                onPress={() => {
                  const v = Math.max(1, (parseInt(customInterval) || 1) - 1);
                  setCustomInterval(v.toString());
                }}
                style={styles.customIntervalBtn}
              >
                <Ionicons name="remove" size={18} color={colors.textMuted} />
              </Pressable>
              <TextInput
                style={[styles.customIntervalInput, { color: colors.text }]}
                value={customInterval}
                onChangeText={(t) => setCustomInterval(t.replace(/[^0-9]/g, ""))}
                keyboardType="number-pad"
                maxLength={2}
              />
              <Pressable
                onPress={() => {
                  const v = (parseInt(customInterval) || 0) + 1;
                  setCustomInterval(v.toString());
                }}
                style={styles.customIntervalBtn}
              >
                <Ionicons name="add" size={18} color={colors.textMuted} />
              </Pressable>
            </View>
            <View style={styles.customPeriodRow}>
              {(["days", "weeks"] as const).map((p) => (
                <Pressable
                  key={p}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setCustomPeriod(p); }}
                  style={[
                    styles.customPeriodPill,
                    { backgroundColor: colors.surfaceLight },
                    p === customPeriod && { backgroundColor: selectedColor.color + "20", borderColor: selectedColor.color },
                  ]}
                >
                  <Text style={[styles.customPeriodText, { color: colors.textMuted }, p === customPeriod && { color: selectedColor.color }]}>
                    {p}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {customPeriod === "weeks" && (
            <View style={styles.customDaysSection}>
              <Text style={[styles.customLabel, { color: colors.textSecondary, marginBottom: 10 }]}>on these days</Text>
              <View style={styles.customDaysRow}>
                {DAYS_LIST.map((day) => (
                  <Pressable
                    key={day}
                    onPress={() => toggleDay(day)}
                    style={[
                      styles.customDayBtn,
                      { backgroundColor: colors.surfaceLight },
                      customDays.includes(day) && { backgroundColor: selectedColor.color + "20", borderColor: selectedColor.color },
                    ]}
                  >
                    <Text style={[styles.customDayText, { color: colors.textMuted }, customDays.includes(day) && { color: selectedColor.color }]}>
                      {day}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          <View style={[styles.customSummaryBar, { backgroundColor: colors.surfaceLight }]}>
            <Ionicons name="calendar-outline" size={14} color={selectedColor.color} />
            <Text style={[styles.customSummaryText, { color: colors.text }]}>{buildCustomFrequency(customInterval, customPeriod, customDays)}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: 0 },
  fieldLabel: { fontFamily: "Inter_600SemiBold", fontSize: 14, marginBottom: 8 },
  inputWrap: { borderRadius: 14, overflow: "hidden", borderWidth: 1.5, borderColor: "transparent" },
  textInput: { fontFamily: "Inter_500Medium", fontSize: 16, paddingHorizontal: 16, paddingVertical: 14 },
  iconGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  iconBtn: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: "transparent",
  },
  colorRow: { flexDirection: "row", gap: 12, flexWrap: "wrap" },
  colorBtn: {
    width: 36, height: 36, borderRadius: 18, padding: 3,
    borderWidth: 2, borderColor: "transparent",
  },
  colorSwatch: { flex: 1, borderRadius: 15 },
  targetRow: {
    flexDirection: "row", alignItems: "center",
    borderRadius: 16, height: 52,
  },
  targetBtn: { width: 52, height: 52, alignItems: "center", justifyContent: "center" },
  targetCenter: { flex: 1, alignItems: "center", justifyContent: "center" },
  targetInput: { fontFamily: "Inter_700Bold", fontSize: 22, textAlign: "center", width: "100%", paddingVertical: 0 },
  unitRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  unitPill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, borderWidth: 1.5, borderColor: "transparent" },
  unitText: { fontFamily: "Inter_500Medium", fontSize: 13 },
  frequencyRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  frequencyPill: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12,
    borderWidth: 1.5, borderColor: "transparent",
  },
  frequencyText: { fontFamily: "Inter_500Medium", fontSize: 13 },
  customPanel: {
    marginTop: 14, borderRadius: 16, borderWidth: 1, padding: 16, gap: 16,
  },
  customRow: {
    flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 10,
  },
  customLabel: { fontFamily: "Inter_500Medium", fontSize: 13 },
  customIntervalWrap: {
    flexDirection: "row", alignItems: "center", borderRadius: 12, overflow: "hidden",
  },
  customIntervalBtn: {
    width: 36, height: 36, alignItems: "center", justifyContent: "center",
  },
  customIntervalInput: {
    fontFamily: "Inter_700Bold", fontSize: 16, textAlign: "center", width: 36, paddingVertical: 6,
  },
  customPeriodRow: { flexDirection: "row", gap: 6 },
  customPeriodPill: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, borderWidth: 1.5, borderColor: "transparent",
  },
  customPeriodText: { fontFamily: "Inter_500Medium", fontSize: 13 },
  customDaysSection: { marginTop: 2 },
  customDaysRow: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  customDayBtn: {
    width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center",
    borderWidth: 1.5, borderColor: "transparent",
  },
  customDayText: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  customSummaryBar: {
    flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10,
  },
  customSummaryText: { fontFamily: "Inter_500Medium", fontSize: 13 },
});
