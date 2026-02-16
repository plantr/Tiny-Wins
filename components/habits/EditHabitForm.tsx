import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  TextInput,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { ICON_OPTIONS, COLOR_OPTIONS, UNIT_OPTIONS, FREQUENCY_OPTIONS, ColorOption } from "@/components/shared/constants";
import { IDENTITY_AREAS } from "@/lib/identity-context";
import { DAYS_LIST, buildCustomFrequency } from "@/lib/utils/frequency";

export interface EditHabitFormProps {
  // Name
  title: string;
  setTitle: (v: string) => void;
  // Icon
  selectedIcon: string;
  setSelectedIcon: (v: string) => void;
  // Color
  selectedColorIdx: number;
  setSelectedColorIdx: (v: number) => void;
  selectedColor: ColorOption;
  // Target
  goal: string;
  setGoal: (v: string) => void;
  selectedUnit: string;
  setSelectedUnit: (v: string) => void;
  // Frequency
  selectedFrequency: string;
  setSelectedFrequency: (v: string) => void;
  customInterval: string;
  setCustomInterval: (v: string) => void;
  customPeriod: "days" | "weeks";
  setCustomPeriod: (v: "days" | "weeks") => void;
  customDays: string[];
  toggleDay: (day: string) => void;
  // Identity
  selectedIdentityId: string;
  setSelectedIdentityId: (v: string) => void;
  customIdentity: string;
  setCustomIdentity: (v: string) => void;
  // Intention
  intentionBehaviour: string;
  setIntentionBehaviour: (v: string) => void;
  intentionTime: string;
  setIntentionTime: (v: string) => void;
  intentionLocation: string;
  setIntentionLocation: (v: string) => void;
  timeMode: "any" | "specific";
  setTimeMode: (v: "any" | "specific") => void;
  reminderHour: string;
  setReminderHour: (v: string) => void;
  reminderMinute: string;
  setReminderMinute: (v: string) => void;
  reminderPeriod: "AM" | "PM";
  setReminderPeriod: (v: "AM" | "PM") => void;
  // Stack
  stackAnchor: string;
  setStackAnchor: (v: string) => void;
  // Versions
  twoMinVersion: string;
  setTwoMinVersion: (v: string) => void;
  standardVersion: string;
  setStandardVersion: (v: string) => void;
  stretchVersion: string;
  setStretchVersion: (v: string) => void;
  // Helpers
  inputBorder: (field: string) => object;
  focusProps: (field: string) => object;
  colors: any;
}

