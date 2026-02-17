# Codebase Structure

**Analysis Date:** 2026-02-16

## Directory Layout

```
Tiny Wins/
├── app/                        # Expo Router screens and layouts (primary routes)
│   ├── _layout.tsx            # Root layout with providers
│   ├── index.tsx              # Onboarding check / entry screen
│   ├── +not-found.tsx         # 404 fallback
│   ├── +native-intent.tsx     # Native deep linking
│   ├── (tabs)/                # Tab-based main navigation
│   │   ├── _layout.tsx        # Tab layout and bottom tab bar
│   │   ├── index.tsx          # Today tab (habits for today)
│   │   ├── dashboard.tsx      # Dashboard view
│   │   ├── evidence.tsx       # Evidence/log history view
│   │   ├── review.tsx         # Weekly review tab
│   │   ├── stats.tsx          # Stats/analytics (hidden from nav)
│   │   └── settings.tsx       # User settings
│   ├── (onboarding)/          # Onboarding flow (modal group)
│   │   ├── _layout.tsx        # Onboarding stack layout
│   │   ├── welcome.tsx
│   │   ├── identity.tsx
│   │   ├── one-percent.tsx
│   │   ├── four-laws.tsx
│   │   ├── habit-stack.tsx
│   │   └── ready.tsx
│   ├── habit/[id].tsx         # Dynamic habit detail page
│   ├── add-habit.tsx          # Add habit modal
│   ├── edit-habit.tsx         # Edit habit modal
│   ├── guided-builder.tsx     # Guided habit builder modal
│   └── paywall.tsx            # Premium upgrade modal
├── components/                 # Reusable UI components
│   ├── ErrorBoundary.tsx      # React error boundary
│   ├── ErrorFallback.tsx      # Error UI component
│   └── KeyboardAwareScrollViewCompat.tsx  # Keyboard handling helper
├── lib/                        # Global state (contexts) and utilities
│   ├── query-client.ts        # React Query configuration and API helpers
│   ├── theme-context.tsx      # Theme (dark/light) and settings context
│   ├── habits-context.tsx     # Habits, logs, and reviews state
│   ├── identity-context.tsx   # User identity areas selection
│   └── premium-context.tsx    # Premium feature flags and paywall
├── shared/                     # Shared types and schemas (frontend + backend)
│   └── schema.ts              # Drizzle ORM schema and Zod validation
├── server/                     # Node.js Express backend
│   ├── index.ts               # Server entry point and middleware setup
│   ├── routes.ts              # Route registration (empty scaffold)
│   ├── storage.ts             # Storage utilities
│   └── templates/
│       └── landing-page.html  # Landing page template for web
├── constants/                  # App-wide static values
│   └── colors.ts              # Theme color definitions
├── assets/                     # Static assets (images, fonts)
│   └── images/
├── attached_assets/            # User-attached assets (large, not committed)
├── scripts/                    # Build scripts
│   └── build.js               # Static Expo build script
├── patches/                    # Patch-package patches for dependencies
├── .planning/                  # GSD planning documents
│   └── codebase/              # This directory
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── app.json                   # Expo app configuration
├── drizzle.config.ts          # Drizzle ORM configuration
├── metro.config.js            # React Native bundler config
├── babel.config.js            # Babel transpiler config
├── eslint.config.js           # ESLint rules
├── expo-env.d.ts              # Expo TypeScript definitions
└── replit.md                  # Replit deployment instructions
```

## Directory Purposes

**app/:**
- Purpose: File-based routing via Expo Router; all user-facing screens
- Contains: Route handlers (screens), layout definitions, modals
- Key files: `app/_layout.tsx` (root), `app/(tabs)/_layout.tsx` (main nav)

**components/:**
- Purpose: Reusable UI components shared across screens
- Contains: Error boundary, error UI, keyboard compatibility helpers
- Key files: `ErrorBoundary.tsx`, `ErrorFallback.tsx`

**lib/:**
- Purpose: Global state management via React Context and API/query utilities
- Contains: Context providers, hooks, query client configuration
- Key files: `theme-context.tsx`, `habits-context.tsx`, `query-client.ts`

**shared/:**
- Purpose: Types and schemas shared between frontend and backend
- Contains: Drizzle ORM table definitions, Zod validation schemas
- Key files: `schema.ts`

**server/:**
- Purpose: Node.js Express backend for asset serving and API routing
- Contains: Middleware setup, route registration, static file serving
- Key files: `server/index.ts` (entry), `server/routes.ts` (API scaffold)

**constants/:**
- Purpose: App-wide static values
- Contains: Theme color palettes (light/dark modes)
- Key files: `colors.ts`

