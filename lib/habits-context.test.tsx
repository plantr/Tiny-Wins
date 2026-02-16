import React from 'react';
import { Text, View, Pressable } from 'react-native';
import { render, screen, waitFor, fireEvent } from '@/lib/test-utils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useHabits } from '@/lib/habits-context';

// Test data factory
const makeTestHabit = (overrides = {}) => ({
  id: 'test-habit-1',
  title: 'Morning Run',
  icon: 'fitness',
  iconColor: '#4ADE80',
  gradientColors: ['#4ADE80', '#22C55E'] as const,
  goal: 1,
  unit: 'times',
  frequency: 'Daily',
  current: 0,
  streak: 0,
  bestStreak: 0,
  weekData: [0, 0, 0, 0, 0, 0, 0],
  createdAt: Date.now(),
  ...overrides,
});

// Helper component that exposes useHabits() values and actions via testIDs
function TestHabitsHook({ onReady }: { onReady?: (ctx: ReturnType<typeof useHabits>) => void }) {
  const ctx = useHabits();

  React.useEffect(() => {
    if (ctx.isLoaded && onReady) {
      onReady(ctx);
    }
  }, [ctx.isLoaded]);

  const firstHabit = ctx.habits[0];

  return (
    <View>
      {/* Status indicators */}
      <Text testID="loaded">{ctx.isLoaded.toString()}</Text>
      <Text testID="habit-count">{ctx.habits.length}</Text>
      <Text testID="log-count">{ctx.logs.length}</Text>
      <Text testID="review-count">{ctx.reviews.length}</Text>

      {/* First habit details */}
      {firstHabit && (
        <>
          <Text testID="habit-0-title">{firstHabit.title}</Text>
          <Text testID="habit-0-streak">{firstHabit.streak}</Text>
          <Text testID="habit-0-current">{firstHabit.current}</Text>
          <Text testID="habit-0-bestStreak">{firstHabit.bestStreak}</Text>
          <Text testID="habit-0-id">{firstHabit.id}</Text>
        </>
      )}

      {/* Action buttons */}
      <Pressable
        testID="add-habit"
        onPress={() => ctx.addHabit({
          title: 'Morning Run',
          icon: 'fitness',
          iconColor: '#4ADE80',
          gradientColors: ['#4ADE80', '#22C55E'] as const,
          goal: 1,
          unit: 'times',
          frequency: 'Daily',
        })}
      />
      <Pressable
        testID="update-habit"
        onPress={() => {
          if (firstHabit) ctx.updateHabit(firstHabit.id, { title: 'Evening Run' });
        }}
      />
      <Pressable
        testID="remove-habit"
        onPress={() => {
          if (firstHabit) ctx.removeHabit(firstHabit.id);
        }}
      />
      <Pressable
        testID="complete-habit"
        onPress={() => {
          if (firstHabit) ctx.completeHabit(firstHabit.id, 'Ran 5km', 'Felt great');
        }}
      />
      <Pressable
        testID="uncomplete-habit"
        onPress={() => {
          if (firstHabit) ctx.uncompleteHabit(firstHabit.id);
        }}
      />
      <Pressable
        testID="log-missed"
        onPress={() => {
          if (firstHabit) ctx.logMissed(firstHabit.id, 'Too tired');
        }}
      />
      <Pressable
        testID="increment-habit"
        onPress={() => {
          if (firstHabit) ctx.incrementHabit(firstHabit.id);
        }}
      />
      <Pressable
        testID="add-review"
        onPress={() => ctx.addReview({
          weekStart: '2026-02-10',
          whatWorked: 'Morning routine',
          whatDidnt: 'Evening procrastination',
          adjustments: ['Wake up earlier'],
          habitRatings: {},
        })}
      />
    </View>
  );
}

