# Phase 5: E2E Testing with Maestro - Context

**Gathered:** 2026-02-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Configure Maestro for E2E testing against an Expo managed workflow app and write flows covering core user journeys: habit creation, daily completion, and weekly review. Onboarding flow excluded per user decision. Flows run on both iOS simulator and Android emulator.

</domain>

<decisions>
## Implementation Decisions

### Flow design
- Skip onboarding E2E flow — focus on core habit flows (creation, completion, review)
- Claude decides: standalone vs chained flows (pick what works best with Maestro)
- Claude decides: happy path only vs including error recovery per flow
- Weekly review flow: researcher should investigate whether the review screen requires habit completion data to function — user unsure

### Test assertions
- Capture screenshots at key checkpoints for visual debugging on failure
- Claude decides: assertion depth (verify specific content vs navigation-only) per flow
- Claude decides: element identification strategy (text-based vs testID) based on codebase state and Maestro best practices
- Claude decides: wait strategy (auto-wait vs explicit waits) based on app animation behavior

### App state setup
- Pre-seed data into AsyncStorage before flows (not fresh-from-scratch)
- Claude decides: seeding mechanism (helper script vs Maestro runScript) based on Expo/Maestro compatibility
- Claude decides: reset between flows or sequential execution
- Researcher should check: existing testIDs or debug flags in the codebase that could aid E2E testing

### Execution model
- Flows must work on both iOS simulator and Android emulator
- Combined script: single npm command that starts Expo, waits for ready, runs Maestro, and cleans up
- Claude decides: local-only vs CI-ready based on what's practical for Expo managed workflow
- Claude decides: retry strategy on flow failure

### Claude's Discretion
- Flow architecture (standalone vs chained)
- Happy path vs error path coverage per flow
- Element identification strategy (text vs testID)
- Wait/timing strategy for animations
- State seeding mechanism
- Reset strategy between flows
- CI configuration (if practical)
- Retry behavior on failure

</decisions>

<specifics>
## Specific Ideas

- STATE.md notes: "New Architecture + Maestro compatibility needs spike before Phase 5 flows" — researcher should investigate this compatibility concern
- User wants a combined npm script for running E2E tests (not manual Expo + Maestro separately)
- Screenshots at key points for failure debugging

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 05-e2e-testing-maestro*
*Context gathered: 2026-02-16*
