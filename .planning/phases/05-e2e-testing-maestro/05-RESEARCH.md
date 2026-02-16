# Phase 5: E2E Testing with Maestro - Research

**Researched:** 2026-02-16
**Domain:** Mobile E2E UI testing with Maestro for Expo managed workflow apps
**Confidence:** HIGH

## Summary

Maestro is officially compatible with Expo managed workflows and React Native New Architecture (including Bridgeless mode as of Nov 2025). It uses YAML-based flow definitions to automate UI testing on iOS simulators and Android emulators without requiring app ejection. Maestro's design philosophy emphasizes modular, reusable flows over monolithic test scripts, with built-in automatic waiting/retry mechanisms that minimize flakiness.

For Expo managed workflow apps with New Architecture enabled (like this project), Maestro provides a production-ready solution. The framework supports both testID and text-based element selection, with testID being the recommended approach for stability and performance. State seeding requires creative workarounds (helper scripts or bundled JavaScript with GraalJS) since Maestro doesn't directly manipulate AsyncStorage.

**Primary recommendation:** Use standalone flows per user journey (habit creation, completion, review), leverage testID selectors for reliability, pre-seed AsyncStorage via Node.js helper script before test execution, and combine flows into a single npm script orchestrated by shell logic.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Flow design:**
- Skip onboarding E2E flow — focus on core habit flows (creation, completion, review)

**Test assertions:**
- Capture screenshots at key checkpoints for visual debugging on failure

**App state setup:**
- Pre-seed data into AsyncStorage before flows (not fresh-from-scratch)

**Execution model:**
- Flows must work on both iOS simulator and Android emulator
- Combined script: single npm command that starts Expo, waits for ready, runs Maestro, and cleans up

### Claude's Discretion

- Flow architecture (standalone vs chained)
- Happy path vs error path coverage per flow
- Element identification strategy (text vs testID)
- Wait/timing strategy for animations
- State seeding mechanism
- Reset strategy between flows
- CI configuration (if practical)
- Retry behavior on failure

### Research Directives from User

- **Weekly review flow:** Investigate whether the review screen requires habit completion data to function
  - **Finding:** Review screen (app/(tabs)/review.tsx) uses `logs.filter((l) => l.date >= weekStart)` to calculate `completedThisWeek` and `missedThisWeek`. It also builds `habitScores` from weekly logs. The screen works without logs but shows zero completion — pre-seeding logs makes tests more realistic.

- **New Architecture + Maestro compatibility:** Investigate compatibility concern noted in STATE.md
  - **Finding:** Officially confirmed compatible as of Nov 2025. React Native's own project uses Maestro to test New Architecture features. Minor view flattening may occur but is attributed to RN rendering, not Maestro.

- **Existing testIDs or debug flags:** Check codebase for testID usage
  - **Finding:** No production testIDs found in app code (only in test files). Phase 5 will need to add testID props to interactive elements before writing flows.

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope

</user_constraints>

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Maestro | Latest (CLI) | Mobile UI automation framework | Official Expo documentation recommends it; works with managed workflow; YAML-based flows are maintainable; built-in stability features reduce flakiness |
| Expo CLI | ~54.0.27 | Build development builds for simulator/emulator | Required for generating .app (iOS) and .apk (Android) files that Maestro tests against |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| wait-on | ^8.0.0 | Wait for Metro bundler readiness | Use in npm script to ensure Expo dev server is ready before Maestro runs |
| node (fs/path) | Built-in | AsyncStorage seeding helper script | Use to write test fixture data to AsyncStorage location before flows run |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Maestro | Detox | Detox requires bare workflow (ejection); rejected for managed workflow incompatibility |
| Maestro | Appium | Appium is lower-level, requires more boilerplate; Maestro's YAML syntax is more maintainable |
| Pre-seed with script | Maestro runScript with GraalJS | GraalJS can bundle npm packages but adds complexity; shell script is simpler for AsyncStorage file writes |

**Installation:**

