# Phase 1: Test Infrastructure Setup - Research

**Researched:** 2026-02-16
**Domain:** Jest + React Native Testing Library for Expo SDK 54
**Confidence:** HIGH

## Summary

This phase establishes the testing foundation for a React Native/Expo app using Jest 30, React Native Testing Library 12.4+, and jest-expo preset. The codebase uses Expo SDK 54 with React 19.1.0, React Native 0.81.5, and four context providers (ThemeProvider, PremiumProvider, IdentityProvider, HabitsProvider) that all depend on AsyncStorage for persistence. All four providers implement loading states and only render children after hydration, which is critical for test infrastructure design.

The app heavily uses native modules: expo-router (file-based routing), expo-haptics (tactile feedback), expo-linear-gradient (UI styling), react-native-reanimated (animations), react-native-gesture-handler (gestures), react-native-keyboard-controller (keyboard management), and react-native-safe-area-context (layout). The standard approach uses jest-expo preset with additional configuration for transformIgnorePatterns, native module mocks, and a custom render wrapper that wraps all four context providers.

**Primary recommendation:** Use jest-expo preset as the foundation, create a comprehensive jest.setup.js for all native module mocks (including the official mocks from AsyncStorage, Reanimated, Gesture Handler, and Keyboard Controller), build a custom render wrapper in lib/test-utils.tsx that provides all four context providers with overridable defaults, and configure coverage reporting with a 70% threshold across all metrics (lines, branches, functions, statements). Co-locate test files using .test.tsx pattern for maintainability.

## User Constraints

<user_constraints>
### Claude's Discretion

All implementation decisions for this phase are at Claude's discretion. The user trusts Claude to make the right calls based on codebase analysis and best practices. Key areas where Claude should make informed choices:

**Mock strategy:**
- Which native modules to mock upfront vs. defer to later phases (AsyncStorage is required; others based on what the codebase imports)
- Mock file organization (single setup file vs. organized __mocks__ directory)
- AsyncStorage mock reset strategy (per-test isolation vs. per-describe-block persistence)
- Mock fidelity per module (silent no-ops vs. jest.fn() call tracking)

**Render wrapper design:**
- Default provider state (empty/fresh vs. pre-seeded with sample data)
- Whether to support per-provider overrides in the render API
- File location (lib/test-utils.tsx per TINF-03 requirement, or alternative based on project structure)
- Whether to re-export @testing-library/react-native for single-import convenience

**Coverage rules:**
- Per-file vs. overall project threshold enforcement
- Which coverage metrics to enforce (lines, branches, functions, statements)
- Directory and file type exclusions
- Report output format (terminal only vs. terminal + HTML)

**Smoke test scope:**
- Target component (full screen vs. simpler component that still exercises providers)
- Interaction depth (render-only vs. render + simulate user action)
- Test data strategy (pre-seeded AsyncStorage vs. empty state)
- Test file location (co-located vs. separate infrastructure test folder)
</user_constraints>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| jest | 30.x | Test runner and assertion library | Industry standard for JavaScript testing, excellent React Native support |
| jest-expo | 54.0.11+ | Jest preset for Expo | Official Expo preset that handles native module mocking and transpilation automatically for SDK 54 |
| @testing-library/react-native | 12.4+ | Component testing utilities | Current standard for React Native testing, includes built-in jest matchers (no jest-native needed) |
| @types/jest | latest | TypeScript types for Jest | Required for TypeScript projects to get type safety in tests |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @react-native-async-storage/async-storage/jest/async-storage-mock | 2.2.0 | Official AsyncStorage mock | Required - app uses AsyncStorage in all 4 context providers |
| react-native-reanimated | 4.1.1 | Animation testing setup | Required - app uses Reanimated for animations |
| react-native-gesture-handler/jestSetup | 2.28.0 | Gesture handler mocks | Required - app uses GestureHandlerRootView in root layout |
| react-native-keyboard-controller/jest | 1.20.6 | Keyboard controller mocks | Required - app uses KeyboardProvider in root layout |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| jest-expo preset | react-native preset | jest-expo handles Expo SDK specifics automatically; react-native preset requires manual configuration for expo modules |
| @testing-library/react-native 12.4+ | @testing-library/jest-native | Version 12.4+ includes built-in matchers; jest-native is no longer maintained |
| Co-located .test.tsx files | __tests__ directory | Co-location makes tests easier to find and maintain; __tests__ centralizes but increases cognitive distance |

