import React from 'react';
import { render, screen, waitFor } from '@/lib/test-utils';
import { RemindersModal } from './RemindersModal';

describe('RemindersModal', () => {
  const defaultProps = {
    visible: true,
    onClose: jest.fn(),
  };

  it('renders empty state when no habits', async () => {
    render(<RemindersModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('add habits first to set reminders')).toBeOnTheScreen();
    });
  });

  it('renders title and subtitle when visible', async () => {
    render(<RemindersModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('reminders')).toBeOnTheScreen();
    });
  });
});
