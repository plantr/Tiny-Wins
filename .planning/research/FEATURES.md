# Feature Research: React Native App Refactoring and Testing

**Domain:** React Native / Expo App Refactoring & Test Infrastructure
**Researched:** 2026-02-16
**Confidence:** HIGH

## Feature Landscape

This research focuses on the refactoring patterns and test coverage features needed for a React Native habit tracking app with large monolithic components (1634 lines, 1106 lines, 967 lines) and zero existing tests.

### Table Stakes (Must Have for Well-Tested RN App)

Features users/teams expect in any production-ready, well-tested React Native application.

| Feature | Why Expected | Complexity | Dependencies | Notes |
|---------|--------------|------------|--------------|-------|
| **Unit Testing Infrastructure** | Industry standard - Jest + React Native Testing Library for component testing | LOW | None | Jest comes preconfigured with React Native; RNTL is the de-facto standard for component testing |
| **Component Extraction (Functional)** | Breaking 1000+ line components into smaller, testable units is fundamental refactoring | MEDIUM | None | Extract presentational components first, then container/logic components |
| **Custom Hooks Extraction** | Reusable logic patterns (frequency parsing, time formatting) should be extracted into hooks | MEDIUM | None | Hooks are the modern React pattern for sharing logic; easier to test than components |
| **Utility Functions** | Pure functions for duplicated logic (formatting, parsing) must live in testable utility modules | LOW | None | Easiest wins for testing - pure functions with no side effects |
| **Test Co-location** | Tests living alongside code in `__tests__/` folders or `.test.tsx` files | LOW | Jest configuration | Makes tests discoverable and maintainable |
| **Snapshot Testing** | Basic regression testing for component render output | LOW | Jest | Catches unintended UI changes; built into Jest |
| **Mock Strategies for Context** | Testing components that consume Context providers requires proper mocking | MEDIUM | RNTL | 4 context providers in app require wrapping strategies for tests |
| **Test Coverage Reporting** | Code coverage metrics to track test completeness | LOW | Jest | Built into Jest with `--coverage` flag |
| **Separation of Concerns** | Separating UI (presentation) from logic (containers/hooks) | MEDIUM | None | Fundamental to testability - logic without UI is easier to test |
| **Component Organization** | Each component in own folder with component, styles, tests | LOW | None | Standard React Native project structure pattern |

### Differentiators (Advanced Testing/Refactoring Practices)

Features that distinguish well-architected, maintainable RN apps from basic implementations.

| Feature | Value Proposition | Complexity | Dependencies | Notes |
|---------|-------------------|------------|--------------|-------|
| **Test-Driven Refactoring (Red-Green-Refactor)** | Write tests for existing code before refactoring to create safety net | HIGH | Strong Jest/RNTL knowledge | Not pure TDD, but applying TDD cycle to legacy code refactoring |
| **Custom Testing Utilities** | Reusable test wrappers that include all Context providers | MEDIUM | Custom render function | Reduces boilerplate when testing components that need multiple providers |
| **Integration Testing** | Testing component interactions and data flow between components | MEDIUM | RNTL queries | Goes beyond unit testing to verify components work together |
| **Coverage Thresholds (80%+)** | Enforced minimum coverage levels in CI/CD | LOW | Jest config | Industry standard is 80% for statements, branches, functions, lines |
| **E2E Testing Infrastructure** | Full user flow testing with Maestro or Detox | HIGH | Maestro (simpler) or Detox | Maestro preferred for new implementations - simpler YAML-based setup |
| **Visual Regression Testing** | Screenshot-based testing to catch visual changes | MEDIUM | Detox screenshots or dedicated tool | More advanced than snapshot testing; pixel-by-pixel comparison |
| **Compound Component Pattern** | Advanced pattern for complex components with sub-components | HIGH | Deep React knowledge | Useful for habit builder and complex modal structures |
| **Presentational/Container Pattern** | Separating smart (logic) from dumb (UI) components | MEDIUM | None | Classic pattern, though less rigid with hooks; still valuable for large components |
| **Test Organization by Type** | Separate folders for unit, integration, e2e tests | LOW | Test runner config | Helps teams understand test pyramid and run specific test suites |
| **Storybook Integration** | Component development and documentation environment | MEDIUM | Storybook for React Native | Not strictly testing, but aids component isolation and visual QA |
| **Performance Testing** | Measuring render performance and detecting regressions | HIGH | React DevTools Profiler, custom tooling | Advanced practice for apps with performance concerns |
| **Accessibility Testing** | Automated a11y checks in test suite | MEDIUM | jest-native matchers | Tests for proper accessibility labels, roles |

