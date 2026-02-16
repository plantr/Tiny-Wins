# Pitfalls Research

**Domain:** React Native/Expo Testing Infrastructure & Component Refactoring
**Researched:** 2026-02-16
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: Empty waitFor Callbacks Creating Fragile Tests

**What goes wrong:**
Tests pass initially but become flaky or break on minor refactoring. Developers write `await waitFor(() => {})` or similar empty callbacks, which only wait for one tick of the event loop without verifying actual state changes.

**Why it happens:**
When adding async testing for the first time, developers discover their tests pass with an empty waitFor and don't realize they've created technical debt. The test passes because it waits just long enough for the current async operation, but this is fragile.

**How to avoid:**
Always put specific assertions inside waitFor callbacks. Use `await waitFor(() => expect(screen.getByText('Expected')).toBeTruthy())` instead of empty callbacks followed by assertions.

**Warning signs:**
- Tests that pass inconsistently
- Tests that break when refactoring async logic timing
- Empty arrow functions passed to waitFor
- Assertions outside waitFor blocks for async operations

**Phase to address:**
Phase 1 (Test Infrastructure Setup) - Establish this pattern in initial test examples and documentation.

---

### Pitfall 2: Testing Implementation Details Instead of User Behavior

**What goes wrong:**
Tests break on every refactoring even when user-facing functionality remains identical. Using UNSAFE_getByType, UNSAFE_getByProps, or querying internal component structure creates brittle tests tied to implementation.

**Why it happens:**
Developers familiar with traditional unit testing apply those patterns to React components. They test "does this component render a FlatList" instead of "can the user see their habit list."

**How to avoid:**
Query by accessibility labels, testIDs, or user-visible text. Use `getByText`, `getByLabelText`, `getByRole` instead of `getByType` or `getByProps`. React Native Testing Library marks type/props queries as UNSAFE precisely because they test composite components fragility.

**Warning signs:**
- Imports including UNSAFE_getByType or UNSAFE_getByProps
- Tests failing during component structure refactoring
- Snapshot tests as primary verification method
- Testing for specific component types in render output

**Phase to address:**
Phase 1 (Test Infrastructure Setup) - Create test examples and conventions document. Phase 2 (Component Refactoring) - Refactor existing tests before component work.

---

### Pitfall 3: Incomplete AsyncStorage Mocking

**What goes wrong:**
Tests appear to pass but don't actually verify persistence logic. AsyncStorage calls fail silently or return undefined, masking bugs in data persistence flows.

**Why it happens:**
Developers copy-paste basic AsyncStorage mocks without implementing proper Promise-based responses. The mock exists but doesn't simulate actual storage behavior.

**How to avoid:**
Use the official `@react-native-async-storage/async-storage/jest/async-storage-mock` or create a complete mock using a Map to actually store/retrieve data. Verify the mock is called with correct arguments using `jest.spyOn`.

**Warning signs:**
- AsyncStorage calls returning undefined in tests
- Persistence tests passing without actual data verification
- Missing clear() calls in afterEach blocks
- No spying/verification of AsyncStorage method calls

**Phase to address:**
Phase 1 (Test Infrastructure Setup) - Configure AsyncStorage mock properly from the start. Include verification examples.

---

### Pitfall 4: Forgetting to Await Async Queries

**What goes wrong:**
Tests always pass even when assertions are wrong. Unawaited findBy queries or async utilities return Promises that never get verified, creating false confidence.

**Why it happens:**
JavaScript allows Promise objects without await, and the test framework doesn't catch the mistake. The test completes before the assertion runs.

**How to avoid:**
Use ESLint plugin `eslint-plugin-testing-library` with rules `await-async-queries` and `await-async-utils` enabled. Always await findBy queries and waitFor calls.

**Warning signs:**
- Tests passing immediately (< 100ms) when testing async operations
- Tests that never fail even with intentional bugs
- Missing await keywords before findBy* queries
- Floating promises in test code

**Phase to address:**
Phase 1 (Test Infrastructure Setup) - Configure ESLint rules before writing first test.

---

### Pitfall 5: Not Providing Custom Render Wrapper for Multiple Contexts

