# Tiny Wins

## What This Is

A habit tracking mobile app built with Expo/React Native, designed around the principles from Atomic Habits — identity-based habit building, implementation intentions, habit stacking, and the four laws of behavior change. Users track daily habits, log evidence of progress, and do weekly reviews. Currently local-first with AsyncStorage persistence.

## Core Value

Users can reliably track their daily habits and see their progress — the core tracking loop (complete habit → see streak → feel momentum) must always work.

## Requirements

### Validated

- ✓ Onboarding flow with identity selection and four laws education — existing
- ✓ Habit CRUD (create, edit, delete) with icons, colors, gradients — existing
- ✓ Daily habit completion with streak tracking and weekly data — existing
- ✓ Evidence logging with notes, images, and reflections — existing
- ✓ Habit stacking (anchor habits to existing routines) — existing
- ✓ Implementation intentions (behaviour + time + location) — existing
- ✓ Habit versions (two-min, standard, stretch) — existing
- ✓ Weekly review with what worked/didn't, law analysis, ratings — existing
- ✓ Dark/light theme with week start day preference — existing
- ✓ Premium tier stub with feature gating (10 habit free limit) — existing
- ✓ Dashboard, Today, Evidence, Review, Settings tabs — existing
- ✓ Guided habit builder with step-by-step flow — existing
- ✓ File-based routing with Expo Router — existing
- ✓ Express server with static build serving — existing

### Active

- [ ] Refactor Today tab — break 1634-line index.tsx into focused components
- [ ] Refactor guided builder — break 1106-line guided-builder.tsx into manageable pieces
- [ ] Refactor edit habit — break 967-line edit-habit.tsx into focused components
- [ ] Set up Jest test framework with React Native Testing Library
- [ ] Unit tests for context logic (habits, streaks, logs, identity, theme, premium)
- [ ] Unit tests for shared utilities (time formatting, frequency parsing, ID generation)
- [ ] Integration tests for context + AsyncStorage persistence
- [ ] Component rendering and interaction tests
- [ ] Set up Maestro for E2E testing
- [ ] E2E tests for core user flows (onboarding, habit creation, daily completion, review)

### Out of Scope

- Backend API implementation — refactor/test first, features later
- Cloud sync / multi-device — needs stable codebase first
- New features (notifications, analytics, social) — after test coverage exists
- Performance optimization — address after refactoring reveals actual bottlenecks

## Context

- Expo 54 / React Native 0.81 / React 19 / TypeScript 5.9
- Local-first: all data in AsyncStorage, no backend sync yet
- 4 context providers manage global state (Theme, Habits, Identity, Premium)
- Largest files: `app/(tabs)/index.tsx` (1634 lines), `app/guided-builder.tsx` (1106 lines), `app/edit-habit.tsx` (967 lines)
- Duplicated logic: frequency parsing in guided-builder and edit-habit, time formatting in multiple files
- Zero test files currently exist
- Codebase map available at `.planning/codebase/`

## Constraints

- **Tech stack**: Must stay on Expo managed workflow — no ejecting
- **No regressions**: Refactoring must not change user-facing behavior
- **Test framework**: Jest + React Native Testing Library for unit/integration, Maestro for E2E
- **Incremental**: Refactor and test in lockstep — don't refactor everything then test everything

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Jest + RNTL for unit/integration | Standard for React Native, good Expo support, large ecosystem | — Pending |
| Maestro for E2E | Simpler than Detox for Expo managed workflow, YAML-based, no native build required | — Pending |
| Refactor before full test coverage | Easier to test small focused components than 1600-line monoliths | — Pending |
| Today tab first | Most painful file, most used screen, highest value refactor | — Pending |

---
*Last updated: 2026-02-16 after initialization*
