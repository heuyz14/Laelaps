# System Design

Status: Draft

## Executive Summary

Laelaps uses a layered architecture: Next.js handles UI and server interactions, Supabase provides auth and persistence, deterministic analytics modules compute metrics, and Mastra agents explain those metrics through scoped tools.

## High-Level Architecture

```text
Browser
  |
  v
Next.js App Router
  |
  +-- React UI
  +-- Server Actions
  +-- API Routes
  |
  v
Application Services
  |
  +-- Supabase Auth
  +-- Supabase PostgreSQL
  +-- Analytics Engine
  +-- Mastra Runtime
```

## Layer Responsibilities

UI layer:

- Render authenticated application screens.
- Collect input through validated forms.
- Display deterministic metrics and AI insights.

Server layer:

- Enforce authenticated context.
- Validate inputs.
- Execute database writes.
- Call analytics modules.
- Invoke AI workflows.

Data layer:

- Store user-owned records.
- Enforce RLS policies.
- Preserve audit-friendly AI outputs.

Analytics layer:

- Compute all trusted metrics.
- Keep unit handling explicit.
- Return typed outputs used by UI and agents.

AI layer:

- Explain metrics.
- Compare runs.
- Summarize trends.
- Recommend next actions from bounded context.

## Key Design Constraints

- AI must not calculate source-of-truth metrics.
- Users must never access another user's data.
- The app must remain useful when AI is disabled.
- Free-tier limits should shape feature scope and caching decisions.
