# Phase 1: Foundation

Status: Draft  
Target: Week 1  
Depends on: None

## Executive Summary

Phase 1 creates the base application, authentication, database schema, row-level security, and protected layout. The exit condition is a user who can sign in, sign out, and access authenticated application routes backed by Supabase.

## Scope

In scope:

- Next.js app setup
- Tailwind and shadcn/ui setup
- Supabase client configuration
- Google OAuth
- Session persistence
- Protected routes
- Initial schema
- RLS policies
- Basic app shell

Out of scope:

- AI agents
- Advanced analytics
- Run import integrations
- Production deployment automation

## Deliverables

- Working local development environment
- `.env.local.example`
- Supabase migration files
- Auth middleware
- Protected dashboard route
- Profile creation flow
- Initial README and architecture docs

## Acceptance Criteria

- User can authenticate with Google OAuth.
- Authenticated routes reject anonymous users.
- User profile exists after first sign-in.
- Database migrations can be applied from a clean Supabase project.
- RLS prevents users from reading or writing another user's records.
- Linting and formatting commands run successfully.
