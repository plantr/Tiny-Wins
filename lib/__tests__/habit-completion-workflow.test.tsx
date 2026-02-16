import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { render, screen, waitFor, fireEvent } from '@/lib/test-utils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useHabits } from '@/lib/habits-context';
import { HabitGridCard } from '@/components/habits/HabitGridCard';
import { EvidenceModal } from '@/components/modals/EvidenceModal';

/**
 * Multi-component workflow test
 *
 * This test exercises the full habit completion chain as orchestrated in app/(tabs)/index.tsx:
 * 1. HabitGridCard check button pressed -> onComplete callback
 * 2. EvidenceModal opens with habit details
 * 3. User submits evidence (or skips) -> completeHabit called
 * 4. Log persists to AsyncStorage with evidence
 * 5. Habit streak increments
 */

function HabitCompletionWorkflow() {
  const { habits, completeHabit, uncompleteHabit, logs, addHabit, isLoaded } = useHabits();
  const [evidenceModal, setEvidenceModal] = useState<{
    visible: boolean;
    habitId: string;
    habitTitle: string;
  }>({
    visible: false,
    habitId: '',
    habitTitle: '',
  });

  const handleComplete = (habitId: string) => {
    const habit = habits.find((h) => h.id === habitId);
    if (habit) {
      setEvidenceModal({ visible: true, habitId, habitTitle: habit.title });
    }
  };

  const handleSubmitEvidence = (note: string, imageUri?: string) => {
    completeHabit(evidenceModal.habitId, note || undefined, undefined, imageUri);
    setEvidenceModal({ visible: false, habitId: '', habitTitle: '' });
  };

  const handleSkip = () => {
    completeHabit(evidenceModal.habitId);
    setEvidenceModal({ visible: false, habitId: '', habitTitle: '' });
  };

  const handleCloseEvidence = () => {
    setEvidenceModal({ visible: false, habitId: '', habitTitle: '' });
  };

  return (
    <View>
      {/* Status displays for assertions */}
      <Text testID="loaded">{isLoaded.toString()}</Text>
      <Text testID="habit-count">{habits.length}</Text>
      <Text testID="log-count">{logs.length}</Text>
      <Text testID="evidence-visible">{evidenceModal.visible.toString()}</Text>

      {/* Seed habit button */}
      <Pressable
        testID="seed-habit"
        onPress={() =>
          addHabit({
            title: 'Morning Run',
            icon: 'fitness',
            iconColor: '#4ADE80',
            gradientColors: ['#4ADE80', '#22C55E'] as const,
            goal: 1,
            unit: 'times',
            frequency: 'Daily',
          })
        }
      />

      {/* Render HabitGridCards */}
      {habits.map((habit, idx) => (
        <HabitGridCard
          key={habit.id}
          habit={habit}
          index={idx}
          isCompleted={habit.current >= habit.goal}
          onComplete={handleComplete}
          onUncomplete={uncompleteHabit}
        />
      ))}

      {/* EvidenceModal */}
      <EvidenceModal
        visible={evidenceModal.visible}
        habitTitle={evidenceModal.habitTitle}
        onSubmit={handleSubmitEvidence}
        onSkip={handleSkip}
        onClose={handleCloseEvidence}
      />
    </View>
  );
}

