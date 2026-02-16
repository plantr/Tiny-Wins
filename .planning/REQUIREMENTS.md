# Requirements: Tiny Wins Refactoring & Testing

**Defined:** 2026-02-16
**Core Value:** Users can reliably track their daily habits and see their progress — the core tracking loop (complete habit → see streak → feel momentum) must always work.

## v1 Requirements

Requirements for this milestone. Each maps to roadmap phases.

### Test Infrastructure

- [ ] **TINF-01**: Jest 30 + jest-expo configured with working test runner
- [ ] **TINF-02**: @testing-library/react-native installed with custom matchers
- [ ] **TINF-03**: Custom render wrapper (`lib/test-utils.tsx`) wrapping all 4 context providers
- [ ] **TINF-04**: AsyncStorage mock configured globally (clear in afterEach)
- [ ] **TINF-05**: Co-located test file pattern (.test.tsx) configured in Jest
- [ ] **TINF-06**: Coverage reporting enabled with 70% initial threshold
- [ ] **TINF-07**: Smoke test proving infrastructure works end-to-end

### Utility Extraction

- [ ] **UTIL-01**: Time formatting functions extracted to shared utility module with tests
- [ ] **UTIL-02**: Frequency parsing logic deduplicated from guided-builder and edit-habit into shared module with tests
- [ ] **UTIL-03**: Date helper functions (getTodayStr, week calculations) extracted with tests
- [ ] **UTIL-04**: ID generation logic extracted to utility with tests
- [ ] **UTIL-05**: Custom hooks extracted for reusable logic shared across screens

### Component Extraction — Today Tab

- [ ] **COMP-01**: DaySelector extracted as presentational component with tests
- [ ] **COMP-02**: ProgressRing extracted as presentational component with tests
- [ ] **COMP-03**: TodayWidget extracted as feature component with tests
- [ ] **COMP-04**: IdentityBadge extracted as feature component with tests
- [ ] **COMP-05**: HabitGridCard extracted as feature component with tests
- [ ] **COMP-06**: HabitStackView extracted as feature component with tests
- [ ] **COMP-07**: EvidenceModal extracted as modal component with tests
- [ ] **COMP-08**: RemindersModal extracted as modal component with tests
- [ ] **COMP-09**: AddHabitChoiceModal extracted as modal component with tests
- [ ] **COMP-10**: ConfirmationModal extracted as reusable modal with tests
- [ ] **COMP-11**: Today screen (index.tsx) reduced to <300 lines orchestrator

### Component Extraction — Other Screens

- [ ] **COMP-12**: Guided builder (guided-builder.tsx) broken into focused components with tests
- [ ] **COMP-13**: Edit habit (edit-habit.tsx) broken into focused components with tests

### Integration Testing

- [ ] **INTG-01**: Context provider tests — HabitsProvider CRUD operations with AsyncStorage
- [ ] **INTG-02**: Context provider tests — ThemeProvider persistence and switching
- [ ] **INTG-03**: Context provider tests — IdentityProvider state management
- [ ] **INTG-04**: Context provider tests — PremiumProvider feature gating
- [ ] **INTG-05**: Multi-component flow tests for habit completion workflow
- [ ] **INTG-06**: Coverage threshold raised to 80% and enforced

### E2E Testing

- [ ] **E2E-01**: Maestro CLI installed and configured for Expo managed workflow
- [ ] **E2E-02**: E2E flow — onboarding journey (new user through identity selection)
- [ ] **E2E-03**: E2E flow — habit creation (guided builder end-to-end)
- [ ] **E2E-04**: E2E flow — daily habit completion with streak update
- [ ] **E2E-05**: E2E flow — weekly review submission

## v2 Requirements

Deferred to future milestone. Tracked but not in current roadmap.

### Quality & CI

- **QCI-01**: CI pipeline running tests on every push
- **QCI-02**: Visual regression testing for component library
- **QCI-03**: Storybook integration for component documentation
- **QCI-04**: Performance profiling and benchmarks

### Additional Refactoring

- **REFR-01**: Dashboard tab component extraction
- **REFR-02**: Evidence tab component extraction
- **REFR-03**: Review tab component extraction
- **REFR-04**: Settings tab component extraction
- **REFR-05**: Onboarding flow component extraction

## Out of Scope

| Feature | Reason |
|---------|--------|
| Backend API implementation | Refactor/test first, features later |
| Cloud sync / multi-device | Needs stable codebase first |
| New features (notifications, analytics, social) | After test coverage exists |
| Performance optimization | Address after refactoring reveals actual bottlenecks |
| Ejecting from Expo managed workflow | Constraint — must stay managed |
| Detox E2E framework | Requires ejecting, Maestro works with managed workflow |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| TINF-01 | Phase 1 | Pending |
| TINF-02 | Phase 1 | Pending |
| TINF-03 | Phase 1 | Pending |
| TINF-04 | Phase 1 | Pending |
| TINF-05 | Phase 1 | Pending |
| TINF-06 | Phase 1 | Pending |
| TINF-07 | Phase 1 | Pending |
| UTIL-01 | Phase 2 | Pending |
| UTIL-02 | Phase 2 | Pending |
| UTIL-03 | Phase 2 | Pending |
| UTIL-04 | Phase 2 | Pending |
| UTIL-05 | Phase 3 | Pending (deferred from Phase 2 per research: hook extraction deferred until component patterns clarify reuse) |
| COMP-01 | Phase 3 | Pending |
| COMP-02 | Phase 3 | Pending |
| COMP-03 | Phase 3 | Pending |
| COMP-04 | Phase 3 | Pending |
| COMP-05 | Phase 3 | Pending |
| COMP-06 | Phase 3 | Pending |
| COMP-07 | Phase 3 | Pending |
| COMP-08 | Phase 3 | Pending |
| COMP-09 | Phase 3 | Pending |
| COMP-10 | Phase 3 | Pending |
| COMP-11 | Phase 3 | Pending |
| COMP-12 | Phase 3 | Pending |
| COMP-13 | Phase 3 | Pending |
| INTG-01 | Phase 4 | Pending |
| INTG-02 | Phase 4 | Pending |
| INTG-03 | Phase 4 | Pending |
| INTG-04 | Phase 4 | Pending |
| INTG-05 | Phase 4 | Pending |
| INTG-06 | Phase 4 | Pending |
| E2E-01 | Phase 5 | Pending |
| E2E-02 | Phase 5 | Pending |
| E2E-03 | Phase 5 | Pending |
| E2E-04 | Phase 5 | Pending |
| E2E-05 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 36 total
- Mapped to phases: 36
- Unmapped: 0

---
*Requirements defined: 2026-02-16*
*Last updated: 2026-02-16 after initial definition*
