---
phase: 02-utility-hook-extraction
plan: 01
subsystem: shared-utilities
tags: [tdd, extraction, deduplication, pure-functions]
dependency-graph:
  requires: [01-03-coverage-threshold-enforcement]
  provides: [lib/utils/time.ts, lib/utils/date.ts]
  affects: [app/(tabs)/index.tsx, app/(tabs)/review.tsx, lib/habits-context.tsx]
tech-stack:
  added: [lib/utils/time.ts, lib/utils/date.ts]
  patterns: [TDD, pure functions, fake timers for deterministic date testing]
key-files:
  created:
    - lib/utils/time.ts
    - lib/utils/time.test.ts
    - lib/utils/date.ts
    - lib/utils/date.test.ts
  modified:
    - app/(tabs)/index.tsx
    - app/(tabs)/review.tsx
    - lib/habits-context.tsx
    - jest.config.js
decisions:
  - Extracted formatTime, getTodayStr, and getWeekStartDate as pure functions with comprehensive test coverage
  - Used fake timers for deterministic date testing in getTodayStr and getWeekStartDate tests
  - Parameterized getWeekStartDate with weekStartDay to support user's week-start-day setting
  - Achieved 100% coverage on both utility files by testing all branches including default parameters
  - Commented out inline code instead of deleting to maintain git history and allow easy rollback
metrics:
  duration: 8
  tasks: 3
  files: 8
  tests: 33
  commits: 3
  completed: 2026-02-16
---

# Phase 02 Plan 01: Utility Hook Extraction Summary

**One-liner:** Extracted time formatting and date helper utilities (formatTime, getTodayStr, getWeekStartDate) from monolithic screen files into shared, tested modules with 100% coverage and TDD workflow.

## What Was Built

Created a new `lib/utils/` directory with two utility modules:

1. **lib/utils/time.ts** - Time formatting utilities
   - `formatTime(time24: string)`: Converts 24-hour time to 12-hour format with AM/PM
   - Handles edge cases: midnight (00:xx -> 12:xx am), noon (12:xx -> 12:xx pm)
   - 11 test cases covering morning, afternoon, evening, midnight, noon, and minute padding

2. **lib/utils/date.ts** - Date helper utilities
   - `getTodayStr()`: Returns today's date as YYYY-MM-DD with zero-padding
   - `getWeekStartDate(weekStartDay, now?)`: Returns week start date based on configurable week start day
   - 22 test cases using fake timers for deterministic testing
   - Full coverage of all week start days, edge cases, and default parameters

## Deduplication Achieved

**getTodayStr** was duplicated in two files and is now shared:
- `app/(tabs)/index.tsx` (line 52-55) -> imports from `@/lib/utils/date`
- `lib/habits-context.tsx` (line 89-92) -> imports from `@/lib/utils/date`

**formatTime** extracted from:
- `app/(tabs)/index.tsx` (line 995-1001) -> imports from `@/lib/utils/time`

**getWeekStartDate** extracted from:
- `app/(tabs)/review.tsx` (line 26-32, previously `getWeekStart`) -> imports from `@/lib/utils/date`

All inline implementations commented out with `// EXTRACTED to @/lib/utils/...` markers.

## Test Coverage

**lib/utils/time.ts:** 100% coverage (11 tests)
- Branches: 100%
- Functions: 100%
- Lines: 100%
- Statements: 100%

**lib/utils/date.ts:** 100% coverage (22 tests)
- Branches: 100% (including default parameters and negative diff logic)
- Functions: 100%
- Lines: 100%
- Statements: 100%

**Total:** 33 passing tests, 0 failures

## TDD Workflow

All three tasks followed strict TDD:

1. **Task 1 (formatTime):**
   - RED: Created `lib/utils/time.ts` with exact inline implementation
   - RED: Wrote 11 tests for all edge cases
   - GREEN: Tests passed (extracting existing working code)
   - REFACTOR: Replaced inline code with import in `index.tsx`
   - VERIFY: Full test suite passed, 100% coverage achieved

