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
- Store internally as seconds per kilometer.
- Display as minutes per mile or minutes per kilometer based on user preference.

Weekly mileage:

- Sum of run distance in ISO weeks that start on Monday in UTC.

Monthly mileage:

- Sum of run distance by calendar month using `YYYY-MM`.

Personal records:

- Longest run uses maximum distance.
- Fastest pace uses lowest aggregate seconds per kilometer.

Streak:

- Count of consecutive days or weeks with qualifying activity.

Effort zones:

- Easy: effort 1-3.
- Moderate: effort 4-7.
- Hard: effort 8-10.
- Unknown: missing or out-of-range effort.

Comparable runs:

- Runs within a deterministic distance tolerance of the target distance.
- Sort by absolute distance delta first, then newer run date.

Recovery signals:

- Recent volume increases
- Effort clustering
- Elevated heart rate when enough data exists
- Missing easy/recovery days

Invalid data:

- Runs with invalid date, non-positive distance, or non-positive duration are excluded from metrics and counted separately.

## Testing Plan

- Empty input returns zeroed metrics.
- Mixed optional data does not crash.
- Known sample data produces expected pace and mileage.
- Comparable run selection is deterministic.

## Acceptance Criteria

- UI and AI tools consume shared analytics outputs.
- Metrics are documented and tested.
- No AI prompt is required to calculate statistics.
