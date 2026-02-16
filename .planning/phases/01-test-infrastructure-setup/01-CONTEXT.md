# Phase 1: Test Infrastructure Setup - Context

**Gathered:** 2026-02-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Jest + RNTL test runner configured with custom render wrapper wrapping all 4 context providers, native module mocks, coverage reporting at 70% threshold, and a smoke test proving the entire infrastructure works end-to-end. Co-located test files (.test.tsx). No actual component extraction or feature testing — just the foundation.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion

All implementation decisions for this phase are at Claude's discretion. The user trusts Claude to make the right calls based on codebase analysis and best practices. Key areas where Claude should make informed choices:

**Mock strategy:**
- Which native modules to mock upfront vs. defer to later phases (AsyncStorage is required; others based on what the codebase imports)
- Mock file organization (single setup file vs. organized __mocks__ directory)
- AsyncStorage mock reset strategy (per-test isolation vs. per-describe-block persistence)
- Mock fidelity per module (silent no-ops vs. jest.fn() call tracking)

**Render wrapper design:**
- Default provider state (empty/fresh vs. pre-seeded with sample data)
- Whether to support per-provider overrides in the render API
- File location (lib/test-utils.tsx per TINF-03 requirement, or alternative based on project structure)
- Whether to re-export @testing-library/react-native for single-import convenience

**Coverage rules:**
- Per-file vs. overall project threshold enforcement
- Which coverage metrics to enforce (lines, branches, functions, statements)
- Directory and file type exclusions
- Report output format (terminal only vs. terminal + HTML)

**Smoke test scope:**
- Target component (full screen vs. simpler component that still exercises providers)
- Interaction depth (render-only vs. render + simulate user action)
- Test data strategy (pre-seeded AsyncStorage vs. empty state)
- Test file location (co-located vs. separate infrastructure test folder)

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches. The user wants Claude to analyze the codebase and make informed decisions based on:
- What native modules the app actually imports
- How the 4 context providers are structured and nested
- RNTL and Jest best practices for React Native + Expo
- What will serve downstream phases (utility extraction, component extraction, integration tests) best

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-test-infrastructure-setup*
*Context gathered: 2026-02-16*