**Installation:**
```bash
npx expo install jest-expo jest @types/jest --dev
npm install --save-dev @testing-library/react-native
```

## Architecture Patterns

### Recommended Project Structure
```
app/
├── (tabs)/
│   └── index.test.tsx           # Co-located test files
lib/
├── test-utils.tsx               # Custom render wrapper with providers
├── theme-context.tsx
├── habits-context.tsx
├── identity-context.tsx
└── premium-context.tsx
jest.config.js                   # Jest configuration
jest.setup.js                    # Global mocks and setup
coverage/                        # Generated coverage reports (gitignored)
```

### Pattern 1: Custom Render Wrapper with Context Providers

**What:** A custom render function that wraps components with all required context providers automatically

**When to use:** Every component test that uses any of the four context providers (ThemeProvider, PremiumProvider, IdentityProvider, HabitsProvider)

**Example:**
```typescript
// lib/test-utils.tsx
// Source: https://testing-library.com/docs/react-native-testing-library/setup/
import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './query-client';
import { ThemeProvider } from './theme-context';
import { PremiumProvider } from './premium-context';
import { IdentityProvider } from './identity-context';
import { HabitsProvider } from './habits-context';

interface AllProvidersProps {
  children: React.ReactNode;
}

function AllProviders({ children }: AllProvidersProps) {
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

function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllProviders, ...options });
}

// Re-export everything from RNTL
export * from '@testing-library/react-native';

// Override render with our custom version
export { customRender as render };
```

### Pattern 2: AsyncStorage Mock with Per-Test Isolation

**What:** Mock AsyncStorage globally and clear it between tests to prevent test pollution

**When to use:** Required for all tests since all four context providers use AsyncStorage

**Example:**
```javascript
// jest.setup.js
// Source: https://react-native-async-storage.github.io/async-storage/docs/advanced/jest/
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Clear AsyncStorage after each test for isolation
afterEach(async () => {
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  await AsyncStorage.clear();
});
```

### Pattern 3: Native Module Mocking in Setup File

**What:** Load official mocks for react-native-reanimated, react-native-gesture-handler, and react-native-keyboard-controller

**When to use:** Required setup for apps using these libraries

**Example:**
```javascript
// jest.setup.js
// Source: https://docs.swmansion.com/react-native-reanimated/docs/guides/testing/
// Source: https://docs.swmansion.com/react-native-gesture-handler/docs/guides/testing/
// Source: https://kirillzyusko.github.io/react-native-keyboard-controller/docs/recipes/jest-testing-guide

// Gesture Handler mock
import 'react-native-gesture-handler/jestSetup';

// Reanimated mock
require('react-native-reanimated').setUpTests();

// Keyboard Controller mock
jest.mock('react-native-keyboard-controller', () =>
  require('react-native-keyboard-controller/jest')
);
```

### Pattern 4: Coverage Configuration with Thresholds

**What:** Configure Jest to enforce coverage thresholds and generate reports

**When to use:** Always - ensures code quality and CI integration

**Example:**
```javascript
// jest.config.js
// Source: https://jestjs.io/docs/configuration
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)'
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/__tests__/**',
    '!**/.expo/**'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  coverageReporters: ['text', 'lcov', 'html']
};
```

### Anti-Patterns to Avoid

