# Week 1 Tasks: Foundation

Status: Draft

## Goal

Create the working foundation: app setup, Supabase auth, schema, RLS, and protected routes.

## Tasks

- Initialize Next.js application structure.
- Install and configure Tailwind CSS.
- Add shadcn/ui setup.
- Create Supabase project configuration.
- Add `.env.local.example`.
- Implement Supabase browser and server clients.
- Configure Google OAuth.
- Add auth callback route.
- Add protected route middleware.
- Create `profiles`, `runs`, `shoes`, `goals`, `ai_insights`, and `ai_usage` migrations.
- Enable RLS and ownership policies.
- Build signed-in app shell.
- Add profile bootstrap.

## Validation

- User can sign in.
- User can sign out.
- Protected routes reject anonymous sessions.
- Migration applies cleanly.
- Cross-user data access is blocked.
