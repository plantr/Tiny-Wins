import React from 'react';
import { render, screen, waitFor } from '@/lib/test-utils';
import { HabitStackView } from './HabitStackView';
import { Habit } from '@/lib/habits-context';

// Mock habit factory
function mockHabit(overrides?: Partial<Habit>): Habit {
  return {
    id: 'habit-1',
    title: 'Test Habit',
    icon: 'fitness',
    iconColor: '#FF6B6B',
    gradientColors: ['#FF6B6B', '#FF8E8E'] as const,
    goal: 10,
    unit: 'reps',
    frequency: 'daily',
    current: 5,
    streak: 3,
    bestStreak: 5,
    weekData: [0, 0, 0, 0, 0, 0, 0],
    createdAt: Date.now(),
    ...overrides,
  };
}

describe('HabitStackView', () => {
  it('renders standalone habits when no stacking', async () => {
    const habit1 = mockHabit({ id: 'habit-1', title: 'Morning Run' });
    const habit2 = mockHabit({ id: 'habit-2', title: 'Read Book' });
    const habits = [habit1, habit2];
    const completedIds = new Set<string>();
    const onComplete = jest.fn();
    const onUncomplete = jest.fn();

    render(
      <HabitStackView
        habits={habits}
        completedIds={completedIds}
        onComplete={onComplete}
        onUncomplete={onUncomplete}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Morning Run')).toBeOnTheScreen();
      expect(screen.getByText('Read Book')).toBeOnTheScreen();
    });
  });

  it('renders empty hint when no habits provided', async () => {
    const habits: Habit[] = [];
    const completedIds = new Set<string>();
    const onComplete = jest.fn();
    const onUncomplete = jest.fn();

    render(
      <HabitStackView
        habits={habits}
        completedIds={completedIds}
        onComplete={onComplete}
        onUncomplete={onUncomplete}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/stack your habits together/i)).toBeOnTheScreen();
    });
  });
});
