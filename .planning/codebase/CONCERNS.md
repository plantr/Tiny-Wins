# Codebase Concerns

**Analysis Date:** 2026-02-16

## Tech Debt

**Large component files creating maintenance burden:**
- Issue: Multiple screens exceed 1000 lines of code, mixing concerns and UI logic
- Files: `app/(tabs)/index.tsx` (1634 lines), `app/guided-builder.tsx` (1106 lines), `app/edit-habit.tsx` (967 lines)
- Impact: Difficult to test, refactor, and debug. Multiple nested functions and state management within single files increases cognitive load.
- Fix approach: Extract sub-components (TodayWidget, IdentityBadge, DaySelector, HabitGridCard, HabitStackView are already separated but defined in same file). Create separate files for modal components (EvidenceModal, RemindersModal, AddHabitChoiceModal). Consider extracting habit list rendering logic into dedicated component files.

**AsyncStorage persistence pattern lacks error boundaries:**
- Issue: AsyncStorage calls throughout context providers don't have error handling for persistence failures
- Files: `lib/habits-context.tsx`, `lib/theme-context.tsx`, `lib/premium-context.tsx`, `lib/identity-context.tsx`
- Impact: Silent failures if AsyncStorage operations fail. Users' data changes may not persist without feedback.
- Fix approach: Add try-catch wrapping around AsyncStorage operations. Consider adding user-facing error notifications or offline queue for failed persistence attempts.

**ID generation uses `Date.now()` concatenation:**
- Issue: ID generation in `lib/habits-context.tsx` line 95 uses `Date.now().toString() + Math.random().toString(36).substr(2, 9)` which is not cryptographically secure and collision-prone at scale
- Files: `lib/habits-context.tsx`
- Impact: Potential ID collisions if multiple habits created simultaneously. Non-standard ID format complicates data migrations and syncing.
- Fix approach: Use library like `uuid` or `nanoid` for proper ID generation. Update habit creation to use robust IDs.

**Inline object creation in render/useMemo deps:**
- Issue: Many inline object/array literals passed directly to component props without memoization, particularly in mapping operations
- Files: `app/(tabs)/index.tsx` (lines 92, 206, etc.), `app/guided-builder.tsx` (multiple StyleSheet.create calls), `app/edit-habit.tsx`
- Impact: Causes unnecessary re-renders of child components. StyleSheet.create should be memoized or defined outside components.
- Fix approach: Move all StyleSheet.create calls outside component functions. Memoize inline objects and arrays using useMemo.

## Known Bugs

**Week data day index calculation mismatch:**
- Symptoms: Week progress tracking may display wrong day when `weekStartDay` setting differs from JavaScript default (Sunday = 0)
- Files: `lib/habits-context.tsx` line 185, `app/(tabs)/index.tsx` line 250-254
- Trigger: Enable Monday week start in settings, complete habits on different days of week, check week data
- Workaround: Use Sunday week start (default). The `WEEK_START_INDEX` in theme-context is defined but not consistently applied when calculating `dayIdx`.

**Habit stack anchor matching is case-sensitive:**
- Symptoms: When setting up habit stacking, entering "morning coffee" won't match existing habit "Morning Coffee"
- Files: `app/(tabs)/index.tsx` lines 437-448, `app/guided-builder.tsx` lines 650-655
- Trigger: Create habit with title "Morning Coffee". Try stacking with "morning coffee" anchor.
- Workaround: Match casing exactly when entering stack anchors.

**Time picker validation accepts invalid hour values:**
- Symptoms: User can input hour = 0 or > 12 in specific time mode, producing invalid time strings
- Files: `app/guided-builder.tsx` lines 546-548 - validation allows any number, not enforcing 1-12 range properly
- Trigger: Focus hour input, clear it, type "0" or "13"
- Workaround: Use "Any time" mode instead of specific time.

