# Database ERD

Status: Draft

## Executive Summary

The database centers on authenticated users, their profiles, runs, goals, shoes, AI insights, and AI usage records. Supabase Auth owns identity. Application tables reference `auth.users.id` and enforce row-level security.

## Entity Overview

```text
auth.users
  |
  +-- profiles
  +-- runs
  |     |
  |     +-- shoes
  |
  +-- goals
  +-- ai_insights
  +-- ai_usage
```

## Tables

### profiles

Stores application-level user preferences.

Fields:

- `id uuid primary key references auth.users(id)`
- `display_name text`
- `preferred_unit text`
- `created_at timestamptz`
- `updated_at timestamptz`

### runs

Stores manually logged runs.

Fields:

- `id uuid primary key`
- `user_id uuid references auth.users(id)`
- `shoe_id uuid null references shoes(id)`
- `run_date date`
- `distance_meters integer`
- `duration_seconds integer`
- `avg_heart_rate integer null`
- `max_heart_rate integer null`
- `effort integer null`
- `notes text null`
- `created_at timestamptz`
- `updated_at timestamptz`

### shoes

Tracks shoe usage and mileage.

Fields:

- `id uuid primary key`
- `user_id uuid references auth.users(id)`
- `name text`
- `retired_at date null`
- `created_at timestamptz`

### goals

Stores active and historical training goals.

Fields:

- `id uuid primary key`
- `user_id uuid references auth.users(id)`
- `type text`
- `target_value numeric null`
- `target_date date null`
- `status text`
- `created_at timestamptz`
- `updated_at timestamptz`

### ai_insights

Stores structured AI outputs for later review.

Fields:

- `id uuid primary key`
- `user_id uuid references auth.users(id)`
- `run_id uuid null references runs(id)`
- `insight_type text`
- `input_summary jsonb`
- `output jsonb`
- `created_at timestamptz`

### ai_usage

Tracks AI calls for auditing and rate-limit analysis.

Fields:

- `id uuid primary key`
- `user_id uuid references auth.users(id)`
- `agent_name text`
- `tool_names text[]`
- `status text`
- `latency_ms integer null`
- `created_at timestamptz`

## RLS Policy Pattern

Every user-owned table should enforce:

- Select only where `user_id = auth.uid()`.
- Insert only where `user_id = auth.uid()`.
- Update only where `user_id = auth.uid()`.
- Delete only where `user_id = auth.uid()`.

For `profiles`, `id = auth.uid()` is the ownership check.