**assets/:**
- Purpose: Static images and other media assets
- Contains: Image files for UI
- Key files: Directory structure organized by type

**scripts/:**
- Purpose: Build and deployment automation
- Contains: Custom build scripts for Expo static builds
- Key files: `build.js`

## Key File Locations

**Entry Points:**
- `app/_layout.tsx`: Root layout; initializes providers, fonts, navigation
- `app/index.tsx`: First-load check; redirects to onboarding or main tabs
- `server/index.ts`: Express server entry; middleware and route setup

**Configuration:**
- `package.json`: Dependencies, scripts, project metadata
- `tsconfig.json`: TypeScript compiler options and path aliases
- `app.json`: Expo app configuration (name, version, splash screen, etc.)
- `drizzle.config.ts`: Database connection and migration settings

**Core Logic:**
- `lib/habits-context.tsx`: Habit CRUD, logging, review management
- `lib/theme-context.tsx`: Theme state and persistence
- `lib/identity-context.tsx`: Identity area selection
- `lib/premium-context.tsx`: Feature flags and paywall state
- `lib/query-client.ts`: API client configuration and HTTP utilities

**Testing:**
- No test files detected in current structure

## Naming Conventions

**Files:**
- Screens/pages: camelCase.tsx (e.g., `add-habit.tsx`, `dashboard.tsx`)
- Components: PascalCase.tsx (e.g., `ErrorBoundary.tsx`, `ErrorFallback.tsx`)
- Utilities/contexts: camelCase.ts/tsx (e.g., `query-client.ts`, `theme-context.tsx`)
- Layouts: _layout.tsx (Expo Router convention)
- Dynamic routes: [param].tsx (e.g., `[id].tsx`)

**Directories:**
- Feature grouping: (feature-name)/ using Expo Router groups (e.g., `(tabs)/`, `(onboarding)/`)
- Logical grouping: lowercase plural (e.g., `components/`, `lib/`, `assets/`)

**Type/Interface Names:**
- PascalCase (e.g., `Habit`, `HabitLog`, `ReviewLog`, `ThemeColors`)
- Context hook names: useX (e.g., `useHabits()`, `useTheme()`)
- Provider components: XProvider (e.g., `ThemeProvider`, `HabitsProvider`)

**CSS/Styles:**
- StyleSheet objects: camelCase followed by `Styles` suffix
  - Example: `widgetStyles`, `weekStyles`, `versionStyles` (from `app/(tabs)/index.tsx`, `app/habit/[id].tsx`)

## Where to Add New Code

**New Feature (e.g., new tab or workflow):**
- Primary screen: `app/(feature-group)/screen-name.tsx`
- Layout (if grouped): `app/(feature-group)/_layout.tsx`
- Tests: None currently; would add `.test.ts` adjacent to source
- Context (if global state needed): `lib/feature-context.tsx`

**New Component:**
- Implementation: `components/ComponentName.tsx`
- Follow PascalCase naming
- Import theme via `useTheme()`, habits via `useHabits()` as needed
- Use StyleSheet.create() for styling with theme colors

**New Context (global state):**
- Location: `lib/feature-context.tsx`
- Pattern: createContext → Provider component → useX hook
- Persistence: Use AsyncStorage with dedicated key in SCREAMING_SNAKE_CASE
- Export both Provider and hook from same file

**Utilities/Helpers:**
- Shared API calls: `lib/query-client.ts` (extend getQueryFn or add new functions)
- Server routes: `server/routes.ts` (add new routes via registerRoutes)
- Constants: `constants/` (create new file if category-specific, e.g., `constants/habit-defaults.ts`)

**Adding backend API:**
- Register route in `server/routes.ts` with `/api/` prefix
- Use `apiRequest()` from `lib/query-client.ts` in frontend
- Define schema in `shared/schema.ts` for type safety

## Special Directories

**app/:**
- Purpose: Expo Router file-based routing
- Generated: No (manually created)
- Committed: Yes (source files)
- Note: () groups are non-navigable route segments; names become route segments

**static-build/:**
- Purpose: Generated static Expo bundles for web and native platforms
- Generated: Yes (via `expo:static:build` script)
- Committed: No (in .gitignore)
- Note: Served by server for manifest and assets

**attached_assets/:**
- Purpose: User-uploaded images and attachments
- Generated: Yes (at runtime via image picker)
- Committed: No (in .gitignore)
- Note: Large directory; not part of source code

**.planning/codebase/:**
- Purpose: GSD planning and analysis documents
- Generated: Automatically by GSD tools
- Committed: Yes (documentation)
- Note: Used by /gsd:plan-phase and /gsd:execute-phase

---

*Structure analysis: 2026-02-16*
