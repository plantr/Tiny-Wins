# Phase 4: Integration Tests & Quality Gates - Research

**Researched:** 2026-02-16
**Domain:** Integration testing with React Native Testing Library, AsyncStorage persistence, and Jest coverage enforcement
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Use per-path thresholds at 80% (continuing the pattern established in Phases 1-3)
- Raise the global coverage floor higher than the current 15-17% to reflect accumulated test coverage

### Claude's Discretion
- **Provider test depth:** Claude assesses each provider's complexity and allocates testing depth accordingly (happy path + edges for complex providers, lighter for simple ones)
- **Test style:** Claude decides whether to verify data shape contracts, behavioral correctness, or both — based on what makes tests most useful and resilient
- **Provider priority:** Claude determines which providers get deeper coverage based on complexity assessment
- **PremiumProvider limit testing:** Claude decides whether to test exact limit (10) or limit concept
- **Workflow test layer:** Claude picks whether to render full components or test at provider-level logic for the habit completion flow
- **Workflow failure scenarios:** Claude determines if testing failure mid-flow adds value
- **Additional workflows:** Claude assesses which workflows (beyond habit completion) give the most value within scope
- **Visual vs data assertions:** Claude picks based on what Phase 3 component tests already cover
- **App restart simulation:** Claude picks unmount/remount vs fresh render based on what works with existing test-utils
- **Storage pre-seeding:** Claude decides based on what success criteria require
- **Hydration helper:** Claude picks helper function vs inline waitFor based on test count
- **Storage format verification:** Claude decides based on serialization risk
- **Whether to retroactively raise Phase 3 component thresholds from 70% to 80% or keep them separate**
- **Handling coverage conflicts with untested files (exempt vs stub tests)**

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope

</user_constraints>

## Summary

Phase 4 focuses on integration testing React Native context providers that persist state to AsyncStorage, verifying multi-component workflows, and enforcing stricter quality gates through 80% coverage thresholds. The codebase already has excellent test infrastructure (test-utils.tsx with all 4 providers wrapped, AsyncStorage mock configured, 22 passing test suites) and uses a two-tier coverage strategy (per-path 70% + global floor 15-17%). This phase extends that pattern with deeper provider testing and stricter thresholds.

The research reveals that React Native Testing Library + AsyncStorage testing follows well-established patterns: custom render wrappers (already implemented), waitFor for async state hydration (already documented in test-utils comments), and Jest's per-path coverage thresholds (already configured). The key technical insight is that provider tests with persistence require careful async handling since AsyncStorage operations and useEffect hydration are asynchronous, even with synchronous mocks.

**Primary recommendation:** Test providers at the provider level (not full UI integration) using the existing test-utils wrapper, pre-seed AsyncStorage for hydration tests, verify persistence with getItem assertions, and use per-path 80% thresholds on all new test files while raising global floor to match actual coverage (~23-27% based on current 17-24% actual).

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @testing-library/react-native | 13.3.3 | Component testing | Official React Native testing solution, follows Testing Library principles ("test as users use"), supports async operations with waitFor/findBy |
| @react-native-async-storage/async-storage | 2.2.0 | Storage mock | Official library provides Jest mock at `/jest/async-storage-mock`, fully compatible with testing patterns |
| jest | 29.7.0 | Test runner | Industry standard, built into React Native ecosystem via jest-expo |
| jest-expo | 54.0.17 | Expo preset | Handles React Native transformations, includes all necessary mocks and config |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @tanstack/react-query | 5.83.0 | Query state | Already wrapped in test-utils, no additional testing needed for Phase 4 |
| jest-coverage-thresholds-bumper | N/A (optional) | Auto-bump thresholds | Only if automating threshold increases in CI, not needed for manual incremental approach |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Provider-level tests | Full UI integration tests | Full UI tests are more realistic but slower, harder to debug, and many Phase 3 component tests already cover UI interactions. Provider tests are faster and isolate persistence logic. |
| Per-path 80% thresholds | jest-it-up auto-bumper | Auto-bumping is convenient but obscures intentional quality decisions. Manual thresholds make standards explicit. |
| AsyncStorage mock | Custom mock implementation | Official mock is maintained, feature-complete, and follows library best practices. Custom mocks add maintenance burden. |

**Installation:**
No new packages needed — all required dependencies already installed.

## Architecture Patterns