### Anti-Features (Things to Deliberately NOT Do)

Common practices that seem good but create problems during refactoring and testing.

| Anti-Feature | Why Requested | Why Problematic | Alternative |
|--------------|---------------|-----------------|-------------|
| **100% Test Coverage Goal** | Seems like a quality metric | Creates busywork testing trivial render-only components; diminishing returns | Focus on 80% coverage emphasizing business logic, complex components, and critical paths |
| **Premature Component Extraction** | "Every component should be tiny" mindset | Creates excessive abstraction for one-off UI; harder to follow code flow | Extract when reused 2+ times OR when component exceeds 250-300 lines |
| **Over-mocking in Tests** | Makes tests easier to write initially | Tests become brittle, test implementation not behavior, lose confidence | Use real objects when possible; mock only external dependencies (API, native modules) |
| **Testing Implementation Details** | Want thorough coverage | Tests break with every refactor; couple tests to code structure | Test user behavior and outcomes, not internal state or function calls |
| **Extract Everything to Hooks** | Hooks are modern and reusable | Creates indirection; hooks with no reuse add complexity | Extract hooks only when logic is reused OR when separating concerns aids testing |
| **Snapshot Testing Everything** | Easy to add, seems comprehensive | Snapshots become noise; devs blindly update them; don't catch logic bugs | Use snapshots selectively for stable components; prefer explicit assertions |
| **Big Refactor Before Tests** | "Let's clean up first, then test" | No safety net; risk breaking working code | Write tests FIRST for existing behavior, THEN refactor (test-driven refactoring) |
| **Mixing Test Types** | Convenience - all tests together | Slow test runs; unclear test pyramid; hard to run subsets | Separate unit (fast, many), integration (moderate), E2E (slow, few) |
| **Class Component Refactoring** | Modernize to hooks | In React Native, not necessary if working; time better spent on testing | Keep class components if stable; focus refactoring on extracting logic and reducing size |
| **Detox for First E2E Tests** | Popular in RN community | Complex setup, flaky, steep learning curve | Start with Maestro - simpler YAML syntax, no app modifications needed |

## Feature Dependencies

```
Test Infrastructure Setup
    └──enables──> Unit Testing of Utilities
    └──enables──> Unit Testing of Hooks
    └──enables──> Component Testing

Component Extraction
    └──requires──> Test Infrastructure (safety net)
    └──enables──> Unit Testing per Component

Custom Hooks Extraction
    └──requires──> Test Infrastructure
    └──enables──> Hook Testing (easier than component testing)

Utility Functions Extraction
    └──requires──> Test Infrastructure
    └──enables──> Pure Function Testing (easiest tests)

Mock Strategies
    └──requires──> Test Infrastructure
    └──requires──> Context Understanding
    └──enables──> Component Testing with Context

Test-Driven Refactoring
    └──requires──> Test Infrastructure
    └──requires──> Snapshot or Unit Tests for existing behavior
    └──enables──> Safe Refactoring

Integration Testing
    └──requires──> Unit Test Infrastructure
    └──requires──> Multiple Components Extracted

E2E Testing
    └──requires──> Stable UI Components
    └──requires──> Core User Flows Defined
    └──conflicts──> Active Refactoring (E2E tests brittle during UI changes)

Coverage Thresholds
    └──requires──> Meaningful Test Suite
    └──enables──> Quality Gates
```

### Dependency Notes

