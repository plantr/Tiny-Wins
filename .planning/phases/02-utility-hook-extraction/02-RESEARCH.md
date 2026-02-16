# Phase 2: Utility & Hook Extraction - Research

**Researched:** 2026-02-16
**Domain:** React Native utility extraction, pure function testing, custom hook patterns
**Confidence:** HIGH

## Summary

Phase 2 extracts duplicated logic (time formatting, frequency parsing, date helpers, ID generation) from three monolithic screens (`index.tsx`, `guided-builder.tsx`, `edit-habit.tsx`) into shared, tested modules. The codebase uses Expo SDK 54, React Native 0.81.5, Jest 29.7 with React Native Testing Library, and follows TypeScript strict mode. Test infrastructure from Phase 1 (custom render wrapper with 4 context providers, co-located `.test.tsx` files, per-path 70% coverage thresholds) is in place.

**Primary recommendation:** Extract utilities as pure functions into `lib/utils/` subdirectory with co-located tests, test utilities before extracting from screens to capture current behavior, use one atomic commit per utility to enable individual rollback, and defer hook extraction decisions until utility extraction reveals which patterns are truly reusable.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Migration strategy:**
- **DECIDED: Write tests first** — Write tests for current inline behavior BEFORE extracting, then extract and confirm tests still pass
- **DECIDED: Comment out old code briefly** — Keep commented-out inline code for one commit as safety net, remove in follow-up cleanup
- **DECIDED: One commit per utility** — Each utility extraction gets its own atomic commit for easy individual revert
- **DECIDED: Verify app after each extraction** — Run the app after each extraction to spot-check behavior, don't just trust tests

### Claude's Discretion

Module structure decisions (directory layout, file organization, import patterns, hook location) — Claude has full flexibility to match existing codebase conventions.

Extraction scope decisions (what to extract, granularity, type strictness) — Claude judges based on actual duplication and complexity found in the code.

Hook design decisions (size, timing, testing approach, error model) — Claude picks based on what the codebase actually needs.

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.

</user_constraints>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Jest | 29.7.0 | Test runner | De facto standard for React Native, built into expo preset |
| @testing-library/react-native | 13.3.3 | Component/hook testing | Official React Native testing utilities, `renderHook` built-in |
| TypeScript | ~5.9.2 | Type safety | Project already uses strict mode, utilities must match |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| jest-expo | ~54.0.17 | Jest preset for Expo | Already configured, provides RN transform pipeline |
| @babel/core | ^7.25.2 | Transform JSX/TS | Automatically configured via jest-expo |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Jest | Vitest | Vitest faster but Jest has better RN ecosystem support, migration not worth disruption mid-project |
| Manual ID generation | nanoid/uuid | Current `Date.now() + Math.random()` is simple and works; nanoid would add dependency for marginal benefit since IDs are client-only and collision risk is negligible |
| Custom date utils | date-fns | Project has minimal date needs (just formatting and "today" string); date-fns 70KB+ would be overkill |

**Installation:**
No new packages required — all utilities use native JavaScript/TypeScript and existing test infrastructure.

## Architecture Patterns

### Recommended Project Structure
```
lib/
├── utils/                    # Shared utilities (new in Phase 2)
│   ├── time.ts              # Time formatting (formatTime)
│   ├── time.test.ts         # Co-located test
│   ├── date.ts              # Date helpers (getTodayStr, week calculations)
│   ├── date.test.ts
│   ├── frequency.ts         # Frequency parsing (buildCustomFrequency, parseCustomFrequency)
│   ├── frequency.test.ts
│   ├── id.ts                # ID generation (generateId)
│   └── id.test.ts
├── theme-context.tsx        # Existing context providers
├── habits-context.tsx
├── identity-context.tsx
├── premium-context.tsx
├── query-client.ts
└── test-utils.tsx           # Custom render wrapper (Phase 1)
```

**Rationale:** Flat `lib/utils/` structure matches existing `lib/` pattern (contexts live at `lib/` root). Co-located tests follow Phase 1 decision (not `__tests__/` directories). Granular files (one concern per file) enable focused testing and easier imports.

### Pattern 1: Pure Utility Functions

**What:** Stateless functions that transform inputs to outputs with no side effects, external dependencies, or mutable state.

