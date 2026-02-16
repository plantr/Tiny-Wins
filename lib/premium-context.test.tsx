import React from 'react';
import { Text, Pressable } from 'react-native';
import { render, screen, waitFor, fireEvent } from '@/lib/test-utils';
import { usePremium } from '@/lib/premium-context';

// TestPremiumHook helper component exposing usePremium() values
function TestPremiumHook() {
  const {
    isPremium,
    freeHabitLimit,
    showPaywall,
    paywallTrigger,
    canCreateHabit,
    isFeatureLocked,
    triggerPaywall,
    setShowPaywall,
    purchasePackage,
    restorePurchases,
  } = usePremium();

  const mockPackage = {
    packageType: 'ANNUAL',
    identifier: 'annual_premium',
    product: { title: 'Annual Premium', priceString: '$29.99' },
  };

  return (
    <>
      <Text testID="isPremium">{isPremium.toString()}</Text>
      <Text testID="freeHabitLimit">{freeHabitLimit}</Text>
      <Text testID="showPaywall">{showPaywall.toString()}</Text>
      <Text testID="paywallTrigger">{paywallTrigger}</Text>
      <Text testID="canCreate-0">{canCreateHabit(0).toString()}</Text>
      <Text testID="canCreate-9">{canCreateHabit(9).toString()}</Text>
      <Text testID="canCreate-10">{canCreateHabit(10).toString()}</Text>
      <Text testID="canCreate-11">{canCreateHabit(11).toString()}</Text>
      <Text testID="canCreate-100">{canCreateHabit(100).toString()}</Text>
      <Text testID="locked-unlimited_habits">
        {isFeatureLocked('unlimited_habits').toString()}
      </Text>
      <Text testID="locked-cloud_sync">{isFeatureLocked('cloud_sync').toString()}</Text>
      <Pressable testID="trigger-paywall" onPress={() => triggerPaywall('test_reason')}>
        <Text>Trigger Paywall</Text>
      </Pressable>
      <Pressable testID="dismiss-paywall" onPress={() => setShowPaywall(false)}>
        <Text>Dismiss Paywall</Text>
      </Pressable>
      <Pressable testID="purchase" onPress={() => purchasePackage(mockPackage)}>
        <Text>Purchase</Text>
      </Pressable>
      <Pressable testID="restore" onPress={() => restorePurchases()}>
        <Text>Restore</Text>
      </Pressable>
    </>
  );
}

