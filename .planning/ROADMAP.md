# Roadmap: Tiny Wins Refactoring & Testing

## Overview

Take a habit tracking app with three monolithic screen components and zero test coverage to a well-tested, maintainable codebase. Bottom-up approach: test infrastructure first, then extract and test utilities, then extract and test components, then integration tests with quality gates, then E2E flows with Maestro. Each phase builds the safety net for the next.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [ ] **Phase 1: Test Infrastructure Setup** - Jest + RNTL configured with custom render wrapper, mocks, and smoke test
- [ ] **Phase 2: Utility & Hook Extraction** - Shared utilities and hooks extracted from monoliths with full test coverage
- [ ] **Phase 3: Component Extraction & Testing** - Today tab, guided builder, and edit habit broken into focused, tested components
- [ ] **Phase 4: Integration Tests & Quality Gates** - Context provider integration tests and coverage threshold raised to 80%
- [ ] **Phase 5: E2E Testing with Maestro** - Maestro configured with flows covering core user journeys

## Phase Details

### Phase 1: Test Infrastructure Setup
**Goal**: Developer can run `npx jest` and get a passing test suite with coverage reporting, context-aware rendering, and proper mocking
**Depends on**: Nothing (first phase)
**Requirements**: TINF-01, TINF-02, TINF-03, TINF-04, TINF-05, TINF-06, TINF-07
**Success Criteria** (what must be TRUE):
  1. Running `npx jest` executes tests and exits cleanly with coverage summary
  2. A test file using the custom render wrapper can render a component inside all 4 context providers without manual setup
  3. AsyncStorage operations in tests read/write correctly and are isolated between test cases (no bleed)
  4. Coverage report generates and enforces 70% threshold (fails CI if under)
  5. A smoke test renders a real app component, interacts with it, and asserts observable behavior
**Plans**: 3 plans

Plans:
- [ ] 01-01-PLAN.md — Jest + RNTL installation, configuration, and comprehensive native module mocks
- [ ] 01-02-PLAN.md — Custom render wrapper with all 4 context providers and Settings screen smoke test
- [ ] 01-03-PLAN.md — Gap closure: raise coverage threshold to 70% with per-path enforcement

### Phase 2: Utility & Hook Extraction
**Goal**: Duplicated logic (frequency parsing, time formatting, date helpers, ID generation) lives in shared, tested modules and screens import from them instead of inlining
**Depends on**: Phase 1
**Requirements**: UTIL-01, UTIL-02, UTIL-03, UTIL-04
**Deferred to Phase 3**: UTIL-05 (custom hooks extraction) — per research recommendation, hook extraction deferred until component patterns in Phase 3 clarify which hooks are truly reusable. CONTEXT.md grants Claude discretion on hook timing.
**Success Criteria** (what must be TRUE):
  1. Time formatting produces correct 12h/24h output for edge cases (midnight, noon, single-digit hours) verified by tests
  2. Frequency parsing in guided-builder and edit-habit both import from one shared module (no duplicated logic)
  3. Date helpers (getTodayStr, week calculations) handle week-start-day setting correctly across all days
  4. No behavior changes visible to the user after extraction (existing app works identically)
**Plans**: 3 plans

Plans:
- [ ] 02-01-PLAN.md — Extract formatTime, getTodayStr, and getWeekStartDate to lib/utils/ with TDD tests
- [ ] 02-02-PLAN.md — Extract buildCustomFrequency and parseCustomFrequency to lib/utils/ with TDD tests, deduplicate across 3 screens
- [ ] 02-03-PLAN.md — Extract generateId to lib/utils/, clean up commented-out code, raise coverage floor