**What goes wrong:**
Every test file duplicates context provider setup. Tests become verbose, inconsistent, and difficult to maintain. When context structure changes, dozens of test files break.

**Why it happens:**
The project has 4 context providers but no standard test wrapper. Developers manually wrap each test in providers, leading to inconsistent test setup across files.

**How to avoid:**
Create a custom render function in test utils that wraps components with all necessary providers. Allow provider props to be overridden for specific test cases. Import from test-utils instead of @testing-library/react-native directly.

**Warning signs:**
- Repeated provider setup in every test file
- Inconsistent provider ordering across tests
- Tests breaking when provider structure changes
- Inability to easily test components that depend on multiple contexts

**Phase to address:**
Phase 1 (Test Infrastructure Setup) - Create custom render wrapper before writing component tests.

---

### Pitfall 6: Refactoring Large Components Without Test Coverage First

**What goes wrong:**
Breaking changes go unnoticed during refactoring. The refactored component appears to work but has subtle behavioral differences from the original.

**Why it happens:**
The urge to "clean up" large components (1634, 1106, 967 lines) is strong, and writing tests for existing code feels like extra work. Developers start refactoring immediately.

**How to avoid:**
Write characterization tests for current behavior before any refactoring. These tests may test implementation details temporarily - that's acceptable as scaffolding. Refactor tests to user behavior patterns after component refactoring is complete.

**Warning signs:**
- Refactoring PRs without test additions
- "Works on my device" verification only
- Inability to verify behavioral equivalence
- Regression bugs discovered by users

**Phase to address:**
Phase 2 (Component Refactoring) - Explicitly require test coverage before refactoring work begins.

---

### Pitfall 7: Over-Extracting Custom Hooks Too Early

**What goes wrong:**
Creating overly abstract custom hooks that are harder to understand than the original code. Hooks with 8+ parameters, confusing APIs, or forced abstractions that don't actually reuse logic.

**Why it happens:**
After learning about custom hooks, developers extract logic aggressively. They see 20 lines of useState and useEffect and immediately think "this should be a hook" without considering whether it's actually reusable.

**How to avoid:**
Extract custom hooks only when logic is duplicated across 2-3 components OR when a clear, reusable concern emerges (e.g., useHabitPersistence). Keep hooks focused - if a hook needs more than 3-4 parameters, it's probably too abstract.

**Warning signs:**
- Custom hooks with 5+ parameters
- Hooks used in only one place
- Confusing hook APIs requiring extensive documentation
- More lines of code after "abstraction" than before

**Phase to address:**
Phase 2 (Component Refactoring) - Review custom hook extractions. Require 2+ uses or clear single responsibility.

---

### Pitfall 8: New Architecture View Flattening Breaking E2E Tests

**What goes wrong:**
Maestro E2E tests that worked in legacy architecture fail because view hierarchy has changed. Elements that were previously separate views are now flattened, making them undiscoverable by accessibility queries.

**Why it happens:**
The project has New Architecture enabled. View flattening optimizes render performance but changes the view hierarchy that E2E tools rely on. This is a documented issue with Appium and similar tools.

**How to avoid:**
Use accessibility labels and testIDs on semantic elements, not wrapper Views. Test Maestro flows against New Architecture builds from the start. Consider using text matching as primary strategy with testID as backup.

**Warning signs:**
- Maestro "element not found" errors on elements that are visibly present
- E2E tests passing in dev builds but failing in release builds
- Inconsistent view hierarchy between iOS and Android
- Need for increasingly specific view hierarchy queries

**Phase to address:**
Phase 3 (E2E Testing) - Build New Architecture test app first, verify Maestro compatibility before writing flows.

---

### Pitfall 9: React Compiler Breaking Mock Expectations

**What goes wrong:**
Tests fail intermittently or show unexpected behavior because the React Compiler's automatic memoization changes when effects run and when components re-render.

**Why it happens:**
The project has React Compiler enabled. Tests written without considering skip-memoization can have wrong assumptions about render counts or effect invocations. Props that are unchanged (skip-memoized) may not trigger expected re-renders.

**How to avoid:**
Test effects under scenarios of both changed and unchanged props. Don't assert exact render counts - test observable behavior instead. Be aware that creating new objects with spread operators during test setup breaks memoization.