```bash
# macOS installation (Homebrew recommended)
brew tap mobile-dev-inc/tap
brew install mobile-dev-inc/tap/maestro

# Or via curl
curl -fsSL "https://get.maestro.mobile.dev" | bash

# Supporting packages for npm script
npm install --save-dev wait-on
```

**Prerequisites:**
- Java 17 or higher
- Xcode 14+ with Command Line Tools (macOS)
- Android Studio with emulator configured

## Architecture Patterns

### Recommended Project Structure

```
.maestro/
├── config.yaml                    # Workspace configuration
├── flows/
│   ├── habit-creation.yaml       # Standalone flow: create habit
│   ├── habit-completion.yaml     # Standalone flow: complete habit
│   └── weekly-review.yaml        # Standalone flow: submit review
├── common/                        # Utility flows (excluded from execution)
│   └── login.yaml                # Reusable subflow (if needed later)
└── .env.local                     # Environment variables (optional)

scripts/
└── seed-e2e-data.js              # AsyncStorage seeding helper

package.json                       # npm scripts for E2E orchestration
```

### Pattern 1: Standalone Flows (Recommended)

**What:** Each flow tests a single user journey from start to finish, self-contained.

**When to use:** Default pattern for most scenarios. Maestro best practices strongly discourage monolithic flows. Each flow should represent one user intent.

**Example:**

```yaml
# .maestro/flows/habit-creation.yaml
appId: com.myapp
---
- launchApp
- tapOn:
    id: "add-habit-button"
- tapOn:
    id: "quick-add-option"
- inputText: "Morning meditation"
- tapOn:
    id: "save-habit-button"
- assertVisible: "Morning meditation"
- takeScreenshot: habit-created
```

**Why:** Maestro documentation explicitly states: "A Flow should test a single user scenario. If your flow is covering more than one user intent, it probably makes sense to break it up into multiple flows." Benefits: parallel execution, clearer failure reporting, easier maintenance.

### Pattern 2: Reusable Subflows

**What:** Extract common workflows (e.g., navigating to Today tab) into separate files invoked via `runFlow`.

**When to use:** Only when genuinely reusable across multiple flows (e.g., login, dismissing modals). Avoid premature abstraction.

**Example:**

```yaml
# .maestro/common/navigate-to-today.yaml
---
- tapOn:
    id: "today-tab"
- assertVisible: "today"

# .maestro/flows/habit-completion.yaml
appId: com.myapp
---
- launchApp
- runFlow: ../common/navigate-to-today.yaml
- tapOn:
    id: "habit-checkbox-morning-meditation"
- assertVisible: "1 day streak"
```

### Pattern 3: Environment-Based Configuration

**What:** Use environment variables for dynamic values (dates, habit titles) and config.yaml for execution control.

**When to use:** When flows need different data sets or when managing smoke tests vs full suite.

**Example:**

```yaml
# .maestro/config.yaml
flows:
  - 'flows/*'
includeTags:
  - core
executionOrder:
  continueOnFailure: false
  flowsOrder:
    - habit-creation.yaml
    - habit-completion.yaml
    - weekly-review.yaml

# .maestro/flows/habit-creation.yaml
appId: com.myapp
env:
  HABIT_TITLE: ${HABIT_TITLE || "Default Habit"}
---
- launchApp
- inputText: ${HABIT_TITLE}
```

### Pattern 4: AsyncStorage Seeding via Helper Script

**What:** Node.js script that writes test fixture JSON to AsyncStorage file location before Maestro runs.

**When to use:** Always for E2E tests requiring pre-populated data (habits, logs, reviews).

**Example:**

```javascript
// scripts/seed-e2e-data.js
const fs = require('fs');
const path = require('path');

const platform = process.argv[2]; // 'ios' or 'android'

const fixtureData = {
  habits: [
    { id: '1', title: 'Morning meditation', frequency: 'daily' }
  ],
  logs: [
    { habitId: '1', date: '2026-02-10', status: 'done' }
  ]
};

const asyncStoragePath = platform === 'ios'
  ? path.join(process.env.HOME, 'Library/Developer/CoreSimulator/Devices/[DEVICE_UUID]/data/Containers/Data/Application/[APP_UUID]/Library/Preferences/RCTAsyncLocalStorage')
  : '/path/to/android/emulator/storage';

fs.writeFileSync(
  path.join(asyncStoragePath, 'manifest.json'),
  JSON.stringify(fixtureData)
);
```

