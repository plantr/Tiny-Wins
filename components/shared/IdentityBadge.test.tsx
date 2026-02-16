import React from 'react';
import { render, screen, waitFor } from '@/lib/test-utils';
import { IdentityBadge } from './IdentityBadge';

describe('IdentityBadge', () => {
  it('returns null when no identity selected and no habits', async () => {
    render(<IdentityBadge />);

    await waitFor(() => {
      // When no identity is selected and no habits exist, component returns null
      // Verify "your identity" header is NOT present
      expect(screen.queryByText(/your identity/i)).not.toBeOnTheScreen();
    });
  });
});
