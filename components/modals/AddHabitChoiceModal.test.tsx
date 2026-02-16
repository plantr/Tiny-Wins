import React from 'react';
import { render, screen, fireEvent, waitFor } from '@/lib/test-utils';
import { AddHabitChoiceModal } from './AddHabitChoiceModal';

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    back: jest.fn(),
  },
}));

describe('AddHabitChoiceModal', () => {
  const defaultProps = {
    visible: true,
    onClose: jest.fn(),
  };

  it('renders quick add and guided builder options when visible', async () => {
    render(<AddHabitChoiceModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('quick add')).toBeOnTheScreen();
      expect(screen.getByText('guided builder')).toBeOnTheScreen();
    });
  });

  it('renders modal title', async () => {
    render(<AddHabitChoiceModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('create a habit')).toBeOnTheScreen();
    });
  });
});
