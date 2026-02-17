# Testing Patterns

**Analysis Date:** 2026-02-16

## Test Framework

**Status:** No testing framework configured

**Note:** This codebase currently has zero test files (0 `.test.*` or `.spec.*` files found). Testing infrastructure is not set up.

**Recommendation for future setup:**
- Consider Jest (React Native / Node.js standard)
- Or Vitest (modern alternative, faster)
- ESLint is configured but not test-focused

## Test File Organization

**Current State:** Not applicable - no tests exist

**Future Recommendation:**
- Co-locate test files with source: `component.tsx` + `component.test.tsx`
- Server test files in `server/__tests__/` or alongside routes
- Context tests in `lib/__tests__/` or alongside context files

## Test Structure

**No established patterns** - Use React Testing Library conventions for future tests:

```typescript
// Expected structure for future tests
describe("ComponentName", () => {
  it("should render correctly", () => {
    // Test implementation
  });

  it("should handle user interaction", () => {
    // Test implementation
  });
});
```

## Mocking

**Framework:** Not applicable - no testing setup

**Future recommendations for this codebase:**
- Mock `AsyncStorage` for context tests
- Mock `expo-router` for navigation tests
- Mock `fetch` via `jest.mock()` for API tests
- Consider `msw` (Mock Service Worker) for API mocking

**What to Mock (when testing is added):**
- AsyncStorage calls (used throughout contexts)
- Router navigation (used in screens)
- API responses (used in query-client)
- Expo modules (haptics, location, etc.)

**What NOT to Mock:**
- React Context providers themselves
- Custom hooks internal logic
- StyleSheet calculations

## Fixtures and Factories

**Current State:** Not applicable - no test infrastructure

**Future approach for this codebase:**
- Create `__fixtures__/` directory for mock data
- Example fixtures needed:
  - Mock Habit objects (for habits-context testing)
  - Mock User objects (for server/auth testing)
  - Mock API responses (for query-client testing)

**Example fixture location:**
- `lib/__fixtures__/habit.ts` - Contains factory functions for creating test Habits
- `server/__fixtures__/user.ts` - Contains mock User data
- `shared/__fixtures__/` - Shared test data between client and server

## Coverage

**Requirements:** Not enforced

**Current State:** No coverage tracking tools installed

**View Coverage (when framework is added):**
```bash
npm run test:coverage  # (not currently configured)
```

## Test Types

**Unit Tests (recommended for):**
- Context logic: habits calculations, streak tracking, log filtering
- Utility functions: ID generation, date formatting (`getTodayStr()`)
- Data validation: schema validation with Zod
- React hooks: custom hook behavior in isolation

**Integration Tests (recommended for):**
- Context + AsyncStorage interaction
- Router navigation flows
- Provider composition (checking context availability)
- API request → response flow

**E2E Tests:**
- Not currently configured
- Future: Consider Detox for React Native testing
- Or: Manual testing via Expo development build

## Common Patterns to Establish

### Async Testing (when tests are added)

```typescript
// Pattern to use
describe("HabitsContext", () => {
  it("should load habits from AsyncStorage", async () => {
    // Mock AsyncStorage.getItem
    // Render provider and component
    // Wait for effect to complete
    // Assert loaded state
  });
});
```

**Key points for async patterns:**
- Wrap async operations in `waitFor()`
- Mock AsyncStorage before rendering
- Test loading states and completion

### Error Testing (when tests are added)

```typescript
// Pattern for context error handling
it("should throw when hook used outside provider", () => {
  expect(() => {
    // Call hook outside provider
  }).toThrow("useHabits must be used within a HabitsProvider");
});

// Pattern for API error handling
it("should throw on non-ok response", async () => {
  // Mock fetch to return 404
  // Call apiRequest
  // Expect thrown error with status
});
```

**Current error handling in code:**
- Contexts throw descriptive errors when used outside providers
- `throwIfResNotOk()` throws with `${status}: ${message}` format
- Try-catch used in data loading with fallback defaults
- ErrorBoundary catches and displays render errors

### Testing Async Storage

```typescript
// Future test pattern for context persistence
it("should persist habits to AsyncStorage", async () => {
  const mockSetItem = jest.spyOn(AsyncStorage, "setItem");
  // Trigger habit update
  // Assert AsyncStorage.setItem called with HABITS_KEY
  expect(mockSetItem).toHaveBeenCalledWith(HABITS_KEY, expect.any(String));
});
```

**Contexts with AsyncStorage persistence:**
- `lib/habits-context.tsx` - Persists to HABITS_KEY, LOGS_KEY, REVIEWS_KEY
- `lib/theme-context.tsx` - Persists to THEME_STORAGE_KEY, WEEK_START_KEY
- `lib/identity-context.tsx` - Likely persists identity state
- All use `JSON.stringify()`/`JSON.parse()` with try-catch

## Critical Areas Lacking Tests

**High Priority (complex logic):**
- Habit streak calculation logic in `lib/habits-context.tsx` (lines 178-221)
- Habit completion and uncomplete flows (complex state updates)
- Week data array manipulation and day index calculation
- AsyncStorage serialization/deserialization error handling

**Medium Priority:**
- API request flow and error handling in `lib/query-client.ts`
- Server middleware (CORS, body parsing, logging)
- Zod schema validation for User and InsertUser

**Low Priority:**
- UI component rendering (can be visual tested via Expo)
- Navigation routing (can be manual tested)
- Theme toggling (simple state logic)

---

*Testing analysis: 2026-02-16*

**Note:** This codebase would significantly benefit from test coverage, especially for:
1. Complex context logic (habits, identity, premium)
2. AsyncStorage persistence layers
3. API request/response handling
4. Data validation schemas
