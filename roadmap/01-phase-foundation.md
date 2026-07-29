# Phase 1: Foundation

Status: Draft  
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
- Run import integrations
- Production deployment automation
- Final GCP deployment configuration

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
- Auth middleware
- Protected dashboard route
- Profile creation flow
- Initial README and architecture docs
- Confirmed pnpm workspace commands from the repository root

## Acceptance Criteria

- Root workspace scripts run without recursion or unexpected failures.
- User can authenticate with Google OAuth.
- Authenticated routes reject anonymous users.
- User profile exists after first sign-in.
- Database migrations can be applied from a clean Supabase project.
- RLS prevents users from reading or writing another user's records.
- Linting and formatting commands run successfully.