### Recommended Test Structure
```
lib/
├── habits-context.tsx
├── habits-context.test.tsx      # NEW: Provider integration tests
├── theme-context.tsx
├── theme-context.test.tsx        # NEW: Provider integration tests
├── identity-context.tsx
├── identity-context.test.tsx     # NEW: Provider integration tests
├── premium-context.tsx
├── premium-context.test.tsx      # NEW: Provider integration tests
└── test-utils.tsx                # Existing: Custom render wrapper
```

Co-locate provider tests with provider files (established pattern from Phases 1-3).

### Pattern 1: Provider Integration Test Structure
**What:** Test providers through their public API (hook), verify state changes persist to AsyncStorage, test hydration from storage on mount.

**When to use:** For all context providers with persistence (HabitsProvider, ThemeProvider, IdentityProvider). Use lighter testing for stateless providers (PremiumProvider).

**Example:**
```typescript
// Source: Project codebase + RNTL best practices
import React from 'react';
import { render, screen, waitFor } from '@/lib/test-utils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useHabits } from './habits-context';

// Helper component to expose hook values for testing
function TestComponent() {
  const { habits, addHabit, isLoaded } = useHabits();
  return (
    <>
      <Text testID="loaded">{isLoaded ? 'ready' : 'loading'}</Text>
      <Text testID="count">{habits.length}</Text>
      <Button testID="add" onPress={() => addHabit({...habitData})} />
    </>
  );
}

describe('HabitsProvider', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('loads empty state on first mount', async () => {
    render(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('loaded')).toHaveTextContent('ready');
    });
    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });

  it('persists new habit to AsyncStorage', async () => {
    render(<TestComponent />);
    await waitFor(() => expect(screen.getByTestId('loaded')).toHaveTextContent('ready'));

    fireEvent.press(screen.getByTestId('add'));

    await waitFor(async () => {
      const stored = await AsyncStorage.getItem('tinywins_habits');
      expect(JSON.parse(stored)).toHaveLength(1);
    });
  });

  it('hydrates from AsyncStorage on mount', async () => {
    // Pre-seed storage
    const existingHabit = { id: 'test-1', title: 'Test Habit', /* ... */ };
    await AsyncStorage.setItem('tinywins_habits', JSON.stringify([existingHabit]));

    render(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('count')).toHaveTextContent('1');
    });
  });
});
```

### Pattern 2: App Restart Simulation
**What:** Unmount provider tree, verify AsyncStorage contains persisted data, mount fresh provider tree, verify hydration.

**When to use:** For testing that state survives "app restart" (ThemeProvider dark/light mode persistence, HabitsProvider data survival).

**Example:**
```typescript
// Source: RNTL API documentation + project patterns
it('persists theme across app restarts', async () => {
  // First mount: change theme
  const { unmount } = render(<TestComponent />);
  await waitFor(() => expect(screen.getByTestId('loaded')).toHaveTextContent('ready'));

  fireEvent.press(screen.getByTestId('toggle-theme'));
  await waitFor(() => expect(screen.getByTestId('mode')).toHaveTextContent('light'));

  unmount();

  // Verify persistence
  const stored = await AsyncStorage.getItem('app_theme_mode');
  expect(stored).toBe('light');

  // Second mount: verify hydration
  render(<TestComponent />);
  await waitFor(() => {
    expect(screen.getByTestId('mode')).toHaveTextContent('light');
  });
});
```

### Pattern 3: Multi-Component Workflow Test
**What:** Render component that uses provider, simulate user actions, verify provider state updates and persistence, verify side effects (logs, streaks).

**When to use:** For testing critical workflows like habit completion flow (completeHabit → streak increments → log persists → evidence modal context).

**Example:**
```typescript
// Source: Project test patterns + RNTL integration guidance
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@/lib/test-utils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useHabits } from '@/lib/habits-context';

function HabitCompletionWorkflow() {
  const { habits, completeHabit, logs } = useHabits();
  const habit = habits[0];

  if (!habit) return <Text>No habits</Text>;

  return (
    <>
      <Text testID="streak">{habit.streak}</Text>
      <Text testID="log-count">{logs.length}</Text>
      <Button
        testID="complete"
        onPress={() => completeHabit(habit.id, 'Did it!', 'Felt great')}
      />
    </>
  );
}

it('habit completion workflow creates log and increments streak', async () => {
  // Pre-seed habit
  const habit = { id: 'h1', title: 'Test', streak: 0, goal: 1, /* ... */ };
  await AsyncStorage.setItem('tinywins_habits', JSON.stringify([habit]));

  render(<HabitCompletionWorkflow />);
  await waitFor(() => expect(screen.queryByText('No habits')).toBeNull());

  // Complete habit
  fireEvent.press(screen.getByTestId('complete'));

  // Verify streak incremented
  await waitFor(() => {
    expect(screen.getByTestId('streak')).toHaveTextContent('1');
  });

  // Verify log created
  expect(screen.getByTestId('log-count')).toHaveTextContent('1');

  // Verify persistence
  const storedHabits = JSON.parse(await AsyncStorage.getItem('tinywins_habits'));
  expect(storedHabits[0].streak).toBe(1);

  const storedLogs = JSON.parse(await AsyncStorage.getItem('tinywins_logs'));
  expect(storedLogs).toHaveLength(1);
  expect(storedLogs[0].evidenceNote).toBe('Did it!');
});
```

