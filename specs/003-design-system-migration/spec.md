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