- **Test Infrastructure First:** Cannot safely refactor without tests as safety net
- **Extract Utilities Before Hooks:** Utilities are pure functions (easier to test) and often used by hooks
- **Extract Hooks Before Components:** Hooks centralize logic that multiple components share
- **Component Extraction Last:** Once utilities and hooks exist, components become thin presentation layers
- **E2E Testing Deferred:** Wait until refactoring stabilizes; E2E tests are expensive and brittle during change

## Refactoring Sequence Recommendation

Based on complexity and dependencies, recommended order for Tiny Wins app:

### Phase 1: Foundation (Weeks 1-2)
- [ ] **Test Infrastructure Setup** — Jest + RNTL + jest-native configuration
- [ ] **Utility Function Extraction** — Extract and test frequency parsing, time formatting (duplicated logic)
- [ ] **Coverage Reporting** — Configure Jest coverage thresholds (70% initial target)

**Why First:** Zero tests today. Need safety net before touching large components. Utilities are lowest-hanging fruit - pure functions, easy to test.

### Phase 2: Logic Extraction (Weeks 3-4)
- [ ] **Custom Hooks Extraction** — Extract state management, side effects from large components
- [ ] **Mock Strategies** — Create custom render helpers wrapping all 4 Context providers
- [ ] **Hook Testing** — Test extracted hooks in isolation

**Why Second:** With utilities tested, extract business logic into hooks. Hooks are easier to test than components and centralize logic.

### Phase 3: Component Refactoring (Weeks 5-7)
- [ ] **Component Extraction** — Break index.tsx (1634 lines), guided-builder.tsx (1106 lines) into smaller components
- [ ] **Presentational/Container Split** — Separate smart (logic) from dumb (UI) components where beneficial
- [ ] **Component Testing** — Test extracted components with RNTL
- [ ] **Snapshot Testing** — Add snapshot tests for presentational components

**Why Third:** With logic in tested utilities/hooks, components become thin presentation. Easier to extract and test.

### Phase 4: Quality Gates (Week 8)
- [ ] **Coverage Thresholds** — Raise to 80% for statements, branches, functions, lines
- [ ] **Test Organization** — Organize by type if needed (unit vs integration)
- [ ] **Integration Tests** — Test key user flows through multiple components

**Why Fourth:** Once unit testing is comprehensive, add quality gates and higher-level tests.

### Phase 5: Advanced Testing (Post-Refactor, Optional)
- [ ] **E2E Testing with Maestro** — Test critical user flows end-to-end
- [ ] **Visual Regression** — Screenshot testing for key screens
- [ ] **Accessibility Testing** — Automated a11y checks

**Why Last:** These are differentiators, not table stakes. Add after core refactoring complete and app stable.

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Risk if Skipped | Priority |
|---------|------------|---------------------|-----------------|----------|
| Test Infrastructure Setup | N/A (internal) | LOW | HIGH - No safety net for refactor | P1 |
| Utility Function Extraction | N/A (internal) | LOW | MEDIUM - Continued duplication | P1 |
| Custom Hooks Extraction | N/A (internal) | MEDIUM | HIGH - Logic stays tangled in UI | P1 |
| Component Extraction | N/A (internal) | HIGH | HIGH - Components stay untestable | P1 |
| Mock Strategies for Context | N/A (internal) | MEDIUM | HIGH - Can't test context consumers | P1 |
| Component Testing | N/A (internal) | MEDIUM | HIGH - No regression safety | P1 |
| Coverage Thresholds (80%) | N/A (internal) | LOW | MEDIUM - Quality not enforced | P2 |
| Integration Testing | N/A (internal) | MEDIUM | MEDIUM - Miss interaction bugs | P2 |
| E2E Testing Infrastructure | N/A (internal) | HIGH | LOW - Unit tests catch most bugs | P3 |
| Visual Regression Testing | N/A (internal) | MEDIUM | LOW - Manual testing covers this | P3 |
| Storybook Integration | N/A (internal) | MEDIUM | LOW - Nice for component library | P3 |
| Accessibility Testing | HIGH (user-facing) | MEDIUM | MEDIUM - Excludes users | P2 |