- **Mocking AsyncStorage per-test:** Creates duplication and risks inconsistent behavior. Mock globally in jest.setup.js instead.
- **Not clearing AsyncStorage between tests:** Causes test pollution where one test's data affects another. Always clear in afterEach.
- **Testing implementation details:** Don't test context provider internals. Test components that consume the contexts instead.
- **Wrapping providers manually in each test:** Use the custom render wrapper to avoid duplication and ensure consistency.
- **Skipping setupFilesAfterEnv:** Native module mocks require setupFilesAfterEnv, not setupFiles. Using setupFiles can cause initialization order issues.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| AsyncStorage mocking | Custom mock implementation | @react-native-async-storage/async-storage/jest/async-storage-mock | Official mock handles all edge cases, tracks calls correctly, and is maintained by the AsyncStorage team |
| Reanimated mocking | Manual animation mocks | require('react-native-reanimated').setUpTests() | Official setup handles worklet compilation, shared values, and animation APIs that are complex to mock correctly |
| Gesture handler mocking | Custom gesture mocks | react-native-gesture-handler/jestSetup | Official mock provides fireGestureHandler API and handles native event simulation |
| Keyboard controller mocking | Manual keyboard state mocks | react-native-keyboard-controller/jest | Official mock provides proper hook mocking for useKeyboardAnimation and keyboard state |
| Custom jest matchers | Extending jest manually | @testing-library/react-native 12.4+ built-in matchers | Version 12.4+ includes toBeOnTheScreen, toHaveAccessibilityValue, etc. automatically |
| Provider composition wrapper | Nested wrapper components in each test | lib/test-utils.tsx custom render | Single source of truth for provider setup, easier to update when providers change |

**Key insight:** React Native testing has matured significantly. Most native modules now provide official Jest mocks that handle complex native bridge interactions, worklet compilation, and asynchronous behavior correctly. Using these official mocks prevents subtle bugs that appear only in CI or on specific platforms.

## Common Pitfalls

### Pitfall 1: setupFiles vs setupFilesAfterEnv Confusion

**What goes wrong:** Native module mocks don't work correctly, or tests fail with "Cannot read property 'setUpTests' of undefined"

**Why it happens:** Different mocks require different initialization timing. setupFiles runs before Jest environment setup; setupFilesAfterEnv runs after.

**How to avoid:**
- Use setupFilesAfterEnv for react-native-reanimated, react-native-gesture-handler
- Use setupFiles only for simple mocks that don't depend on the Jest environment
- jest-expo documentation recommends setupFilesAfterEnv as the default

**Warning signs:** Native module errors, "undefined is not a function" for native APIs, inconsistent test failures

### Pitfall 2: Context Provider Loading States Break Tests

**What goes wrong:** Components render as null or tests timeout because providers never finish loading

**Why it happens:** ThemeProvider and IdentityProvider have `if (!loaded) return null` logic that waits for AsyncStorage. In tests, AsyncStorage is mocked but the Promise never resolves.

**How to avoid:**
- Ensure AsyncStorage mock is loaded before test execution (jest.setup.js)
- Use waitFor from @testing-library/react-native when providers have loading states
- Consider pre-seeding AsyncStorage in test setup for faster tests
- Option: Mock the contexts directly for component tests that don't need full provider behavior

**Warning signs:** Tests hang, timeout errors, components don't render, "Unable to find element" errors

### Pitfall 3: Incomplete transformIgnorePatterns

**What goes wrong:** Tests fail with "SyntaxError: Unexpected token" or "Cannot use import statement outside a module" for Expo/React Native packages

**Why it happens:** Many Expo packages and React Native libraries publish untranspiled TypeScript/ESM code. Jest doesn't transpile node_modules by default.

**How to avoid:**
- Use the comprehensive transformIgnorePatterns pattern from Expo documentation
- Include: react-native, @react-native, expo, @expo, @unimodules, react-navigation, @react-navigation
- Update pattern when adding new native modules
- jest-expo preset provides defaults but some packages still need explicit inclusion