**Why:** Maestro runScript can execute JavaScript but AsyncStorage manipulation is complex. Helper scripts are simpler and more maintainable for file-based seeding.

### Anti-Patterns to Avoid

- **Monolithic flows:** Never chain all user journeys into a single YAML file. If one step fails, the entire test halts.
- **Index-based selectors:** Avoid `index: 2` for element selection; UI changes break tests. Prefer testID or descriptive text.
- **Hard-coded sleep statements:** Don't use `- wait: 5000` unless absolutely necessary. Maestro auto-waits; use `waitForAnimationToEnd` or assertions.
- **point(x, y) coordinates:** Screen size variations across devices break coordinate-based taps. Use testID or text selectors.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Waiting for elements | Custom polling loops | Maestro's built-in auto-wait + `assertVisible` | Maestro retries assertions automatically for 5-10 seconds; custom polling adds flakiness |
| Screenshot capture on failure | Manual try/catch screenshot logic | Maestro's automatic failure screenshots (v1.28.0+) | Maestro saves screenshots to `~/.maestro/tests/<datetime>/` on command failure |
| Element identification | XPath or accessibility tree traversal | testID props + Maestro `id:` selector | testID is locale-agnostic, fast, stable across UI changes |
| Test data management | In-flow data generation | Pre-seeded AsyncStorage + env variables | Deterministic state prevents flaky tests; env vars keep flows DRY |
| Multi-platform flows | Separate iOS/Android flow files | Single YAML with conditional logic (if needed) | Maestro's text/id selectors work cross-platform; share flows unless platform-specific UI differs |

**Key insight:** Maestro's design philosophy is "implementation agnostic" — it tests rendered UI, not internal state. Hand-rolling element waiters, retry logic, or screenshot capture duplicates built-in features and increases maintenance burden.

## Common Pitfalls

### Pitfall 1: App Launch Failures

**What goes wrong:** `maestro test` reports "Either the app is not installed or the appId is wrong."

**Why it happens:**
- Expo development builds use different bundle IDs than Expo Go
- appId in flow doesn't match actual installed app identifier
- App not installed on simulator/emulator

**How to avoid:**
- iOS: Run `xcrun simctl listapps booted | grep CFBundleIdentifier` to find exact bundle ID
- Android: Run `adb shell pm list packages | grep myapp` to verify package name
- Use bundle ID from app.json: `ios.bundleIdentifier` (com.myapp) and `android.package` (com.myapp)

**Warning signs:** Flow immediately fails at `launchApp` step with no UI screenshot.

### Pitfall 2: Unicode Text Input on Android

**What goes wrong:** `inputText` commands with emojis or special characters fail silently on Android.

**Why it happens:** Maestro's Android implementation only supports ASCII characters in `inputText`.

**How to avoid:**
- Stick to ASCII characters for cross-platform flows
- Test Unicode input separately on iOS if required
- Use text fixtures that avoid special characters

**Warning signs:** Text input works on iOS but fails on Android with no error.

### Pitfall 3: Accidental Double Taps

**What goes wrong:** `tapOn` fires twice, causing unexpected navigation or state changes.

**Why it happens:** Maestro retries tap if no hierarchy change is detected after the action.

**How to avoid:**
- Add `retryTapIfNoChange: false` to tap commands that shouldn't retry
- Example: `- tapOn: { id: "submit-button", retryTapIfNoChange: false }`

**Warning signs:** Navigation occurs twice, duplicate items created, or "already completed" errors.

### Pitfall 4: iOS Keyboard Hiding Unreliability

**What goes wrong:** `hideKeyboard` command sometimes fails to dismiss keyboard on iOS.

