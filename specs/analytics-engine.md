# Analytics Engine Spec

Status: Draft  
Phase: Analytics

## Executive Summary

The analytics engine computes trusted running metrics used by both the UI and AI agents. It is the source of truth for all statistics.

## Scope

In scope:

- Pace
- Weekly mileage
- Monthly mileage
- Average pace
- Longest run
- Personal records
- Streaks
- Effort zones
- Comparable runs
- Recovery signals

Out of scope:

- AI explanation
- Medical analysis
- Race prediction in MVP

## Functional Requirements

- Convert raw run data into typed metric objects.
- Handle empty datasets.
- Handle runs with missing optional fields.
- Keep units explicit.
- Provide comparable-run selection for AI tools.

## Non-Functional Requirements

- Analytics functions should be deterministic.
- Unit tests should cover edge cases.
- Functions should not depend on UI or request state.

## Metric Definitions

Pace:

- `duration_seconds / distance_meters`
- Display as minutes per mile or minutes per kilometer based on user preference.

Weekly mileage:

- Sum of run distance in a calendar or configured week.

Streak:

- Count of consecutive days or weeks with qualifying activity.

Comparable runs:

- Runs near the target distance or matching effort/type when available.

Recovery signals:

- Recent volume increases
- Effort clustering
- Elevated heart rate when enough data exists
- Missing easy/recovery days

## Testing Plan

- Empty input returns zeroed metrics.
- Mixed optional data does not crash.
- Known sample data produces expected pace and mileage.
- Comparable run selection is deterministic.

## Acceptance Criteria

- UI and AI tools consume shared analytics outputs.
- Metrics are documented and tested.
- No AI prompt is required to calculate statistics.