describe('PremiumProvider', () => {
  describe('Free tier defaults', () => {
    it('isPremium is false by default', async () => {
      render(<TestPremiumHook />);
      await waitFor(() => {
        expect(screen.getByTestId('isPremium')).toHaveTextContent('false');
      });
    });

    it('freeHabitLimit is 10', async () => {
      render(<TestPremiumHook />);
      await waitFor(() => {
        expect(screen.getByTestId('freeHabitLimit')).toHaveTextContent('10');
      });
    });

    it('showPaywall is false by default', async () => {
      render(<TestPremiumHook />);
      await waitFor(() => {
        expect(screen.getByTestId('showPaywall')).toHaveTextContent('false');
      });
    });
  });

  describe('Habit creation limit (exact limit - test off-by-one)', () => {
    it('canCreateHabit(0) returns true (fresh user)', async () => {
      render(<TestPremiumHook />);
      await waitFor(() => {
        expect(screen.getByTestId('canCreate-0')).toHaveTextContent('true');
      });
    });

    it('canCreateHabit(9) returns true (below limit)', async () => {
      render(<TestPremiumHook />);
      await waitFor(() => {
        expect(screen.getByTestId('canCreate-9')).toHaveTextContent('true');
      });
    });

    it('canCreateHabit(10) returns false (at limit)', async () => {
      render(<TestPremiumHook />);
      await waitFor(() => {
        expect(screen.getByTestId('canCreate-10')).toHaveTextContent('false');
      });
    });

    it('canCreateHabit(11) returns false (above limit)', async () => {
      render(<TestPremiumHook />);
      await waitFor(() => {
        expect(screen.getByTestId('canCreate-11')).toHaveTextContent('false');
      });
    });
  });

  describe('Feature gating', () => {
    it('isFeatureLocked(unlimited_habits) returns true for free user', async () => {
      render(<TestPremiumHook />);
      await waitFor(() => {
        expect(screen.getByTestId('locked-unlimited_habits')).toHaveTextContent('true');
      });
    });

    it('isFeatureLocked(cloud_sync) returns true for free user', async () => {
      render(<TestPremiumHook />);
      await waitFor(() => {
        expect(screen.getByTestId('locked-cloud_sync')).toHaveTextContent('true');
      });
    });

    it('after purchasePackage succeeds: isFeatureLocked returns false', async () => {
      render(<TestPremiumHook />);

      // Before purchase - features locked
      await waitFor(() => {
        expect(screen.getByTestId('locked-unlimited_habits')).toHaveTextContent('true');
        expect(screen.getByTestId('locked-cloud_sync')).toHaveTextContent('true');
      });

      // Purchase
      const purchaseButton = screen.getByTestId('purchase');
      fireEvent.press(purchaseButton);

      // After purchase - features unlocked
      await waitFor(() => {
        expect(screen.getByTestId('locked-unlimited_habits')).toHaveTextContent('false');
        expect(screen.getByTestId('locked-cloud_sync')).toHaveTextContent('false');
      });
    });

    it('after purchasePackage succeeds: canCreateHabit(10) returns true', async () => {
      render(<TestPremiumHook />);

      // Before purchase - at limit
      await waitFor(() => {
        expect(screen.getByTestId('canCreate-10')).toHaveTextContent('false');
      });

      // Purchase
      const purchaseButton = screen.getByTestId('purchase');
      fireEvent.press(purchaseButton);

      // After purchase - unlimited
      await waitFor(() => {
        expect(screen.getByTestId('canCreate-10')).toHaveTextContent('true');
      });
    });
  });

  describe('Paywall triggering', () => {
    it('triggerPaywall sets showPaywall=true and paywallTrigger to reason string', async () => {
      render(<TestPremiumHook />);

      await waitFor(() => {
        expect(screen.getByTestId('showPaywall')).toHaveTextContent('false');
        expect(screen.getByTestId('paywallTrigger')).toHaveTextContent('');
      });

      const triggerButton = screen.getByTestId('trigger-paywall');
      fireEvent.press(triggerButton);

      expect(screen.getByTestId('showPaywall')).toHaveTextContent('true');
      expect(screen.getByTestId('paywallTrigger')).toHaveTextContent('test_reason');
    });

    it('setShowPaywall(false) dismisses paywall', async () => {
      render(<TestPremiumHook />);

      await waitFor(() => {
        expect(screen.getByTestId('showPaywall')).toHaveTextContent('false');
      });

      // Trigger paywall
      const triggerButton = screen.getByTestId('trigger-paywall');
      fireEvent.press(triggerButton);
      expect(screen.getByTestId('showPaywall')).toHaveTextContent('true');

      // Dismiss paywall
      const dismissButton = screen.getByTestId('dismiss-paywall');
      fireEvent.press(dismissButton);
      expect(screen.getByTestId('showPaywall')).toHaveTextContent('false');
    });
  });

  describe('Premium state', () => {
    it('purchasePackage resolves to true and sets isPremium=true', async () => {
      render(<TestPremiumHook />);

      await waitFor(() => {
        expect(screen.getByTestId('isPremium')).toHaveTextContent('false');
      });

      const purchaseButton = screen.getByTestId('purchase');
      fireEvent.press(purchaseButton);

      await waitFor(() => {
        expect(screen.getByTestId('isPremium')).toHaveTextContent('true');
      });
    });

    it('after premium: canCreateHabit(100) returns true (unlimited)', async () => {
      render(<TestPremiumHook />);

      // Before purchase - would be blocked
      await waitFor(() => {
        expect(screen.getByTestId('canCreate-100')).toHaveTextContent('false');
      });

      // Purchase
      const purchaseButton = screen.getByTestId('purchase');
      fireEvent.press(purchaseButton);

      // After purchase - unlimited
      await waitFor(() => {
        expect(screen.getByTestId('canCreate-100')).toHaveTextContent('true');
      });
    });

    it('restorePurchases resolves to false (stub implementation)', async () => {
      render(<TestPremiumHook />);

      await waitFor(() => {
        expect(screen.getByTestId('isPremium')).toHaveTextContent('false');
      });

      const restoreButton = screen.getByTestId('restore');
      fireEvent.press(restoreButton);

      // restorePurchases is async and returns false - verify no errors
      // isPremium should remain false
      await waitFor(() => {
        expect(screen.getByTestId('isPremium')).toHaveTextContent('false');
      });
    });
  });
});
