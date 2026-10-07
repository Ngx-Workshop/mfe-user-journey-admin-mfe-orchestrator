# Implementation plan: MVVM refactor

Status: Historical implementation record
Spec: [spec.md](spec.md)
Updated: 2026-10-07

## Technical Context

**Language/Version**: TypeScript ~5.9.3 / Angular 21.1.0
**Primary Dependencies**: Material/CDK 21.1.0, RxJS 7.8.2, orchestrator contracts ^0.0.54, Module Federation 20.0.0
**Storage**: In-memory singleton catalog, browser/broker dev settings, backend remote records
**Project Type**: Host-mounted Angular administrator MFE catalog

The original plan and evidence are preserved in [implementation-record.md](implementation-record.md). HTTP and broker access were separated from the root model. Route/form VMs were scoped to UI lifetimes; form factories used typed controls and conditional request projection. Large views were split by responsibility, inline styles converted to BEM and components used OnPush. Existing specs moved to root testing with explicit Angular discovery.

FR/AC-001 and 002 map to model/VM suites; FR/AC-003 maps to component source review and builds; FR/AC-004 maps to discovery and all 15 passing tests. The earlier shell check caught an rxjs-interop injection-context issue and explicit DestroyRef references resolved it. No API or federation migration was planned. Subsequent feature-folder moves are described in 002, not retroactively attributed here.

## Constitution Check and verification limits

MVVM, inline templates/styles, BEM, strict typing and separated tests match the adopted principles. Prior builds/tests and sampled live reads/forms were verified in this chat; HTTP writes and storage persistence used doubles. Backend integration and shared-version compatibility remain follow-up findings, not proven by the refactor.
