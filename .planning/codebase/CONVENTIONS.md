# Coding Conventions

**Analysis Date:** 2026-02-16

## Naming Patterns

**Files:**
- PascalCase for components: `ErrorBoundary.tsx`, `ErrorFallback.tsx`, `KeyboardAwareScrollViewCompat.tsx`
- camelCase for non-component files: `query-client.ts`, `habits-context.tsx`, `theme-context.tsx`
- Kebab-case for route segments: `guided-builder.tsx`, `add-habit.tsx`, `edit-habit.tsx`
- Special route files with plus prefix: `+native-intent.tsx`, `+not-found.tsx`

**Functions:**
- camelCase for all functions: `getApiUrl()`, `throwIfResNotOk()`, `apiRequest()`, `generateId()`, `getTodayStr()`
- Prefix helper functions with descriptive verbs: `get`, `set`, `add`, `remove`, `increment`, `update`
- Provider components named as `{Name}Provider`: `ThemeProvider`, `HabitsProvider`, `IdentityProvider`, `PremiumProvider`
- Hook functions prefixed with `use`: `useTheme()`, `useHabits()`, `useIdentity()`, `usePremium()`

**Variables:**
- camelCase for all variables and constants: `const HABITS_KEY = "tinywins_habits"`, `const isDark = colorScheme === "dark"`
- UPPER_SNAKE_CASE for constants that are never reassigned: `MONTH_LABELS`, `HABITS_KEY`, `LOGS_KEY`, `REVIEWS_KEY`, `THEME_STORAGE_KEY`, `DEFAULT_HABITS`
- Descriptive names for state: `isLoaded`, `isDark`, `fontsLoaded`, `isLocalhost`
- Descriptive names for handler functions: `handleRestart()`, `resetError()`, `persistHabits()`, `persistLogs()`

**Types:**
- PascalCase for all type and interface names: `ErrorBoundaryProps`, `ErrorFallbackProps`, `HabitVersions`, `ImplementationIntention`, `Habit`, `HabitLog`, `ReviewLog`, `IdentityArea`, `ThemeMode`, `CueType`, `VersionLevel`, `WeekStartDay`, `User`, `InsertUser`, `IStorage`, `ThemeColors`
- Suffix props types with `Props`: `ErrorBoundaryProps`, `ErrorFallbackProps`
- Prefix interfaces with `I` for protocol/contract types: `IStorage`

## Code Style

**Formatting:**
- Tool: ESLint via `eslint-config-expo` (Expo's built-in linting)
- Configuration: `eslint.config.js` uses flat config format with `defineConfig`
- No Prettier config detected; uses ESLint's built-in formatting recommendations
- Default indentation is 2 spaces
- Line length appears to be around 80-100 characters (based on code samples)

**Linting:**
- Uses ESLint 9.31.0 with Expo's configuration
- Run: `npm run lint` to check
- Run: `npm run lint:fix` to auto-fix issues
- Ignores `dist/*` directory

## Import Organization

**Order:**
1. External packages (React, React Native, Expo): `import React from "react"`, `import { View } from "react-native"`
2. Third-party libraries: `import { QueryClientProvider } from "@tanstack/react-query"`, `import AsyncStorage from "@react-native-async-storage/async-storage"`
3. Internal absolute imports: `import { useTheme } from "@/lib/theme-context"`, `import { ErrorBoundary } from "@/components/ErrorBoundary"`
4. Type imports: `import type { User, InsertUser } from "@shared/schema"`

**Path Aliases:**
- `@/*` - Maps to root directory (configured in `tsconfig.json`)
- `@shared/*` - Maps to `./shared/` directory (configured in `tsconfig.json`)
- Used throughout: `import { useTheme } from "@/lib/theme-context"`, `import { type User } from "@shared/schema"`

## Error Handling

**Patterns:**
- Throw descriptive Error objects with messages: `throw new Error("EXPO_PUBLIC_DOMAIN is not set")`
- Use `throw new Error()` for validation failures and missing context
- Custom hooks throw errors when not used within required providers: `throw new Error("useTheme must be used within a ThemeProvider")`
- Try-catch blocks used minimally, primarily in data loading: `try { setHabits(JSON.parse(storedHabits)); } catch { setHabits(DEFAULT_HABITS); }`
- Error fallback component (`ErrorFallback.tsx`) displays error messages in dev and reload prompts in production
- Request errors include status codes: `throw new Error(`${res.status}: ${text}`)`

## Logging

**Framework:** console (no logging framework detected)

**Patterns:**
- Direct console.log used only in server code: `const log = console.log` in `server/index.ts`
- Server logs request info in standard format: `${req.method} ${path} ${res.statusCode} in ${duration}ms`
- No logging in client/app code; errors bubble to ErrorBoundary
- Request logging captures JSON responses when available
- Logs truncated at 80 characters with ellipsis

## Comments

**When to Comment:**
- JSDoc blocks for public functions and exports: `/** Gets the base URL for the Express API server (e.g., "http://localhost:3000") */`
- Inline comments for non-obvious logic: `// Allow localhost origins for Expo web development (any port)`
- Comments explain "why" not "what": code should be self-documenting via naming

**JSDoc/TSDoc:**
- Used for public functions: `/** Gets the base URL for the Express API server ... @returns {string} The API base URL */`
- Includes parameter and return type info
- Comments placed directly above function definition

## Function Design

**Size:** Functions are concise, typically 5-50 lines. Helper functions extracted when logic becomes complex.

**Parameters:**
- Single parameter objects preferred over multiple parameters: `function serveLandingPage({ req, res, landingPageTemplate, appName })`
- Type annotations required for all parameters: `async function throwIfResNotOk(res: Response)`
- Destructuring used in parameter lists for clarity

**Return Values:**
- Async functions return Promise types: `Promise<Response>`, `Promise<User | undefined>`
- Function return types always annotated: `function getApiUrl(): string`
- Functions that conditionally return null explicitly type it: `Promise<User | undefined>`

## Module Design

**Exports:**
- Named exports for utilities and hooks: `export function useTheme()`, `export const getApiUrl()`
- Default exports for providers and components: `export default function RootLayout()`
- Type exports for interfaces and types: `export type Habit = ...`, `export interface IStorage { ... }`
- Barrel files (index files) not used; direct imports from specific files

**Barrel Files:** Not used in this codebase. Imports are direct to specific module files.

---

*Convention analysis: 2026-02-16*
