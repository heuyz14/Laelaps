# Laelaps Master Roadmap

Status: Draft  
Owner: Project maintainer  
Audience: Engineering, portfolio reviewers, future collaborators

## Executive Summary

Laelaps is a full-stack running analytics and coaching platform. The product begins as a reliable run log with deterministic analytics, then adds AI agents that explain those analytics, answer training questions, and provide grounded coaching.

The key architectural rule is that AI does not calculate trusted metrics. The application owns calculations such as pace, weekly mileage, personal records, streaks, effort zones, and recovery indicators. AI agents receive those precomputed values through scoped tools and explain them in plain language.

## Product North Star

Laelaps should help a runner understand what happened, why it may have happened, and what to do next.

The first production version should support:

- Secure user accounts
- Run logging and editing
- Historical training views
- Deterministic analytics
- Goal tracking
- AI run summaries
- AI historical analysis
- Training recommendations grounded in recent history
- Saved insights for future review

## Engineering Principles

- Ship a complete non-AI running product before relying on AI.
- Treat analytics as domain logic, not prompt behavior.
- Keep agent tool access narrow, typed, authenticated, and auditable.
- Prefer small, testable modules over broad application services.
- Make every phase demonstrable.
- Keep deployment compatible with practical free-tier limits.

## Phase Map

| Phase | Focus | Primary Output |
| --- | --- | --- |
| 1 | Foundation | Auth, schema, RLS, app shell |
| 2 | Core platform | Run CRUD, dashboard, goals, shoes |
| 3 | Analytics | Deterministic metrics engine |
| 4 | AI platform | Mastra agents, tools, memory, workflows |
| 5 | Production | Deployment, observability, docs, demo |

## Implementation Order

1. Establish project foundation and environment.
2. Implement authentication and protected routing.
3. Create database schema and RLS policies.
4. Build run CRUD and dashboard views.
5. Implement deterministic analytics modules.
6. Add AI tools that only expose scoped analytics.
7. Add agents for run summaries, historical analysis, recovery, and coaching.
8. Add tests, observability, rate limiting, and production deployment.

## Documentation System

This project uses four documentation tracks:

- `roadmap/`: phase sequencing, milestones, and delivery strategy
- `specs/`: feature-level RFCs with scope, requirements, contracts, and acceptance criteria
- `architecture/`: cross-cutting system design and decisions
- `tasks/`: week-by-week implementation plans

## Spec Expansion Strategy

The first version of each spec should define the implementation boundary and acceptance criteria. Before coding a feature, expand that spec using `specs/_template.md` and fill in every relevant section:

- Executive summary
- Scope in and out
- User stories
- Functional and non-functional requirements
- UI/UX flows
- Database changes
- API contracts
- Mastra agents and tools
- Workflows
- Memory design
- Prompt strategy
- Error handling
- Security considerations
- Testing plan
- Acceptance criteria
- Future enhancements

## Definition of Done

A feature is done when:

- It has a written spec.
- It has user-facing behavior implemented.
- It has database/API contracts documented where applicable.
- It has meaningful tests for expected and failure cases.
- It respects authentication, authorization, and RLS boundaries.
- It works in local development.
- It can be demonstrated through a realistic user flow.

## Portfolio Narrative

Laelaps should read as a production-style engineering project, not a prototype. The strongest portfolio story is the separation between deterministic analytics and AI explanation: this shows practical AI system design, security awareness, product thinking, and incremental delivery.