describe('HabitsProvider Integration Tests', () => {
  beforeEach(async () => {
    jest.useFakeTimers({ now: new Date('2026-02-16T12:00:00Z') });
    await AsyncStorage.clear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Hydration tests', () => {
    it('starts with empty habits when no storage data', async () => {
      render(<TestHabitsHook />);

      await waitFor(() => expect(screen.getByTestId('loaded')).toHaveTextContent('true'));

      expect(screen.getByTestId('habit-count')).toHaveTextContent('0');
      expect(screen.getByTestId('log-count')).toHaveTextContent('0');
      expect(screen.getByTestId('review-count')).toHaveTextContent('0');
    });

    it('hydrates habits from pre-seeded AsyncStorage', async () => {
      const testHabit = makeTestHabit();
      await AsyncStorage.setItem('tinywins_habits', JSON.stringify([testHabit]));

      render(<TestHabitsHook />);

      await waitFor(() => expect(screen.getByTestId('loaded')).toHaveTextContent('true'));

      expect(screen.getByTestId('habit-count')).toHaveTextContent('1');
      expect(screen.getByTestId('habit-0-title')).toHaveTextContent('Morning Run');
      expect(screen.getByTestId('habit-0-streak')).toHaveTextContent('0');
    });

    it('hydrates logs from pre-seeded AsyncStorage', async () => {
      const testLog = {
        id: 'log-1',
        habitId: 'test-habit-1',
        date: '2026-02-16',
        status: 'done',
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem('tinywins_logs', JSON.stringify([testLog]));

      render(<TestHabitsHook />);

      await waitFor(() => expect(screen.getByTestId('loaded')).toHaveTextContent('true'));

      expect(screen.getByTestId('log-count')).toHaveTextContent('1');
    });

    it('hydrates reviews from pre-seeded AsyncStorage', async () => {
      const testReview = {
        id: 'review-1',
        weekStart: '2026-02-10',
        whatWorked: 'Morning routine',
        whatDidnt: 'Evening procrastination',
        adjustments: ['Wake up earlier'],
        habitRatings: {},
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem('tinywins_reviews', JSON.stringify([testReview]));

      render(<TestHabitsHook />);

      await waitFor(() => expect(screen.getByTestId('loaded')).toHaveTextContent('true'));

      expect(screen.getByTestId('review-count')).toHaveTextContent('1');
    });

    it('handles corrupted storage data gracefully', async () => {
      await AsyncStorage.setItem('tinywins_habits', 'invalid JSON{]');
      await AsyncStorage.setItem('tinywins_logs', 'invalid JSON{]');
      await AsyncStorage.setItem('tinywins_reviews', 'invalid JSON{]');

      render(<TestHabitsHook />);

      await waitFor(() => expect(screen.getByTestId('loaded')).toHaveTextContent('true'));

      // Should fallback to empty arrays/default habits
      expect(screen.getByTestId('habit-count')).toHaveTextContent('0');
      expect(screen.getByTestId('log-count')).toHaveTextContent('0');
      expect(screen.getByTestId('review-count')).toHaveTextContent('0');
    });
  });

  describe('CRUD tests', () => {
    it('addHabit: adds habit with generated id, zeroed current/streak/weekData, persists to AsyncStorage', async () => {
      render(<TestHabitsHook />);

      await waitFor(() => expect(screen.getByTestId('loaded')).toHaveTextContent('true'));

      fireEvent.press(screen.getByTestId('add-habit'));

      await waitFor(() => expect(screen.getByTestId('habit-count')).toHaveTextContent('1'));

      expect(screen.getByTestId('habit-0-title')).toHaveTextContent('Morning Run');
      expect(screen.getByTestId('habit-0-current')).toHaveTextContent('0');
      expect(screen.getByTestId('habit-0-streak')).toHaveTextContent('0');
      expect(screen.getByTestId('habit-0-bestStreak')).toHaveTextContent('0');

      // Verify persistence
      const stored = await AsyncStorage.getItem('tinywins_habits');
      expect(stored).toBeTruthy();
      const habits = JSON.parse(stored!);
      expect(habits).toHaveLength(1);
      expect(habits[0].title).toBe('Morning Run');
      expect(habits[0].id).toBeTruthy();
      expect(habits[0].weekData).toEqual([0, 0, 0, 0, 0, 0, 0]);
    });

    it('updateHabit: modifies title, persists updated habit to AsyncStorage', async () => {
      const testHabit = makeTestHabit();
      await AsyncStorage.setItem('tinywins_habits', JSON.stringify([testHabit]));

      render(<TestHabitsHook />);

      await waitFor(() => expect(screen.getByTestId('loaded')).toHaveTextContent('true'));

      expect(screen.getByTestId('habit-0-title')).toHaveTextContent('Morning Run');

      fireEvent.press(screen.getByTestId('update-habit'));

      await waitFor(() => expect(screen.getByTestId('habit-0-title')).toHaveTextContent('Evening Run'));

      // Verify persistence
      const stored = await AsyncStorage.getItem('tinywins_habits');
      const habits = JSON.parse(stored!);
      expect(habits[0].title).toBe('Evening Run');
    });

    it('removeHabit: removes habit by id, persists updated list to AsyncStorage', async () => {
      const testHabit = makeTestHabit();
      await AsyncStorage.setItem('tinywins_habits', JSON.stringify([testHabit]));

      render(<TestHabitsHook />);

      await waitFor(() => expect(screen.getByTestId('loaded')).toHaveTextContent('true'));

      expect(screen.getByTestId('habit-count')).toHaveTextContent('1');

      fireEvent.press(screen.getByTestId('remove-habit'));

      await waitFor(() => expect(screen.getByTestId('habit-count')).toHaveTextContent('0'));

      // Verify persistence
      const stored = await AsyncStorage.getItem('tinywins_habits');
      const habits = JSON.parse(stored!);
      expect(habits).toHaveLength(0);
    });
  });

  describe('Completion flow tests', () => {
    it('completeHabit: sets current to goal, increments streak, creates "done" log, persists both habits and logs', async () => {
      const testHabit = makeTestHabit();
      await AsyncStorage.setItem('tinywins_habits', JSON.stringify([testHabit]));

      render(<TestHabitsHook />);

      await waitFor(() => expect(screen.getByTestId('loaded')).toHaveTextContent('true'));

      expect(screen.getByTestId('habit-0-streak')).toHaveTextContent('0');
      expect(screen.getByTestId('habit-0-current')).toHaveTextContent('0');

      fireEvent.press(screen.getByTestId('complete-habit'));

      await waitFor(() => expect(screen.getByTestId('habit-0-streak')).toHaveTextContent('1'));

      expect(screen.getByTestId('habit-0-current')).toHaveTextContent('1');
      expect(screen.getByTestId('habit-0-bestStreak')).toHaveTextContent('1');
      expect(screen.getByTestId('log-count')).toHaveTextContent('1');

      // Verify habits persistence
      const storedHabits = await AsyncStorage.getItem('tinywins_habits');
      const habits = JSON.parse(storedHabits!);
      expect(habits[0].streak).toBe(1);
      expect(habits[0].current).toBe(1);
      expect(habits[0].bestStreak).toBe(1);

      // Verify logs persistence
      const storedLogs = await AsyncStorage.getItem('tinywins_logs');
      const logs = JSON.parse(storedLogs!);
      expect(logs).toHaveLength(1);
      expect(logs[0].status).toBe('done');
      expect(logs[0].habitId).toBe('test-habit-1');
      expect(logs[0].evidenceNote).toBe('Ran 5km');
      expect(logs[0].reflection).toBe('Felt great');
    });

    it('uncompleteHabit: resets current to 0, decrements streak (min 0), removes today\'s done log, persists both', async () => {
      const testHabit = makeTestHabit({ streak: 3, current: 1, bestStreak: 5 });
      const testLog = {
        id: 'log-1',
        habitId: 'test-habit-1',
        date: '2026-02-16',
        status: 'done',
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem('tinywins_habits', JSON.stringify([testHabit]));
      await AsyncStorage.setItem('tinywins_logs', JSON.stringify([testLog]));

      render(<TestHabitsHook />);

      await waitFor(() => expect(screen.getByTestId('loaded')).toHaveTextContent('true'));

      expect(screen.getByTestId('habit-0-streak')).toHaveTextContent('3');
      expect(screen.getByTestId('log-count')).toHaveTextContent('1');

      fireEvent.press(screen.getByTestId('uncomplete-habit'));

      await waitFor(() => expect(screen.getByTestId('habit-0-streak')).toHaveTextContent('2'));

      expect(screen.getByTestId('habit-0-current')).toHaveTextContent('0');
      expect(screen.getByTestId('log-count')).toHaveTextContent('0');

      // Verify habits persistence
      const storedHabits = await AsyncStorage.getItem('tinywins_habits');
      const habits = JSON.parse(storedHabits!);
      expect(habits[0].streak).toBe(2);
      expect(habits[0].current).toBe(0);

      // Verify logs persistence
      const storedLogs = await AsyncStorage.getItem('tinywins_logs');
      const logs = JSON.parse(storedLogs!);
      expect(logs).toHaveLength(0);
    });

    it('uncompleteHabit: streak decrements with minimum of 0', async () => {
      const testHabit = makeTestHabit({ streak: 1, current: 1 });
      const testLog = {
        id: 'log-1',
        habitId: 'test-habit-1',
        date: '2026-02-16',
        status: 'done',
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem('tinywins_habits', JSON.stringify([testHabit]));
      await AsyncStorage.setItem('tinywins_logs', JSON.stringify([testLog]));

      render(<TestHabitsHook />);

      await waitFor(() => expect(screen.getByTestId('loaded')).toHaveTextContent('true'));

      fireEvent.press(screen.getByTestId('uncomplete-habit'));

      await waitFor(() => expect(screen.getByTestId('habit-0-streak')).toHaveTextContent('0'));

      // Second uncomplete should stay at 0
      fireEvent.press(screen.getByTestId('complete-habit'));
      await waitFor(() => expect(screen.getByTestId('habit-0-streak')).toHaveTextContent('1'));

      fireEvent.press(screen.getByTestId('uncomplete-habit'));
      await waitFor(() => expect(screen.getByTestId('habit-0-streak')).toHaveTextContent('0'));
    });

    it('logMissed: resets streak to 0, creates "missed" log, persists both', async () => {
      const testHabit = makeTestHabit({ streak: 5, bestStreak: 10 });
      await AsyncStorage.setItem('tinywins_habits', JSON.stringify([testHabit]));

      render(<TestHabitsHook />);

      await waitFor(() => expect(screen.getByTestId('loaded')).toHaveTextContent('true'));

      expect(screen.getByTestId('habit-0-streak')).toHaveTextContent('5');

      fireEvent.press(screen.getByTestId('log-missed'));

      await waitFor(() => expect(screen.getByTestId('habit-0-streak')).toHaveTextContent('0'));

      expect(screen.getByTestId('log-count')).toHaveTextContent('1');

      // Verify habits persistence
      const storedHabits = await AsyncStorage.getItem('tinywins_habits');
      const habits = JSON.parse(storedHabits!);
      expect(habits[0].streak).toBe(0);

      // Verify logs persistence
      const storedLogs = await AsyncStorage.getItem('tinywins_logs');
      const logs = JSON.parse(storedLogs!);
      expect(logs).toHaveLength(1);
      expect(logs[0].status).toBe('missed');
      expect(logs[0].frictionReason).toBe('Too tired');
    });

    it('incrementHabit: increments current by 1, updates weekData for current day', async () => {
      // Sunday = 0 in JS Date.getDay(), which maps to index 6 in weekData (Monday-first array)
      // 2026-02-16 is a Monday, so dayIdx = (1 + 6) % 7 = 0 (first element of weekData)
      const testHabit = makeTestHabit({ goal: 3 });
      await AsyncStorage.setItem('tinywins_habits', JSON.stringify([testHabit]));

      render(<TestHabitsHook />);

      await waitFor(() => expect(screen.getByTestId('loaded')).toHaveTextContent('true'));

      expect(screen.getByTestId('habit-0-current')).toHaveTextContent('0');

      fireEvent.press(screen.getByTestId('increment-habit'));

      await waitFor(() => expect(screen.getByTestId('habit-0-current')).toHaveTextContent('1'));

      // Verify persistence and weekData
      const stored = await AsyncStorage.getItem('tinywins_habits');
      const habits = JSON.parse(stored!);
      expect(habits[0].current).toBe(1);
      expect(habits[0].weekData[0]).toBe(1); // Monday index
      expect(habits[0].streak).toBe(0); // Hasn't reached goal yet
    });

    it('incrementHabit: reaching goal increments streak and creates log', async () => {
      const testHabit = makeTestHabit({ goal: 2, current: 1 });
      await AsyncStorage.setItem('tinywins_habits', JSON.stringify([testHabit]));

      render(<TestHabitsHook />);

      await waitFor(() => expect(screen.getByTestId('loaded')).toHaveTextContent('true'));

      expect(screen.getByTestId('habit-0-streak')).toHaveTextContent('0');
      expect(screen.getByTestId('log-count')).toHaveTextContent('0');

      fireEvent.press(screen.getByTestId('increment-habit'));

      await waitFor(() => expect(screen.getByTestId('habit-0-current')).toHaveTextContent('2'));

      expect(screen.getByTestId('habit-0-streak')).toHaveTextContent('1');
      expect(screen.getByTestId('log-count')).toHaveTextContent('1');

      // Verify log was created
      const storedLogs = await AsyncStorage.getItem('tinywins_logs');
      const logs = JSON.parse(storedLogs!);
      expect(logs[0].status).toBe('done');
    });
  });

  describe('Review management', () => {
    it('addReview: creates review with generated id and timestamp, persists to AsyncStorage', async () => {
      render(<TestHabitsHook />);

      await waitFor(() => expect(screen.getByTestId('loaded')).toHaveTextContent('true'));

      expect(screen.getByTestId('review-count')).toHaveTextContent('0');

      fireEvent.press(screen.getByTestId('add-review'));

      await waitFor(() => expect(screen.getByTestId('review-count')).toHaveTextContent('1'));

      // Verify persistence
      const stored = await AsyncStorage.getItem('tinywins_reviews');
      const reviews = JSON.parse(stored!);
      expect(reviews).toHaveLength(1);
      expect(reviews[0].whatWorked).toBe('Morning routine');
      expect(reviews[0].id).toBeTruthy();
      expect(reviews[0].timestamp).toBeTruthy();
    });
  });

  describe('App restart simulation', () => {
    it('habit persists across unmount/remount cycle', async () => {
      const { unmount } = render(<TestHabitsHook />);

      await waitFor(() => expect(screen.getByTestId('loaded')).toHaveTextContent('true'));

      // Add a habit
      fireEvent.press(screen.getByTestId('add-habit'));

      await waitFor(() => expect(screen.getByTestId('habit-count')).toHaveTextContent('1'));

      const habitId = screen.getByTestId('habit-0-id').props.children;

      // Unmount (simulate app close)
      unmount();

      // Remount (simulate app restart)
      render(<TestHabitsHook />);

      await waitFor(() => expect(screen.getByTestId('loaded')).toHaveTextContent('true'));

      // Habit should still be there
      expect(screen.getByTestId('habit-count')).toHaveTextContent('1');
      expect(screen.getByTestId('habit-0-title')).toHaveTextContent('Morning Run');
      expect(screen.getByTestId('habit-0-id')).toHaveTextContent(habitId);
    });

    it('completed habit with log persists across unmount/remount', async () => {
      const { unmount } = render(<TestHabitsHook />);

      await waitFor(() => expect(screen.getByTestId('loaded')).toHaveTextContent('true'));

      // Add and complete a habit
      fireEvent.press(screen.getByTestId('add-habit'));
      await waitFor(() => expect(screen.getByTestId('habit-count')).toHaveTextContent('1'));

      fireEvent.press(screen.getByTestId('complete-habit'));
      await waitFor(() => expect(screen.getByTestId('habit-0-streak')).toHaveTextContent('1'));

      // Unmount
      unmount();

      // Remount
      render(<TestHabitsHook />);

      await waitFor(() => expect(screen.getByTestId('loaded')).toHaveTextContent('true'));

      // Both habit state and log should persist
      expect(screen.getByTestId('habit-0-streak')).toHaveTextContent('1');
      expect(screen.getByTestId('habit-0-current')).toHaveTextContent('1');
      expect(screen.getByTestId('log-count')).toHaveTextContent('1');
    });
  });

  describe('Query methods', () => {
    it('getLogsForDate returns logs for specific date', async () => {
      const log1 = {
        id: 'log-1',
        habitId: 'habit-1',
        date: '2026-02-16',
        status: 'done',
        timestamp: Date.now(),
      };
      const log2 = {
        id: 'log-2',
        habitId: 'habit-2',
        date: '2026-02-17',
        status: 'done',
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem('tinywins_logs', JSON.stringify([log1, log2]));

      let contextValue: ReturnType<typeof useHabits> | null = null;

      render(<TestHabitsHook onReady={(ctx) => { contextValue = ctx; }} />);

      await waitFor(() => expect(screen.getByTestId('loaded')).toHaveTextContent('true'));

      const logsForToday = contextValue!.getLogsForDate('2026-02-16');
      expect(logsForToday).toHaveLength(1);
      expect(logsForToday[0].id).toBe('log-1');

      const logsForTomorrow = contextValue!.getLogsForDate('2026-02-17');
      expect(logsForTomorrow).toHaveLength(1);
      expect(logsForTomorrow[0].id).toBe('log-2');
    });

    it('getLogsForHabit returns logs for specific habit', async () => {
      const log1 = {
        id: 'log-1',
        habitId: 'habit-1',
        date: '2026-02-16',
        status: 'done',
        timestamp: Date.now(),
      };
      const log2 = {
        id: 'log-2',
        habitId: 'habit-1',
        date: '2026-02-17',
        status: 'done',
        timestamp: Date.now(),
      };
      const log3 = {
        id: 'log-3',
        habitId: 'habit-2',
        date: '2026-02-16',
        status: 'done',
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem('tinywins_logs', JSON.stringify([log1, log2, log3]));

      let contextValue: ReturnType<typeof useHabits> | null = null;

      render(<TestHabitsHook onReady={(ctx) => { contextValue = ctx; }} />);

      await waitFor(() => expect(screen.getByTestId('loaded')).toHaveTextContent('true'));

      const logsForHabit1 = contextValue!.getLogsForHabit('habit-1');
      expect(logsForHabit1).toHaveLength(2);

      const logsForHabit2 = contextValue!.getLogsForHabit('habit-2');
      expect(logsForHabit2).toHaveLength(1);
    });
  });
});
