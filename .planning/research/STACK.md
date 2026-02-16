# Stack Research

**Domain:** React Native/Expo Testing and Refactoring Infrastructure
**Researched:** 2026-02-16
**Confidence:** HIGH

## Recommended Stack

### Testing Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Jest | 30.2.0 | Test runner and assertion library | Ships with React Native, has built-in coverage (Istanbul), watch mode, parallel execution. Jest 30 (mid-2025) improved performance and TypeScript support. Official RN recommendation. |
| jest-expo | 54.0.17 | Jest preset for Expo | Official Expo preset that handles native module mocking, transforms, and multi-platform testing (iOS/Android/web/node). Required for Expo 54. |
| @testing-library/react-native | 13.3.3 | Component testing library | Official React Native recommendation. Encourages testing from user perspective, not implementation details. Built on react-test-renderer with fireEvent and query APIs. |
| @testing-library/jest-native | 5.4.3 | Custom Jest matchers for RN | Extends Jest with React Native-specific matchers like toBeVisible, toHaveTextContent, toBeDisabled. Improves test readability. |
| @types/jest | latest | TypeScript types for Jest | Essential for TypeScript projects (Tiny Wins uses TS 5.9). Provides autocomplete and type safety in tests. |

### E2E Testing

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Maestro | latest (CLI) | E2E mobile testing | Designed specifically for React Native/Expo. Uses human-readable YAML syntax (no code). Handles flakiness better than alternatives. Built-in Studio tool for building tests. Official Expo integration. Free tier: 100 tests/month. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @types/react | ~19.1.10 | React 19 types | Already in project, needed for testing React components with TypeScript |
| react-test-renderer | N/A - AVOID | Legacy renderer | DEPRECATED - lacks React 19 support. Use @testing-library/react-native instead |

### Refactoring Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| VSCode Glean | Extract JSX to components, convert class→functional, rename state+setters | Free VSCode extension by Wix. Best for automated component extraction. Handles props wiring automatically. Supports TS + JS. |
| WebStorm Extract Component | Extract JSX selections into new components | Built into JetBrains IDEs. Good alternative for WebStorm/IntelliJ users. |
| GitHub Copilot | AI-assisted refactoring suggestions | Paid. Real-time suggestions for modernizing code, converting class components. Good for large-scale patterns. |
| Built-in VSCode Refactor | Rename symbols, extract functions | Free, built-in. Use for basic refactoring (rename variables, extract functions). |

## Installation

### Core Testing Setup
```bash
# Install Jest and Expo preset (use expo install for version compatibility)
npx expo install jest-expo jest @types/jest --dev

# Install React Native Testing Library
npx expo install @testing-library/react-native --dev

# Install custom matchers
npm install --save-dev @testing-library/jest-native
```

### Maestro E2E Setup
```bash
# Install Maestro CLI (macOS/Linux)
curl -Ls "https://get.maestro.mobile.dev" | bash

# Verify installation
maestro --version
```

### Refactoring Tools
```bash
# VSCode: Install "Glean" extension
# Search: wix.glean in VSCode extensions marketplace

# WebStorm: Built-in (no installation)

# GitHub Copilot: Requires subscription + VSCode extension
```

## Configuration

### package.json Setup

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watchAll",
    "test:coverage": "jest --coverage",
    "test:e2e": "maestro test .maestro"
  },
  "jest": {
    "preset": "jest-expo",
    "setupFilesAfterEnv": ["@testing-library/jest-native/extend-expect"],
    "collectCoverageFrom": [
      "app/**/*.{js,jsx,ts,tsx}",
      "components/**/*.{js,jsx,ts,tsx}",
      "lib/**/*.{js,jsx,ts,tsx}",
      "!**/*.d.ts",
      "!**/node_modules/**",
      "!**/__tests__/**",
      "!**/coverage/**"
    ],
    "coverageThresholds": {
      "global": {
        "branches": 70,
        "functions": 70,
        "lines": 70,
        "statements": 70
      }
    },
    "transformIgnorePatterns": [
      "node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg))"
    ]
  }
}
```

### jest-expo Platform Presets

Available for multi-platform testing:
- `jest-expo` - Base preset (recommended starting point)
- `jest-expo/universal` - Cross-platform tests
- `jest-expo/ios` - iOS-specific tests
- `jest-expo/android` - Android-specific tests
- `jest-expo/web` - Web-specific tests
- `jest-expo/node` - Node/SSR tests

### Test File Organization

```
__tests__/                    # Root-level tests
  setup.ts                    # Global test setup

app/
  (tabs)/
    index.tsx                 # Component
    __tests__/
      index.test.tsx          # Component test

