# Deployment Spec

Status: Draft  
Phase: Production

## Executive Summary

RunLog AI should deploy to Vercel with Supabase as the backend. Production setup must document environment variables, OAuth redirects, migrations, and verification steps.

## Scope

In scope:

- Vercel deployment
- Supabase production project
- Environment variables
- OAuth redirect configuration
- Migration application

Out of scope:

- Paid infrastructure
- Multi-region deployment
- Enterprise monitoring

## Environment Variables

Expected variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- AI provider API key
- Mastra runtime configuration values as needed

## Deployment Steps

1. Create Supabase project.
2. Apply migrations.
3. Configure Google OAuth.
4. Configure Vercel environment variables.
5. Deploy application.
6. Verify auth callback.
7. Run smoke test.

## Acceptance Criteria

- Production app loads.
- Google OAuth works.
- Authenticated dashboard loads.
- Run CRUD works.
- AI route fails gracefully if provider configuration is missing.
