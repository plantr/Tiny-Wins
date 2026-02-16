import React, { useState } from "react";
import { StyleSheet, Text, View, Pressable, Modal, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/lib/theme-context";
import { useHabits, Habit } from "@/lib/habits-context";
import { formatTime } from "@/lib/utils/time";

export interface RemindersModalProps {
  visible: boolean;
  onClose: () => void;
}

function ReminderHabitRow({ habit, hours }: { habit: Habit; hours: { label: string; value: string }[] }) {
  const { colors } = useTheme();
  const { updateHabit } = useHabits();
  const [showPicker, setShowPicker] = useState(false);

  return (
    <View>
      <View style={[reminderStyles.habitRow, { backgroundColor: colors.surfaceLight }]}>
        <View style={[reminderStyles.habitIcon, { backgroundColor: habit.gradientColors[0] + "20" }]}>
          <Ionicons name={habit.icon as any} size={18} color={habit.gradientColors[0]} />
        </View>
        <View style={reminderStyles.habitInfo}>
          <Text style={[reminderStyles.habitName, { color: colors.text }]}>{habit.title}</Text>
          <Text style={[reminderStyles.noReminderText, { color: colors.textMuted }]}>no reminder</Text>
        </View>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowPicker(!showPicker);
          }}
          style={[reminderStyles.addBtn, { backgroundColor: colors.accent + "18" }]}
        >
          <Ionicons name={showPicker ? "chevron-up" : "notifications-outline"} size={16} color={colors.accent} />
        </Pressable>
      </View>
      {showPicker && (
        <View style={[reminderStyles.pickerGrid, { backgroundColor: colors.surfaceLight }]}>
          {hours.map((h) => (
            <Pressable
              key={h.value}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                updateHabit(habit.id, { reminderTime: h.value });
                setShowPicker(false);
              }}
              style={[reminderStyles.timeSlot, { backgroundColor: colors.surface }]}
            >
              <Text style={[reminderStyles.timeSlotText, { color: colors.text }]}>{h.label}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

export function RemindersModal({ visible, onClose }: RemindersModalProps) {
  const { colors } = useTheme();
  const { habits, updateHabit } = useHabits();

  const HOURS = Array.from({ length: 24 }, (_, i) => {
    const h = i % 12 === 0 ? 12 : i % 12;
    const ampm = i < 12 ? "am" : "pm";
    return { label: `${h}:00 ${ampm}`, value: `${String(i).padStart(2, "0")}:00` };
  });

  const habitsWithReminders = habits.filter((h) => h.reminderTime);
  const habitsWithoutReminders = habits.filter((h) => !h.reminderTime);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={reminderStyles.overlay} onPress={onClose}>
        <Pressable style={[reminderStyles.sheet, { backgroundColor: colors.surface }]} onPress={() => {}}>
          <View style={reminderStyles.handle} />
          <View style={reminderStyles.headerRow}>
            <Ionicons name="notifications" size={20} color="#FF3B7F" />
            <Text style={[reminderStyles.title, { color: colors.text }]}>reminders</Text>
            <Pressable onPress={onClose} style={[reminderStyles.closeBtn, { backgroundColor: colors.surfaceLight }]}>
              <Ionicons name="close" size={18} color={colors.textSecondary} />
            </Pressable>
          </View>
          <Text style={[reminderStyles.subtitle, { color: colors.textSecondary }]}>
            set daily reminder times for your habits
          </Text>

          <ScrollView style={reminderStyles.list} showsVerticalScrollIndicator={false}>
            {habits.length === 0 && (
              <View style={reminderStyles.emptyState}>
                <Ionicons name="notifications-off-outline" size={32} color={colors.textMuted} />
                <Text style={[reminderStyles.emptyText, { color: colors.textMuted }]}>
                  add habits first to set reminders
                </Text>
              </View>
            )}

            {habitsWithReminders.length > 0 && (
              <View style={{ marginBottom: 16 }}>
                <Text style={[reminderStyles.sectionLabel, { color: colors.textMuted }]}>active reminders</Text>
                {habitsWithReminders.map((habit) => (
                  <View key={habit.id} style={[reminderStyles.habitRow, { backgroundColor: colors.surfaceLight }]}>
                    <View style={[reminderStyles.habitIcon, { backgroundColor: habit.gradientColors[0] + "20" }]}>
                      <Ionicons name={habit.icon as any} size={18} color={habit.gradientColors[0]} />
                    </View>
                    <View style={reminderStyles.habitInfo}>
                      <Text style={[reminderStyles.habitName, { color: colors.text }]}>{habit.title}</Text>
                      <View style={reminderStyles.timeRow}>
                        <Ionicons name="time-outline" size={13} color="#FF3B7F" />
                        <Text style={[reminderStyles.timeText, { color: "#FF3B7F" }]}>{formatTime(habit.reminderTime!)}</Text>
                      </View>
                    </View>
                    <Pressable
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        updateHabit(habit.id, { reminderTime: undefined });
                      }}
                      style={[reminderStyles.removeBtn, { backgroundColor: "#FF3B7F15" }]}
                    >
                      <Ionicons name="notifications-off" size={16} color="#FF3B7F" />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}

            {habitsWithoutReminders.length > 0 && (
              <View>
                <Text style={[reminderStyles.sectionLabel, { color: colors.textMuted }]}>
                  {habitsWithReminders.length > 0 ? "no reminder set" : "your habits"}
                </Text>
                {habitsWithoutReminders.map((habit) => (
                  <ReminderHabitRow key={habit.id} habit={habit} hours={HOURS} />
                ))}
              </View>
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const reminderStyles = StyleSheet.create({
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
  subtitle: { fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 20, marginBottom: 16 },
  list: { maxHeight: 400 },
  sectionLabel: {
    fontFamily: "Inter_600SemiBold", fontSize: 11, textTransform: "uppercase",
    letterSpacing: 0.8, marginBottom: 10,
  },
  habitRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    padding: 14, borderRadius: 14, marginBottom: 8,
  },
  habitIcon: {
    width: 36, height: 36, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
  },
  habitInfo: { flex: 1, gap: 2 },
  habitName: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  timeRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  timeText: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  noReminderText: { fontFamily: "Inter_400Regular", fontSize: 12 },
  removeBtn: {
    width: 34, height: 34, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
  },
  addBtn: {
    width: 34, height: 34, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
  },
  pickerGrid: {
    flexDirection: "row", flexWrap: "wrap", gap: 6,
    padding: 12, borderRadius: 14, marginBottom: 8, marginTop: -4,
  },
  timeSlot: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
  },
  timeSlotText: { fontFamily: "Inter_500Medium", fontSize: 12 },
  emptyState: {
    alignItems: "center", gap: 10, paddingVertical: 32,
  },
  emptyText: { fontFamily: "Inter_400Regular", fontSize: 14 },
});