components/
  HabitCard.tsx
  HabitCard.test.tsx          # Co-located test

.maestro/
  flows/
    habit-creation.yaml       # E2E test flows
    habit-completion.yaml
```

### Maestro Configuration

Create `.maestro/config.yaml`:
```yaml
appId: com.tinywins.app  # Replace with your Expo app ID
---
# Common setup for all flows
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Jest | Vitest | Never for React Native (no RN support yet). Only for web-only React projects. |
| @testing-library/react-native | Enzyme | Never - deprecated, no React 19 support, tests implementation details |
| Maestro | Detox | If you need extreme customization or low-level access. Detox is more complex but more powerful. Requires native code access (incompatible with Expo managed workflow). |
| Maestro | Appium | If you need cross-platform mobile + desktop testing. Overkill for RN-only apps. More complex setup. |
| VSCode Glean | Manual refactoring | For learning purposes or one-off refactors. Glean is faster for repetitive work. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| react-test-renderer (direct use) | Lacks React 19 support. Low-level API is hard to use correctly. | @testing-library/react-native (wraps it with better APIs) |
| jest-expo-enzyme | Enzyme is deprecated. No longer maintained. | @testing-library/react-native |
| Detox with Expo managed | Requires ejecting from Expo or using bare workflow. Cannot use with managed Expo apps. | Maestro (designed for Expo managed workflow) |
| Snapshot testing (large snapshots) | Brittle, hard to review, implementation-focused. | Explicit assertions with @testing-library queries |
| testID-only queries | Implementation detail. Breaks if you remove testID. | Accessibility queries (getByRole, getByLabelText, getByText) |

## Stack Patterns by Testing Level

### Unit Tests (70% of tests)
- **Target:** Pure functions, hooks, utilities
- **Tools:** Jest + expect assertions
- **Speed:** Milliseconds per test
- **Example:** `lib/habitHelpers.ts` functions

```typescript
// lib/__tests__/habitHelpers.test.ts
import { calculateStreak } from '../habitHelpers';

describe('calculateStreak', () => {
  it('returns 0 for empty completion array', () => {
    expect(calculateStreak([])).toBe(0);
  });
});
```

### Integration Tests (20% of tests)
- **Target:** Components with state, Context, async operations
- **Tools:** React Native Testing Library + fireEvent + waitFor
- **Speed:** 100-500ms per test
- **Example:** `components/HabitCard.tsx` with completion logic

```typescript
// components/__tests__/HabitCard.test.tsx
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { HabitCard } from '../HabitCard';

it('marks habit as complete when tapped', async () => {
  const onComplete = jest.fn();
  const { getByRole } = render(
    <HabitCard habit={mockHabit} onComplete={onComplete} />
  );

  fireEvent.press(getByRole('button', { name: 'Complete' }));

  await waitFor(() => {
    expect(onComplete).toHaveBeenCalledWith(mockHabit.id);
  });
});
```

### E2E Tests (10% of tests)
- **Target:** Critical user flows (create habit, complete habit, view stats)
- **Tools:** Maestro YAML flows
- **Speed:** 10-60 seconds per flow
- **Example:** Complete habit creation flow

```yaml
# .maestro/flows/create-habit.yaml
appId: com.tinywins.app
---
- launchApp
- tapOn:
    id: "add_habit_button"
- tapOn:
    id: "habit_name_input"
- inputText: "Morning Meditation"
- tapOn: "Save"
- assertVisible: "Morning Meditation"
```

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| jest-expo@54.0.17 | expo@~54.0.x, react-native@*, react-server-dom-webpack@~19.0.4-19.2.4 | Peer dependencies enforced. Use npx expo install for automatic version matching. |
| @testing-library/react-native@13.3.3 | react@16.0.0+, react-native@0.60.0+ | Works with React 19 and React Native 0.81. |
| Jest@30.2.0 | Node.js 14+ | Jest 30 released mid-2025 with improved TS support. |
| Maestro | iOS 13+, Android API 21+ | Platform requirements, not library versions. |

## Testing Strategy Pyramid

```
     /\
    /E2E\          10% - Critical flows only (Maestro)
   /------\
  /Integ.  \       20% - Component + Context + async (RNTL)
 /----------\
/   Unit     \     70% - Pure functions, utilities (Jest)
--------------
```

**Rationale for distribution:**
- **Unit tests are fast** - Run on every save, catch logic bugs early
- **Integration tests are realistic** - Test how components actually work together
- **E2E tests are expensive** - Slow, flaky, hard to debug. Reserve for vital flows only.

## Confidence Assessment

