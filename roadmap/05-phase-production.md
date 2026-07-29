# Phase 5: Production

Status: Draft  
Target: End of Week 4  
Depends on: Phases 1-4

## Executive Summary

Phase 5 prepares Laelaps for deployment, demonstration, and portfolio review. The focus is reliability, security, documentation, observability, cost control, and a polished demo path.

## Scope

In scope:

- GCP deployment target selection
- Production Supabase configuration
- OAuth redirect configuration
- Environment variable documentation
- Error boundaries
- Observability
- Seed/demo data strategy
- Portfolio demo flow
- Root workspace verification

Out of scope:

- Paid infrastructure by default
- Native mobile app
- Public team collaboration features
- Final cloud infrastructure automation unless required for the chosen deployment target
- Terraform, Docker, or Cloud Build config without a concrete deployment need

## GCP Direction

Choose the first hosting target after the web app architecture is known.

Candidate targets:

- Cloud Run for server-rendered web/API deployment.
- Firebase Hosting with Cloud Run for static hosting plus dynamic backend routes.
- Firebase App Hosting if the final Next.js app fits its workflow and cost model.

Production readiness must include:

- Budget alerts
- Environment variable documentation
- OAuth redirect verification
- Secret-handling notes
- Smoke-test checklist
- Rollback notes

## Acceptance Criteria

- Production deployment works from a clean repository clone.
- Required environment variables are documented.
- OAuth works in production.
- App has meaningful loading, empty, and error states.
- Demo flow covers login, run creation, dashboard, run summary, and AI question.
- Documentation supports handoff to another developer.
- GCP cost-control expectations are documented before launch.
