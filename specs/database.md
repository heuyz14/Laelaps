# Database Spec

Status: Draft  
Phase: Foundation

## Executive Summary

The database stores user profiles, runs, shoes, goals, AI insights, and AI usage records. The schema should support deterministic analytics, AI grounding, and future integrations without exposing cross-user data.

## Scope

In scope:

- Core schema
- Constraints
- Indexes
- RLS policies
- Migration strategy

Out of scope:

- Garmin or Strava sync tables
- Billing
- Team accounts

## Functional Requirements

- Store authenticated user profiles.
- Store run history with distance, duration, date, effort, notes, and optional heart-rate fields.
- Store shoes and associate runs to shoes.
- Store goals and their lifecycle status.
- Store structured AI insights.
- Store AI usage events.

## Non-Functional Requirements

- Queries for recent runs should be fast for active users.
- Schema should preserve metric units explicitly.
- Migrations should be repeatable from a clean project.

## Schema Requirements

Required tables:

- `profiles`
- `runs`
- `shoes`
- `goals`
- `ai_insights`
- `ai_usage`

Recommended indexes:

- `runs(user_id, run_date desc)`
- `runs(user_id, shoe_id)`
- `goals(user_id, status)`
- `ai_insights(user_id, created_at desc)`
- `ai_usage(user_id, created_at desc)`

## Security Considerations

- Enable RLS on every user-owned table.
- Add ownership checks to select, insert, update, and delete policies.
- Restrict service role usage to trusted server-only contexts.

## Testing Plan

- Migration applies cleanly.
- Cross-user reads fail.
- Cross-user updates fail.
- Required constraints reject invalid records.

## Acceptance Criteria

- Database supports Phase 1 and Phase 2 flows.
- RLS blocks unauthorized access.
- Analytics queries have appropriate indexes.