### Pattern 4: Coverage Threshold Configuration
**What:** Use per-path thresholds for files with tests, global floor for overall project health.

**When to use:** Always. Set per-path thresholds when adding tests, raise global floor incrementally.

**Example:**
```javascript
// Source: Jest official documentation + project jest.config.js
module.exports = {
  coverageThreshold: {
    global: {
      branches: 23,
      functions: 23,
      lines: 27,
      statements: 27,
    },
    // NEW: Phase 4 providers at 80%
    './lib/habits-context.tsx': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    './lib/theme-context.tsx': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    './lib/identity-context.tsx': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    './lib/premium-context.tsx': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    // OPTIONAL: Raise Phase 3 thresholds from 70% to 80%
    // (Claude's discretion based on cost/benefit)
  },
};
```

### Anti-Patterns to Avoid
- **Testing provider internals:** Don't test React.useState or useEffect directly — test through the public API (the hook). Users don't call internal functions; they call hook methods.
- **Skipping AsyncStorage verification:** Provider state might update in-memory but fail to persist. Always verify with `AsyncStorage.getItem()` assertions.
- **Forgetting waitFor after renders:** Even with sync mocks, useEffect hydration is async. Always `waitFor(() => expect(isLoaded).toBe(true))` before state assertions.
- **Testing too much UI in integration tests:** Provider tests should focus on persistence and state management, not UI rendering. Phase 3 already covered component UI.
- **Setting 80% thresholds without tests:** Per-path thresholds fail builds if not met. Only add thresholds for files with actual test coverage.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| AsyncStorage mocking | Custom localStorage mock or in-memory store | `@react-native-async-storage/async-storage/jest/async-storage-mock` | Official mock handles all AsyncStorage APIs (multiGet, multiSet, mergeItem, etc.), follows async patterns correctly, maintained alongside library updates |
| Custom render wrapper | Manually wrapping providers in each test | test-utils.tsx with AllProviders wrapper (already implemented) | Single source of truth, matches production provider order, prevents provider order bugs in tests |
| waitFor alternatives | setTimeout, setImmediate, custom polling | `waitFor()` from @testing-library/react-native | Built-in timeout handling, better error messages, automatic retry logic, handles React act() warnings |
| Coverage threshold scripts | Custom coverage parser and threshold enforcer | Jest's built-in coverageThreshold config | Native support, glob patterns, per-path thresholds, clear error messages on failure |
| State persistence testing | Mocking AsyncStorage methods per-test | Pre-seed with AsyncStorage.setItem in beforeEach | More realistic test flow, catches serialization bugs, tests actual persistence contract |

**Key insight:** Integration testing infrastructure is deceptively complex — AsyncStorage async behavior, React lifecycle timing, coverage configuration edge cases. The ecosystem provides battle-tested solutions; custom implementations miss edge cases and add maintenance burden.

## Common Pitfalls

### Pitfall 1: Racing with AsyncStorage Hydration
**What goes wrong:** Test assertions run before provider finishes hydrating from AsyncStorage, causing false failures or flaky tests.

**Why it happens:** AsyncStorage mock resolves synchronously, but provider useEffect is async and runs after initial render. Tests see "loading" state instead of hydrated state.

**How to avoid:**
- Always wait for isLoaded flag: `await waitFor(() => expect(isLoaded).toBe(true));`
- Use findBy queries instead of getBy when expecting async content: `await screen.findByText('habit title')`
- Document hydration requirement in test comments (already done in test-utils.tsx)

**Warning signs:**
```typescript
// BAD: No wait for hydration
render(<TestComponent />);
expect(screen.getByText('habit title')).toBeOnTheScreen(); // Fails — not loaded yet

// GOOD: Wait for hydration
render(<TestComponent />);
await waitFor(() => expect(screen.queryByText('loading')).toBeNull());
expect(screen.getByText('habit title')).toBeOnTheScreen();
```