**When to use:** Time formatting, date string generation, frequency string parsing, ID generation — any logic that doesn't need React context or state.

**Example:**
```typescript
// lib/utils/time.ts
/**
 * Converts 24-hour time format (HH:MM) to 12-hour format with AM/PM.
 * Handles edge cases: midnight (0:00 → 12:00 am), noon (12:00 → 12:00 pm).
 *
 * @param time24 - Time string in 24-hour format (e.g., "07:30", "00:00", "23:45")
 * @returns Time string in 12-hour format (e.g., "7:30 am", "12:00 am", "11:45 pm")
 *
 * @example
 * formatTime("00:00") // "12:00 am" (midnight)
 * formatTime("12:00") // "12:00 pm" (noon)
 * formatTime("13:30") // "1:30 pm"
 */
export function formatTime(time24: string): string {
  const [hStr, mStr] = time24.split(":");
  const h = parseInt(hStr, 10);
  const ampm = h < 12 ? "am" : "pm";
  const h12 = h % 12 === 0 ? 12 : h % 12; // Handle midnight (0) and noon (12)
  return `${h12}:${mStr} ${ampm}`;
}
```

**Source:** Extracted from `app/(tabs)/index.tsx` line 995-1001.

### Pattern 2: Testing Pure Functions

**What:** Unit tests for pure functions focus on input/output behavior, edge cases, and type correctness.

**When to use:** Every utility function extracted. Write tests BEFORE extraction (per user decision) to capture current behavior.

**Example:**
```typescript
// lib/utils/time.test.ts
import { formatTime } from './time';

describe('formatTime', () => {
  it('converts morning hours to 12-hour format', () => {
    expect(formatTime('07:30')).toBe('7:30 am');
    expect(formatTime('09:00')).toBe('9:00 am');
  });

  it('converts afternoon/evening hours to 12-hour format', () => {
    expect(formatTime('13:30')).toBe('1:30 pm');
    expect(formatTime('23:45')).toBe('11:45 pm');
  });

  it('handles midnight edge case (00:00 → 12:00 am)', () => {
    expect(formatTime('00:00')).toBe('12:00 am');
    expect(formatTime('00:30')).toBe('12:30 am');
  });

  it('handles noon edge case (12:00 → 12:00 pm)', () => {
    expect(formatTime('12:00')).toBe('12:00 pm');
    expect(formatTime('12:30')).toBe('12:30 pm');
  });

  it('preserves minute padding', () => {
    expect(formatTime('07:05')).toBe('7:05 am');
    expect(formatTime('14:09')).toBe('2:09 pm');
  });
});
```