**Priority key:**
- P1: Must have for this milestone - core refactoring and test coverage
- P2: Should have - quality improvements and comprehensive testing
- P3: Nice to have - advanced practices for future iterations

## Complexity Assessment

### Low Complexity (1-2 days each)
- Test infrastructure setup (Jest + RNTL already work with Expo)
- Test co-location (organizational)
- Snapshot testing (built into Jest)
- Coverage reporting (Jest `--coverage`)
- Utility function extraction (pure functions, no dependencies)
- Coverage thresholds configuration (Jest config)

### Medium Complexity (3-5 days each)
- Custom hooks extraction (identify patterns, extract, test)
- Mock strategies for context (understand context usage, create test utils)
- Component testing (learning RNTL queries, writing meaningful tests)
- Component extraction (identify boundaries, extract)
- Presentational/container pattern (architectural decision, refactor)
- Custom testing utilities (reusable test helpers)
- Integration testing (coordinating multiple components)

### High Complexity (1-2 weeks each)
- Test-driven refactoring of large components (write tests for existing behavior, refactor incrementally)
- Component extraction from 1000+ line files (complex dependencies, many states)
- E2E testing infrastructure (setup Maestro/Detox, write flows)
- Compound component pattern (advanced React pattern)
- Performance testing (tooling, metrics, analysis)

## Testing Anti-Patterns to Avoid

Based on research, here are common mistakes when adding tests to existing RN apps:

1. **Testing Implementation, Not Behavior**
   - Bad: `expect(component.state.count).toBe(5)`
   - Good: `expect(screen.getByText('Count: 5')).toBeTruthy()`

2. **Over-Mocking**
   - Bad: Mock Context, navigation, all hooks
   - Good: Use real Context providers, mock only external APIs

3. **Snapshot Testing Everything**
   - Bad: Snapshot test every component
   - Good: Selective snapshots for stable presentational components + explicit assertions

4. **Big-Bang Refactor**
   - Bad: Rewrite index.tsx from scratch
   - Good: Incremental extraction with tests as safety net

5. **Treating Tests as Second-Class Code**
   - Bad: Commented code, unused helpers, no organization
   - Good: Clean test code with clear naming and structure

6. **Testing Multiple Concerns**
   - Bad: One test verifying rendering, state, side effects, navigation
   - Good: Short, focused tests - one concern per test

7. **Brittle Selectors**
   - Bad: `getByTestId('view-123')` everywhere
   - Good: `getByRole`, `getByLabelText`, `getByText` (user-facing queries)

## Standard Test Types for React Native

### Unit Tests (Many, Fast)
- **What:** Test individual functions, hooks, components in isolation
- **Tools:** Jest + RNTL
- **Coverage:** Utilities, hooks, simple components
- **Speed:** Milliseconds per test
- **When to Run:** On every save (watch mode), before commit

### Integration Tests (Some, Moderate)
- **What:** Test multiple components working together
- **Tools:** Jest + RNTL
- **Coverage:** User flows spanning multiple components
- **Speed:** Seconds per test
- **When to Run:** Before commit, in CI

### E2E Tests (Few, Slow)
- **What:** Test complete user journeys on real/simulated device
- **Tools:** Maestro (recommended) or Detox
- **Coverage:** Critical paths (onboarding, habit CRUD, weekly review)
- **Speed:** Minutes per test
- **When to Run:** Before release, in CI on key branches

### Snapshot Tests (Selective)
- **What:** Text serialization of component render output
- **Tools:** Jest (built-in)
- **Coverage:** Stable presentational components
- **Speed:** Milliseconds per test
- **When to Run:** With unit tests

## Coverage Thresholds: Industry Standards

Based on research, standard thresholds for production React Native apps:

| Metric | Minimum (Initial) | Target (Mature) | Notes |
|--------|-------------------|-----------------|-------|
| **Statements** | 70% | 80% | Percentage of code statements executed |
| **Branches** | 70% | 80% | Percentage of if/else branches taken |
| **Functions** | 70% | 80% | Percentage of functions called |
| **Lines** | 70% | 80% | Percentage of lines executed |

