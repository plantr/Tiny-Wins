# Project Research Summary

**Project:** Tiny Wins Habit Tracker - Testing and Refactoring Infrastructure
**Domain:** React Native / Expo App Refactoring and Test Coverage
**Researched:** 2026-02-16
**Confidence:** HIGH

## Executive Summary

Tiny Wins is an Expo 54 habit tracking app with three monolithic screen components (1634, 1106, and 967 lines) and zero existing test coverage. All four research streams converge on the same conclusion: the project needs a bottom-up, test-first refactoring approach using Jest 30 + React Native Testing Library as the core testing stack, with Maestro for E2E flows deferred until after refactoring stabilizes. The stack is mature, well-documented, and officially supported by both Expo and React Native -- there are no risky technology bets here.

The recommended approach is incremental extraction guided by the testing pyramid (70% unit, 20% integration, 10% E2E). Extract utility functions first (pure, easy to test), then custom hooks (logic separation), then components (now thin presentation layers). Each extraction gets tests immediately, creating a growing safety net. The app's 4 context providers (Theme, Habits, Identity, Premium) require a custom render wrapper created on day one to avoid test boilerplate explosion across the codebase.

The primary risks are: (1) refactoring without tests first, which all research documents flag as the single most dangerous anti-pattern for this project, (2) React Compiler and New Architecture interactions with test tooling that could cause flaky tests if not accounted for from the start, and (3) over-extraction of custom hooks that creates abstraction without reuse. These are all preventable with the conventions established in Phase 1.

## Key Findings

### Recommended Stack

The testing stack is standardized and uncontroversial. Every source agrees on the core tools.

**Core technologies:**
- **Jest 30.2.0 + jest-expo 54.0.17:** Test runner with Expo preset -- handles native module mocking, transforms, and multi-platform testing out of the box
- **@testing-library/react-native 13.3.3:** Component testing from the user's perspective -- official RN recommendation, works with React 19
- **@testing-library/jest-native 5.4.3:** Custom matchers (toBeVisible, toBeDisabled) that improve test readability
- **Maestro (CLI):** E2E testing via YAML flows -- designed for Expo managed workflow, unlike Detox which requires ejecting

**Explicitly avoid:** react-test-renderer (deprecated, no React 19 support), Enzyme (deprecated), Detox with Expo managed workflow (requires ejecting), Vitest (no RN support), large snapshot testing (brittle, low value).

**Refactoring tooling:** VSCode Glean extension for automated JSX extraction with prop wiring.

### Expected Features

**Must have (table stakes):**
- Jest + RNTL test infrastructure with coverage reporting
- Utility function extraction and testing (frequency parsing, time formatting)
- Custom hooks extraction for reusable logic
- Component extraction from monolithic screens
- Custom render wrapper for 4 context providers
- Co-located test files (.test.tsx next to implementation)
- 70% initial coverage threshold, rising to 80%

**Should have (differentiators):**
- Test-driven refactoring workflow (characterization tests before extraction)
- Integration tests for multi-component user flows
- Accessibility testing via accessibility-first query patterns
- Coverage thresholds enforced in CI

**Defer (v2+):**
- E2E testing with Maestro (wait for refactoring to stabilize)
- Visual regression testing
- Storybook integration
- Performance profiling

### Architecture Approach

The architecture follows a three-tier component model: Screen components (100-200 lines, orchestration only, consume context), Feature components (50-200 lines, domain-specific UI sections, accept props), and Presentational components (20-100 lines, pure UI, no context). All research documents agree on bottom-up extraction order: presentational components first, then feature components, then screen refactoring last.

**Major components to extract from index.tsx (1634 lines):**
1. **Presentational:** DaySelector, ProgressRing -- no dependencies, safest to extract
2. **Feature:** TodayWidget, IdentityBadge, HabitGridCard, HabitStackView -- consume derived data via props
3. **Modals:** EvidenceModal, RemindersModal, AddHabitChoiceModal, ConfirmationModal -- self-contained
4. **Screen:** index.tsx becomes thin orchestrator importing all above