2. **Task 2 (getTodayStr):**
   - RED: Created `lib/utils/date.ts` with exact inline implementation
   - RED: Wrote 6 tests using fake timers
   - GREEN: Tests passed
   - REFACTOR: Replaced inline code in BOTH `index.tsx` and `habits-context.tsx`
   - VERIFY: Full test suite passed, deduplication complete

3. **Task 3 (getWeekStartDate):**
   - RED: Created parameterized `getWeekStartDate` with weekStartDay parameter
   - RED: Wrote 16 tests covering all week start days and edge cases
   - GREEN: Tests passed
   - REFACTOR: Replaced inline `getWeekStart` in `review.tsx`
   - VERIFY: Full test suite passed, 100% coverage achieved

## Key Decisions

1. **Parameterized weekStartDay:** Added `weekStartDay: DayName` parameter to `getWeekStartDate` to support user's week-start-day setting (Success Criteria 3). Defaults to "Monday" to match current hardcoded behavior.

2. **Fake timers for deterministic testing:** Used `jest.useFakeTimers()` and `jest.setSystemTime()` for all date-based tests to ensure reproducible results across different test environments.

3. **Default parameter testing:** Added explicit tests for default parameters (`weekStartDay` and `now`) to achieve 100% branch coverage.

4. **Commented vs deleted code:** Preserved inline implementations as comments to maintain git history and enable easy rollback if needed.

5. **Per-path coverage thresholds:** Added 70% thresholds for both `lib/utils/time.ts` and `lib/utils/date.ts` in `jest.config.js` to enforce coverage on new utilities immediately.

## Deviations from Plan

None - plan executed exactly as written. All three utilities extracted with TDD workflow, comprehensive test coverage achieved, and deduplication completed successfully.

## Commits

| Task | Commit | Description | Files |
|------|--------|-------------|-------|
| 1 | dd2f89d | feat(02-01): extract formatTime to lib/utils/time.ts with tests | lib/utils/time.ts, lib/utils/time.test.ts, app/(tabs)/index.tsx, jest.config.js |
| 2 | f311806 | feat(02-01): extract getTodayStr to lib/utils/date.ts with tests | lib/utils/date.ts, lib/utils/date.test.ts, app/(tabs)/index.tsx, lib/habits-context.tsx, jest.config.js |
| 3 | 4a0d2b2 | feat(02-01): extract getWeekStartDate to lib/utils/date.ts with tests | lib/utils/date.ts (updated), lib/utils/date.test.ts (updated), app/(tabs)/review.tsx |

## Verification

- [x] All 33 tests pass (`npx jest lib/utils/time.test.ts lib/utils/date.test.ts`)
- [x] 100% coverage on both utility files
- [x] No duplicate function definitions remain uncommented in source files
- [x] getWeekStartDate accepts weekStartDay parameter and handles all 7 days correctly
- [x] Per-path 70% coverage thresholds enforced in jest.config.js
- [x] 3 atomic commits enable individual rollback

## Self-Check

Verifying all claimed files and commits exist:

**Files created:**
- lib/utils/time.ts: EXISTS
- lib/utils/time.test.ts: EXISTS
- lib/utils/date.ts: EXISTS
- lib/utils/date.test.ts: EXISTS

**Files modified:**
- app/(tabs)/index.tsx: EXISTS (imports added, inline code commented)
- app/(tabs)/review.tsx: EXISTS (import added, inline code commented)
- lib/habits-context.tsx: EXISTS (import added, inline code commented)
- jest.config.js: EXISTS (per-path thresholds added)

**Commits:**
- dd2f89d: EXISTS (formatTime extraction)
- f311806: EXISTS (getTodayStr extraction)
- 4a0d2b2: EXISTS (getWeekStartDate extraction)

**Self-Check: PASSED**