**Why it happens:** iOS has no native keyboard dismiss API; Maestro simulates by scrolling up/down from screen center. If keyboard blocks scrollable area, it fails.

**How to avoid:**
- Tap on a non-interactive area instead: `- tapOn: { point: "50%,10%" }`
- Or rely on app's native "Done" button with testID

**Warning signs:** Subsequent taps fail because keyboard obscures elements.

### Pitfall 5: Missing testIDs in Production Code

**What goes wrong:** Flows rely on text selectors that break when copy changes or app is localized.

**Why it happens:** Production code doesn't have testID props; tests written with text selectors for convenience.

**How to avoid:**
- Add testID props to all interactive elements before writing flows
- Use `testID="add-habit-button"` in React Native components
- Maestro selector: `- tapOn: { id: "add-habit-button" }`

**Warning signs:** Flows break after minor UI text changes, tests fail in non-English locales.

### Pitfall 6: WebView Content Not Visible

**What goes wrong:** Maestro can't find elements rendered inside WebViews.

**Why it happens:** Native accessibility APIs struggle with web-rendered content.

**How to avoid:**
- Add `androidWebViewHierarchy: devtools` to flow configuration for Android
- Use Chrome DevTools protocol for WebView element detection
- Avoid WebViews in critical E2E flows if possible

**Warning signs:** `assertVisible` fails despite element being visibly rendered.

### Pitfall 7: State Pollution Between Flows

**What goes wrong:** Second flow fails because first flow left app in unexpected state.

**Why it happens:** Flows run sequentially without app state reset; AsyncStorage persists data.

**How to avoid:**
- Clear app state before each flow: `- clearState` (Android) or `- eraseText` + navigation reset
- Or make flows idempotent (test works regardless of prior state)
- Reseed AsyncStorage between flows in npm script orchestration

**Warning signs:** Flows pass individually but fail when run in sequence.

## Code Examples

Verified patterns from official sources:

### Basic Flow Structure

```yaml
# Source: https://docs.maestro.dev/platform-support/react-native
appId: com.myapp
---
- launchApp
- tapOn: "Go"
- assertVisible: "Welcome"
```

### testID-Based Interaction (Recommended)

```yaml
# Source: https://docs.maestro.dev/platform-support/react-native
# React Native component:
# <Pressable testID="continue-button" onPress={handleContinue}>

- tapOn:
    id: "continue-button"
```

### Text Input with Assertions

```yaml
# Source: https://docs.maestro.dev/platform-support/react-native
- tapOn:
    id: "habit-title-input"
- inputText: "Morning meditation"
- assertVisible: "Morning meditation"
```

### Screenshot Capture at Checkpoints

```yaml
# Source: https://docs.maestro.dev/troubleshooting/debug-output
- tapOn:
    id: "save-habit-button"
- assertVisible: "Habit created"
- takeScreenshot: habit-saved
```

**Note:** Maestro automatically captures screenshots on command failure (v1.28.0+) to `~/.maestro/tests/<datetime>/`.

### Wait for Animations

```yaml
# Source: https://docs.maestro.dev/api-reference/commands/waitforanimationtoend
- tapOn:
    id: "submit-review-button"
- waitForAnimationToEnd:
    timeout: 3000
- assertVisible: "Review saved"
```

**Alternative:** Use `assertVisible` with implicit wait instead of explicit `waitForAnimationToEnd` for simpler flows.

### Environment Variables with Defaults

```yaml
# Source: https://docs.maestro.dev/advanced/parameters-and-constants
appId: com.myapp
env:
  HABIT_TITLE: ${HABIT_TITLE || "Default Habit"}
  COMPLETION_NOTE: ${COMPLETION_NOTE || "Completed via E2E test"}
---
- launchApp
- tapOn:
    id: "add-habit-button"
- inputText: ${HABIT_TITLE}
```

### Reusable Subflow with Parameters

