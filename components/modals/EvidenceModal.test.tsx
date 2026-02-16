import React from 'react';
import { render, screen, fireEvent, waitFor } from '@/lib/test-utils';
import { EvidenceModal } from './EvidenceModal';

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
  requestCameraPermissionsAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
}));

describe('EvidenceModal', () => {
  const defaultProps = {
    visible: true,
    habitTitle: 'Meditate',
    onSubmit: jest.fn(),
    onSkip: jest.fn(),
    onClose: jest.fn(),
  };

  it('renders title and subtitle when visible', async () => {
    render(<EvidenceModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('evidence of identity')).toBeOnTheScreen();
    });
  });

  it('calls onSkip when skip button pressed', async () => {
    const onSkip = jest.fn();
    render(<EvidenceModal {...defaultProps} onSkip={onSkip} />);

    await waitFor(() => {
      expect(screen.getByText('skip')).toBeOnTheScreen();
    });

    fireEvent.press(screen.getByText('skip'));
    expect(onSkip).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when close button pressed', async () => {
    const onClose = jest.fn();
    render(<EvidenceModal {...defaultProps} onClose={onClose} />);

    await waitFor(() => {
      expect(screen.getByText('evidence of identity')).toBeOnTheScreen();
    });

    const closeIcon = screen.getByText('x');
    fireEvent.press(closeIcon.parent!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