export default function EditHabitForm({
  title,
  setTitle,
  selectedIcon,
  setSelectedIcon,
  selectedColorIdx,
  setSelectedColorIdx,
  selectedColor,
  goal,
  setGoal,
  selectedUnit,
  setSelectedUnit,
  selectedFrequency,
  setSelectedFrequency,
  customInterval,
  setCustomInterval,
  customPeriod,
  setCustomPeriod,
  customDays,
  toggleDay,
  selectedIdentityId,
  setSelectedIdentityId,
  customIdentity,
  setCustomIdentity,
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
  stackAnchor,
  setStackAnchor,
  twoMinVersion,
  setTwoMinVersion,
  standardVersion,
  setStandardVersion,
  stretchVersion,
  setStretchVersion,
  inputBorder,
  focusProps,
  colors,
}: EditHabitFormProps) {
  return (
    <>
      <View style={styles.formSection}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>name</Text>
        <View
          style={[
            styles.inputContainer,
            { backgroundColor: colors.surface, borderColor: colors.cardBorder },
            inputBorder("title"),
          ]}
        >
          <TextInput
            style={[styles.textInput, { color: colors.text }]}
            placeholder="e.g. Drink Water, Run, Read..."
            placeholderTextColor={colors.textMuted}
            value={title}
            onChangeText={setTitle}
            maxLength={30}
            {...focusProps("title")}
          />
        </View>
      </View>

      <View style={styles.formSection}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>icon</Text>
        <View style={styles.iconGrid}>
          {ICON_OPTIONS.map((opt) => {
            const isSelected = opt.name === selectedIcon;
            return (
              <Pressable
                key={opt.name}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedIcon(opt.name);
                }}
                style={[
                  styles.iconOption,
                  {
                    backgroundColor: colors.surface,
                    borderColor: isSelected ? selectedColor.color : "transparent",
                  },
                ]}
              >
                <Ionicons
                  name={opt.name as any}
                  size={22}
                  color={isSelected ? selectedColor.color : colors.textMuted}
                />
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.formSection}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>color</Text>
        <View style={styles.colorRow}>
          {COLOR_OPTIONS.map((opt, idx) => {
            const isSelected = idx === selectedColorIdx;
            return (
              <Pressable
                key={opt.color}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedColorIdx(idx);
                }}
                style={[
                  styles.colorOption,
                  isSelected && { borderWidth: 2.5, borderColor: opt.color },
                ]}
              >
                <LinearGradient
                  colors={opt.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.colorSwatch}
                />
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.formSection}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>target</Text>
        <View style={styles.goalRow}>
          <View
            style={[
              styles.goalInputWrap,
              { backgroundColor: colors.surface, borderColor: colors.cardBorder },
            ]}
          >
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                const v = Math.max(1, (parseInt(goal) || 1) - 1);
                setGoal(v.toString());
              }}
              style={styles.goalButton}
            >
              <Feather name="minus" size={18} color={colors.textSecondary} />
            </Pressable>
            <TextInput
              style={[styles.goalInput, { color: colors.text }]}
              value={goal}
              onChangeText={(t) => setGoal(t.replace(/[^0-9]/g, ""))}
              keyboardType="number-pad"
              maxLength={4}
            />
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                const v = (parseInt(goal) || 0) + 1;
                setGoal(v.toString());
              }}
              style={styles.goalButton}
            >
              <Feather name="plus" size={18} color={colors.textSecondary} />
            </Pressable>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.unitScroll}
          >
            {UNIT_OPTIONS.map((u) => (
              <Pressable
                key={u}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedUnit(u);
                }}
                style={[
                  styles.unitPill,
                  { backgroundColor: colors.surface },
                  u === selectedUnit && {
                    backgroundColor: selectedColor.color + "20",
                    borderColor: selectedColor.color,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.unitText,
                    { color: colors.textMuted },
                    u === selectedUnit && { color: selectedColor.color },
                  ]}
                >
                  {u}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </View>

      <View style={styles.formSection}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>frequency</Text>
        <View style={styles.frequencyRow}>
          {FREQUENCY_OPTIONS.map((f) => (
            <Pressable
              key={f}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedFrequency(f);
              }}
              style={[
                styles.frequencyPill,
                { backgroundColor: colors.surface },
                f === selectedFrequency && {
                  backgroundColor: selectedColor.color + "20",
                  borderColor: selectedColor.color,
                },
              ]}
            >
              <Text
                style={[
                  styles.frequencyText,
                  { color: colors.textMuted },
                  f === selectedFrequency && { color: selectedColor.color },
                ]}
              >
                {f}
              </Text>
            </Pressable>
          ))}
        </View>

        {selectedFrequency === "Custom" && (
          <View
            style={[
              styles.customPanel,
              { backgroundColor: colors.surface, borderColor: colors.cardBorder },
            ]}
          >
            <View style={styles.customRow}>
              <Text style={[styles.customLabel, { color: colors.textSecondary }]}>
                repeat every
              </Text>
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
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setCustomPeriod(p);
                    }}
                    style={[
                      styles.customPeriodPill,
                      { backgroundColor: colors.surfaceLight },
                      p === customPeriod && {
                        backgroundColor: selectedColor.color + "20",
                        borderColor: selectedColor.color,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.customPeriodText,
                        { color: colors.textMuted },
                        p === customPeriod && { color: selectedColor.color },
                      ]}
                    >
                      {p}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {customPeriod === "weeks" && (
              <View style={styles.customDaysSection}>
                <Text
                  style={[
                    styles.customLabel,
                    { color: colors.textSecondary, marginBottom: 10 },
                  ]}
                >
                  on these days
                </Text>
                <View style={styles.customDaysRow}>
                  {DAYS_LIST.map((day) => (
                    <Pressable
                      key={day}
                      onPress={() => toggleDay(day)}
                      style={[
                        styles.customDayBtn,
                        { backgroundColor: colors.surfaceLight },
                        customDays.includes(day) && {
                          backgroundColor: selectedColor.color + "20",
                          borderColor: selectedColor.color,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.customDayText,
                          { color: colors.textMuted },
                          customDays.includes(day) && { color: selectedColor.color },
                        ]}
                      >
                        {day}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            <View style={[styles.customSummaryBar, { backgroundColor: colors.surfaceLight }]}>
              <Ionicons name="calendar-outline" size={14} color={selectedColor.color} />
              <Text style={[styles.customSummaryText, { color: colors.text }]}>
                {buildCustomFrequency(customInterval, customPeriod, customDays)}
              </Text>
            </View>
          </View>
        )}
      </View>

      <View style={[styles.divider, { backgroundColor: colors.cardBorder }]} />

      <View style={styles.formSection}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>identity link</Text>
        <View style={styles.chipGrid}>
          {IDENTITY_AREAS.map((area) => (
            <Pressable
              key={area.id}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedIdentityId(area.id);
              }}
              style={[
                styles.chip,
                { backgroundColor: colors.surface },
                selectedIdentityId === area.id && {
                  backgroundColor: area.color + "20",
                  borderColor: area.color,
                },
              ]}
            >
              <Ionicons
                name={area.icon as any}
                size={14}
                color={selectedIdentityId === area.id ? area.color : colors.textMuted}
              />
              <Text
                style={[
                  styles.chipText,
                  {
                    color:
                      selectedIdentityId === area.id ? area.color : colors.textMuted,
                  },
                ]}
              >
                {area.label}
              </Text>
            </Pressable>
          ))}
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedIdentityId("custom");
            }}
            style={[
              styles.chip,
              { backgroundColor: colors.surface },
              selectedIdentityId === "custom" && {
                backgroundColor: colors.accent + "20",
                borderColor: colors.accent,
              },
            ]}
          >
            <Ionicons
              name="add-circle"
              size={14}
              color={selectedIdentityId === "custom" ? colors.accent : colors.textMuted}
            />
            <Text
              style={[
                styles.chipText,
                {
                  color:
                    selectedIdentityId === "custom" ? colors.accent : colors.textMuted,
                },
              ]}
            >
              custom
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedIdentityId("");
            }}
            style={[
              styles.chip,
              { backgroundColor: colors.surface },
              selectedIdentityId === "" && {
                backgroundColor: colors.textMuted + "20",
                borderColor: colors.textMuted,
              },
            ]}
          >
            <Ionicons name="close-circle" size={14} color={colors.textMuted} />
            <Text style={[styles.chipText, { color: colors.textMuted }]}>none</Text>
          </Pressable>
        </View>
        {selectedIdentityId === "custom" && (
          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: colors.surface,
                borderColor: colors.cardBorder,
                marginTop: 12,
              },
              inputBorder("customIdentity"),
            ]}
          >
            <TextInput
              style={[styles.textInput, { color: colors.text }]}
              placeholder="e.g. a disciplined person"
              placeholderTextColor={colors.textMuted}
              value={customIdentity}
              onChangeText={setCustomIdentity}
              maxLength={40}
              {...focusProps("customIdentity")}
            />
          </View>
        )}
      </View>

      <View style={styles.formSection}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          implementation intention
        </Text>
        <Text style={[styles.hint, { color: colors.textMuted }]}>I will...</Text>
        <View
          style={[
            styles.inputContainer,
            { backgroundColor: colors.surface, borderColor: colors.cardBorder },
            inputBorder("behaviour"),
          ]}
        >
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
        <Text style={[styles.hint, { color: colors.textMuted, marginTop: 10 }]}>at...</Text>
        <View style={styles.timeModeRow}>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setTimeMode("any");
            }}
            style={[
              styles.timeModePill,
              { backgroundColor: colors.surface },
              timeMode === "any" && {
                backgroundColor: selectedColor.color + "20",
                borderColor: selectedColor.color,
              },
            ]}
          >
            <Ionicons
              name="time-outline"
              size={14}
              color={timeMode === "any" ? selectedColor.color : colors.textMuted}
            />
            <Text
              style={[
                styles.timeModeText,
                { color: timeMode === "any" ? selectedColor.color : colors.textMuted },
              ]}
            >
              any time
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setTimeMode("specific");
            }}
            style={[
              styles.timeModePill,
              { backgroundColor: colors.surface },
              timeMode === "specific" && {
                backgroundColor: selectedColor.color + "20",
                borderColor: selectedColor.color,
              },
            ]}
          >
            <Ionicons
              name="alarm-outline"
              size={14}
              color={timeMode === "specific" ? selectedColor.color : colors.textMuted}
            />
            <Text
              style={[
                styles.timeModeText,
                {
                  color: timeMode === "specific" ? selectedColor.color : colors.textMuted,
                },
              ]}
            >
              specific time
            </Text>
          </Pressable>
        </View>

        {timeMode === "any" ? (
          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: colors.surface,
                borderColor: colors.cardBorder,
                marginTop: 10,
              },
              inputBorder("time"),
            ]}
          >
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
          <View
            style={[
              styles.timePickerWrap,
              { backgroundColor: colors.surface, borderColor: colors.cardBorder },
            ]}
          >
            <View style={styles.timePickerRow}>
              <View style={[styles.timeInputBox, { backgroundColor: colors.surfaceLight }]}>
                <TextInput
                  style={[styles.timeInputText, { color: colors.text }]}
                  value={reminderHour}
                  onChangeText={(t) => {
                    const n = t.replace(/[^0-9]/g, "");
                    if (n === "" || (parseInt(n) >= 1 && parseInt(n) <= 12))
                      setReminderHour(n);
                  }}
                  keyboardType="number-pad"
                  maxLength={2}
                  {...focusProps("reminderHour")}
                />
                <Text style={[styles.timeInputLabel, { color: colors.textMuted }]}>hour</Text>
              </View>
              <Text style={[styles.timeColon, { color: colors.textMuted }]}>:</Text>
              <View style={[styles.timeInputBox, { backgroundColor: colors.surfaceLight }]}>
                <TextInput
                  style={[styles.timeInputText, { color: colors.text }]}
                  value={reminderMinute}
                  onChangeText={(t) => {
                    const n = t.replace(/[^0-9]/g, "");
                    if (n === "" || (parseInt(n) >= 0 && parseInt(n) <= 59))
                      setReminderMinute(
                        n.length === 1 && parseInt(n) > 5 ? `0${n}` : n
                      );
                  }}
                  keyboardType="number-pad"
                  maxLength={2}
                  {...focusProps("reminderMinute")}
                />
                <Text style={[styles.timeInputLabel, { color: colors.textMuted }]}>min</Text>
              </View>
              <View style={styles.periodToggle}>
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setReminderPeriod("AM");
                  }}
                  style={[
                    styles.periodBtn,
                    { backgroundColor: colors.surfaceLight },
                    reminderPeriod === "AM" && {
                      backgroundColor: selectedColor.color + "20",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.periodText,
                      { color: colors.textMuted },
                      reminderPeriod === "AM" && { color: selectedColor.color },
                    ]}
                  >
                    AM
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setReminderPeriod("PM");
                  }}
                  style={[
                    styles.periodBtn,
                    { backgroundColor: colors.surfaceLight },
                    reminderPeriod === "PM" && {
                      backgroundColor: selectedColor.color + "20",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.periodText,
                      { color: colors.textMuted },
                      reminderPeriod === "PM" && { color: selectedColor.color },
                    ]}
                  >
                    PM
                  </Text>
                </Pressable>
              </View>
            </View>
            <View style={[styles.reminderNote, { backgroundColor: colors.surfaceLight }]}>
              <Ionicons name="notifications-outline" size={13} color={selectedColor.color} />
              <Text style={[styles.reminderNoteText, { color: colors.textSecondary }]}>
                reminder at {reminderHour || "7"}:{reminderMinute || "00"} {reminderPeriod}
              </Text>
            </View>
          </View>
        )}
        <Text style={[styles.hint, { color: colors.textMuted, marginTop: 10 }]}>in...</Text>
        <View
          style={[
            styles.inputContainer,
            { backgroundColor: colors.surface, borderColor: colors.cardBorder },
            inputBorder("location"),
          ]}
        >
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
      </View>

      <View style={styles.formSection}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>habit stack</Text>
        <Text style={[styles.hint, { color: colors.textMuted }]}>after I...</Text>
        <View
          style={[
            styles.inputContainer,
            { backgroundColor: colors.surface, borderColor: colors.cardBorder },
            inputBorder("stackAnchor"),
          ]}
        >
          <TextInput
            style={[styles.textInput, { color: colors.text }]}
            placeholder="e.g. pour my morning coffee"
            placeholderTextColor={colors.textMuted}
            value={stackAnchor}
            onChangeText={setStackAnchor}
            maxLength={60}
            {...focusProps("stackAnchor")}
          />
        </View>
      </View>

      <View style={styles.formSection}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          versions (2-minute rule)
        </Text>
        <Text style={[styles.hint, { color: colors.textMuted }]}>2-minute version</Text>
        <View
          style={[
            styles.inputContainer,
            { backgroundColor: colors.surface, borderColor: colors.cardBorder },
            inputBorder("twoMin"),
          ]}
        >
          <TextInput
            style={[styles.textInput, { color: colors.text }]}
            placeholder="e.g. Put on running shoes"
            placeholderTextColor={colors.textMuted}
            value={twoMinVersion}
            onChangeText={setTwoMinVersion}
            maxLength={60}
            {...focusProps("twoMin")}
          />
        </View>
        <Text style={[styles.hint, { color: colors.textMuted, marginTop: 10 }]}>
          standard version
        </Text>
        <View
          style={[
            styles.inputContainer,
            { backgroundColor: colors.surface, borderColor: colors.cardBorder },
            inputBorder("standard"),
          ]}
        >
          <TextInput
            style={[styles.textInput, { color: colors.text }]}
            placeholder={title || "your regular habit"}
            placeholderTextColor={colors.textMuted}
            value={standardVersion}
            onChangeText={setStandardVersion}
            maxLength={60}
            {...focusProps("standard")}
          />
        </View>
        <Text style={[styles.hint, { color: colors.textMuted, marginTop: 10 }]}>
          stretch version (optional)
        </Text>
        <View
          style={[
            styles.inputContainer,
            { backgroundColor: colors.surface, borderColor: colors.cardBorder },
            inputBorder("stretch"),
          ]}
        >
          <TextInput
            style={[styles.textInput, { color: colors.text }]}
            placeholder="e.g. Run a 5K"
            placeholderTextColor={colors.textMuted}
            value={stretchVersion}
            onChangeText={setStretchVersion}
            maxLength={60}
            {...focusProps("stretch")}
          />
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  formSection: {
    marginBottom: 24,
  },
  label: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    marginBottom: 10,
  },
  hint: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    marginBottom: 6,
  },
  inputContainer: {
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "transparent",
    overflow: "hidden",
  },
  textInput: {
    fontFamily: "Inter_500Medium",
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  iconOption: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  colorRow: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    padding: 3,
    borderWidth: 2,
    borderColor: "transparent",
  },
  colorSwatch: {
    flex: 1,
    borderRadius: 17,
  },
  goalRow: {
    gap: 12,
  },
  goalInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  goalButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  goalInput: {
    flex: 1,
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    textAlign: "center",
    paddingVertical: 12,
  },
  unitScroll: {
    gap: 8,
    paddingVertical: 4,
  },
  unitPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  unitText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
  frequencyRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  frequencyPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  frequencyText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
  customPanel: {
    marginTop: 14,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 16,
  },
  customRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 10,
  },
  customLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
  customIntervalWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    overflow: "hidden",
  },
  customIntervalBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  customIntervalInput: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    textAlign: "center",
    width: 36,
    paddingVertical: 6,
  },
  customPeriodRow: {
    flexDirection: "row",
    gap: 6,
  },
  customPeriodPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  customPeriodText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
  customDaysSection: {
    marginTop: 2,
  },
  customDaysRow: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
  },
  customDayBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  customDayText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },
  customSummaryBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  customSummaryText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
  timeModeRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 6,
  },
  timeModePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  timeModeText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
  timePickerWrap: {
    marginTop: 10,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  timePickerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  timeInputBox: {
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
    minWidth: 64,
  },
  timeInputText: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    textAlign: "center",
    width: 50,
    paddingVertical: 2,
  },
  timeInputLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    marginTop: 2,
  },
  timeColon: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    marginBottom: 14,
  },
  periodToggle: {
    gap: 4,
    marginLeft: 6,
  },
  periodBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
  },
  periodText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
  reminderNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  reminderNoteText: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
  },
  divider: {
    height: 1,
    marginBottom: 24,
    marginHorizontal: -20,
    opacity: 0.3,
  },
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  chipText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
});
