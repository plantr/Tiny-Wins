/**
 * Custom render wrapper for React Native Testing Library
 *
 * IMPORTANT: ThemeProvider blocks rendering until AsyncStorage resolves.
 * Even though the AsyncStorage mock resolves synchronously, the Provider's
 * useEffect runs asynchronously. Tests MUST use `waitFor` to wait for
 * providers to hydrate before asserting on rendered content.
 *
 * Usage:
 *   import { render, screen, waitFor } from '@/lib/test-utils';
 *
 *   render(<MyComponent />);
 *   await waitFor(() => {
 *     expect(screen.getByText('Hello')).toBeOnTheScreen();
 *   });
 */

import React from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/lib/theme-context';
import { PremiumProvider } from '@/lib/premium-context';
import { IdentityProvider } from '@/lib/identity-context';
import { HabitsProvider } from '@/lib/habits-context';

/**
 * Create a fresh QueryClient for each test to prevent query cache pollution
 */
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

/**
 * AllProviders wrapper that nests all 4 context providers in the same order as app/_layout.tsx
 *
 * Nesting order:
 * 1. QueryClientProvider (outermost)
 * 2. ThemeProvider
 * 3. PremiumProvider
 * 4. IdentityProvider
 * 5. HabitsProvider (innermost)
 *
 * Note: GestureHandlerRootView and KeyboardProvider are NOT included -- they are
 * native wrappers already mocked in jest.setup.js and would add unnecessary complexity.
 */
function AllProviders({ children }: { children: React.ReactNode }) {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <PremiumProvider>
          <IdentityProvider>
            <HabitsProvider>
              {children}
            </HabitsProvider>
          </IdentityProvider>
        </PremiumProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

/**
 * Custom render function that wraps components in all context providers
 */
function customRender(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllProviders, ...options });
}

// Re-export everything from @testing-library/react-native for single-import convenience
export * from '@testing-library/react-native';

// Export customRender as 'render' so tests can import { render } from this file
export { customRender as render };
