# Feature: MVVM refactor and external test tree

Status: Implemented; live writes not exercised
Feature ID: 001-mvvm-refactor
Recorded: 2026-10-07
Request/source: Earlier user requests in this chat to refactor this remote and move specs outside production source. This is a retrospective delivery record, not a newly executed feature.

## Problem, audience and scope

Administrators need a maintainable catalog/configuration remote. The original HTTP service mixed requests, shared state and dev settings; form subscriptions used forkJoin on live streams. The authorized refactor separated responsibilities, fixed stream behavior and kept inline HTML/SCSS with BEM names. A follow-up moved unit specs to a mirrored repository-root testing tree.

## Requirements and acceptance

- FR-001 / AC-001: HTTP access is stateless; singleton model orchestrates shared catalog requests/writes with recoverable failures. Verify queue ordering, data retention and retry in unit tests.
- FR-002 / AC-002: Scoped view models manage search/selection and form drafts with idiomatic streams. Replacing forms detaches old subscriptions; type changes project relevant payloads; verification ignores stale responses.
- FR-003 / AC-003: Components have focused orchestration/presentation roles, inline views/styles, BEM classes and a flexible ~230-line target.
- FR-004 / AC-004: Specs live outside source, with discovery/imports updated and the complete suite still running.

Routes, published contracts, federation exports and existing provider lifetimes remain compatible. Full live CRUD acceptance, backend authorization changes and deployments were outside verification performed. No unresolved implementation decision blocks the delivered refactor; integration evidence limits are retained.

## Constitution Check

The adopted 2026-10-07 constitution formalizes these earlier user requirements. The historical implementation used the preceding folder layout; current organization is tracked separately by 002. The rail's cohesive inline styles make it a small line-count exception, not a gate failure.