**Source:** Pattern from [Expo Unit Testing Documentation](https://docs.expo.dev/develop/unit-testing/) and [Jest Testing React Native](https://jestjs.io/docs/tutorial-react-native).

### Pattern 3: Date Utilities with Current Date Dependencies

**What:** Utilities that depend on "today's date" need careful handling to avoid flakiness. Mock `Date.now()` or inject date as parameter.

**When to use:** Functions like `getTodayStr()` that call `new Date()` internally.

**Example:**
```typescript
// lib/utils/date.ts
/**
 * Returns today's date as YYYY-MM-DD string in local timezone.
 *
 * @returns Date string (e.g., "2026-02-16")
 */
export function getTodayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// lib/utils/date.test.ts
import { getTodayStr } from './date';

describe('getTodayStr', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns date in YYYY-MM-DD format', () => {
    jest.setSystemTime(new Date('2026-02-16T10:30:00Z'));
    const result = getTodayStr();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('pads single-digit months and days with zero', () => {
    jest.setSystemTime(new Date('2026-01-05T10:30:00Z'));
    const result = getTodayStr();
    expect(result).toBe('2026-01-05');
  });
});
```

**Source:** Pattern from [Jest Timer Mocks](https://jestjs.io/docs/timer-mocks).

### Pattern 4: Frequency Parsing with String Manipulation

**What:** Functions that parse and build custom frequency strings (e.g., "Every 2 weeks on Mon, Wed, Fri") need comprehensive test coverage for all frequency patterns.

**When to use:** Extracting `buildCustomFrequency` and `parseCustomFrequency` from guided-builder and edit-habit screens.

**Example:**
```typescript
// lib/utils/frequency.ts
const DAYS_LIST = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function buildCustomFrequency(
  interval: string,
  period: "days" | "weeks",
  days: string[]
): string {
  const n = parseInt(interval) || 1;
  if (period === "weeks" && days.length > 0) {
    const sorted = DAYS_LIST.filter((d) => days.includes(d));
    if (n === 1) return `Weekly on ${sorted.join(", ")}`;
    return `Every ${n} weeks on ${sorted.join(", ")}`;
  }
  if (n === 1) return period === "days" ? "Daily" : "Weekly";
  return `Every ${n} ${period}`;
}

export function parseCustomFrequency(f: string): {
  interval: string;
  period: "days" | "weeks";
  days: string[];
} {
  let interval = "1";
  let period: "days" | "weeks" = "weeks";
  let days: string[] = [];

  if (f.startsWith("Every ")) {
    const parts = f.replace("Every ", "").split(" ");
    interval = parts[0] || "1";
    if (parts[1]?.startsWith("day")) period = "days";
    else period = "weeks";

    const onIdx = f.indexOf(" on ");
    if (onIdx !== -1) {
      days = f.substring(onIdx + 4).split(", ").map((d) => d.trim()).filter(Boolean);
    }
  } else if (f.startsWith("Weekly on ")) {
    days = f.replace("Weekly on ", "").split(", ").map((d) => d.trim()).filter(Boolean);
  }

  return { interval, period, days };
}
```

**Source:** Extracted from `app/guided-builder.tsx` lines 97-106 and `app/edit-habit.tsx` lines 80-97.

### Pattern 5: Hook Extraction (Deferred to Later Tasks)

**What:** Custom hooks extract stateful logic shared across screens. Defer until utility extraction reveals which patterns are truly reusable.

**When to use:** Not in Phase 2 initial extraction. Evaluate after utilities are stable and duplicate patterns emerge across multiple screens.

**Recommendation:** Focus Phase 2 on pure utilities first. Hook extraction belongs in Phase 3 (Component Extraction) or later when component patterns clarify which hooks are needed.

**Source:** Based on [Testing Custom React Hooks](https://www.builder.io/blog/test-custom-hooks-react-testing-library) and project CONTEXT.md granting Claude discretion on timing.

### Anti-Patterns to Avoid

- **Premature abstraction:** Don't extract a utility until it's duplicated in 2+ places. Single-use "utilities" add indirection without benefit.
- **God utility files:** Don't create `utils/helpers.ts` with unrelated functions. One concern per file enables focused testing and clear imports.
- **Untested utilities:** Don't extract without tests. User decision requires tests-first approach to capture current behavior before extraction.
- **Breaking atomicity:** Don't extract multiple utilities in one commit. User decision requires one commit per utility for individual rollback capability.
- **Side effects in utilities:** Don't put context access, state updates, or async operations in utility functions. Keep utilities pure for easy testing.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| UUID generation | Custom crypto-based ID generator | Native `Date.now() + Math.random()` (existing) or nanoid if adding dependency | Project IDs are client-only, collision risk negligible; existing approach works; nanoid adds 118 bytes if more paranoia needed |
| Date arithmetic | Custom date math (days between, week start) | Native Date methods or date-fns if complexity grows | Current needs are minimal (today string, week start day); native methods sufficient unless Phase 3+ reveals more complex needs |
| Time format localization | Manual AM/PM locale logic | `Intl.DateTimeFormat` with `hour12: true` | Automatically handles midnight/noon edge cases, locale-aware, fastest native approach per [MDN Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat) |
| Hook testing infrastructure | Custom hook renderer | `renderHook` from `@testing-library/react-native` | Built into RNTL 13.3+, officially supported, handles React 19 async act properly per [RNTL renderHook docs](http://oss.callstack.com/react-native-testing-library/docs/api/misc/render-hook) |

**Key insight:** JavaScript natives (Date, Intl, Math.random) handle 90% of utility needs. Only add libraries if Phase 3+ reveals complex requirements (timezone handling, complex date math, high-security ID needs). Premature dependencies create maintenance burden without value.

## Common Pitfalls

### Pitfall 1: Test Flakiness from Uncontrolled Time

**What goes wrong:** Tests calling `getTodayStr()` or using `Date.now()` fail randomly depending on when CI runs (e.g., midnight boundary, month rollover).

**Why it happens:** `new Date()` returns actual current time, which changes every millisecond. Tests comparing "today's date" can fail if test spans midnight.

**How to avoid:** Always use `jest.useFakeTimers()` and `jest.setSystemTime()` in tests for date/time utilities. Set deterministic date at test setup.

**Warning signs:** Tests pass locally, fail in CI randomly. Tests fail when run at midnight or month boundaries. Test output shows unexpected dates.

**Example fix:**
```typescript
// ❌ FLAKY TEST
it('returns today', () => {
  expect(getTodayStr()).toBe('2026-02-16'); // Hardcoded, fails tomorrow
});

// ✅ STABLE TEST
it('returns today', () => {
  jest.setSystemTime(new Date('2026-02-16T10:00:00Z'));
  expect(getTodayStr()).toBe('2026-02-16');
});
```

**Source:** Pattern from [Jest Timer Mocks](https://jestjs.io/docs/timer-mocks).

### Pitfall 2: Breaking Screen Behavior During Extraction

**What goes wrong:** Extracting `formatTime` from `index.tsx` changes time display format unexpectedly (loses padding, swaps am/pm, breaks midnight).

**Why it happens:** Inline code has subtle behavior (string coercion, default parameters, edge case handling) not captured in extracted version.

**How to avoid:** User decision requires tests-first approach. Write test for **current inline behavior** BEFORE extracting. Test must pass on inline code, then pass after extraction.

**Warning signs:** Tests added after extraction. Tests written from spec, not from current behavior. Manual testing reveals visual differences post-extraction.

**Example workflow:**
```typescript
// STEP 1: Add test for CURRENT inline behavior (in screen file)
describe('formatTime (inline)', () => {
  it('matches current behavior', () => {
    // Copy-paste inline function to test file temporarily
    const formatTime = (time24: string): string => {
      const [hStr, mStr] = time24.split(":");
      const h = parseInt(hStr, 10);
      const ampm = h < 12 ? "am" : "pm";
      const h12 = h % 12 === 0 ? 12 : h % 12;
      return `${h12}:${mStr} ${ampm}`;
    };
    expect(formatTime("00:00")).toBe("12:00 am"); // Captures current behavior
  });
});

// STEP 2: Extract to utility, tests still pass
// STEP 3: Update imports, verify tests pass
// STEP 4: Run app, spot-check time display (user decision)
```

### Pitfall 3: Incomplete Frequency Parsing Coverage

**What goes wrong:** `parseCustomFrequency` works for "Every 2 weeks on Mon, Wed" but fails for "Weekly on Sat, Sun" or "Every 3 days".

**Why it happens:** Frequency string format has many variants (daily, weekly, weekdays, weekends, custom intervals, specific days). Parser written for one format breaks on others.

**How to avoid:** Test all frequency patterns found in codebase. Grep for frequency usage, collect all variants, write test case for each.

**Warning signs:** Tests only cover "happy path" (single format). Frequency options broken in guided-builder after extraction. Edit screen crashes on load with custom frequency.

**Example coverage:**
```typescript
describe('parseCustomFrequency', () => {
  it('parses "Daily"', () => {
    expect(parseCustomFrequency("Daily")).toEqual({ interval: "1", period: "days", days: [] });
  });

  it('parses "Weekly on Mon, Wed, Fri"', () => {
    expect(parseCustomFrequency("Weekly on Mon, Wed, Fri")).toEqual({
      interval: "1",
      period: "weeks",
      days: ["Mon", "Wed", "Fri"]
    });
  });

  it('parses "Every 2 weeks on Tue, Thu"', () => {
    expect(parseCustomFrequency("Every 2 weeks on Tue, Thu")).toEqual({
      interval: "2",
      period: "weeks",
      days: ["Tue", "Thu"]
    });
  });

  it('parses "Every 3 days"', () => {
    expect(parseCustomFrequency("Every 3 days")).toEqual({
      interval: "3",
      period: "days",
      days: []
    });
  });

  // Add tests for "Weekdays", "Weekends", "3x per week" when found in codebase
});
```

**Source:** Patterns observed in `guided-builder.tsx` and `edit-habit.tsx` frequency handling.

### Pitfall 4: Import Path Breakage After Extraction

**What goes wrong:** After extracting utilities, imports fail with "module not found" or TypeScript errors.

**Why it happens:** Relative paths change when moving code. TypeScript `@/` alias might not resolve correctly. Jest transform might not handle new path.

**How to avoid:** Use `@/lib/utils/` alias paths consistently. Verify `tsconfig.json` includes `lib/` in paths. Run `npm run test` after each extraction to catch import errors early.

**Warning signs:** TypeScript errors after extraction. Tests fail with "Cannot find module". App builds but crashes on utility import at runtime.

**Example fix:**
```typescript
// ❌ FRAGILE (relative path breaks if file moves)
import { formatTime } from '../../../lib/utils/time';

// ✅ STABLE (alias path always resolves)
import { formatTime } from '@/lib/utils/time';
```

**Verification:**
```bash
# After each extraction:
npm run test              # Catch import errors in tests
npm run lint              # Catch unused imports
npx expo start            # Run app, spot-check feature (user decision)
```

### Pitfall 5: Commented-Out Code Left Forever

**What goes wrong:** User decision requires keeping commented-out inline code for one commit as safety net. Cleanup commit never happens; commented code rots in codebase.

**Why it happens:** Focus shifts to next extraction. Cleanup commit feels low-priority. Commented code accumulates across multiple extractions.

**How to avoid:** Track cleanup commits in phase plan. Create cleanup task after each 3-4 extractions. Set reminder to review commented code before phase PR.

**Warning signs:** Multiple extractions done, no cleanup commits. Search for `// OLD CODE:` or `// EXTRACTED:` shows 10+ occurrences. Phase PR diff shows hundreds of lines of commented code.

**Example workflow:**
```
Commit 1: Extract formatTime (inline code commented out)
Commit 2: Extract getTodayStr (inline code commented out)
Commit 3: Extract buildCustomFrequency (inline code commented out)
Commit 4: Clean up commented-out time/date code from all screens  ← DO THIS
Commit 5: Extract parseCustomFrequency (inline code commented out)
...
```

**Source:** User decision to keep commented code briefly, standard software engineering practice to remove it promptly.

## Code Examples

Verified patterns from codebase analysis:

### Time Formatting (24h → 12h with AM/PM)

```typescript
// Source: app/(tabs)/index.tsx line 995-1001
// Current inline implementation
function formatTime(time24: string): string {
  const [hStr, mStr] = time24.split(":");
  const h = parseInt(hStr, 10);
  const ampm = h < 12 ? "am" : "pm";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${mStr} ${ampm}`;
}

// ✅ Extract to: lib/utils/time.ts
// ✅ Test edge cases: midnight (00:00), noon (12:00), single-digit hours
// ✅ Used in: index.tsx (line 489, 916), guided-builder.tsx (line 624), edit-habit.tsx (line 688)
```

### Today's Date String (YYYY-MM-DD)

```typescript
// Source: app/(tabs)/index.tsx line 52-55
// Current inline implementation
function getTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// ✅ Extract to: lib/utils/date.ts
// ✅ Test with jest.setSystemTime for deterministic dates
// ✅ Used in: index.tsx (lines 55, 60, 255, 1011), multiple log/completion flows
```

### Custom Frequency Builder

```typescript
// Source: app/guided-builder.tsx lines 97-106
// Current inline implementation
const DAYS_LIST = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const buildCustomFrequency = () => {
  const n = parseInt(customInterval) || 1;
  if (customPeriod === "weeks" && customDays.length > 0) {
    const sorted = DAYS_LIST.filter((d) => customDays.includes(d));
    if (n === 1) return `Weekly on ${sorted.join(", ")}`;
    return `Every ${n} weeks on ${sorted.join(", ")}`;
  }
  if (n === 1) return customPeriod === "days" ? "Daily" : "Weekly";
  return `Every ${n} ${customPeriod}`;
};

// ✅ Extract to: lib/utils/frequency.ts
// ✅ Export DAYS_LIST constant for consistent day ordering
// ✅ Test all frequency patterns: Daily, Weekly, "Every N days", "Every N weeks on Days"
// ✅ Used in: guided-builder.tsx (line 108), edit-habit.tsx (line 126)
```

### Custom Frequency Parser

```typescript
// Source: app/edit-habit.tsx lines 80-97
// Current inline implementation
const parseCustomFrequency = (f: string) => {
  let interval = "1";
  let period: "days" | "weeks" = "weeks";
  let days: string[] = [];
  if (f.startsWith("Every ")) {
    const parts = f.replace("Every ", "").split(" ");
    interval = parts[0] || "1";
    if (parts[1]?.startsWith("day")) period = "days";
    else period = "weeks";
    const onIdx = f.indexOf(" on ");
    if (onIdx !== -1) {
      days = f.substring(onIdx + 4).split(", ").map((d) => d.trim()).filter(Boolean);
    }
  } else if (f.startsWith("Weekly on ")) {
    days = f.replace("Weekly on ", "").split(", ").map((d) => d.trim()).filter(Boolean);
  }
  return { interval, period, days };
};

// ✅ Extract to: lib/utils/frequency.ts (alongside buildCustomFrequency)
// ✅ Test round-trip: parseCustomFrequency(buildCustomFrequency(...)) === original input
// ✅ Used in: edit-habit.tsx (lines 99-103), initializes custom frequency form state
```

### ID Generation (Timestamp + Random)

```typescript
// Source: lib/habits-context.tsx lines 94-96
// Current implementation (already in lib/, just needs tests)
function generateId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

// ✅ Extract to: lib/utils/id.ts
// ✅ Test uniqueness: generate 1000 IDs, verify no collisions (low-probability test, run once)
// ✅ Test format: verify output matches /^\d{13}[a-z0-9]{9}$/ pattern
// ✅ Used in: habits-context.tsx (line 310), generates IDs for habits, logs, reviews
```

**Note:** All examples above are **exact current implementations** from codebase. Tests-first approach (user decision) requires testing these **before** extraction to capture current behavior, not idealized behavior.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Separate `react-hooks-testing-library` | `renderHook` built into `@testing-library/react-native` | React 18 (2022), RNTL 13+ (2024) | No separate dependency needed, async act() handled automatically for React 19 |
| Manual date mocking with prototype override | `jest.useFakeTimers()` + `jest.setSystemTime()` | Jest 26+ (2020) | Cleaner API, avoids prototype pollution, works with Date.now() and new Date() |
| `Math.random()` for IDs | `crypto.randomUUID()` or nanoid | Node 14+ crypto (2021), nanoid 3+ (2021) | Better entropy, URL-safe, collision-resistant; but overkill for client-only IDs |
| `toLocaleTimeString()` | `Intl.DateTimeFormat` with hour12 | ECMAScript 2017 | Faster, more control, handles midnight/noon edge cases per [MDN DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat) |

**Deprecated/outdated:**
- **`@testing-library/react-hooks`**: Merged into main `@testing-library/react` and `@testing-library/react-native` in 2022. No longer needed as separate package.
- **`Date.prototype` mocking**: Modern Jest fake timers (`jest.setSystemTime`) replace old approach of overriding `Date` constructor on prototype.

**Current best practices (2026):**
- Use native `Intl.DateTimeFormat` for time formatting instead of manual string manipulation ([MDN Intl](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat))
- Use `renderHook` from `@testing-library/react-native` for hook testing (built-in since RNTL 13+)
- Use `jest.useFakeTimers()` + `jest.setSystemTime()` for date/time testing (stable API since Jest 26)
- Keep utilities pure (no side effects, no context access, no async) for fast, deterministic testing

## Open Questions

1. **Week start day calculation for date helpers**
   - What we know: `WEEK_START_INDEX` exists in `theme-context.tsx`, used in `index.tsx` line 253 for day ordering
   - What's unclear: Whether date helpers need week-start-day parameter or can import from theme context (breaks purity)
   - Recommendation: Check existing usage patterns in Phase 2 Task 1 (date helper extraction). If getTodayStr needs week start, pass as parameter to keep function pure.

2. **Frequency preset constants (Daily, Weekdays, Weekends, 3x per week)**
   - What we know: Preset strings used in `guided-builder.tsx` line 328 and `edit-habit.tsx` line 404
   - What's unclear: Whether these belong in `frequency.ts` as constants or remain inline in screens
   - Recommendation: If preset strings are only used in UI (for button labels), keep them in screens. If used in parsing logic, extract to `frequency.ts` as constants.

3. **Hook extraction scope for Phase 2 vs Phase 3**
   - What we know: CONTEXT.md grants Claude discretion on timing (which hooks belong in Phase 2 vs Phase 3)
   - What's unclear: Whether to extract any hooks in Phase 2 or defer all hook extraction to Phase 3 (Component Extraction)
   - Recommendation: Focus Phase 2 on pure utilities only. Defer hook extraction to Phase 3 when component patterns are clearer and reuse opportunities are validated. Premature hook extraction risks creating hooks that aren't actually reusable.

4. **Coverage threshold for new utility files**
   - What we know: Phase 1 set per-path 70% threshold for `test-utils.tsx`, global floor at 2-6%
   - What's unclear: Whether to add 70% per-path thresholds to `jest.config.js` for each new utility file immediately or wait until Phase 4
   - Recommendation: Add 70% per-path threshold for each utility file in Phase 2 (one threshold per extraction). Enforces quality immediately, prevents backfill work in Phase 4.

## Sources

### Primary (HIGH confidence)
- Codebase analysis: `app/(tabs)/index.tsx`, `app/guided-builder.tsx`, `app/edit-habit.tsx`, `lib/habits-context.tsx` (lines 52-55, 94-96, 97-106, 80-97, 995-1001)
- Test infrastructure: `lib/test-utils.tsx`, `jest.config.js`, `package.json` (Jest 29.7, RNTL 13.3.3, jest-expo 54.0.17)
- TypeScript configuration: `tsconfig.json` (strict mode, `@/` alias paths)
- Phase 1 decisions: Custom render wrapper, co-located tests, per-path coverage thresholds

### Secondary (MEDIUM confidence)
- [React Native folder structure - Medium](https://medium.com/@nitishprasad/react-native-folder-structure-e9ceab3150f3) - Utils folder organization patterns
- [How to Structure Large-Scale React Native Applications - OneUptime](https://oneuptime.com/blog/post/2026-01-15-structure-react-native-applications/view) - Feature-based architecture, utility placement
- [React Native Testing Library - renderHook API](http://oss.callstack.com/react-native-testing-library/docs/api/misc/render-hook) - Hook testing built into RNTL 13+
- [How to Test Custom React Hooks - Builder.io](https://www.builder.io/blog/test-custom-hooks-react-testing-library) - renderHook patterns and best practices
- [Jest Testing React Native - Official Tutorial](https://jestjs.io/docs/tutorial-react-native) - Pure function testing, describe blocks, test independence
- [Expo Unit Testing Documentation](https://docs.expo.dev/develop/unit-testing/) - Testing pure functions and utilities with Jest
- [MDN Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat) - Native time formatting with hour12, handles midnight/noon edge cases
- [Jest Timer Mocks](https://jestjs.io/docs/timer-mocks) - useFakeTimers() and setSystemTime() for date testing
- [Nano ID - GitHub](https://github.com/ai/nanoid) - URL-friendly unique ID generation (118 bytes, secure)

### Tertiary (LOW confidence)
- [JavaScript Date - MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) - Native Date API edge cases
- [date-fns](https://date-fns.org/) - Date utility library (alternative if complexity grows in Phase 3+)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already installed and configured in Phase 1, verified via package.json and jest.config.js
- Architecture: HIGH - Patterns extracted directly from codebase analysis, matches existing `lib/` structure
- Pitfalls: HIGH - Flakiness risks observed in date/time testing documentation, frequency parsing complexity evident from multi-screen duplication
- Hook extraction timing: MEDIUM - Deferred to Phase 3 per CONTEXT.md discretion, actual need unclear until utilities extracted

**Research date:** 2026-02-16
**Valid until:** 60 days (stable domain: Jest/RNTL APIs stable, utility patterns don't change frequently)

**Next steps for planner:**
1. Create tasks for each utility extraction (time, date, frequency, id) with tests-first approach
2. Each task: write tests for inline code → extract to lib/utils → verify tests pass → update imports → commit
3. Add per-path 70% coverage threshold to jest.config.js for each new utility file
4. Defer hook extraction decisions to Phase 3 based on actual reuse patterns observed post-utility-extraction