### Pitfall 2: AsyncStorage State Leaks Between Tests
**What goes wrong:** Tests pass individually but fail when run together because AsyncStorage state persists between tests, causing unexpected hydration.

**Why it happens:** afterEach AsyncStorage.clear() in jest.setup.js runs after test completes, but beforeEach in test file might run before cleanup completes. Race condition.

**How to avoid:**
- Always add explicit `await AsyncStorage.clear()` in test beforeEach even though jest.setup.js has afterEach clear
- Pre-seed storage explicitly for tests that need it — never rely on previous test state
- Use unique storage keys if testing multiple scenarios in one file

**Warning signs:**
- Tests pass in isolation (`jest --testNamePattern "specific test"`) but fail in suite
- "Expected 0 habits, got 3" errors when expecting empty state
- Hydration loads unexpected data

### Pitfall 3: Coverage Threshold Conflicts
**What goes wrong:** Adding per-path 80% threshold to a file with existing tests that only achieve 65% coverage causes immediate build failure.

**Why it happens:** Per-path thresholds are strict — if threshold exists and isn't met, Jest fails. Project has Phase 3 components at 70% with some under-tested (current coverage shows several files at 40-60%).

**How to avoid:**
- Run coverage before adding threshold: `jest --coverage --testPathPattern="habits-context"`
- Only add 80% thresholds to NEW test files created in Phase 4
- For Phase 3 components: decide whether to raise 70%→80% (requires filling coverage gaps first) or keep separate
- Use global floor for files without per-path thresholds rather than adding unmet thresholds

**Warning signs:**
```bash
Jest: "./lib/habits-context.tsx" coverage threshold for branches (80%) not met: 65%
```

### Pitfall 4: Testing AsyncStorage Persistence vs In-Memory State
**What goes wrong:** Test verifies in-memory state updated but doesn't verify AsyncStorage persistence, so code that forgets to persist passes tests but loses data in production.

**Why it happens:** Provider state updates (useState) and persistence (AsyncStorage.setItem) are separate operations. Easy to verify one but forget the other.

**How to avoid:**
- Dual assertions: verify both in-memory state AND AsyncStorage content
- Use restart simulation pattern to force hydration from storage
- Check AsyncStorage.setItem call count: `expect(AsyncStorage.setItem).toHaveBeenCalledWith('key', expect.any(String))`

**Warning signs:**
```typescript
// INCOMPLETE: Only checks in-memory state
expect(screen.getByTestId('count')).toHaveTextContent('1');

// COMPLETE: Checks persistence too
expect(screen.getByTestId('count')).toHaveTextContent('1');
const stored = await AsyncStorage.getItem('tinywins_habits');
expect(JSON.parse(stored)).toHaveLength(1);
```

### Pitfall 5: Workflow Tests That Are Too Broad
**What goes wrong:** Single test tries to verify entire user journey (create habit → complete habit → view evidence → delete habit → verify deletion persists), becomes hard to debug when it fails.

**Why it happens:** "Integration test" sounds like "test everything integrated together". But narrower tests are easier to debug and maintain.

**How to avoid:**
- One workflow per test: "habit completion flow" separate from "habit deletion flow"
- Test at provider level (completeHabit function), not full UI navigation
- Use Phase 3 component tests for UI interactions, Phase 4 for persistence/state
- Limit to 2-3 provider actions per test

**Warning signs:**
- Test has 10+ assertions
- Test name is "tests habit lifecycle"
- Debugging requires commenting out half the test to find failure point
- Test setup is 50+ lines

## Code Examples

Verified patterns from official sources and project codebase:

### Pre-Seeding AsyncStorage for Tests
```typescript
// Source: React Native School TDD with AsyncStorage + project patterns
beforeEach(async () => {
  await AsyncStorage.clear();

  // Pre-seed specific test data
  const testHabit = {
    id: 'test-id',
    title: 'Morning Run',
    streak: 5,
    goal: 1,
    current: 0,
    icon: 'fitness',
    iconColor: '#4ADE80',
    gradientColors: ['#4ADE80', '#22C55E'] as const,
    unit: 'times',
    frequency: 'Daily',
    weekData: [1, 1, 1, 1, 1, 0, 0],
    bestStreak: 5,
    createdAt: Date.now(),
  };

  await AsyncStorage.setItem('tinywins_habits', JSON.stringify([testHabit]));
});
```

