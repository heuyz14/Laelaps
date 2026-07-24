# Deployment Spec

Status: Draft  
Phase: Production

## Executive Summary

RunLog AI is expected to move toward Google Cloud Platform hosting. Production setup must document environment variables, OAuth redirects, migrations, smoke tests, and cost controls before any real deployment configuration is committed.

## Scope

In scope:

- GCP hosting evaluation
- Free-tier-friendly deployment target selection
- Supabase production project
- Environment variables
- OAuth redirect configuration
- Migration application

Out of scope:

- Paid infrastructure
- Multi-region deployment
- Enterprise monitoring
- Final Terraform, Docker, or Cloud Build configuration

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
4. Choose the first GCP hosting target after the web app architecture is known.
5. Configure environment variables in the selected hosting service.
6. Deploy application.
7. Verify auth callback.
8. Run smoke test.

## GCP Direction

Candidate targets:

- Cloud Run for a server-rendered web app or combined web/API service.
- Firebase Hosting with a Cloud Run backend when static hosting plus dynamic routes is useful.
- Firebase App Hosting if the final Next.js app fits its supported workflow and cost model.

Cost-control requirements:

- Confirm current free-tier quotas before deploying.
- Prefer services that scale to zero or have explicit no-cost quotas.
- Add budget alerts before production traffic.
- Avoid committing real deployment config until the app architecture is known.

## Acceptance Criteria

- Production app loads.
- Google OAuth works.
- Authenticated dashboard loads.
- Run CRUD works.
- AI route fails gracefully if provider configuration is missing.
- Cost controls and budget-alert expectations are documented before launch.