**Key patterns:**
- Props-based interfaces for testability (even when context is available)
- Custom render wrapper in `lib/test-utils.tsx` wrapping all 4 providers
- Co-located test files, not `__tests__/` directories
- One commit per extraction for easy rollback

### Critical Pitfalls

1. **Refactoring without tests first** -- Write characterization tests for existing behavior before any extraction. Recovery cost is HIGH (may need to revert and start over).
2. **Missing custom render wrapper** -- Create `lib/test-utils.tsx` with all 4 context providers on day one. Without it, every test file duplicates provider setup, and context structure changes break dozens of files.
3. **Empty waitFor callbacks** -- Always put assertions inside waitFor. Empty callbacks create tests that pass by timing coincidence and become flaky.
4. **React Compiler breaking mock expectations** -- Do not assert render counts. Test observable behavior only. Automatic memoization changes when effects fire.
5. **Incomplete AsyncStorage mocking** -- Use the official mock or a Map-based implementation. Clear storage in afterEach globally. Silent failures mask persistence bugs.

## Implications for Roadmap

Based on combined research, five phases with clear dependency ordering:

### Phase 1: Test Infrastructure Setup
**Rationale:** Every other phase depends on this. Zero tests exist today. Cannot safely refactor without a safety net. All four research documents identify this as the mandatory first step.
**Delivers:** Working Jest + RNTL setup, custom render wrapper, AsyncStorage mock, ESLint testing rules, smoke test proving infrastructure works.
**Addresses:** Test infrastructure setup, coverage reporting, mock strategies, test co-location configuration.
**Avoids:** Pitfalls 3 (incomplete AsyncStorage mock), 4 (forgotten await), 5 (no custom render wrapper), 10 (missing Babel/Expo config).
**Effort:** 1-2 days.

### Phase 2: Utility and Hook Extraction
**Rationale:** Pure functions are the lowest-risk extraction target with the highest testing ROI. Hooks centralize business logic that is currently tangled in 1600-line components. Both must exist before component extraction makes sense.
**Delivers:** Tested utility modules (formatting, parsing, date helpers), tested custom hooks for shared logic, initial coverage baseline.
**Addresses:** Utility function extraction, custom hooks extraction, hook testing.
**Avoids:** Pitfall 7 (over-extracting hooks -- apply the 2+ uses rule).
**Effort:** 1-2 weeks.

### Phase 3: Component Extraction and Testing
**Rationale:** With utilities and hooks tested, components become thin presentation layers that are straightforward to extract and test. Bottom-up extraction order (presentational first, then feature, then modals) minimizes risk.
**Delivers:** 10+ extracted, individually tested components. Screen files reduced to 100-200 lines. Presentational/container separation.
**Addresses:** Component extraction, component testing, presentational/container split, snapshot testing (selective).
**Avoids:** Pitfall 6 (refactoring without tests -- characterization tests required before each extraction), Pitfall 2 (testing implementation details -- use accessibility queries).
**Effort:** 2-3 weeks.

### Phase 4: Integration Tests and Quality Gates
**Rationale:** With unit testing comprehensive, add higher-level tests verifying component interactions and enforce coverage thresholds. This is where the 70-to-80% coverage push happens.
**Delivers:** Integration tests for key user flows, 80% coverage thresholds enforced, CI pipeline integration.
**Addresses:** Integration testing, coverage thresholds, test organization by type, accessibility testing.
**Avoids:** Pitfall 9 (React Compiler mock issues -- verify all tests pass with compiler enabled).
**Effort:** 1-2 weeks.

### Phase 5: E2E Testing with Maestro
**Rationale:** E2E tests are expensive and brittle during active refactoring. Defer until component structure is stable. Maestro is the right choice for Expo managed workflow.
**Delivers:** Maestro flows for 3-4 critical user journeys (habit creation, completion, weekly review), CI integration for release candidates.
**Addresses:** E2E testing infrastructure, visual regression (optional).
**Avoids:** Pitfall 8 (New Architecture view flattening -- verify Maestro compatibility with New Architecture builds before writing flows).
**Effort:** 3-5 days.

### Phase Ordering Rationale