**Unread completion counts in session:**
- Symptoms: When completing multiple habits rapidly, some completions may not trigger evidence modal if modal state changes race with context updates
- Files: `app/(tabs)/index.tsx` lines 1035-1050, interaction between `handleComplete` and modal state management
- Trigger: Tap multiple habit checkboxes rapidly
- Workaround: Wait for evidence modal to fully close before completing next habit.

## Security Considerations

**No input validation on free-text fields:**
- Risk: XSS via stored habit titles, identity statements, implementation intentions if data is ever exposed to web or used in web views
- Files: All input fields in `app/(tabs)/index.tsx`, `app/guided-builder.tsx`, `app/edit-habit.tsx`, `app/add-habit.tsx`
- Current mitigation: Data stored locally in AsyncStorage only, not sent to server currently. React Native Text component automatically escapes.
- Recommendations: If data syncing to backend is added, sanitize input server-side and implement length limits (already present: maxLength on TextInput).

**Server CORS configuration hardcoded to localhost:**
- Risk: In development, CORS allows any localhost port (line 34-35 in `server/index.ts`). If production build uses same code, could be overly permissive.
- Files: `server/index.ts` lines 20-45
- Current mitigation: Checks for explicit Replit domains or localhost, doesn't allow `*`
- Recommendations: Ensure production build has strict CORS. Add environment validation to warn if localhost is enabled in production.

**AsyncStorage stores unencrypted sensitive data:**
- Risk: Habit data, including habit completions and evidence notes, stored unencrypted in AsyncStorage
- Files: Multiple `AsyncStorage.setItem()` calls throughout context providers
- Current mitigation: Data only accessible to app on device. No backend sync yet.
- Recommendations: If app adds backend sync, encrypt AsyncStorage data before transmission. Consider using secure storage library like `react-native-keychain` for sensitive data.

**Placeholder API keys not enforced to be replaced:**
- Risk: If placeholder API keys like 'appl_PLACEHOLDER' in RevenueCat configuration are not replaced before production, IAP will fail silently
- Files: Comments indicate this is intentional (user setup deferred), but no build-time checks enforce replacement
- Current mitigation: Documented as TODO. RevenueCat SDK will fail gracefully.
- Recommendations: Add environment check that warns during development if placeholder keys detected. Consider accepting env vars for API keys.

## Performance Bottlenecks

**Unoptimized ring progress visualization:**
- Problem: Ring progress in TodayWidget renders 36 individual View components and recalculates positions every render
- Files: `app/(tabs)/index.tsx` lines 107-129
- Cause: Array.from loop creating Views for each ring segment without memoization
- Improvement path: Replace with SVG-based ring progress or use `react-native-svg`. Memoize ring rendering logic. Consider canvas if performance critical.

**Recursive habit stack flattening without memoization:**
- Problem: `flattenChain()` recursive function called on every render in HabitStackView
- Files: `app/(tabs)/index.tsx` lines 464-471, 626-635
- Cause: No useMemo wrapper around chain building logic
- Improvement path: Memoize `chainRoots` and `flattenChain` results. Cache parsed habit stacking graph structure.

**Full scroll view re-renders on every state change:**
- Problem: TodayScreen state updates (evidenceModal, addChoiceVisible, viewMode) cause entire scroll view content to re-render
- Files: `app/(tabs)/index.tsx` - complex component with 7 state variables
- Cause: All state in one component, no granular context for modal states
- Improvement path: Extract modal state to custom context or move to separate components. Split screen into smaller components with isolated state.

**Linear Gradient components recreated on every render:**
- Problem: LinearGradient components used extensively without memoization
- Files: `app/(tabs)/index.tsx` (lines 91-96, 359-364, 783-787), `app/guided-builder.tsx` (lines 799-804, 904-909)
- Cause: Props passed inline, component recreation on each render
- Improvement path: Memoize gradient props or extract to constants. Consider gradient presets.

