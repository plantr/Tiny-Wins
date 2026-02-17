# Tiny Wins - Replit Agent Guide

## Overview

Tiny Wins is a habit tracking mobile application built with Expo (React Native) for the frontend and Express.js for the backend API server. The app features a dark-themed UI with animated habit tracking, daily progress views, and statistics. It runs on iOS, Android, and web platforms. The project uses a monorepo structure where the Expo mobile app and Express API server coexist, with a shared schema layer between them.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend (Expo / React Native)
- **Framework**: Expo SDK 54 with expo-router v6 for file-based routing
- **Navigation**: Tab-based layout using `app/(tabs)/` directory with two main screens: Activity (index) and Stats
- **State Management**: TanStack React Query for server state; no dedicated client state library
- **Animations**: react-native-reanimated for smooth animations (bar charts, progress indicators)
- **UI**: Custom dark theme defined in `constants/colors.ts`, Inter font family via `@expo-google-fonts/inter`, expo-linear-gradient for gradient effects
- **Platform Support**: iOS, Android, and web (with platform-specific handling via `Platform.OS` checks)
- **Error Handling**: Custom ErrorBoundary class component wrapping the entire app

### Backend (Express.js)
- **Server**: Express v5 running on port 5000 (configured in `server/index.ts`)
- **API Pattern**: All routes should be prefixed with `/api` (registered in `server/routes.ts`)
- **CORS**: Dynamic CORS configuration supporting Replit domains and localhost for development
- **Storage**: Currently uses in-memory storage (`MemStorage` class in `server/storage.ts`) with an `IStorage` interface designed for easy swapping to a database-backed implementation

### Database Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema**: Defined in `shared/schema.ts` — currently has a `users` table with id (UUID), username, and password
- **Validation**: drizzle-zod for generating Zod schemas from Drizzle table definitions
- **Migrations**: Output to `./migrations` directory, managed via `drizzle-kit push` command
- **Connection**: Uses `DATABASE_URL` environment variable for PostgreSQL connection
- **Note**: The storage layer currently uses in-memory maps (`MemStorage`), not yet wired to the PostgreSQL database via Drizzle. When adding database features, switch from `MemStorage` to a `DatabaseStorage` class that uses Drizzle queries.

### Shared Layer
- `shared/schema.ts` contains database schemas and types shared between frontend and backend
- Path alias `@shared/*` maps to `./shared/*`
- Path alias `@/*` maps to project root

### API Communication
- Frontend uses `lib/query-client.ts` with helper functions `apiRequest()` and `getQueryFn()` to communicate with the Express backend
- Base URL is derived from `EXPO_PUBLIC_DOMAIN` environment variable
- All API calls use HTTPS with credentials included

### Build & Development
- **Dev mode**: Runs Expo dev server and Express server concurrently (`expo:dev` and `server:dev` scripts)
- **Production build**: Expo static build via custom `scripts/build.js`, Express server bundled with esbuild
- **TypeScript**: Strict mode enabled, path aliases configured in `tsconfig.json`
- **Post-install**: Uses patch-package for dependency patches

## External Dependencies

### Core Services
- **PostgreSQL**: Database (connected via `DATABASE_URL` environment variable)
- **Replit**: Hosting platform with domain configuration via `REPLIT_DEV_DOMAIN` and `REPLIT_DOMAINS`

### Key NPM Packages
- **expo** (~54.0.27): Mobile app framework
- **expo-router** (~6.0.17): File-based routing with typed routes
- **express** (^5.0.1): Backend API server
- **drizzle-orm** (^0.39.3): Database ORM for PostgreSQL
- **drizzle-kit**: Database migration tooling
- **@tanstack/react-query** (^5.83.0): Data fetching and caching
- **react-native-reanimated** (~4.1.1): Animations
- **react-native-gesture-handler** (~2.28.0): Gesture handling
- **react-native-keyboard-controller** (^1.20.6): Keyboard management
- **expo-haptics**: Haptic feedback on native platforms
- **expo-linear-gradient**: Gradient UI components
- **pg** (^8.16.3): PostgreSQL client driver
- **zod**: Schema validation (used with drizzle-zod)
- **esbuild**: Server bundling for production