**Warning signs:** Syntax errors in node_modules, import/export errors, JSX parsing errors in dependencies

### Pitfall 4: Coverage Threshold on First Run

**What goes wrong:** CI fails because initial test suite doesn't meet 70% coverage threshold

**Why it happens:** Setting coverageThreshold.global to 70% before any tests exist means zero coverage, which fails the threshold

**How to avoid:**
- Start with lower threshold (30-40%) and increase incrementally
- OR disable threshold initially, establish baseline coverage, then set threshold just below baseline
- OR exclude threshold from initial CI setup, add after smoke test and first component tests exist
- Use coverageThreshold per-directory for incremental rollout

**Warning signs:** "Jest: Coverage threshold for X not met" on first test run, blocking CI before any real tests exist

### Pitfall 5: expo-router Mocking Complexity

**What goes wrong:** Tests fail when components use useRouter, useLocalSearchParams, or router.push

**Why it happens:** expo-router deeply integrates with the file system and native navigation stack. Standard mocks don't capture routing state.

**How to avoid:**
- For smoke test: Use a simple component that doesn't use routing
- For component tests: Mock expo-router with jest.mock() and provide mock implementations
- For integration tests: Use expo-router/testing-library's renderRouter for full routing simulation
- Document that routing-heavy components may need more sophisticated mocking in later phases

**Warning signs:** "useRouter must be used within a Router" errors, navigation-related test failures, undefined router methods

### Pitfall 6: React Native Testing Library 12.4+ Matchers

**What goes wrong:** Installing @testing-library/jest-native alongside @testing-library/react-native 12.4+

**Why it happens:** Developers follow older tutorials that recommend jest-native, not knowing it's deprecated and now built into RNTL 12.4+

**How to avoid:**
- Use @testing-library/react-native 12.4+ which includes built-in matchers automatically
- DO NOT install @testing-library/jest-native (package is no longer maintained)
- Matchers are available automatically when you import from @testing-library/react-native
- No extend-expect setup needed for version 12.4+

**Warning signs:** Duplicate matcher warnings, conflicting matcher implementations, jest-native deprecation warnings

## Code Examples

Verified patterns from official sources:

### Complete jest.config.js
```javascript
// Source: https://docs.expo.dev/develop/unit-testing/
// Source: https://jestjs.io/docs/configuration
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Transform Expo and React Native packages
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)'
  ],

  // Coverage configuration
  collectCoverage: true,
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/__tests__/**',
    '!**/.expo/**',
    '!**/coverage/**'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  coverageReporters: ['text', 'lcov', 'html'],

  // Test file patterns (default, explicit for clarity)
  testMatch: [
    '**/__tests__/**/*.{ts,tsx}',
    '**/*.test.{ts,tsx}',
    '**/*.spec.{ts,tsx}'
  ]
};
```

### Complete jest.setup.js
```javascript
// Source: Multiple official documentation sources
// https://react-native-async-storage.github.io/async-storage/docs/advanced/jest/
// https://docs.swmansion.com/react-native-reanimated/docs/guides/testing/
// https://docs.swmansion.com/react-native-gesture-handler/docs/guides/testing/
// https://kirillzyusko.github.io/react-native-keyboard-controller/docs/recipes/jest-testing-guide

// AsyncStorage mock - must be first
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Gesture Handler mock
import 'react-native-gesture-handler/jestSetup';

// Reanimated mock
require('react-native-reanimated').setUpTests();

// Keyboard Controller mock
jest.mock('react-native-keyboard-controller', () =>
  require('react-native-keyboard-controller/jest')
);

// Expo Haptics mock (no official mock, simple stub)
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
  selectionAsync: jest.fn(() => Promise.resolve()),
}));

// Expo Router mock (basic navigation stub)
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: jest.fn(() => false),
  },
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: jest.fn(() => false),
  })),
  useLocalSearchParams: jest.fn(() => ({})),
  Stack: 'Stack',
  Tabs: 'Tabs',
}));

// Clear AsyncStorage after each test for isolation
afterEach(async () => {
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  await AsyncStorage.clear();
});
```

