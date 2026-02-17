# Architecture

**Analysis Date:** 2026-02-16

## Pattern Overview

**Overall:** Multi-tier client-server architecture with React Native frontend (Expo), context-based state management, and Node.js Express backend.

**Key Characteristics:**
- File-based routing via Expo Router with layout hierarchy
- Client-side state persisted to AsyncStorage (no backend data sync)
- Context API for global state (Theme, Identity, Habits, Premium)
- Server provides manifest/asset serving and API routing scaffold
- Monorepo structure: frontend (app/, components/, lib/) and backend (server/) share package.json

## Layers

**Presentation Layer:**
- Purpose: UI components and screen implementations
- Location: `app/`, `components/`
- Contains: Screens (routes), layouts, custom components (ErrorBoundary, KeyboardAwareScrollViewCompat)
- Depends on: Context providers, theme colors, React Native libraries
- Used by: Root layout and router

**State Management Layer:**
- Purpose: Global state for themes, habits, identity, premium features
- Location: `lib/`
- Contains: Context providers (ThemeProvider, HabitsProvider, IdentityProvider, PremiumProvider) and query client setup
- Depends on: AsyncStorage for persistence, React hooks
- Used by: All screens via hooks (useHabits, useTheme, useIdentity, usePremium)

**Data Persistence Layer:**
- Purpose: Local storage and query client configuration
- Location: `lib/query-client.ts`, AsyncStorage API calls in context files
- Contains: React Query configuration, API request utilities, AsyncStorage key management
- Depends on: AsyncStorage, Expo modules, react-query
- Used by: Context providers and screens

**Server Layer:**
- Purpose: Express server for manifest routing, asset serving, API registration
- Location: `server/`
- Contains: Server entry point (`server/index.ts`), route registration (`server/routes.ts`), storage utilities
- Depends on: Express, Drizzle ORM setup
- Used by: Client via API calls from `lib/query-client.ts`

**Shared Layer:**
- Purpose: Cross-platform schema and type definitions
- Location: `shared/`
- Contains: Database schema with Drizzle ORM, Zod validation
- Depends on: Drizzle ORM, Zod
- Used by: Server for type safety

**Constants Layer:**
- Purpose: App-wide static values
- Location: `constants/`
- Contains: Theme colors (light/dark), identity categories
- Used by: Context providers and screens

## Data Flow

**App Initialization:**

1. Root layout (`app/_layout.tsx`) loads fonts via useFonts
2. Providers wrap application in order: ErrorBoundary → QueryClientProvider → ThemeProvider → PremiumProvider → IdentityProvider → HabitsProvider
3. Root index (`app/index.tsx`) checks onboarding completion in AsyncStorage
4. Redirects to onboarding flow or main tabs

**Habit Management:**

1. Screens call methods from `useHabits()` hook (addHabit, updateHabit, completeHabit)
2. HabitsProvider updates state and persists to AsyncStorage
3. Habit logs tracked separately (`HabitLog[]`) for evidence and streak tracking
4. Weekly data and streaks computed in real-time during completion

**Theme & Appearance:**

1. ThemeProvider loads theme preference and week start day from AsyncStorage
2. All screens consume `useTheme()` to get colors, isDark flag, and setter functions
3. Colors object switches between darkTheme and lightTheme based on mode

**Identity & Onboarding:**

1. IdentityProvider stores selected identity areas and identity statement
2. Habit creation can associate habits with identity areas via habitAreaId
3. Onboarding flow (12 screens) guides user through four laws and identity selection

**Premium Features:**

1. PremiumProvider manages premium state (currently mock implementation)
2. Habit creation checks `canCreateHabit()` against free tier limit (10 habits)
3. Feature access checked via `isFeatureLocked()` for cloud sync, advanced analytics, etc.

**State Management:**
- All state changes trigger AsyncStorage writes for persistence
- No network syncing—data lives entirely on device
- Each context manages its own AsyncStorage keys and serialization

## Key Abstractions

**Context Providers:**
- Purpose: Encapsulate global state and provide hook-based access
- Examples: `lib/theme-context.tsx`, `lib/habits-context.tsx`, `lib/identity-context.tsx`, `lib/premium-context.tsx`
- Pattern: React Context + useState + useCallback for side-effect-free updates + AsyncStorage persistence

**Habit Entity:**
- Purpose: Represents a trackable habit with metadata and progress
- Fields: id, title, icon, goal, unit, frequency, streak tracking, weekly data, implementation intention, stack anchor, versions
- Used across screens for display, editing, and completion

**HabitLog Entity:**
- Purpose: Timestamped record of habit completion or miss
- Fields: id, habitId, date (YYYY-MM-DD), status (done/missed/partial), evidence, reflection, timestamp
- Used for evidence display, review analytics, streak calculations

**ReviewLog Entity:**
- Purpose: Weekly review reflection
- Fields: weekStart, whatWorked, whatDidnt, lawFailed, adjustments, habitRatings
- Used in review tab for historical insights

**Query Client Wrapper:**
- Purpose: Configure React Query for API communication
- Location: `lib/query-client.ts`
- Pattern: getQueryFn() factory returns QueryFunction with 401 behavior configuration

## Entry Points

**Mobile App Entry:**
- Location: `app/_layout.tsx`
- Triggers: App launch via Expo Router
- Responsibilities: Load fonts, initialize providers, set up root navigation stack

**Web/Landing Entry:**
- Location: `server/index.ts`
- Triggers: HTTP request to root or /manifest
- Responsibilities: Serve landing page HTML or Expo manifest based on platform header

**Onboarding Entry:**
- Location: `app/(onboarding)/_layout.tsx` and screens within `app/(onboarding)/`
- Triggers: First app launch (no onboarding_completed flag)
- Responsibilities: 12-screen guided flow through identity, four laws, habit stacking

**Main App Entry:**
- Location: `app/(tabs)/_layout.tsx`
- Triggers: Post-onboarding
- Responsibilities: Bottom tab navigation (Dashboard, Today, Evidence, Review, Settings)

## Error Handling

**Strategy:** Error boundary wrapper + custom error component + console logging

**Patterns:**
- `components/ErrorBoundary.tsx`: React error boundary catching render errors
- `components/ErrorFallback.tsx`: User-facing error UI with reset option
- Server error handler in `server/index.ts`: Catches unhandled Express errors, logs to console
- API failures: Query client retries disabled; errors thrown to caller

## Cross-Cutting Concerns

**Logging:** Console.log used throughout (no structured logging framework)

**Validation:** Zod schemas in `shared/schema.ts` for user/auth validation; ad-hoc validation in components

**Authentication:** Not yet implemented; server routes placeholder with no auth middleware

**Theming:** ThemeContext provides dark/light mode switching; colors object injected into all screens via useTheme hook

---

*Architecture analysis: 2026-02-16*