```yaml
# .maestro/common/complete-habit.yaml
# Source: https://docs.maestro.dev/api-reference/commands/runflow
env:
  HABIT_ID: ${HABIT_ID}
---
- tapOn:
    id: "habit-checkbox-${HABIT_ID}"
- tapOn:
    id: "skip-evidence-button"

# .maestro/flows/habit-completion.yaml
- launchApp
- runFlow:
    file: ../common/complete-habit.yaml
    env:
      HABIT_ID: "morning-meditation"
```

### config.yaml for Sequential Execution

```yaml
# Source: https://docs.maestro.dev/api-reference/configuration/workspace-configuration
flows:
  - 'flows/*'
includeTags:
  - core
executionOrder:
  continueOnFailure: false
  flowsOrder:
    - habit-creation.yaml
    - habit-completion.yaml
    - weekly-review.yaml
```

### Combined npm Script Orchestration

```bash
# Source: Community best practices (Expo + Maestro integration)
# package.json
{
  "scripts": {
    "test:e2e:ios": "npm run test:e2e:seed ios && npm run test:e2e:build ios && npm run test:e2e:run ios",
    "test:e2e:seed": "node scripts/seed-e2e-data.js",
    "test:e2e:build": "eas build --profile development-simulator --platform ios --local && tar -xvzf build-*.tar.gz",
    "test:e2e:install": "xcrun simctl install booted *.app",
    "test:e2e:start": "npx expo start --dev-client & wait-on http://localhost:8081",
    "test:e2e:run": "maestro test .maestro/flows",
    "test:e2e:cleanup": "killall expo"
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Detox for RN E2E | Maestro for managed workflow | 2023 | Detox requires bare workflow; Maestro works with Expo managed workflow without ejection |
| Manual element waiting | Auto-wait + assertions | Maestro v1.0+ | Eliminates sleep() calls; tests are faster and more reliable |
| XPath selectors | testID + text selectors | Maestro design | Cross-platform compatibility; testID is locale-agnostic and stable |
| Rhino JS engine for runScript | GraalJS engine | Maestro v2.0 | Modern JS syntax, npm library support for complex scripting |
| Manual screenshot capture | Automatic on failure | Maestro v1.28.0 | Screenshots saved to ~/.maestro/tests/ on command failure |
| Expo Go testing | Development builds | Expo SDK 50+ | Maestro can't interact with Expo Go wrapper; requires dev builds (.app/.apk) |

**Deprecated/outdated:**
- **Maestro with Expo Go:** Expo Go shows dev menu instead of app when Maestro launches. Use development builds (`eas build --profile development-simulator`) instead.
- **--legacy-peer-deps for Maestro:** Not applicable; Maestro is CLI tool, not npm dependency.
- **Manual retry logic in flows:** Maestro's built-in auto-retry for assertions (5-10s) eliminates need for custom retry loops.

## Open Questions

1. **Simulator/Emulator Device ID Discovery**
   - What we know: iOS uses `xcrun simctl list` to find booted simulator; Android uses `adb devices`
   - What's unclear: Best way to automate device selection in npm script (default booted device vs specific UUID)
   - Recommendation: Use "booted" device implicitly for local dev; document manual emulator/simulator startup in README

2. **AsyncStorage Path Resolution**
   - What we know: iOS simulator stores AsyncStorage in `~/Library/Developer/CoreSimulator/Devices/[UUID]/data/Containers/Data/Application/[APP_UUID]/Library/Preferences/RCTAsyncLocalStorage`
   - What's unclear: How to programmatically resolve APP_UUID for seeding script
   - Recommendation: Use `xcrun simctl get_app_container booted com.myapp data` to find app container path dynamically

3. **CI/CD Feasibility for Managed Workflow**
   - What we know: Maestro Cloud supports CI integration; EAS Workflows can run Maestro tests
   - What's unclear: Whether local GitHub Actions runners can run iOS simulators for free tier
   - Recommendation: Start local-only; defer CI to Phase 5 stretch goal or post-roadmap iteration

4. **React Compiler + Maestro Interaction**
   - What we know: App has `reactCompiler: true` enabled; Maestro is implementation-agnostic (tests rendered UI)
   - What's unclear: Whether React Compiler optimizations affect element hierarchy for Maestro selectors
   - Recommendation: Test flows after Phase 5 implementation; React Compiler shouldn't affect testID or visible text

5. **Retry Strategy for Flaky Flows**
   - What we know: Maestro has built-in assertion retries; no native flow-level retry configuration
   - What's unclear: Whether to implement npm script retry wrapper or rely on manual re-runs
   - Recommendation: Start without retry; add retry wrapper (e.g., `npx retry-cli -n 3 'maestro test'`) only if flakiness emerges

## Sources

### Primary (HIGH confidence)

- Maestro Official Documentation - Platform Support (React Native): https://docs.maestro.dev/platform-support/react-native
- Maestro Official Documentation - Wait Commands: https://docs.maestro.dev/advanced/wait
- Maestro Official Documentation - Selectors: https://docs.maestro.dev/api-reference/selectors
- Maestro Official Documentation - Parameters & Constants: https://docs.maestro.dev/advanced/parameters-and-constants
- Maestro Official Documentation - Workspace Configuration: https://docs.maestro.dev/api-reference/configuration/workspace-configuration
- Maestro Official Documentation - runFlow Command: https://docs.maestro.dev/api-reference/commands/runflow
- Maestro Official Documentation - Known Issues: https://docs.maestro.dev/troubleshooting/known-issues
- Expo Official Documentation - E2E Tests with Maestro: https://docs.expo.dev/eas/workflows/examples/e2e-tests/
- GitHub Issue #2202 - New Architecture Compatibility (Closed Nov 2025): https://github.com/mobile-dev-inc/maestro/issues/2202

### Secondary (MEDIUM confidence)

- Maestro Blog - Best Practices: Structuring Your Test Suite: https://maestro.dev/blog/maestro-best-practices-structuring-your-test-suite
- Maestro Blog - Checklist for Designing Maintainable Test Flows: https://maestro.dev/insights/checklist-for-designing-maintainable-test-flows
- Maestro Blog - Pokedex UI Testing Series (Expo + Maestro): https://maestro.dev/blog/pokedex-ui-testing-series-getting-started-with-maestro-in-expo-react-native-part-1
- Maestro Blog - Running Maestro with Expo Development Builds: https://maestro.dev/blog/running-maestro-ui-tests-in-an-expo-development-builds
- Medium - E2E Testing in React Native with Maestro (Handling Test Data): https://medium.com/@paradiesvogel7/end-to-end-testing-in-react-native-with-maestro-handling-test-data-1a382b34bfc6
- OneUpTime Blog - How to Set Up E2E Testing for React Native with Maestro: https://oneuptime.com/blog/post/2026-01-15-react-native-maestro-testing/view

### Tertiary (LOW confidence)

- GitHub Examples - react-native-eas-maestro: https://github.com/lingvano/react-native-eas-maestro
- GitHub Examples - maestro-expo: https://github.com/MathieuFedrigo/maestro-expo

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official Expo docs recommend Maestro; confirmed New Architecture compatibility
- Architecture: HIGH - Official docs provide clear patterns; best practices blog posts align with docs
- Pitfalls: MEDIUM - Known issues documented officially; some workarounds community-driven
- AsyncStorage seeding: MEDIUM - No official Maestro guidance; approach based on React Native storage internals
- CI/CD integration: LOW - EAS Workflows documented but GitHub Actions setup untested for managed workflow

**Research date:** 2026-02-16
**Valid until:** 2026-03-16 (30 days for stable tooling)

---

**Next Steps for Planner:**
1. Create tasks for adding testID props to interactive elements (habit creation, completion, review screens)
2. Design AsyncStorage seeding script with fixture data (habits, logs, reviews)
3. Write three standalone flows: habit-creation.yaml, habit-completion.yaml, weekly-review.yaml
4. Configure workspace with config.yaml for sequential execution
5. Build npm script orchestration (seed → build → install → start → test → cleanup)
6. Verify flows run on both iOS simulator and Android emulator
