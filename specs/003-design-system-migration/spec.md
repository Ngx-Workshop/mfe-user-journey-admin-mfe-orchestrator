# Feature: Workshop design system migration

Status: Implemented; hosted integration pending
Feature ID: 003-design-system-migration
Created: 2026-10-26
Request: Migrate the admin orchestrator after installing and sharing the package in the admin shell.

## Problem and scope

The catalog uses custom rounded Material cards, a particle header and legacy palette values.
Administrators need the shared workshop console appearance across discovery, editing and dialogs.
Install published `@tmdjr/ngx-workshop-design-system` 21.0.1, align federation sharing with the shell,
adopt its panels/buttons/status and semantic tokens, and make the layout usable on narrow screens.
Routes, adapters, DTOs, persistence, authentication and federation exports retain their contracts.

## Functional requirements and acceptance

- FR-001 / AC-001: In the shell and standalone, catalog, form and dialogs use shared midnight/cyan/magenta tokens, angular panels and buttons. The shell's legacy palette cannot override the migrated workspace or its overlay content.
- FR-002 / AC-002: Search, selection and counts still work. A search with no matches explains the filtered state and offers clearing; an actually empty catalog offers creating a remote.
- FR-003 / AC-003: Creating/editing retains field validation, type-specific controls, URL readability checks and existing emitted payloads. Shared buttons retain disabled and native keyboard behavior.
- FR-004 / AC-004: Create, delete confirmation, development and preview dialogs use matching content/backdrop styles; Material keeps focus trapping. Select and tooltip overlays inherit the matching adapter even outside the remote DOM.
- FR-005 / AC-005: Desktop uses a catalog rail and workspace; at 900px and below, stack them without horizontal page overflow. Keyboard focus remains visible and status is expressed in text as well as color.

## Quality, boundaries and assumptions

Use the package's public Sass and Angular APIs; no new private Material selectors or DOM overrides.
Keep inline HTML/SCSS, BEM and the feature-first source/test map. Existing store/VM behavior, remote
IDs, broker keys, URL verification semantics, pending/error handling and API authorization stay
unchanged. Access denial and backend persistence are outside this presentation migration.
Production smoke testing requires the updated host and remote; local fixture checks do not prove
live federation or backend writes. The user explicitly requested committing/pushing the shell;
the subsequent remote migration is prepared locally for review.

## Constitution Check

MVVM and integration boundaries preserved. Principle 3's established Material theme is extended
with the user-requested public Ngx design system. Accessibility and inline source organization
remain mandatory. Meaningful UI regressions supplement existing domain tests and production builds.

## Mission Control layout refinement — 2026-10-26

- FR-006 / AC-006: Open directly on a compact action bar spanning the remote's
  available width, with a semantic page heading and New remote action; remove the hero.
- FR-007 / AC-007: Prioritize useful content above the fold with full available workspace
  width, compact spacing and side-by-side form sections when the form container is at
  least 960px wide. Keep normal scrolling for longer content and stacked narrow layouts.

The shell still owns the viewport and its navigation; full width means the remote's
allocated content area. Preserve readable controls, validation and all existing actions.

## Selected remote heading and bounded rail — 2026-10-26

- FR-008 / AC-008: The entire rail fits in the remaining viewport with a long
  catalog scrolling internally. Recalculate on viewport, content-size and scroll
  changes; retain search, counters and keyboard access.
- FR-009 / AC-009: Use the selected remote's name as the configuration panel heading.
  Place metadata/quick actions and remote ID in that same heading row, allowing
  wrapping at narrow widths. Remove the separate duplicate context heading.

The user authorized adding the shared header slot. Its implementation lives in
ngx-workshop-design-system; local tests use that built package. Published 21.0.2
still lacks the slot, so a matching library release and host/remote upgrade are
required before clean-install/deployed acceptance.

## Collapsible integration controls — 2026-10-26

FR-010 / AC-010: Route capabilities uses a collapsed-by-default Material accordion,
with its enabled count in the header. Closing/reopening preserves edits and save
payloads. Route capabilities and Shell overrides share semantic surface, text,
border, mono heading, indicator and hover/focus treatment. Native expansion and
keyboard behavior remain Material-owned; narrow form containers wrap content.

## Lifecycle actions and shell selects — 2026-10-26

FR-011 / AC-011: Delete and Archive/Unarchive appear in an initially collapsed
Remote lifecycle accordion within Integration behavior for existing records only.
Save remains in the footer. Delete retains confirmation; lifecycle commands use
the persisted remote independently of unsaved form edits and do not submit the form.
FR-012 / AC-012: Header, Navigation and Footer overrides use labelled Material selects
with Full, Compact and Disabled choices; preserve existing field keys and values.
Select overlays use the design-system theme scope.

## Debounced autosave — 2026-10-26

FR-013 / AC-013: Remove the manual Save changes button. Existing remote edits
autosave after 500ms without another edit, only while valid. Initial population,
unchanged projected values and new-remote drafts must not trigger updates. Cancel
pending debounce on selection replacement/destruction; retain newer local edits
when older successful writes refresh the catalog.
FR-014 / AC-014: The action bar reports Saving during updates and Changes saved
only after a successful server response. Hide success after three seconds,
resetting/cancelling its timer for a subsequent save. Failed saves retain an
explicit error and Retry save action; never announce them as saved.
Serialized writes preserve IDs/type projection. Archive state belongs to the
lifecycle endpoint and is omitted from update payloads so delayed autosaves cannot
undo archive/unarchive actions. Existing create submission remains explicit.

## Selected heading intro — 2026-10-27

FR-015 / AC-015: Selected remote headings reveal characters with a brief staggered neon fade. Replay on selection/name changes, preserve unchanged refreshes and form state, keep the complete accessible heading, and disable motion for reduced-motion users.