**Warning signs:**
- Tests asserting specific render counts failing unpredictably
- Effects not firing when expected in tests
- Mocked functions called fewer times than expected
- Tests passing locally but failing in CI

**Phase to address:**
Phase 1 (Test Infrastructure Setup) - Document React Compiler testing implications. Phase 2 (Component Refactoring) - Review tests after refactoring for compiler compatibility.

---

### Pitfall 10: Missing Test Setup for Babel/Expo 54 Configuration

**What goes wrong:**
Jest cannot parse JSX, imports fail with "Unexpected token" errors, or Expo-specific modules don't resolve. Tests crash before running.

**Why it happens:**
Expo 54 requires specific Jest and Babel configuration. Developers install Jest but forget jest-expo preset, or miss transformIgnorePatterns for node_modules. The babel-preset-expo must be in devDependencies.

**How to avoid:**
Use jest-expo preset which handles most configuration automatically. Ensure babel-preset-expo is in devDependencies. Add transformIgnorePatterns for react-native and expo packages. Verify setup with a simple smoke test.

**Warning signs:**
- "Unexpected token" errors in test output
- Import failures for Expo modules
- JSX syntax errors in tests
- "Cannot find module 'expo/config'" errors

**Phase to address:**
Phase 1 (Test Infrastructure Setup) - First task. No other testing work until Jest runs successfully.

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Snapshot tests only | Fast to write, cover many components quickly | Brittle, break on every UI change, don't verify behavior | Never as sole testing strategy; acceptable as supplement to behavioral tests |
| Testing implementation details | Tests are easy to write following component structure | Refactoring becomes impossible, tests break constantly | Temporarily during characterization testing before refactoring |
| Manual provider wrapping in each test | No abstraction needed, straightforward | 4x duplication, inconsistent setup, breaks easily | Never - custom render is 20 lines once, saves hundreds |
| Skipping async/await on async queries | Test runs, seems to work | Flaky tests, false positives, debugging nightmares | Never - ESLint rule prevents this |
| Extracting custom hooks immediately | Feels like "clean code" | Over-abstraction, confusion, harder to understand | Only after 2+ duplicate uses or clear single responsibility |
| Using testID everywhere | Easy to query in tests | Pollutes production code, accessibility issues | Acceptable for complex interactions; prefer accessibility labels when possible |

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| AsyncStorage | Forgetting to clear storage between tests | Add `AsyncStorage.clear()` in `afterEach` hook globally |
| AsyncStorage | Basic mock without actual storage behavior | Use official mock or Map-based implementation that stores data |
| React Navigation | Not mocking navigation prop | Create mock navigation object in test-utils with jest.fn() for navigate, goBack, etc. |
| Context Providers | Wrapping in wrong order | Match production provider order exactly in test wrapper |
| Expo modules (Camera, etc.) | Not mocking native modules | Create `__mocks__` directory for each Expo native module used |
| React Compiler | Assuming props always trigger re-render | Test with both changed and unchanged props; don't assert render counts |

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Running all tests on every file save | Fast initially, becomes unusable | Use Jest watch mode with `--onlyChanged` flag; use `test.only` during development | ~100+ test files |
| No test parallelization | Long CI times | Enable `--maxWorkers=50%` in CI; default works locally | ~500+ tests |
| Large snapshot files | Git diffs become unreadable | Use targeted snapshots for specific UI sections; prefer behavioral assertions | ~50+ snapshots |
| Rendering entire app tree in unit tests | Tests slow down significantly | Mock navigation screens; test components in isolation | ~20+ integrated tests |
| No test timeouts | Hanging tests block CI indefinitely | Set global timeout to 10s; override for specific slow tests | First network/async mistake |

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Committing .env files with test credentials | Exposing API keys in version control | Add `.env*` to .gitignore; use environment variables in CI |
| testID values exposing business logic | Production app reveals internal structure | Use generic testIDs; strip in production with babel plugin |
| Mocking authentication without testing edge cases | Bugs in auth flows reach production | Test unauthorized, expired token, network failure states |
| Not testing data sanitization in AsyncStorage | User can persist malicious data | Test with malformed JSON, edge case data in storage tests |

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Forgetting to test loading states | App appears broken during data fetch | Test and render loading indicators for all async operations |
| Not testing error states | Cryptic errors confuse users | Test error scenarios; verify user-friendly messages display |
| Ignoring keyboard interactions | iOS/Android soft keyboard breaks layout | Test text inputs with keyboard shown; verify scrolling works |
| Skipping accessibility testing | Screen reader users can't use app | Use accessibility labels; test with screen reader; verify color contrast |
| Not testing offline behavior | App crashes without network | Test AsyncStorage persistence; verify graceful degradation offline |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Test Infrastructure:** Often missing custom render wrapper - verify all 4 context providers included
- [ ] **Test Infrastructure:** Often missing AsyncStorage mock - verify clear() in afterEach and proper storage behavior
- [ ] **Test Infrastructure:** Often missing ESLint testing rules - verify eslint-plugin-testing-library configured
- [ ] **Component Tests:** Often missing async state verification - verify waitFor used correctly, not empty callbacks
- [ ] **Component Tests:** Often missing error state tests - verify error boundaries and error messages tested
- [ ] **Component Tests:** Often missing loading state tests - verify loading indicators tested
- [ ] **Refactored Components:** Often missing behavioral equivalence verification - verify characterization tests exist
- [ ] **Custom Hooks:** Often missing edge case tests - verify hooks tested independently from components
- [ ] **E2E Tests:** Often missing New Architecture verification - verify Maestro tests run on New Architecture build
- [ ] **E2E Tests:** Often missing data setup/teardown - verify test data strategy documented and implemented

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Empty waitFor callbacks | LOW | Search codebase for `waitFor(() => {})`, add assertions inside callbacks, run tests to verify |
| Testing implementation details | MEDIUM | Identify brittle tests, rewrite queries to use text/labels/testIDs, verify tests still pass after refactoring |
| No custom render wrapper | LOW | Extract provider setup from one test file into test-utils, update imports across codebase |
| Forgotten await on async queries | LOW | Enable ESLint rule, run `eslint --fix`, manually fix remaining violations |
| Refactored without tests | HIGH | May need to revert refactoring, write characterization tests, refactor again incrementally |
| Over-abstracted custom hooks | MEDIUM | Inline hook code back into components, identify actual duplication, extract simpler hooks |
| View flattening E2E breaks | MEDIUM | Switch from hierarchy queries to text/accessibility queries, add testIDs to critical elements |
| React Compiler mock issues | MEDIUM | Remove render count assertions, focus on observable behavior, test with both changed/unchanged props |
| Babel/Jest config wrong | LOW | Use jest-expo preset, verify babel-preset-expo in devDependencies, copy working config from Expo docs |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Empty waitFor callbacks | Phase 1: Test Infrastructure | Code review checklist includes waitFor assertions; example tests demonstrate pattern |
| Testing implementation details | Phase 1: Test Infrastructure | Testing conventions document prohibits UNSAFE queries; examples use accessibility queries |
| Incomplete AsyncStorage mocking | Phase 1: Test Infrastructure | Test utils include complete AsyncStorage mock; smoke test verifies storage behavior |
| Forgetting to await async queries | Phase 1: Test Infrastructure | ESLint rule enabled; CI fails on violations |
| No custom render wrapper | Phase 1: Test Infrastructure | test-utils.tsx exports custom render with all 4 providers |
| Refactoring without tests first | Phase 2: Component Refactoring | PR template requires "Characterization tests added: Yes/No"; code review enforces |
| Over-extracting custom hooks | Phase 2: Component Refactoring | Code review checklist: "Is hook used 2+ places OR clear single responsibility?" |
| View flattening E2E breaks | Phase 3: E2E Testing | Maestro tests run against New Architecture build; prefer text/accessibility queries |
| React Compiler mock issues | Phase 2: Component Refactoring | Tests avoid render count assertions; test docs note compiler implications |
| Babel/Jest config wrong | Phase 1: Test Infrastructure | Smoke test in CI verifies Jest runs; jest-expo preset in package.json |