**Important:** High coverage ≠ high quality. Focus coverage on:
- Business logic (habit creation, streak calculation)
- Complex components (guided builder, edit habit)
- Critical paths (onboarding, data persistence)

**Don't obsess over:**
- Simple presentational components (just UI rendering)
- Configuration files
- Type definitions

## Tooling Stack Recommendation

| Category | Tool | Why | Confidence |
|----------|------|-----|------------|
| **Test Runner** | Jest | Built into React Native, widely adopted, excellent DX | HIGH |
| **Component Testing** | React Native Testing Library | De-facto standard, encourages good practices | HIGH |
| **Test Matchers** | jest-native | Custom matchers for RN (toBeVisible, toBeDisabled, etc.) | HIGH |
| **Coverage** | Jest (built-in) | No additional setup needed | HIGH |
| **E2E Testing** | Maestro | Simpler than Detox, YAML syntax, no app changes | MEDIUM |
| **Mocking** | Jest (built-in) | Manual mocks for complex modules | HIGH |
| **Snapshot Testing** | Jest (built-in) | Included with Jest | HIGH |

**Alternative Considered:**
- **Detox** for E2E: More established but complex setup, flaky, requires app modifications. Maestro is simpler for new E2E setup.

## Sources

### Official Documentation
- [Unit testing with Jest - Expo Documentation](https://docs.expo.dev/develop/unit-testing/)
- [Testing React Native Apps · Jest](https://jestjs.io/docs/tutorial-react-native)
- [Testing · React Native](https://reactnative.dev/docs/testing-overview)
- [React Native Testing Library - GitHub](https://github.com/callstack/react-native-testing-library)
- [jest-native - GitHub](https://github.com/testing-library/jest-native)

### Best Practices & Patterns
- [How to Structure Large-Scale React Native Applications for Maintainability](https://oneuptime.com/blog/post/2026-01-15-structure-react-native-applications/view)
- [Refactoring in React Native - Medium](https://medium.com/@dhafinraditya35/refactoring-in-react-native-dd58ed354e7a)
- [Common Sense Refactoring of a Messy React Component](https://alexkondov.com/refactoring-a-messy-react-component/)
- [33 React JS Best Practices For 2026](https://technostacks.com/blog/react-best-practices/)
- [25 React Native Best Practices for High Performance Apps 2026](https://www.esparkinfo.com/blog/react-native-best-practices)

### Testing Infrastructure & Strategy
- [Testing in 2026: Jest, React Testing Library, and Full Stack Testing Strategies](https://www.nucamp.co/blog/testing-in-2026-jest-react-testing-library-and-full-stack-testing-strategies)
- [How to Unit Test React Native Components with Jest](https://oneuptime.com/blog/post/2026-01-15-react-native-jest-testing/view)
- [From Unit to E2E: A Guide to Testing React Native TV in 2026](https://www.callstack.com/blog/testing-react-native-tv-apps)
- [React Native — Testing (Ultimate Guide) - Medium](https://medium.com/@anisurrahmanbup/react-native-testing-ultimate-guide-219a5e7ea5dc)

### Custom Hooks & Logic Extraction
- [How to refactor React components to use Hooks - LogRocket Blog](https://blog.logrocket.com/refactor-react-components-hooks/)
- [Refactoring components in React with custom hooks - CodeScene](https://codescene.com/blog/refactoring-components-in-react-with-custom-hooks)
- [Reusing Logic with Custom Hooks – React](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [Extract React Hook Refactoring](https://blog.rstankov.com/extract-react-hook-refactoring/)
- [Mastering Custom Hooks in React Native - Medium](https://sugandsingh5566.medium.com/mastering-custom-hooks-in-react-native-a-comprehensive-guide-d74c23ef89e8)

### E2E Testing
- [How to Set Up End-to-End Testing for React Native with Maestro](https://oneuptime.com/blog/post/2026-01-15-react-native-maestro-testing/view)
- [Run E2E tests on EAS Workflows and Maestro - Expo Documentation](https://docs.expo.dev/eas/workflows/examples/e2e-tests/)
- [Detox - Official Site](https://wix.github.io/Detox/)
- [End-to-end Testing Mobile Apps with Maestro](https://hybridheroes.de/blog/end-to-end-testing-maestro/)

### Snapshot & Visual Testing
- [Snapshot Testing · Jest](https://jestjs.io/docs/snapshot-testing)
- [How To: Snapshot Testing in React Native with Jest](https://blog.openreplay.com/how-to--snapshot-testing-in-react-native-with-jest/)
- [Visual regression testing React Native apps with Detox and Jest](https://hughmccamphill.com/visual-regression-testing-react-native-apps-with-detox-and-jest)
- [Setting up visual regression testing with React Native Owl - LogRocket Blog](https://blog.logrocket.com/visual-regression-testing-with-react-native-owl/)

### Context Provider Testing
- [Mocking Context with React Testing Library](https://polvara.me/posts/mocking-context-with-react-testing-library/)
- [React Context | Testing Library](https://testing-library.com/docs/example-react-context/)
- [Mocking Context In React Native Testing - Medium](https://doanan3736.medium.com/mocking-context-in-react-native-testing-360cbb35285d)
- [Testing React Context Providers using RNTL - Medium](https://medium.com/seer-medical/testing-react-context-providers-using-react-native-testing-library-7f6823c2d43a)

### Test Organization & Coverage
- [Best Practices for Unit Testing in React and Folder Structure - Medium](https://medium.com/@umerfarooq.dev/best-practices-for-unit-testing-in-react-and-folder-structure-5ca769256546)
- [React Test Coverage | Compile N Run](https://www.compilenrun.com/docs/framework/react/react-testing/react-test-coverage/)
- [Comparing React Native code coverage and testing tools - LogRocket Blog](https://blog.logrocket.com/comparing-react-native-code-coverage-and-testing-tools/)

### Testing Anti-Patterns
- [Unveiling 6 Anti-Patterns in React Test Code: Pitfalls to Avoid - ITNEXT](https://itnext.io/unveiling-6-anti-patterns-in-react-test-code-pitfalls-to-avoid-fd7e5a3a7360)
- [Common mistakes with React Testing Library - Kent C. Dodds](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Advanced testing in React Native with Jest: Mocking - everyday.codes](https://everyday.codes/react-native/advanced-testing-in-react-native-with-jest-mocking/)

### TDD & Refactoring
- [TDD in React: Get to Red-Green-Refactor in No Time](https://www.testim.io/blog/tdd-react/)
- [Understanding the TDD Cycle: Red-Green-Refactor - Medium](https://medium.com/@lelianto.eko/understanding-the-tdd-cycle-red-green-refactor-c449db8cc5de)
- [Building a React Native Project with Test-Driven Development - Medium](https://javascript.plainenglish.io/building-a-react-native-project-with-test-driven-development-1cc9353aea43)
- [Mastering TDD in React: A Guide to Test-Driven Development](https://trio.dev/mastering-tdd-in-react/)

### Presentational/Container Pattern
- [Presentational and Container Components - Dan Abramov](https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0)
- [Container/Presentational Pattern](https://www.patterns.dev/vue/container-presentational/)
- [Container-presentational pattern in React – why and how to use](https://tsh.io/blog/container-presentational-pattern-react)

### Component Extraction
- [How Many Lines of Code Until I Need to Refactor a React Component? - Medium](https://medium.com/geekculture/how-many-lines-of-code-until-i-need-to-refactor-a-react-component-c1b8d16f5a5b)
- [6 Steps to Effectively Extract React Component - LinkedIn](https://www.linkedin.com/pulse/6-steps-effectively-extract-react-component-dawid-sibi%C5%84ski)

---
*Feature research for: Tiny Wins React Native App Refactoring & Testing*
*Researched: 2026-02-16*
