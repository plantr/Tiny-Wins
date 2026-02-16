# Phase 4: Integration Tests & Quality Gates - Context

**Gathered:** 2026-02-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Test context providers (HabitsProvider, ThemeProvider, IdentityProvider, PremiumProvider) with AsyncStorage persistence, verify multi-component workflows, and raise coverage threshold to 80%. No new features — purely testing existing behavior and enforcing quality gates.

</domain>

<decisions>
## Implementation Decisions

### Coverage threshold strategy
- Use per-path thresholds at 80% (continuing the pattern established in Phases 1-3)
- Raise the global coverage floor higher than the current 15-17% to reflect accumulated test coverage
- Claude's discretion on whether to retroactively raise Phase 3 component thresholds from 70% to 80% or keep them separate
- Claude's discretion on handling coverage conflicts with untested files (exempt vs stub tests)

### Claude's Discretion
- **Provider test depth:** Claude assesses each provider's complexity and allocates testing depth accordingly (happy path + edges for complex providers, lighter for simple ones)
- **Test style:** Claude decides whether to verify data shape contracts, behavioral correctness, or both — based on what makes tests most useful and resilient
- **Provider priority:** Claude determines which providers get deeper coverage based on complexity assessment
- **PremiumProvider limit testing:** Claude decides whether to test exact limit (10) or limit concept
- **Workflow test layer:** Claude picks whether to render full components or test at provider-level logic for the habit completion flow
- **Workflow failure scenarios:** Claude determines if testing failure mid-flow adds value
- **Additional workflows:** Claude assesses which workflows (beyond habit completion) give the most value within scope
- **Visual vs data assertions:** Claude picks based on what Phase 3 component tests already cover
- **App restart simulation:** Claude picks unmount/remount vs fresh render based on what works with existing test-utils
- **Storage pre-seeding:** Claude decides based on what success criteria require
- **Hydration helper:** Claude picks helper function vs inline waitFor based on test count
- **Storage format verification:** Claude decides based on serialization risk

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches. The user trusts Claude's judgement across all four discussion areas (provider depth, workflow realism, AsyncStorage simulation, and most coverage details).

The one locked decision: per-path thresholds at 80% with a raised global floor.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-integration-tests-quality-gates*
*Context gathered: 2026-02-16*
