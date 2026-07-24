# Run CRUD Spec

Status: Draft  
Phase: Core Platform

## Executive Summary

Run CRUD is the core product workflow. Users need to add, edit, delete, view, and review runs before AI features are introduced.

## Scope

In scope:

- Run creation
- Run editing
- Run deletion
- Run history
- Run detail page
- Form validation

Out of scope:

- File imports
- GPS route maps
- AI summaries

## User Stories

- As a runner, I can log a run with date, distance, time, effort, and notes.
- As a runner, I can fix mistakes in an existing run.
- As a runner, I can delete duplicate or incorrect runs.
- As a runner, I can review my training history.

## Functional Requirements

- Require run date, distance, and duration.
- Support optional average heart rate, max heart rate, effort, notes, and shoe.
- Recalculate displayed metrics after mutations.
- Confirm destructive delete actions.

## UI/UX Flows

- Dashboard `Add Run` opens run form.
- Successful save returns user to dashboard or run detail.
- History list links to run detail.
- Edit action reuses the run form with existing values.

## API Contracts

Mutation inputs should validate:

- `runDate`: valid date
- `distanceMeters`: positive integer
- `durationSeconds`: positive integer
- `effort`: integer 1-10 when provided
- `avgHeartRate`: positive integer when provided
- `maxHeartRate`: positive integer when provided

## Error Handling

- Validation errors appear near fields.
- Network failures preserve form input.
- Missing run returns not-found state.
- Unauthorized access returns redirect or forbidden response.

## Testing Plan

- Create valid run.
- Reject invalid distance and duration.
- Edit user-owned run.
- Delete user-owned run.
- Block access to another user's run.

## Acceptance Criteria

- A signed-in user can manage runs end to end.
- CRUD behavior is covered by tests.
- Dashboard and history reflect changes.
