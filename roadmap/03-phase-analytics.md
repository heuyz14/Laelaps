# Phase 3: Analytics

Status: Complete  
Target: Week 3, first half  
Depends on: Phase 2

## Executive Summary

Phase 3 creates the deterministic analytics engine. This engine is the trusted source for statistics used by the web UI and AI agents, and it is the first strong candidate for extraction into a shared package.

## Scope

In scope:

- Pace calculations
- Weekly and monthly mileage
- Longest run
- Average pace
- Streaks
- Personal record detection
- Effort zones
- Comparable runs
- Recovery and fatigue signals
- Unit-aware metric formatting assumptions

Out of scope:

- AI interpretation
- Predictive race performance
- Wearable data ingestion
- Mobile-specific analytics UI

## Design Rule

Analytics modules must be pure or nearly pure functions where possible. They should accept typed run data and return typed metric objects that can be tested without Supabase, UI state, or agent runtime.

## Package Direction

Start analytics inside the web implementation if that is fastest, but extract to `packages/analytics` once one of these is true:

- AI tools need the same calculations as the web UI.
- Test fixtures become independent from the web app.
- Mobile implementation is ready to consume the same metrics.

Likely related packages:

- `packages/analytics`: deterministic metric calculations
- `packages/types`: shared run, goal, shoe, and metric types
- `packages/config`: shared TypeScript/test configuration if duplication appears

## Acceptance Criteria

- Analytics produce stable results for fixed input data.
- Unit tests cover empty, sparse, mixed, and invalid data sets.
- UI consumes the typed analytics output; Phase 4 AI tools should consume the same output instead of recalculating metrics.
- Metrics are documented with assumptions and units.
- Package extraction is explicitly deferred until AI or mobile becomes a second production consumer.
