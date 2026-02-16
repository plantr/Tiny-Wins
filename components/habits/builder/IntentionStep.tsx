import React from "react";
import { StyleSheet, Text, View, Pressable, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { ColorOption } from "@/components/shared/constants";

interface IntentionStepProps {
  title: string;
  intentionBehaviour: string;
  setIntentionBehaviour: (text: string) => void;
  intentionTime: string;
  setIntentionTime: (text: string) => void;
  intentionLocation: string;
  setIntentionLocation: (text: string) => void;
  timeMode: "any" | "specific";
  setTimeMode: (mode: "any" | "specific") => void;
  reminderHour: string;
  setReminderHour: (hour: string) => void;
  reminderMinute: string;
  setReminderMinute: (minute: string) => void;
  reminderPeriod: "AM" | "PM";
  setReminderPeriod: (period: "AM" | "PM") => void;
  selectedColor: ColorOption;
  inputBorder: (field: string) => object;
  focusProps: (field: string) => object;
  colors: any;
}

export function IntentionStep({
  title,
  intentionBehaviour,
  setIntentionBehaviour,
  intentionTime,
  setIntentionTime,
  intentionLocation,
  setIntentionLocation,
  timeMode,
  setTimeMode,
  reminderHour,
  setReminderHour,
  reminderMinute,
  setReminderMinute,
  reminderPeriod,
  setReminderPeriod,
  selectedColor,
  inputBorder,
  focusProps,
  colors,
}: IntentionStepProps) {
  return (
    <View style={styles.content}>
      <View style={[styles.conceptBox, { backgroundColor: colors.surfaceLight }]}>
        <Ionicons name="location" size={18} color={colors.accentOrange} />
        <Text style={[styles.conceptText, { color: colors.textSecondary }]}>
          "I will [BEHAVIOR] at [TIME] in [LOCATION]." People who make a specific plan are more likely to follow through.
        </Text>
      </View>

      <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>I will...</Text>
      <View style={[styles.inputWrap, { backgroundColor: colors.surfaceLight }, inputBorder("behaviour")]}>
        <TextInput
          style={[styles.textInput, { color: colors.text }]}
          placeholder={`e.g. ${title || "meditate for 10 minutes"}`}
          placeholderTextColor={colors.textMuted}
          value={intentionBehaviour}
          onChangeText={setIntentionBehaviour}
          maxLength={60}
          {...focusProps("behaviour")}
        />
      </View>

      <Text style={[styles.fieldLabel, { color: colors.textSecondary, marginTop: 16 }]}>at...</Text>
      <View style={styles.timeModeRow}>
        <Pressable
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setTimeMode("any"); }}
          style={[
            styles.timeModePill,
            { backgroundColor: colors.surfaceLight },
            timeMode === "any" && { backgroundColor: selectedColor.color + "20", borderColor: selectedColor.color },
          ]}
        >
          <Ionicons name="time-outline" size={14} color={timeMode === "any" ? selectedColor.color : colors.textMuted} />
          <Text style={[styles.timeModeText, { color: timeMode === "any" ? selectedColor.color : colors.textMuted }]}>any time</Text>
        </Pressable>
        <Pressable
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setTimeMode("specific"); }}
          style={[
            styles.timeModePill,
            { backgroundColor: colors.surfaceLight },
            timeMode === "specific" && { backgroundColor: selectedColor.color + "20", borderColor: selectedColor.color },
          ]}
        >
          <Ionicons name="alarm-outline" size={14} color={timeMode === "specific" ? selectedColor.color : colors.textMuted} />
          <Text style={[styles.timeModeText, { color: timeMode === "specific" ? selectedColor.color : colors.textMuted }]}>specific time</Text>
        </Pressable>
      </View>

      {timeMode === "any" ? (
        <View style={[styles.inputWrap, { backgroundColor: colors.surfaceLight, marginTop: 10 }, inputBorder("time")]}>
          <TextInput
            style={[styles.textInput, { color: colors.text }]}
            placeholder="e.g. after lunch, in the morning"
            placeholderTextColor={colors.textMuted}
            value={intentionTime}
            onChangeText={setIntentionTime}
            maxLength={30}
            {...focusProps("time")}
          />
        </View>
      ) : (
        <View style={[styles.timePickerWrap, { backgroundColor: colors.surfaceLight, borderColor: colors.cardBorder }]}>
          <View style={styles.timePickerRow}>
            <View style={[styles.timeInputBox, { backgroundColor: colors.surface }]}>
              <TextInput
                style={[styles.timeInputText, { color: colors.text }]}
                value={reminderHour}
                onChangeText={(t) => {
                  const n = t.replace(/[^0-9]/g, "");
                  if (n === "" || (parseInt(n) >= 1 && parseInt(n) <= 12)) setReminderHour(n);
                }}
                keyboardType="number-pad"
                maxLength={2}
                {...focusProps("reminderHour")}
              />
              <Text style={[styles.timeInputLabel, { color: colors.textMuted }]}>hour</Text>
            </View>
            <Text style={[styles.timeColon, { color: colors.textMuted }]}>:</Text>
            <View style={[styles.timeInputBox, { backgroundColor: colors.surface }]}>
              <TextInput
                style={[styles.timeInputText, { color: colors.text }]}
                value={reminderMinute}
                onChangeText={(t) => {
                  const n = t.replace(/[^0-9]/g, "");
                  if (n === "" || (parseInt(n) >= 0 && parseInt(n) <= 59)) setReminderMinute(n.length === 1 && parseInt(n) > 5 ? `0${n}` : n);
                }}
                keyboardType="number-pad"
                maxLength={2}
                {...focusProps("reminderMinute")}
              />
              <Text style={[styles.timeInputLabel, { color: colors.textMuted }]}>min</Text>
            </View>
            <View style={styles.periodToggle}>
              <Pressable
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setReminderPeriod("AM"); }}
                style={[
                  styles.periodBtn,
                  { backgroundColor: colors.surface },
                  reminderPeriod === "AM" && { backgroundColor: selectedColor.color + "20" },
                ]}
              >
                <Text style={[styles.periodText, { color: colors.textMuted }, reminderPeriod === "AM" && { color: selectedColor.color }]}>AM</Text>
              </Pressable>
              <Pressable
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setReminderPeriod("PM"); }}
                style={[
                  styles.periodBtn,
                  { backgroundColor: colors.surface },
                  reminderPeriod === "PM" && { backgroundColor: selectedColor.color + "20" },
                ]}
              >
                <Text style={[styles.periodText, { color: colors.textMuted }, reminderPeriod === "PM" && { color: selectedColor.color }]}>PM</Text>
              </Pressable>
            </View>
          </View>
          <View style={[styles.reminderNote, { backgroundColor: colors.surface }]}>
            <Ionicons name="notifications-outline" size={13} color={selectedColor.color} />
            <Text style={[styles.reminderNoteText, { color: colors.textSecondary }]}>
              reminder at {reminderHour || "7"}:{reminderMinute || "00"} {reminderPeriod}
            </Text>
          </View>
        </View>
      )}

      <Text style={[styles.fieldLabel, { color: colors.textSecondary, marginTop: 16 }]}>in...</Text>
      <View style={[styles.inputWrap, { backgroundColor: colors.surfaceLight }, inputBorder("location")]}>
        <TextInput
          style={[styles.textInput, { color: colors.text }]}
          placeholder="e.g. my bedroom, at the park"
          placeholderTextColor={colors.textMuted}
          value={intentionLocation}
          onChangeText={setIntentionLocation}
          maxLength={40}
          {...focusProps("location")}
        />
      </View>

      <View style={[styles.previewBox, { backgroundColor: colors.surface, borderLeftColor: colors.accentOrange }]}>
        <Text style={[styles.previewText, { color: colors.text }]}>
          I will{" "}
          <Text style={{ color: colors.accentOrange }}>
            {intentionBehaviour || "[behavior]"}
          </Text>
          {" "}at{" "}
          <Text style={{ color: colors.accentPurple }}>
            {timeMode === "specific" ? `${reminderHour || "7"}:${reminderMinute || "00"} ${reminderPeriod}` : (intentionTime || "[time]")}
          </Text>
          {" "}in{" "}
          <Text style={{ color: colors.accentCyan }}>
            {intentionLocation || "[location]"}
          </Text>
          .
        </Text>
      </View>
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
  timeModeRow: { flexDirection: "row", gap: 8, marginTop: 8 },
  timeModePill: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12,
    borderWidth: 1.5, borderColor: "transparent",
  },
  timeModeText: { fontFamily: "Inter_500Medium", fontSize: 13 },
  timePickerWrap: {
    marginTop: 10, borderRadius: 16, borderWidth: 1, padding: 16, gap: 12,
  },
  timePickerRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
  },
  timeInputBox: {
    borderRadius: 12, padding: 10, alignItems: "center", minWidth: 64,
  },
  timeInputText: {
    fontFamily: "Inter_700Bold", fontSize: 28, textAlign: "center", width: 50, paddingVertical: 2,
  },
  timeInputLabel: { fontFamily: "Inter_400Regular", fontSize: 11, marginTop: 2 },
  timeColon: { fontFamily: "Inter_700Bold", fontSize: 28, marginBottom: 14 },
  periodToggle: { gap: 4, marginLeft: 6 },
  periodBtn: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, alignItems: "center",
  },
  periodText: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  reminderNote: {
    flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
  },
  reminderNoteText: { fontFamily: "Inter_500Medium", fontSize: 12 },
  previewBox: {
    borderRadius: 14, padding: 16, marginTop: 20, borderLeftWidth: 3,
  },
  previewText: { fontFamily: "Inter_500Medium", fontSize: 15, lineHeight: 22 },
});