### Phase 3: Component Extraction & Testing
**Goal**: Monolithic screens (index.tsx 1634 lines, guided-builder.tsx 1106 lines, edit-habit.tsx 967 lines) are decomposed into focused components under 300 lines each, all individually tested
**Depends on**: Phase 2
**Requirements**: COMP-01, COMP-02, COMP-03, COMP-04, COMP-05, COMP-06, COMP-07, COMP-08, COMP-09, COMP-10, COMP-11, COMP-12, COMP-13, UTIL-05
**Success Criteria** (what must be TRUE):
  1. Today screen index.tsx is under 300 lines and imports DaySelector, ProgressRing, TodayWidget, IdentityBadge, HabitGridCard, HabitStackView, and all modals as separate files
  2. Each extracted component has a co-located .test.tsx file that tests rendering and key interactions
  3. Guided builder is split into focused step components that each handle one builder step
  4. Edit habit screen imports shared frequency/time components rather than defining its own
  5. App launches and all user flows (habit creation, completion, evidence logging, review) work identically to before extraction
**Plans**: 6 plans

Plans:
- [ ] 03-01-PLAN.md — Extract shared constants + guided-builder step components + reduce to orchestrator
- [ ] 03-02-PLAN.md — Extract index.tsx presentational + feature components (TodayWidget, IdentityBadge, DaySelector, HabitGridCard, HabitStackView) with tests
- [ ] 03-03-PLAN.md — Write tests for guided-builder step components + orchestrator integration test
- [ ] 03-04-PLAN.md — Extract index.tsx modals (EvidenceModal, AddHabitChoiceModal, RemindersModal, ConfirmationModal) + reduce to orchestrator
- [ ] 03-05-PLAN.md — Extract edit-habit form components + reduce to orchestrator + tests
- [ ] 03-06-PLAN.md — Extract useFormFocus hook + update coverage thresholds + final verification

### Phase 4: Integration Tests & Quality Gates
**Goal**: Context providers are tested with AsyncStorage persistence, multi-component workflows are verified, and coverage threshold is raised to 80%
**Depends on**: Phase 3
**Requirements**: INTG-01, INTG-02, INTG-03, INTG-04, INTG-05, INTG-06
**Success Criteria** (what must be TRUE):
  1. HabitsProvider tests verify full CRUD cycle (create, read, update, delete) with data persisting to and loading from AsyncStorage
  2. ThemeProvider tests verify dark/light mode switching persists across simulated app restarts
  3. Integration test exercises habit completion workflow end-to-end: complete habit -> streak increments -> evidence modal appears -> log persists
  4. PremiumProvider tests verify the 10-habit free tier limit blocks creation correctly
  5. Coverage threshold is 80% and `npx jest` fails if any file drops below it
**Plans**: TBD

Plans:
- [ ] 04-01: TBD
- [ ] 04-02: TBD

### Phase 5: E2E Testing with Maestro
**Goal**: Critical user journeys are verified end-to-end on a running app via Maestro flows
**Depends on**: Phase 4
**Requirements**: E2E-01, E2E-02, E2E-03, E2E-04, E2E-05
**Success Criteria** (what must be TRUE):
  1. Running `maestro test` executes all flows against a running Expo dev build and reports pass/fail
  2. Onboarding flow completes from fresh app state through identity selection to main tabs
  3. Habit creation flow navigates the guided builder from start to a saved habit appearing on Today screen
  4. Daily completion flow taps a habit checkbox and verifies streak count updates on screen
  5. Weekly review flow submits a review with ratings and confirms it saves
**Plans**: TBD

Plans:
- [ ] 05-01: TBD
- [ ] 05-02: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Test Infrastructure Setup | 3/3 | Complete | 2026-02-16 |
| 2. Utility & Hook Extraction | 0/3 | Planned | - |
| 3. Component Extraction & Testing | 0/6 | Planned | - |
| 4. Integration Tests & Quality Gates | 0/TBD | Not started | - |
| 5. E2E Testing with Maestro | 0/TBD | Not started | - |

---
*Roadmap created: 2026-02-16*
*Last updated: 2026-02-16*