### Verifying Persistence After State Change
```typescript
// Source: Project patterns + AsyncStorage mock documentation
it('persists habit updates to AsyncStorage', async () => {
  const { updateHabit } = renderHook(() => useHabits(), {
    wrapper: AllProviders
  }).result.current;

  await waitFor(() => expect(isLoaded).toBe(true));

  updateHabit('habit-id', { title: 'New Title' });

  // Wait for state update
  await waitFor(() => {
    expect(habits[0].title).toBe('New Title');
  });

  // Verify persistence
  const stored = await AsyncStorage.getItem('tinywins_habits');
  const parsedHabits = JSON.parse(stored);
  expect(parsedHabits[0].title).toBe('New Title');
});
```

### Testing Helper Component Pattern
```typescript
// Source: Testing Library documentation + project test-utils
// Pattern for testing hooks through context
function TestHabitsHook() {
  const habits = useHabits();
  return (
    <View>
      <Text testID="count">{habits.habits.length}</Text>
      <Text testID="loaded">{habits.isLoaded ? 'yes' : 'no'}</Text>
      <Button
        testID="add"
        onPress={() => habits.addHabit({
          title: 'Test',
          icon: 'star',
          // ... required fields
        })}
      />
    </View>
  );
}

describe('HabitsProvider', () => {
  it('starts with empty habits', async () => {
    render(<TestHabitsHook />);
    await waitFor(() => expect(screen.getByTestId('loaded')).toHaveTextContent('yes'));
    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });
});
```

### Calculating Appropriate Global Coverage Floor
```typescript
// Source: Jest documentation + project coverage patterns
// Run coverage to see current actual percentages
// Command: npm test -- --coverage --silent

// Current actual coverage (from Phase 3 completion):
// statements: 17-24%
// branches: 15-20%
// lines: 17-24%
// functions: 15-20%

// Phase 4 adds ~4 provider test files + workflow tests
// Providers are ~300 lines tested at 80% = +240 lines covered
// Total project lines ~3500, so +240 = +6.8% project coverage

// Conservative floor calculation:
// Current low end: 17% statements
// Phase 4 addition: +6.8%
// New floor: 17 + 6.8 = 23.8% → round to 23-24%

// Actual jest.config.js update:
coverageThreshold: {
  global: {
    branches: 23,      // Up from 15
    functions: 23,     // Up from 15
    lines: 27,         // Up from 17
    statements: 27,    // Up from 17
  },
  // ... per-path thresholds
}
```