**Logs filtering called multiple times per render:**
- Problem: `logs.filter()` called separately in TodayWidget and main component for same date
- Files: `app/(tabs)/index.tsx` lines 59-61, 1011-1013
- Cause: No memoization of filtered results
- Improvement path: Create `useLogsForToday()` hook that memoizes result. Use `useMemo` for filtered sets.

## Fragile Areas

**Habit frequency parsing logic repeated across files:**
- Files: `app/guided-builder.tsx` lines 97-106, `app/edit-habit.tsx` lines 80-96
- Why fragile: Same parsing logic duplicated. Changes to frequency format require updates in multiple places. No shared schema.
- Safe modification: Extract to `lib/frequency-parser.ts` with types. Create `parseFrequency()` and `buildFrequency()` functions. Add tests.
- Test coverage: No tests for frequency parsing. Bug in one file invisible to other.

**Time format conversion scattered:**
- Files: `app/(tabs)/index.tsx` lines 995-1001 (`formatTime`), `app/guided-builder.tsx` time parsing in multiple places, `app/edit-habit.tsx` line 145-150
- Why fragile: Multiple time format interpretations (24hr vs 12hr AM/PM, with/without leading zeros). No centralized validation.
- Safe modification: Create `lib/time-utils.ts` with typed time conversion. Add `formatTime12h()`, `parse12hTime()`, `validate24hTime()` functions.
- Test coverage: No tests. Format errors could break reminders silently.

**Habit identity area lookup:**
- Files: `app/(tabs)/index.tsx` lines 191-195, `app/guided-builder.tsx` line 795, `app/edit-habit.tsx` lines 128-138
- Why fragile: IDENTITY_AREAS constant used directly, custom identity areas only identified by absence from IDENTITY_AREAS
- Safe modification: Create `getIdentityArea(id: string)` helper that checks both built-ins and custom. Store custom identity IDs in separate Set for clarity.
- Test coverage: No tests. Adding identity areas feature prone to breakage.

**Theme initialization race condition:**
- Files: `lib/theme-context.tsx` lines 36-91
- Why fragile: Provider returns `null` during loading (line 84), children must handle undefined theme
- Safe modification: Use fallback theme during initialization rather than returning null. Add `isInitialized` flag to context.
- Test coverage: No tests for concurrent initialization scenarios.

**Streak calculation logic in multiple contexts:**
- Files: `lib/habits-context.tsx` lines 178-221 (incrementHabit), lines 223-254 (completeHabit), lines 256-272 (uncompleteHabit)
- Why fragile: Streak updates scattered across three functions. Inconsistent logic (completeHabit always increments, uncompleteHabit decrements)
- Safe modification: Extract to `calculateNewStreak()` function. Add explicit test cases for streak edge cases.
- Test coverage: No unit tests for streak logic. Streak bugs undetected.

## Scaling Limits

**Local storage capacity for logs:**
- Current capacity: AsyncStorage on mobile devices typically 5-10MB. At ~200 bytes per log entry, ~25k-50k entries possible before storage limit
- Limit: App will crash when trying to store log if AsyncStorage fills up
- Scaling path: Implement log archival (monthly aggregates), pagination, or cloud sync with server-side storage. Add storage quota checks before saving.

**Habit grid memory growth:**
- Problem: All habits and logs loaded in memory. With 100+ habits and years of logs, memory usage could be significant
- Limit: Noticeable slowdown on older devices with 1000+ logs
- Scaling path: Implement pagination or infinite scroll for logs. Load habits lazily. Consider time-based data pruning.

**Real-time updates without backend sync:**
- Current capacity: Single device only. No multi-device sync capability.
- Limit: Can't sync habits across devices, no backup
- Scaling path: Add backend API with device sync. Implement conflict resolution for multi-device edits.

## Dependencies at Risk

**React 19.1.0 with possible stability issues:**
- Risk: React 19 released recently (late 2024). May have undiscovered issues with React Native 0.81 compatibility
- Impact: If incompatibility found, could require major version downgrades
- Migration plan: Pin to specific patch version. Monitor React Native release notes for compatibility issues. Keep on current version until React Native officially validates.

