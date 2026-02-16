# Phase 3: Component Extraction & Testing - Context

**Gathered:** 2026-02-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Decompose three monolithic screen files (index.tsx 1634 lines, guided-builder.tsx 1106 lines, edit-habit.tsx 967 lines) into focused, tested components under 300 lines each. Extract reusable hooks (UTIL-05) during component extraction. No new features — app must work identically after extraction.

</domain>

<decisions>
## Implementation Decisions

### Extraction order
- Start with guided-builder.tsx first — mid-size with natural step-based structure, builds extraction confidence before tackling the largest file
- Then edit-habit.tsx (smallest, benefits from shared components already extracted from guided-builder)
- Today tab index.tsx last (largest, most components, benefits from all prior extraction patterns)
- Hooks extracted during component extraction as they're encountered, not as a separate pass

### File organization
- Feature-based folder structure: components/habits/, components/modals/, components/shared/
- Co-located test files (ComponentName.test.tsx next to ComponentName.tsx) — consistent with Phase 1-2 pattern

### State boundaries
- Components access context providers (HabitsProvider, ThemeProvider, etc.) directly rather than receiving data through props
- This means components are "feature components" by default rather than pure presentational

### Claude's Discretion
- Within-screen extraction order (modals first vs presentational first vs whatever makes sense per screen)
- Barrel exports vs direct imports per folder
- Hook file locations (lib/hooks/ for shared, co-located for component-specific)
- Modal state pattern (parent-controlled vs self-managed — pick based on current code patterns)
- Screen file role after extraction (pure orchestrator vs thin logic layer — per screen)
- Guided builder step navigation pattern (parent-managed index vs step-driven onNext/onBack)
- Plan boundaries and count (one per screen vs different grouping — optimize for dependencies and parallelism)
- Whether ConfirmationModal becomes a generic shared component or stays per-screen (based on similarity)
- Whether frequency/schedule UI becomes a shared FrequencyPicker or gets extracted per-screen first (based on similarity)
- 300-line target enforcement — aim for it, allow slight exceptions if splitting would be forced

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches. User's primary concern is that the app works identically after extraction.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 03-component-extraction-testing*
*Context gathered: 2026-02-16*