### Custom Render Wrapper
```typescript
// lib/test-utils.tsx
// Source: https://testing-library.com/docs/react-native-testing-library/setup/
import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { QueryClientProvider } from '@tanstack/react-query';
import { QueryClient } from '@tanstack/react-query';
import { ThemeProvider } from './theme-context';
import { PremiumProvider } from './premium-context';
import { IdentityProvider } from './identity-context';
import { HabitsProvider } from './habits-context';

// Create a fresh query client for each test to avoid cache pollution
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

interface AllProvidersProps {
  children: React.ReactNode;
}

function AllProviders({ children }: AllProvidersProps) {
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

function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllProviders, ...options });
}

// Re-export everything from @testing-library/react-native
export * from '@testing-library/react-native';

// Override render with our custom version
export { customRender as render };
```

### Smoke Test Example
```typescript
// app/(tabs)/index.test.tsx
// Source: https://callstack.github.io/react-native-testing-library/
import { render, screen, waitFor } from '@/lib/test-utils';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Simple smoke test that exercises the infrastructure
describe('Test Infrastructure Smoke Test', () => {
  it('renders a component with all providers', async () => {
    // Pre-seed AsyncStorage so providers load successfully
    await AsyncStorage.setItem('app_theme_mode', 'dark');
    await AsyncStorage.setItem('app_week_start_day', 'Monday');
    await AsyncStorage.setItem('tinywins_identity', JSON.stringify({
      selectedAreaIds: [],
      identityStatement: ''
    }));
    await AsyncStorage.setItem('tinywins_habits', JSON.stringify([]));

    // Simple test component
    const TestComponent = () => {
      const { useTheme } = require('@/lib/theme-context');
      const { colors } = useTheme();
      return <Text testID="test-text" style={{ color: colors.text }}>Test</Text>;
    };

    render(<TestComponent />);

    // Wait for providers to load from AsyncStorage
    await waitFor(() => {
      expect(screen.getByTestId('test-text')).toBeOnTheScreen();
    });

    // Verify text rendered
    expect(screen.getByText('Test')).toBeOnTheScreen();
  });
});
```

### Package.json Scripts
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --maxWorkers=2"
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| @testing-library/jest-native | @testing-library/react-native 12.4+ built-in matchers | RNTL 12.4 (2023) | No need to install jest-native separately; matchers available automatically |
| Manual Reanimated mocking | setUpTests() official setup | Reanimated 2.0+ | Simplified setup, official support for worklets and shared values |
| setupFiles for native mocks | setupFilesAfterEnv | Jest best practices evolution | Correct initialization order for environment-dependent mocks |
| react-native preset | jest-expo preset | Expo SDK standardization | Handles Expo-specific configuration automatically |
| jest 28 | jest 30 | Jest 30 release (2024) | Improved performance, better TypeScript support, no breaking changes for RN testing |

**Deprecated/outdated:**
- **@testing-library/jest-native**: No longer maintained; use @testing-library/react-native 12.4+ instead
- **jest-expo/universal preset for unit tests**: Only needed for multi-platform testing; use base jest-expo for unit tests
- **Manual transformIgnorePatterns for every package**: jest-expo preset handles most common packages now

## Open Questions

1. **Should we pre-seed AsyncStorage in beforeEach or per-test?**
   - What we know: All 4 providers load from AsyncStorage and block rendering until loaded
   - What's unclear: Whether pre-seeding globally speeds up tests enough to justify potential cross-test pollution
   - Recommendation: Start with per-test seeding in smoke test, evaluate test speed, then decide on global beforeEach if needed