**Expo 54 nearing end-of-life:**
- Risk: Expo 54.0.27 was released ~6 months ago. Expo typically supports SDK versions for 1 year before deprecation. Plan for upgrade to 55+ within next 6 months.
- Impact: Security patches and critical bug fixes may stop
- Migration plan: Start testing with Expo 55 in parallel. Schedule upgrade to Expo 55 within next quarter. Document any breaking changes.

**Drizzle ORM 0.39.3 with unstable API:**
- Risk: Drizzle 0.39 still in active development. API may change in minor versions.
- Impact: Dependency updates could require code changes if not pinned properly
- Migration plan: Monitor Drizzle changelog. Pin exact version if API stability critical. Switch to major version ranges only after 1.0 release.

**Custom patch for expo-asset:**
- Risk: Patch applied via patch-package in `patches/expo-asset+12.0.12.patch` adds custom code to node_modules
- Impact: Patch won't apply if expo-asset updates. Breaks deployment if node_modules regenerated
- Migration plan: File issue with expo-asset to get feature merged upstream. Plan migration to patched version when available.

## Missing Critical Features

**No error boundaries for crashes:**
- Problem: App has no Error Boundary components. Any render error crashes entire app.
- Blocks: Production stability. User loses data if app crashes.
- Implementation: Create `ErrorFallback.tsx` component already exists (line 286 in file listing) but not used in _layout. Wrap app root with ErrorBoundary from react-error-boundary or custom implementation.

**No network error handling for future backend:**
- Problem: Currently local-only, but when backend added, no pattern for network error recovery
- Blocks: Server sync feature, cloud backup
- Implementation: Add request retry logic with exponential backoff. Implement offline queue for mutations. Add network status listener.

**No data migration system:**
- Problem: If Habit or HabitLog schema changes, no migration path for existing users
- Blocks: Schema evolution without data loss
- Implementation: Create `lib/migrations.ts` with version-based transformation functions. Add version field to stored data.

**No backup/export feature:**
- Problem: Users can't backup or export their habit data
- Blocks: Data portability, disaster recovery
- Implementation: Add settings screen option to export habits as JSON. Add import from file.

## Test Coverage Gaps

**No tests for habit context logic:**
- What's not tested: All habit CRUD operations, streak calculations, log filtering, date string generation
- Files: `lib/habits-context.tsx` (entire file - 350 lines)
- Risk: Bugs in core functionality invisible until runtime. Regressions from refactoring undetected.
- Priority: **High** - Context is critical data flow

**No tests for frequency string parsing:**
- What's not tested: Custom frequency string building, parsing, "Weekly on X", "Every N weeks on ..." patterns
- Files: `app/guided-builder.tsx` lines 97-106, `app/edit-habit.tsx` lines 80-123
- Risk: Frequency format bugs break habit scheduling in user-facing ways
- Priority: **High** - Directly impacts habit creation

**No tests for time formatting:**
- What's not tested: 24-hour to 12-hour conversion, AM/PM handling, edge cases (12:00, 00:00)
- Files: `app/(tabs)/index.tsx` line 995-1001, various time parsing in guided-builder
- Risk: Reminder times displayed incorrectly or become invalid
- Priority: **Medium** - May not affect core flow but impacts UX

**No tests for component integration:**
- What's not tested: Modal opening/closing flows, form validation and submission, navigation between screens
- Files: All screen components
- Risk: UI flows may break without detection. User workflows untested.
- Priority: **Medium** - Would require e2e test infrastructure

**No tests for AsyncStorage persistence:**
- What's not tested: Data actually persists across app restarts, corruption recovery, quota handling
- Files: All context providers
- Risk: Data loss in production without warning
- Priority: **High** - Data loss is critical

---

*Concerns audit: 2026-02-16*
