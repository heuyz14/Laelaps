# RunLog AI

RunLog AI is a full-stack running analytics and coaching platform for runners. It starts as a reliable run log and training dashboard, then layers in AI coaching that explains progress, answers training questions, detects trends, and helps runners make evidence-backed decisions.

The project is designed around a clear boundary: the application calculates metrics deterministically, and the AI explains those metrics. AI agents should not invent or calculate core statistics themselves.

## Vision

RunLog AI should become an AI running coach capable of:

- Logging runs and maintaining training history
- Tracking pace, mileage, effort, streaks, and personal records
- Explaining performance changes over time
- Answering questions about training and recovery
- Detecting trends, fatigue signals, and volume spikes
- Remembering user goals
- Building training recommendations from verified analytics
- Saving structured AI insights for later review

## Core Principles

- Build all non-AI running features before depending on AI behavior.
- Keep analytics deterministic, testable, and separate from agent responses.
- Ground every coaching response in authenticated user data.
- Never expose arbitrary SQL through AI tools.
- Never trust client-supplied user IDs for server-side data access.
- Stay deployable on free tiers where practical.

## Planned Stack

- Next.js App Router
- React
- Tailwind CSS
- shadcn/ui
- Supabase Auth, PostgreSQL, and Storage
- Server Actions and API routes
- Mastra agents, tools, workflows, and memory
- Google Cloud Platform hosting direction, with free-tier-friendly services evaluated before committing to production infrastructure

## MVP Roadmap

### Phase 1: Foundation

- Configure the development environment
- Set up Supabase, authentication, protected routes, and middleware
- Create the initial database schema, indexes, constraints, and RLS policies
- Establish the application layout and folder structure

### Phase 2: Core Running Platform

- Add run create, read, update, and delete flows
- Build run history and detail pages
- Implement deterministic analytics for pace, weekly mileage, PR detection, streaks, effort zones, and comparable runs
- Build dashboard cards for weekly mileage, monthly mileage, average pace, longest run, and recent activity

### Phase 3: AI Infrastructure

- Add Mastra agents, tools, prompts, workflows, and schemas
- Implement authenticated tools such as recent runs, weekly stats, goals, and saved insights
- Build grounded agents for run summaries and historical analysis

### Phase 4: Coaching Intelligence

- Create higher-level training coach workflows
- Evaluate goals, fatigue, recovery, and weekly recommendations
- Store structured AI coaching output
- Add benchmark scenarios for missing data, inconsistent data, mixed units, API failures, and rate limits

### Phase 5: Production and Documentation

- Deploy with Vercel and Supabase
- Configure production environment variables and OAuth redirects
- Document architecture, database design, API behavior, agents, and workflows
- Prepare a demo flow covering login, run entry, dashboard analytics, run summaries, and AI questions

## Future Direction

Potential post-MVP features include Garmin sync, Strava sync, wearable integrations, voice coaching, multi-agent orchestration, predictive race performance, marathon planning, social features, and a mobile app.

## Engineering Documentation

RunLog AI is planned as a spec-driven engineering project. The documentation is split into roadmap, specs, architecture, and implementation task tracks so each phase can be built incrementally and reviewed like a production system.

- [Master roadmap](roadmap/00-master-roadmap.md)
- [Foundation phase](roadmap/01-phase-foundation.md)
- [Core platform phase](roadmap/02-phase-core-platform.md)
- [Analytics phase](roadmap/03-phase-analytics.md)
- [AI platform phase](roadmap/04-phase-ai-platform.md)
- [Production phase](roadmap/05-phase-production.md)
- [Backlog](roadmap/backlog.md)
- [System design](architecture/system-design.md)
- [Database ERD](architecture/database-erd.md)
- [API design](architecture/api-design.md)
- [Mastra architecture](architecture/mastra-architecture.md)
- [Security](architecture/security.md)
- [Architecture decisions](architecture/decisions.md)

Core implementation specs live in [`specs/`](specs), and weekly execution plans live in [`tasks/`](tasks). New feature specs should use the [feature spec template](specs/_template.md) so every implementation document covers scope, requirements, UI flows, database changes, API contracts, AI behavior, security, testing, and acceptance criteria.

## Future Monorepo Layout

This repository is prepared as a pnpm workspace without scaffolding full applications yet. The intended structure is:

```text
apps/
  web/
  mobile/
packages/
  analytics/
  db/
  types/
  config/
  ui/
infra/
  gcp/
```

Current implementation focus is web-first. `apps/web` is reserved for the future Next.js application. `apps/mobile` should be added later when the mobile strategy is ready. Shared logic should move into `packages/*` only when at least one app needs it.

The preferred hosting direction is GCP, likely starting with free-tier-friendly managed services such as Cloud Run or Firebase Hosting/App Hosting depending on the final web architecture. Real deployment configs are intentionally deferred until the app shape is known.
