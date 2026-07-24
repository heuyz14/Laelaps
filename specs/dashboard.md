# Dashboard Spec

Status: Draft  
Phase: Core Platform

## Executive Summary

The dashboard gives runners a quick view of recent progress and current training status. It should remain useful before AI features are enabled.

## Scope

In scope:

- Weekly mileage
- Monthly mileage
- Average pace
- Longest run
- Recent activity
- Goal progress summary

Out of scope:

- AI chat
- Social feed
- Advanced race prediction

## User Stories

- As a runner, I can see whether I am training consistently.
- As a runner, I can quickly find my latest runs.
- As a runner, I can understand my current weekly volume.

## Functional Requirements

- Show summary cards based on authenticated user's runs.
- Show recent activity ordered by date.
- Show empty state for new users.
- Link to add-run flow.

## UI/UX Requirements

- Dashboard should prioritize scanning.
- Cards should be compact and data-first.
- Empty states should guide the user to add a first run.
- Loading states should not shift layout significantly.

## Data Requirements

Dashboard reads from:

- `runs`
- `goals`
- Analytics engine outputs

## Testing Plan

- Empty dashboard state.
- Dashboard with one run.
- Dashboard with multiple weeks of runs.
- Dashboard updates after run CRUD.

## Acceptance Criteria

- Dashboard displays accurate deterministic metrics.
- New users understand the next action.
- Recent activity links to run detail.