- **Infrastructure before code changes:** All research documents agree that touching monolithic components without tests is the highest-risk action in this project.
- **Bottom-up extraction:** Utilities have no dependencies. Hooks depend on utilities. Components depend on both. This ordering minimizes coupling during extraction.
- **E2E last:** FEATURES.md and PITFALLS.md both flag that E2E tests are brittle during active UI refactoring. Defer until component structure stabilizes.
- **Incremental commits:** ARCHITECTURE.md recommends one extraction per commit for easy rollback. This is a core workflow constraint, not optional.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 3 (Component Extraction):** The 1634-line index.tsx has complex internal dependencies between inline components. Needs careful dependency mapping before extraction begins. Consider `/gsd:research-phase` to analyze the actual component boundaries.
- **Phase 5 (E2E with Maestro):** New Architecture + view flattening interaction with Maestro is a known issue. Needs a compatibility spike before writing flows.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Test Infrastructure):** Fully documented in Expo and Jest official docs. Configuration is boilerplate.
- **Phase 2 (Utility/Hook Extraction):** Well-established React patterns. No novel decisions needed.
- **Phase 4 (Integration Tests):** Standard RNTL patterns documented extensively.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All tools officially recommended by Expo/RN docs, npm registry verified, version compatibility confirmed |
| Features | HIGH | Based on established React/RN testing practices with 30+ sources. Clear consensus on priorities. |
| Architecture | HIGH | Component decomposition follows standard React patterns. Specific extraction targets identified from actual codebase. |
| Pitfalls | HIGH | Sourced from official docs, Kent C. Dodds (Testing Library creator), and documented Expo/RN issues. React Compiler pitfall based on official React docs. |

**Overall confidence:** HIGH

### Gaps to Address

- **React Compiler + Jest interaction:** Documented in theory but the project's specific compiler configuration may surface edge cases. Validate during Phase 1 smoke testing.
- **New Architecture + Maestro compatibility:** Known issue documented but not yet tested against this specific app's build. Requires a spike in Phase 5.
- **Context provider ordering sensitivity:** The 4 providers may have implicit ordering dependencies. Validate correct nesting order in custom render wrapper during Phase 1.
- **Guided-builder.tsx (1106 lines) and other large files:** Research focused primarily on index.tsx (1634 lines). The extraction strategy for other large files needs analysis during Phase 3 planning.

## Contradictions

No contradictions were found between the four research documents. All four converge on the same core recommendations: test-first, bottom-up extraction, Jest + RNTL stack, Maestro deferred. The only tension is between FEATURES.md listing E2E as P3 (nice-to-have) while STACK.md includes it in its migration path -- resolved by placing E2E in Phase 5 as a post-stabilization activity.

## Sources

### Primary (HIGH confidence)
- [Expo Unit Testing with Jest](https://docs.expo.dev/develop/unit-testing/)
- [React Native Testing Overview](https://reactnative.dev/docs/testing-overview)
- [React Native Testing Library](http://oss.callstack.com/react-native-testing-library/)
- [Jest Configuration](https://jestjs.io/docs/configuration)
- [Maestro React Native Support](https://docs.maestro.dev/platform-support/react-native)
- [React Compiler](https://react.dev/learn/react-compiler)
- npm registry: jest-expo@54.0.17, @testing-library/react-native@13.3.3, Jest@30.2.0

### Secondary (MEDIUM confidence)
- [Common mistakes with React Testing Library - Kent C. Dodds](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Common Sense Refactoring of a Messy React Component](https://alexkondov.com/refactoring-a-messy-react-component/)
- [React project structure for scale](https://www.developerway.com/posts/react-project-structure)
- [VSCode Glean](https://marketplace.visualstudio.com/items?itemName=wix.glean)
- [Reusing Logic with Custom Hooks - React](https://react.dev/learn/reusing-logic-with-custom-hooks)

### Tertiary (LOW confidence)
- Community blog posts on React Native New Architecture testing implications -- patterns are evolving rapidly
- Maestro + New Architecture compatibility -- limited production reports as of February 2026

---
*Research completed: 2026-02-16*
*Ready for roadmap: yes*
