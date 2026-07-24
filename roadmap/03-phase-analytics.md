# Phase 3: Analytics

Status: Draft  
Target: Week 3, first half  
Depends on: Phase 2

## Executive Summary

Phase 3 creates the deterministic analytics engine. This engine is the trusted source for statistics used by the UI and AI agents.

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

Out of scope:

- AI interpretation
- Predictive race performance
- Wearable data ingestion

## Design Rule

Analytics modules must be pure or nearly pure functions where possible. They should accept typed run data and return typed metric objects that can be tested without Supabase, UI state, or agent runtime.

## Acceptance Criteria

- Analytics produce stable results for fixed input data.
- Unit tests cover empty, sparse, mixed, and invalid data sets.
- UI and AI tools consume the same analytics outputs.
- Metrics are documented with assumptions and units.
