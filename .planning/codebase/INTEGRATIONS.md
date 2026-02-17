# External Integrations

**Analysis Date:** 2026-02-16

## APIs & External Services

**No Third-Party APIs Detected:**
- The codebase does not currently integrate with external API services (Stripe, Auth0, Firebase, etc.)
- All data exchange is handled through the internal Express server
- Custom API endpoints would be added to `server/routes.ts`

## Data Storage

**Databases:**
- PostgreSQL (primary database)
  - Connection: Via `DATABASE_URL` environment variable
  - Client: `pg` 8.16.3 (native Node.js PostgreSQL driver)
  - ORM: Drizzle ORM 0.39.3
  - Configuration: `drizzle.config.ts` points to `shared/schema.ts` for type definitions
  - Migrations: Managed by Drizzle Kit, stored in `./migrations/` directory
  - Migration command: `npm run db:push`
  - Current schema: Users table with `id`, `username`, `password` fields

**Local Storage:**
- AsyncStorage 2.2.0
  - Used in: `app/index.tsx`, `lib/` context files
  - Purpose: Persistent local app state on client (onboarding status, habits, logs)
  - Key examples:
    - `tinywins_fresh_v1` - Fresh install detection
    - `onboarding_completed` - Onboarding completion status
    - Habits and logs data stored locally in JSON via AsyncStorage

**In-Memory Storage:**
- MemStorage class in `server/storage.ts`
  - Implements `IStorage` interface (getUser, createUser, getUserByUsername)
  - Currently uses in-memory Map for users (not persistent)
  - Located: `server/storage.ts`
  - Usage: Exported as `storage` singleton

**File Storage:**
- Local filesystem only
  - Assets served from `./assets/` directory
  - Static builds from `./static-build/` directory
  - No cloud storage integration (AWS S3, Firebase Storage, etc.)

**Caching:**
- React Query (TanStack React Query 5.83.0)
  - Client-side server state caching and synchronization
  - Configuration in `lib/query-client.ts`
  - Settings: `refetchInterval: false`, `refetchOnWindowFocus: false`, `staleTime: Infinity`
  - Used for managing data fetched from Express API

## Authentication & Identity

**Auth Provider:**
- Custom implementation (no external auth service)
- Identity context: `lib/identity-context.tsx`
- Simple username/password model (schema in `shared/schema.ts`)
- No OAuth, SSO, or third-party authentication
- Credentials stored in PostgreSQL users table

**Session Management:**
- Not currently implemented
- No JWT, session tokens, or session storage detected
- API requests include `credentials: "include"` for cookie-based auth (not implemented)

## Networking & API Communication

**HTTP Client:**
- Expo Fetch (native Fetch API from Expo)
  - Location: `lib/query-client.ts`
  - Used for all API requests from client to Express server

**API Routing:**
- Express 5.0.1 server
  - Location: `server/index.ts`
  - Port: Configurable via `PORT` env var (defaults to 5000)
  - Routes defined in: `server/routes.ts` (currently empty, ready for implementation)
  - CORS enabled for Replit and localhost origins
  - All API routes prefixed with `/api`

**Server-Client Communication:**
- Base URL construction: `https://${EXPO_PUBLIC_DOMAIN}`
- Request method: `fetch()` with JSON content-type
- Error handling: HTTP status code checking with `throwIfResNotOk()`
- Special handling for 401 Unauthorized responses

**WebSocket:**
- ws 8.18.0 library installed but not actively used
- Available for real-time features if needed in future

## File Serving

**Static File Service:**
- Expo manifest files served with special headers for native apps
- Asset serving from `./assets/` directory
- Static build serving from `./static-build/` directory
- Landing page template: `server/templates/landing-page.html`

**Platform-Specific Manifests:**
- iOS manifest: `static-build/ios/manifest.json`
- Android manifest: `static-build/android/manifest.json`
- Web app static files: `static-build/web/` and web assets

## Monitoring & Observability

**Error Tracking:**
- Not detected (no Sentry, LogRocket, or similar)
- Error boundary implemented: `components/ErrorBoundary.tsx`
- Basic console logging in server

**Logging:**
- Console-based logging in `server/index.ts`
  - Request logging: Method, path, status code, duration, response JSON
  - Errors logged to stderr via `console.error()`
  - App logging: `const log = console.log;`

**No external logging service detected:**
- No structured logging to CloudWatch, Datadog, or similar services

## CORS & Cross-Origin Configuration

**CORS Setup:** (in `server/index.ts`)
- Allowed origins:
  - Replit dev domain: `https://${REPLIT_DEV_DOMAIN}`
  - Replit production domains: `https://${REPLIT_DOMAINS}` (comma-separated)
  - Localhost: Any `http://localhost:*` or `http://127.0.0.1:*`
- Allowed methods: GET, POST, PUT, DELETE, OPTIONS
- Allowed headers: Content-Type
- Credentials: true (for cookie-based auth if implemented)

## CI/CD & Deployment

**Hosting:**
- Replit (primary target platform)
  - Environment variables: `REPLIT_DEV_DOMAIN`, `REPLIT_DOMAINS`
  - Development command: `npm run expo:dev` with Replit proxy
  - Production: Served static builds with Express backend

**Build Process:**
- Expo CLI for React Native bundle
  - Static build: `npm run expo:static:build`
  - Dev build: `npm run expo:start:static:build`
- esbuild for Node.js server: `npm run server:build`
  - Output: `server_dist/index.js` (ESM format)
  - Platform: Node.js
  - External packages preserved

**No External CI/CD Detected:**
- No GitHub Actions, GitLab CI, Travis CI, or similar
- Manual deployment via Replit

## Webhooks & Callbacks

**Incoming Webhooks:**
- Not detected (no external service webhook handlers)

**Outgoing Webhooks:**
- Not detected (no calls to external webhook endpoints)

**Deep Linking:**
- Expo Linking 8.0.10 configured
- Scheme: `myapp` (defined in `app.json`)
- Used for app-to-app communication
- No external webhook service integration

## Environment-Specific Configuration

**Development:**
- `NODE_ENV=development`
- Expo dev server with local proxy
- localhost origins allowed in CORS

**Production:**
- `NODE_ENV=production`
- Static builds served with Express
- Replit domain origins in CORS
- Server compiled to ESM bundle

---

*Integration audit: 2026-02-16*