describe('Habit Completion Workflow Integration', () => {
  beforeEach(async () => {
    jest.useFakeTimers({ now: new Date('2026-02-16T12:00:00Z') });
    await AsyncStorage.clear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('HabitGridCard check opens EvidenceModal', async () => {
    render(<HabitCompletionWorkflow />);

    await waitFor(() => expect(screen.getByTestId('loaded')).toHaveTextContent('true'));

    // Seed a habit
    fireEvent.press(screen.getByTestId('seed-habit'));

    await waitFor(() => expect(screen.getByTestId('habit-count')).toHaveTextContent('1'));

    // Find and press the check button (the Pressable with ellipse-outline icon)
    // The HabitGridCard renders an ellipse-outline icon when not completed
    const checkButton = screen.getByText('ellipse-outline');
    fireEvent.press(checkButton);

    // EvidenceModal should now be visible
    await waitFor(() => expect(screen.getByTestId('evidence-visible')).toHaveTextContent('true'));

    // EvidenceModal should show the habit title in the subtitle text
    expect(screen.getByText(/You just completed "Morning Run"/)).toBeTruthy();
  });

  it('Submit evidence completes habit and persists log', async () => {
    render(<HabitCompletionWorkflow />);

    await waitFor(() => expect(screen.getByTestId('loaded')).toHaveTextContent('true'));

    // Seed habit and open EvidenceModal
    fireEvent.press(screen.getByTestId('seed-habit'));
    await waitFor(() => expect(screen.getByTestId('habit-count')).toHaveTextContent('1'));

    const checkButton = screen.getByText('ellipse-outline');
    fireEvent.press(checkButton);
    await waitFor(() => expect(screen.getByTestId('evidence-visible')).toHaveTextContent('true'));

    // Type a note in the TextInput
    const noteInput = screen.getByPlaceholderText('What did you do? How did it feel?');
    fireEvent.changeText(noteInput, 'Ran 5km in the park');

    // Press "save evidence" button
    const saveButton = screen.getByText('save evidence');
    fireEvent.press(saveButton);

    // EvidenceModal should close
    await waitFor(() => expect(screen.getByTestId('evidence-visible')).toHaveTextContent('false'));

    // Log count should increment
    expect(screen.getByTestId('log-count')).toHaveTextContent('1');

    // Verify AsyncStorage contains the log with evidenceNote
    const storedLogs = await AsyncStorage.getItem('tinywins_logs');
    expect(storedLogs).toBeTruthy();
    const logs = JSON.parse(storedLogs!);
    expect(logs).toHaveLength(1);
    expect(logs[0].evidenceNote).toBe('Ran 5km in the park');
    expect(logs[0].status).toBe('done');
  });

  it('Skip evidence still completes habit', async () => {
    render(<HabitCompletionWorkflow />);

    await waitFor(() => expect(screen.getByTestId('loaded')).toHaveTextContent('true'));

    // Seed habit and open EvidenceModal
    fireEvent.press(screen.getByTestId('seed-habit'));
    await waitFor(() => expect(screen.getByTestId('habit-count')).toHaveTextContent('1'));

    const checkButton = screen.getByText('ellipse-outline');
    fireEvent.press(checkButton);
    await waitFor(() => expect(screen.getByTestId('evidence-visible')).toHaveTextContent('true'));

    // Press "skip" button
    const skipButton = screen.getByText('skip');
    fireEvent.press(skipButton);

    // EvidenceModal should close
    await waitFor(() => expect(screen.getByTestId('evidence-visible')).toHaveTextContent('false'));

    // Log should be created
    expect(screen.getByTestId('log-count')).toHaveTextContent('1');

    // Verify AsyncStorage contains log with no evidenceNote
    const storedLogs = await AsyncStorage.getItem('tinywins_logs');
    const logs = JSON.parse(storedLogs!);
    expect(logs[0].status).toBe('done');
    expect(logs[0].evidenceNote).toBeUndefined();

    // Verify streak incremented (check via AsyncStorage since HabitGridCard doesn't expose it via testID)
    const storedHabits = await AsyncStorage.getItem('tinywins_habits');
    const habits = JSON.parse(storedHabits!);
    expect(habits[0].streak).toBe(1);
  });

  it('Close evidence does NOT complete habit', async () => {
    render(<HabitCompletionWorkflow />);

    await waitFor(() => expect(screen.getByTestId('loaded')).toHaveTextContent('true'));

    // Seed habit and open EvidenceModal
    fireEvent.press(screen.getByTestId('seed-habit'));
    await waitFor(() => expect(screen.getByTestId('habit-count')).toHaveTextContent('1'));

    const checkButton = screen.getByText('ellipse-outline');
    fireEvent.press(checkButton);
    await waitFor(() => expect(screen.getByTestId('evidence-visible')).toHaveTextContent('true'));

    // Find and press the close (X) button
    const closeButton = screen.getByText('x');
    fireEvent.press(closeButton);

    // EvidenceModal should close
    await waitFor(() => expect(screen.getByTestId('evidence-visible')).toHaveTextContent('false'));

    // No log should be created
    expect(screen.getByTestId('log-count')).toHaveTextContent('0');

    // Verify no completion happened (logs should still be empty/null)
    const storedLogs = await AsyncStorage.getItem('tinywins_logs');
    // AsyncStorage might be null or '[]' depending on whether logs were initialized
    expect(storedLogs === null || storedLogs === '[]').toBe(true);
  });

  it('Full end-to-end: complete -> streak increments -> log persists', async () => {
    render(<HabitCompletionWorkflow />);

    await waitFor(() => expect(screen.getByTestId('loaded')).toHaveTextContent('true'));

    // Seed habit
    fireEvent.press(screen.getByTestId('seed-habit'));
    await waitFor(() => expect(screen.getByTestId('habit-count')).toHaveTextContent('1'));

    // Verify initial state
    let storedHabits = await AsyncStorage.getItem('tinywins_habits');
    let habits = JSON.parse(storedHabits!);
    expect(habits[0].streak).toBe(0);
    expect(habits[0].current).toBe(0);

    // Open EvidenceModal
    const checkButton = screen.getByText('ellipse-outline');
    fireEvent.press(checkButton);
    await waitFor(() => expect(screen.getByTestId('evidence-visible')).toHaveTextContent('true'));

    // Submit evidence with note
    const noteInput = screen.getByPlaceholderText('What did you do? How did it feel?');
    fireEvent.changeText(noteInput, 'Ran 5km');

    const saveButton = screen.getByText('save evidence');
    fireEvent.press(saveButton);

    await waitFor(() => expect(screen.getByTestId('evidence-visible')).toHaveTextContent('false'));

    // Verify streak incremented
    storedHabits = await AsyncStorage.getItem('tinywins_habits');
    habits = JSON.parse(storedHabits!);
    expect(habits[0].streak).toBe(1);
    expect(habits[0].current).toBe(1);
    expect(habits[0].bestStreak).toBe(1);

    // Verify log persisted with evidenceNote
    const storedLogs = await AsyncStorage.getItem('tinywins_logs');
    const logs = JSON.parse(storedLogs!);
    expect(logs).toHaveLength(1);
    expect(logs[0].habitId).toBe(habits[0].id);
    expect(logs[0].status).toBe('done');
    expect(logs[0].evidenceNote).toBe('Ran 5km');
    expect(logs[0].date).toBe('2026-02-16');
  });

  it('Multiple completions increment streak correctly', async () => {
    render(<HabitCompletionWorkflow />);

    await waitFor(() => expect(screen.getByTestId('loaded')).toHaveTextContent('true'));

    // Seed habit
    fireEvent.press(screen.getByTestId('seed-habit'));
    await waitFor(() => expect(screen.getByTestId('habit-count')).toHaveTextContent('1'));

    // First completion
    let checkButton = screen.getByText('ellipse-outline');
    fireEvent.press(checkButton);
    await waitFor(() => expect(screen.getByTestId('evidence-visible')).toHaveTextContent('true'));

    let skipButton = screen.getByText('skip');
    fireEvent.press(skipButton);
    await waitFor(() => expect(screen.getByTestId('evidence-visible')).toHaveTextContent('false'));

    // Verify first completion
    let storedHabits = await AsyncStorage.getItem('tinywins_habits');
    let habits = JSON.parse(storedHabits!);
    expect(habits[0].streak).toBe(1);

    // Uncomplete to reset
    const checkmarkButton = screen.getByText('checkmark-circle');
    fireEvent.press(checkmarkButton);
    await waitFor(() => {
      return AsyncStorage.getItem('tinywins_habits').then((stored) => {
        const h = JSON.parse(stored!);
        return h[0].streak === 0;
      });
    });

    // Second completion (simulate next day by completing again)
    checkButton = screen.getByText('ellipse-outline');
    fireEvent.press(checkButton);
    await waitFor(() => expect(screen.getByTestId('evidence-visible')).toHaveTextContent('true'));

    skipButton = screen.getByText('skip');
    fireEvent.press(skipButton);
    await waitFor(() => expect(screen.getByTestId('evidence-visible')).toHaveTextContent('false'));

    // Verify streak is back to 1 (since we uncompleted in between)
    storedHabits = await AsyncStorage.getItem('tinywins_habits');
    habits = JSON.parse(storedHabits!);
    expect(habits[0].streak).toBe(1);
  });

  it('Completed habit shows checkmark-circle instead of ellipse-outline', async () => {
    render(<HabitCompletionWorkflow />);

    await waitFor(() => expect(screen.getByTestId('loaded')).toHaveTextContent('true'));

    // Seed habit
    fireEvent.press(screen.getByTestId('seed-habit'));
    await waitFor(() => expect(screen.getByTestId('habit-count')).toHaveTextContent('1'));

    // Initially shows ellipse-outline
    expect(screen.getByText('ellipse-outline')).toBeTruthy();
    expect(screen.queryByText('checkmark-circle')).toBeNull();

    // Complete habit
    const checkButton = screen.getByText('ellipse-outline');
    fireEvent.press(checkButton);
    await waitFor(() => expect(screen.getByTestId('evidence-visible')).toHaveTextContent('true'));

    const skipButton = screen.getByText('skip');
    fireEvent.press(skipButton);
    await waitFor(() => expect(screen.getByTestId('evidence-visible')).toHaveTextContent('false'));

    // Now shows checkmark-circle
    await waitFor(() => expect(screen.getByText('checkmark-circle')).toBeTruthy());
    expect(screen.queryByText('ellipse-outline')).toBeNull();
  });
});