### Provider Test with Restart Simulation
```typescript
// Source: RNTL GitHub issues + project patterns
it('theme persists across app restart', async () => {
  // Mount 1: Change theme to light
  const { unmount: unmount1 } = render(<ThemeTestComponent />);

  await waitFor(() => {
    expect(screen.getByTestId('mode')).toHaveTextContent('dark'); // default
  });

  fireEvent.press(screen.getByTestId('toggle'));

  await waitFor(() => {
    expect(screen.getByTestId('mode')).toHaveTextContent('light');
  });

  unmount1();

  // Verify AsyncStorage has persisted value
  const stored = await AsyncStorage.getItem('app_theme_mode');
  expect(stored).toBe('light');

  // Mount 2: Fresh render should hydrate from storage
  render(<ThemeTestComponent />);

  await waitFor(() => {
    expect(screen.getByTestId('mode')).toHaveTextContent('light');
  });
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Global coverage thresholds only | Per-path + global floor | Jest 24+ (2019) | Enables incremental coverage improvement without blocking development |
| Manual AsyncStorage mocks | Official jest mock package | @react-native-async-storage 1.12+ (2020) | Reduces custom mock maintenance, catches more edge cases |
| getByText for async content | findByText or waitFor + getByText | RTL 7+ (2019) | Eliminates race conditions with async state updates |
| Integration tests with full navigation | Provider-level tests + component tests | RNTL best practices (2023+) | Faster tests, better isolation, easier debugging |
| Setting thresholds to current coverage | Setting thresholds as targets | Modern Jest practices (2025+) | Forces quality improvement instead of just preventing regression |

**Deprecated/outdated:**
- `wait()` function: Replaced by `waitFor()` in RNTL 7.0+. waitFor has better timeout handling and clearer error messages.
- `cleanup()` manual calls: RNTL auto-cleanup since v2.0 (2019). Manually calling causes double-cleanup warnings.
- `wrapper` option in every test: Superseded by custom render in test-utils. Project already implements this pattern correctly.
- `async-storage` package (old): Replaced by `@react-native-async-storage/async-storage` (community maintained version)

## Open Questions

1. **Phase 3 threshold retroactive increase**
   - What we know: 16 Phase 3 files have 70% thresholds, some under-performing (40-60% actual)
   - What's unclear: Cost/benefit of raising to 80% now vs keeping 70% separate tier
   - Recommendation: Keep Phase 3 at 70%, Phase 4 at 80%. Two-tier system (70% for components, 80% for core logic) is reasonable. Raising Phase 3 thresholds requires significant test additions (estimated 8-12 hours work), which is out of scope for Phase 4.

2. **Untested files coverage strategy**
   - What we know: Many app/components files have no tests (query-client.ts, various screens)
   - What's unclear: Should global floor exempt them or should Phase 4 add stub tests
   - Recommendation: Let global floor catch them naturally. Don't add stub tests just to pass thresholds — that's coverage theater. Future phases will add E2E tests that exercise screens. Focus Phase 4 on success criteria (providers + workflow).

3. **PremiumProvider limit testing detail**
   - What we know: FREE_HABIT_LIMIT = 10, canCreateHabit checks `currentCount < FREE_HABIT_LIMIT`
   - What's unclear: Test exact limit (9 passes, 10 fails) or just test concept (below/at/above limit)
   - Recommendation: Test exact limit. Simple to implement, catches off-by-one errors, limit is explicit business rule. Test: 9 habits → canCreate true, 10 habits → canCreate false, 11 habits → canCreate false.

4. **Hydration helper utility need**
   - What we know: Every provider test needs `await waitFor(() => expect(isLoaded).toBe(true))`
   - What's unclear: Create `waitForProvidersReady()` helper or inline waitFor everywhere
   - Recommendation: Inline waitFor in each test. Only 4 provider test files + 1 workflow file = ~20 uses. Helper adds indirection for minimal DRY benefit. Keep tests explicit and readable.

## Sources

### Primary (HIGH confidence)
- [Jest Configuration Documentation](https://jestjs.io/docs/configuration) - Coverage threshold syntax and per-path configuration
- [Testing Library Setup Guide](https://testing-library.com/docs/react-testing-library/setup) - Custom render wrapper patterns
- [AsyncStorage Jest Integration (GitHub)](https://github.com/invertase/react-native-async-storage/blob/master/docs/Jest-integration.md) - Official mock setup and testing patterns
- [Jest Asynchronous Testing](https://jestjs.io/docs/asynchronous) - waitFor and async patterns
- Project codebase analysis - test-utils.tsx, jest.config.js, existing test patterns

### Secondary (MEDIUM confidence)
- [React Native Testing Overview](https://reactnative.dev/docs/testing-overview) - Testing strategy layers
- [RNTL Best Practices (Yuri Kan)](https://yrkan.com/blog/react-native-testing-library/) - Integration testing patterns
- [React Native School: TDD with AsyncStorage](https://www.reactnativeschool.com/test-driven-development-with-asyncstorage/) - Pre-seeding and persistence testing
- [Configuring Jest Coverage (Valentinog)](https://www.valentinog.com/blog/jest-coverage/) - Threshold strategies
- [Unit Testing Expo Apps (Nx)](https://nx.dev/blog/unit-testing-expo-apps-with-jest) - Expo-specific patterns

### Tertiary (LOW confidence)
- [Medium: Enforcing Coverage Thresholds in CI](https://medium.com/@Adekola_Olawale/enforcing-code-coverage-thresholds-for-javascript-projects-in-ci-1877113832c4) - CI integration strategies (not needed for Phase 4)
- [jest-it-up tool](https://github.com/rbardini/jest-it-up) - Auto-bumping thresholds (not using automated approach)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All packages already installed and in use, official documentation verified
- Architecture patterns: HIGH - Patterns verified in project codebase and official RNTL docs
- AsyncStorage testing: HIGH - Official mock and GitHub documentation
- Coverage thresholds: HIGH - Jest official docs + working implementation in project
- Workflow testing: MEDIUM - General RNTL guidance, specific approach is Claude's discretion per CONTEXT.md
- Pitfalls: HIGH - Derived from GitHub issues, official docs "Common Mistakes", and project test experience

**Research date:** 2026-02-16
**Valid until:** 60 days (stable ecosystem — Jest and RNTL are mature, patterns unlikely to change rapidly)