2. **Should coverage threshold start at 70% or ramp up incrementally?**
   - What we know: Requirement is 70% threshold, but smoke test alone won't reach this
   - What's unclear: Whether to block CI immediately or allow gradual improvement
   - Recommendation: Start at 30% threshold, increase to 50% after Phase 2 component extraction, reach 70% by Phase 4 integration tests. Document the ramp-up plan.

3. **Do we need to mock expo-file-system and expo-sharing for smoke test?**
   - What we know: Settings screen uses these, but smoke test targets simpler component
   - What's unclear: Whether jest-expo handles these automatically or needs explicit mocks
   - Recommendation: Start without mocks, add only if tests fail. Jest-expo SDK 54 should handle most Expo modules automatically.

4. **Should we use renderRouter from expo-router/testing-library for smoke test?**
   - What we know: Full routing testing utilities exist but add complexity
   - What's unclear: Whether smoke test needs routing or can use simpler mock
   - Recommendation: Use simple jest.mock for expo-router in smoke test (as shown in Code Examples). Save renderRouter for integration tests in later phases.

## Sources

### Primary (HIGH confidence)
- [Expo Unit Testing Documentation](https://docs.expo.dev/develop/unit-testing/) - Official Expo SDK 54 testing setup
- [React Native Testing Library Setup](https://testing-library.com/docs/react-native-testing-library/setup/) - Custom render wrapper pattern
- [AsyncStorage Jest Integration](https://react-native-async-storage.github.io/async-storage/docs/advanced/jest/) - Official AsyncStorage mock setup
- [React Native Reanimated Testing Guide](https://docs.swmansion.com/react-native-reanimated/docs/guides/testing/) - Official setUpTests() configuration
- [React Native Gesture Handler Testing](https://docs.swmansion.com/react-native-gesture-handler/docs/guides/testing/) - Official jestSetup.js configuration
- [React Native Keyboard Controller Jest Guide](https://kirillzyusko.github.io/react-native-keyboard-controller/docs/recipes/jest-testing-guide) - Official Jest mock
- [Jest Configuration Documentation](https://jestjs.io/docs/configuration) - Coverage thresholds and transformIgnorePatterns

### Secondary (MEDIUM confidence)
- [Jest Coverage Threshold Configuration](https://jestjs.io/docs/configuration#coveragethreshold-object) - Coverage metrics setup
- [Expo Router Testing Documentation](https://docs.expo.dev/router/reference/testing/) - renderRouter testing utilities
- [RNTL Built-in Matchers Migration](https://callstack.github.io/react-native-testing-library/docs/migration/jest-matchers) - Version 12.4+ matcher information

### Tertiary (LOW confidence - requires validation)
- [React Native Testing Best Practices 2026](https://www.creolestudios.com/react-native-testing-with-jest-and-rtl/) - General patterns and examples
- [Unit Testing Expo Apps with Jest](https://nx.dev/blog/unit-testing-expo-apps-with-jest) - Coverage and CI configuration examples

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official documentation from Expo, Jest, RNTL, and native module maintainers
- Architecture: HIGH - Patterns verified against official documentation and current codebase structure
- Pitfalls: HIGH - Common issues documented in official GitHub issues and migration guides
- Code examples: HIGH - All examples sourced from official documentation with URLs provided

**Research date:** 2026-02-16
**Valid until:** 2026-04-16 (60 days - stable ecosystem with slow-moving dependencies)

**Key versions verified:**
- Expo SDK: 54.0.27 (from package.json)
- React Native: 0.81.5 (from package.json)
- React: 19.1.0 (from package.json)
- @react-native-async-storage/async-storage: 2.2.0 (from package.json)
- react-native-reanimated: 4.1.1 (from package.json)
- react-native-gesture-handler: 2.28.0 (from package.json)
- react-native-keyboard-controller: 1.20.6 (from package.json)
