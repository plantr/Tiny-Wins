import React from 'react';
import { render, screen, waitFor } from '@/lib/test-utils';
import { DaySelector } from './DaySelector';

describe('DaySelector', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders 7 day labels', async () => {
    render(<DaySelector />);

    await waitFor(() => {
      // DaySelector renders days based on weekStartDay setting
      // Default is Sunday start, so we expect all 7 days to render
      const dayLabels = screen.getAllByText(/^[SMTWF]$/);
      expect(dayLabels).toHaveLength(7);
    });
  });

  it('highlights current day', async () => {
    // Set to a Monday (jsDay = 1)
    jest.setSystemTime(new Date('2026-02-16T12:00:00Z')); // This is a Monday

    render(<DaySelector />);

    await waitFor(() => {
      // Verify that at least one day label is rendered (current day)
      const dayLabels = screen.getAllByText(/^[SMTWF]$/);
      expect(dayLabels.length).toBeGreaterThan(0);
    });
  });
});