| Technology | Confidence | Source |
|------------|------------|--------|
| Jest 30.2.0 | HIGH | Official RN docs + npm registry verified |
| jest-expo 54.0.17 | HIGH | Expo official docs + npm registry verified |
| @testing-library/react-native 13.3.3 | HIGH | Official RN docs + npm registry verified |
| @testing-library/jest-native 5.4.3 | HIGH | Npm registry verified + widely used in community |
| Maestro | HIGH | Expo official docs + official React Native support |
| VSCode Glean | MEDIUM | GitHub repo active (last commit recent) + positive community feedback |
| GitHub Copilot | MEDIUM | Widely used but paid tool, effectiveness varies |

## Refactoring Strategy for 1600+ Line Components

**Goal:** Extract monolithic screen components into testable units without breaking functionality.

### Recommended Approach

1. **Add Maestro E2E tests first** - Capture current behavior before refactoring
2. **Use VSCode Glean** - Extract JSX sections into smaller components
3. **Add unit tests** - Test extracted components in isolation
4. **Refactor incrementally** - One component extraction per commit
5. **Run E2E after each extraction** - Ensure no regressions

### Glean Extraction Pattern

**Before (1600 lines):**
```typescript
// app/(tabs)/habits.tsx - MONOLITHIC
export default function HabitsScreen() {
  // 1600 lines of JSX and logic
}
```

**After extraction with Glean:**
```typescript
// app/(tabs)/habits.tsx - ORCHESTRATOR (200 lines)
export default function HabitsScreen() {
  return (
    <>
      <HabitHeader />
      <HabitList habits={habits} onComplete={handleComplete} />
      <AddHabitButton onPress={handleAdd} />
    </>
  );
}

// components/HabitHeader.tsx - TESTABLE (50 lines)
// components/HabitList.tsx - TESTABLE (100 lines)
// components/AddHabitButton.tsx - TESTABLE (30 lines)
```

**Benefits:**
- Each component can be tested independently
- Easier to understand and modify
- Reusable components across screens
- Parallel development possible

## Migration Path

**Phase 1: Setup (1 day)**
1. Install Jest, jest-expo, @testing-library/react-native
2. Configure package.json with test scripts and coverage
3. Create `__tests__/setup.ts` for global test configuration
4. Install VSCode Glean extension

**Phase 2: E2E Safety Net (2-3 days)**
1. Install Maestro
2. Write E2E flows for 3-4 critical user journeys
3. Run flows to establish baseline
4. Document expected behavior

**Phase 3: Component Extraction (2-3 weeks)**
1. Start with smallest screen component
2. Use Glean to extract 3-5 logical sections
3. Add unit tests for extracted components
4. Run Maestro flows to verify no breakage
5. Commit and repeat for next component

**Phase 4: Integration Tests (1-2 weeks)**
1. Add integration tests for components with Context/async
2. Test user interactions (button presses, form inputs)
3. Test state management flows
4. Aim for 70% coverage threshold

**Phase 5: CI/CD Integration (2-3 days)**
1. Add test runs to CI pipeline
2. Enforce coverage thresholds
3. Run Maestro tests on release candidates
4. Set up coverage reporting

## Sources

### Official Documentation (HIGH confidence)
- [Expo Unit Testing with Jest](https://docs.expo.dev/develop/unit-testing/)
- [React Native Testing Overview](https://reactnative.dev/docs/testing-overview)
- [Maestro React Native Support](https://docs.maestro.dev/platform-support/react-native)
- [React Native Testing Library](http://oss.callstack.com/react-native-testing-library/)
- [Jest Configuration](https://jestjs.io/docs/configuration)

### npm Registry (HIGH confidence)
- [jest-expo versions](https://www.npmjs.com/package/jest-expo)
- [@testing-library/react-native](https://www.npmjs.com/package/@testing-library/react-native)
- [@testing-library/jest-native](https://www.npmjs.com/package/@testing-library/jest-native)

### Community Resources (MEDIUM confidence)
- [VSCode Glean](https://marketplace.visualstudio.com/items?itemName=wix.glean)
- [GitHub - wix-incubator/vscode-glean](https://github.com/wix-incubator/vscode-glean)
- [Expo E2E Workflows with Maestro](https://docs.expo.dev/eas/workflows/examples/e2e-tests/)
- [React Native Testing Library Best Practices](https://yrkan.com/blog/react-native-testing-library/)

---
*Stack research for: Tiny Wins Habit Tracker - Testing & Refactoring Infrastructure*
*Researched: 2026-02-16*
*Focus: Subsequent milestone adding tests to existing Expo 54 app with zero current test coverage*
