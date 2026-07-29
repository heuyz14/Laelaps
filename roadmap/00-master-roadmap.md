# Laelaps Master Roadmap

Status: Draft  
Owner: Project maintainer  
Audience: Engineering, portfolio reviewers, future collaborators

## Executive Summary

Laelaps is an AI running intelligence platform for athletes who want precise, evidence-backed training feedback. The product begins as a reliable run log with deterministic analytics, then adds AI agents that explain those analytics, answer training questions, detect trends, and provide grounded coaching.

The key architectural rule is that AI does not calculate trusted metrics. The application owns calculations such as pace, weekly mileage, personal records, streaks, effort zones, recovery signals, and comparable-run analysis. AI agents receive those precomputed values through scoped tools and explain them in plain language.

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
- Keep the repository monorepo-ready without scaffolding unused applications early.
- Build web-first, then add mobile once shared domain boundaries are proven.
- Separate account authentication from activity-source integrations.

## Repository Direction

Laelaps is prepared as a pnpm workspace so the project can grow into a web app, mobile app, shared packages, and cloud infrastructure without reshaping the repository later.

Target structure:

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

Current implementation focus:

- `apps/web`: first application target, expected to become the Next.js web app.
- `apps/mobile`: future mobile app target, intentionally deferred.
- `packages/*`: shared code should be extracted only when reuse is real.
- `infra/gcp`: future Google Cloud Platform notes and deployment assets.

The planning documents remain at the repository root because they describe the full product and engineering system rather than one app.

## Account and Integration Strategy

Laelaps accounts should not depend on one provider. Google OAuth is useful for quick sign-in, but it should not be the only way to create an account. Phase 1 should support email/password plus Google OAuth, with magic links and Apple login available as later additions if needed.

Connected activity sources are a separate concern. Strava, Garmin, Apple Health, Coros, GPX, or FIT imports should be treated as optional integrations that attach data to an existing Laelaps account. Strava OAuth or an MCP-backed Strava connector should not replace Laelaps account authentication.

The model is:

```text
Laelaps account login
= identity, session, user-owned database rows, RLS boundary

Connected activity sources
= optional permissions to import or sync running data
```

## Phase Map

| Phase | Focus | Primary Output |
| --- | --- | --- |
| 1 | Foundation | pnpm workspace, web app foundation, auth, schema, RLS, app shell |
| 2 | Core platform | Run CRUD, dashboard, goals, shoes |
| 3 | Analytics | Deterministic metrics engine and first shared package candidates |
| 4 | AI platform | Mastra agents, tools, memory, workflows |
| 5 | Production | GCP hosting selection, observability, docs, demo |

## Implementation Order

1. Establish pnpm workspace foundation and web app environment.
2. Implement account authentication with email/password and Google OAuth.
3. Implement protected routing and profile bootstrap.
4. Create database schema and RLS policies.
5. Build run CRUD and dashboard views.
6. Implement deterministic analytics modules.
7. Extract analytics/types into `packages/*` only when web implementation proves the boundary.
8. Add AI tools that only expose scoped analytics.
9. Add agents for run summaries, historical analysis, recovery, and coaching.
10. Add tests, observability, rate limiting, and production deployment.
11. Add optional activity-source integrations such as Strava after core account-owned data works.
12. Add mobile app support after the web app proves shared package boundaries.

## Hosting Direction

Laelaps is expected to move toward Google Cloud Platform for hosting. The exact target should be chosen after the web app architecture is known.

Candidate targets:

- Cloud Run for a server-rendered web app or combined web/API service.
- Firebase Hosting with Cloud Run when static hosting plus dynamic backend routes is useful.
- Firebase App Hosting if the final Next.js app fits its supported workflow and cost model.

Before production deployment:

- Confirm current free-tier quotas.
- Add budget alerts.
- Document environment variables.
- Keep generated cloud state and secrets out of git.
- Avoid committing Docker, Terraform, or Cloud Build configuration until there is a concrete deployment need.

## Documentation System

This project uses these documentation and implementation tracks:

- `roadmap/`: phase sequencing, milestones, and delivery strategy
- `specs/`: feature-level RFCs with scope, requirements, contracts, and acceptance criteria
- `architecture/`: cross-cutting system design and decisions
- `tasks/`: week-by-week implementation plans
- `apps/`: future application workspaces
- `packages/`: future shared code workspaces
- `infra/`: future cloud infrastructure notes and deployment assets

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