## Sources

**React Native Testing Library Best Practices:**
- [Testing · React Native](https://reactnative.dev/docs/testing-overview)
- [A Developer's Guide to React Native Testing with Jest, RNTL & E2E](https://www.gigson.co/blog/react-native-testing-jest-rntl-e2e)
- [React-Native-Advanced-Guide: RNTL Component Testing](https://github.com/anisurrahman072/React-Native-Advanced-Guide/blob/master/Testing/RNTL-Component-Testing-ultimate-guide.md)
- [Testing environment - React Native Testing Library](https://oss.callstack.com/react-native-testing-library/docs/advanced/testing-env)

**Common Testing Mistakes:**
- [Common mistakes with React Testing Library](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Async Methods | Testing Library](https://testing-library.com/docs/dom-testing-library/api-async/)
- [Misleading Test Coverage and How to Avoid False Confidence](https://hackernoon.com/misleading-test-coverage-and-how-to-avoid-false-confidence)

**AsyncStorage Testing:**
- [How to Mock Native Modules in React Native Tests](https://oneuptime.com/blog/post/2026-01-15-react-native-mock-native-modules/view)
- [Jest integration | Async Storage](https://react-native-async-storage.github.io/async-storage/docs/advanced/jest/)

**React Context Testing:**
- [React Context | Testing Library](https://testing-library.com/docs/example-react-context/)
- [How to test React Context](https://www.samdawson.dev/article/react-context-testing/)

**Expo Configuration:**
- [Unit testing with Jest - Expo Documentation](https://docs.expo.dev/develop/unit-testing/)
- [babel.config.js - Expo Documentation](https://docs.expo.dev/versions/latest/config/babel/)
- [Jest problems with Expo 50 · expo/expo · Discussion #26856](https://github.com/expo/expo/discussions/26856)

**React Native New Architecture:**
- [React Native's New Architecture - Expo Documentation](https://docs.expo.dev/guides/new-architecture/)
- [Migrating to React Native's New Architecture (2025) - Shopify](https://shopify.engineering/react-native-new-architecture)
- [Library support for New Architecture + Bridgeless in 2024](https://github.com/reactwg/react-native-new-architecture/discussions/167)

**React 19 Compatibility:**
- [React Native 0.83 - React 19.2, New DevTools features, no breaking changes](https://reactnative.dev/blog/2025/12/10/react-native-0.83)
- [React 19 Upgrade Guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide)

**React Compiler:**
- [React Compiler – React](https://react.dev/learn/react-compiler)
- [React Compiler v1.0](https://react.dev/blog/2025/10/07/react-compiler-1)
- [Meta's React Compiler 1.0 Brings Automatic Memoization to Production](https://www.infoq.com/news/2025/12/react-compiler-meta/)

**Component Refactoring:**
- [Common Sense Refactoring of a Messy React Component](https://alexkondov.com/refactoring-a-messy-react-component/)
- [How to Refactor your React Native App](https://stormotion.io/blog/how-to-refactor-your-react-native-app/)
- [Refactoring components in React with custom hooks](https://codescene.com/engineering-blog/refactoring-components-in-react-with-custom-hooks)

**Custom Hooks Best Practices:**
- [Reusing Logic with Custom Hooks – React](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [Extract React Hook Refactoring](https://blog.rstankov.com/extract-react-hook-refactoring/)
- [React Hooks — Common pitfalls and Best Practices](https://hrshdg8.medium.com/react-hooks-common-pitfalls-and-best-practices-96079a40870c)

**Maestro E2E Testing:**
- [How to Set Up End-to-End Testing for React Native with Maestro](https://oneuptime.com/blog/post/2026-01-15-react-native-maestro-testing/view)
- [Run E2E tests on EAS Workflows and Maestro - Expo Documentation](https://docs.expo.dev/eas/workflows/examples/e2e-tests/)
- [React Native Support | Maestro](https://docs.maestro.dev/platform-support/react-native)

**Accessibility & testID:**
- [Best Practices for React Native Development to Improve Appium Test Automation](https://www.testmuai.com/blog/react-native-best-practices/)
- [React Native Accessibility Best Practices: 2025 Guide](https://www.accessibilitychecker.org/blog/react-native-accessibility/)

---
*Pitfalls research for: Tiny Wins - Expo 54 Habit Tracking App Testing & Refactoring*
*Researched: 2026-02-16*
