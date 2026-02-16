# Phase 2: Utility & Hook Extraction - Context

**Gathered:** 2026-02-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Extract duplicated logic (frequency parsing, time formatting, date helpers, ID generation) from monolithic screens (index.tsx, guided-builder.tsx, edit-habit.tsx) into shared, tested modules. Extract reusable hooks for shared screen logic. Screens import from shared modules instead of inlining. No behavior changes visible to users.

</domain>

<decisions>
## Implementation Decisions

### Module structure
- Claude's discretion on directory layout (lib/ flat vs lib/utils/ subfolder)
- Claude's discretion on file granularity (one file per concern vs grouped by domain)
- Claude's discretion on hook location (separate hooks/ dir vs alongside utilities)
- Claude's discretion on import style (barrel exports vs direct imports)

### Extraction scope
- Claude's discretion on whether to extract beyond the 4 named utilities if other duplication is found
- Claude's discretion on extracting single-use complex logic for testability
- Claude's discretion on separating pure data utils from display formatters
- Claude's discretion on TypeScript strictness level (match existing codebase conventions)

### Hook granularity
- Claude's discretion on hook size (one per screen vs many focused hooks)
- Claude's discretion on timing (which hooks belong in Phase 2 vs Phase 3)
- Claude's discretion on hook testing approach (renderHook vs through components)
- Claude's discretion on error model (hooks handle errors vs bubble up)

### Migration strategy
- **DECIDED: Write tests first** — Write tests for current inline behavior BEFORE extracting, then extract and confirm tests still pass
- **DECIDED: Comment out old code briefly** — Keep commented-out inline code for one commit as safety net, remove in follow-up cleanup
- **DECIDED: One commit per utility** — Each utility extraction gets its own atomic commit for easy individual revert
- **DECIDED: Verify app after each extraction** — Run the app after each extraction to spot-check behavior, don't just trust tests

### Claude's Discretion
Module structure decisions (directory layout, file organization, import patterns, hook location) — Claude has full flexibility to match existing codebase conventions.

Extraction scope decisions (what to extract, granularity, type strictness) — Claude judges based on actual duplication and complexity found in the code.

Hook design decisions (size, timing, testing approach, error model) — Claude picks based on what the codebase actually needs.

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches. User wants Claude to make implementation choices that fit the existing codebase patterns.

The key constraint: extraction must be safe. Tests-first approach, atomic commits, and manual verification after each extraction ensure no regressions.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 02-utility-hook-extraction*
*Context gathered: 2026-02-16*
