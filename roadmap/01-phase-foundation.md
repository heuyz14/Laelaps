# Phase 1: Foundation

Status: Complete  
Target: Week 1  
Depends on: None

## Executive Summary

Phase 1 creates the repo and web-app foundation for Laelaps. The exit condition is a pnpm workspace with a future-safe structure, a web app foundation, authentication, database schema, row-level security, and protected routes backed by Supabase.

## Scope

In scope:

- pnpm workspace validation
- `apps/web` application foundation
- Next.js app setup when implementation begins
- Tailwind and shadcn/ui setup
- Supabase client configuration
- Email/password authentication
- Google OAuth
- Session persistence
- Protected routes
- Initial schema
- RLS policies
- Basic app shell

Out of scope:

- `apps/mobile` scaffold
- Shared package extraction before real reuse exists
- AI agents
- Advanced analytics
- Strava, Garmin, Apple Health, or other activity-source integrations
- Strava OAuth as a primary account login method
- Production deployment automation
- Final GCP deployment configuration

## Auth Strategy

Phase 1 authentication is for Laelaps account identity. It should answer: who is the user, which records do they own, and what can they access?

Initial auth methods:

- Email/password for users without Google accounts.
- Google OAuth for fast sign-in.

Deferred auth methods:

- Magic link sign-in.
- Apple login.
- Additional social providers only if there is product need.

Strava is not a Phase 1 account provider. Strava OAuth or an MCP-backed Strava connector should be handled later as an optional activity-source integration attached to an existing Laelaps account.

## Monorepo Notes

Keep the workspace simple in this phase:

- Root `package.json` owns workspace scripts.
- `pnpm-workspace.yaml` includes `apps/*` and `packages/*`.
- `apps/web` is the only app planned for initial implementation.
- `packages/*` should remain empty or placeholder-only until shared code is justified.
- `infra/gcp` remains notes-only until production architecture is selected.

## Deliverables

- Working local development environment
- `.env.local.example`
- Supabase migration files
- Email/password sign-up and sign-in flow
- Google OAuth sign-in flow
- Auth middleware
- Protected dashboard route
- Profile creation flow
- Initial README and architecture docs
- Confirmed pnpm workspace commands from the repository root

## Acceptance Criteria

- Root workspace scripts run without recursion or unexpected failures.
- User can authenticate with email/password.
- User can authenticate with Google OAuth.
- Authenticated routes reject anonymous users.
- User profile exists after first sign-in from either supported auth method.
- Database migrations can be applied from a clean Supabase project.
- RLS prevents users from reading or writing another user's records.
- Linting and formatting commands run successfully.

## Completion Notes

- Next.js web app foundation is implemented in `apps/web`.
- Google OAuth was manually verified through Supabase and Google Cloud configuration.
- Email/password sign-up and sign-in are implemented with server actions and Zod validation.
- Supabase REST checks confirm all Phase 1 tables are reachable and anonymous sessions see zero rows.
- Root verification commands pass: lint, typecheck, test, format, and build.
- Security follow-up notes are tracked in `architecture/phase-1-security-review.md`.
