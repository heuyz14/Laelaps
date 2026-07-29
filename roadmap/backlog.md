# Backlog

Status: Living document

## Near-Term Enhancements

- Run tags such as easy, workout, race, long run, recovery
- Manual weather notes
- Shoe mileage warnings
- Goal progress charts
- Export user data as CSV
- Advanced filtering by date, distance, effort, and shoe
- Web-first onboarding checklist

## AI Enhancements

- Monthly training report
- Race-readiness explanation
- Training plan adaptation suggestions
- Coach tone preferences
- Saved Q&A threads
- Evaluation suite for common coaching questions

## Auth Enhancements

- Magic link sign-in
- Apple login
- Account deletion flow
- Data export flow

## Integrations

- Strava sync as an optional connected activity source
- Garmin sync
- Apple Health import
- Coros import
- GPX/FIT file upload

## Platform Enhancements

- Mobile-first PWA behavior
- Offline draft run entry
- Email summaries
- Social sharing
- Public profile opt-in
- Future `apps/mobile` scaffold after web package boundaries are stable

## Package Candidates

- `packages/analytics` for deterministic metric calculations
- `packages/types` for stable domain types
- `packages/db` for database helpers and generated types
- `packages/config` for shared TypeScript, lint, or test configuration
- `packages/ui` after reusable web/mobile UI needs are clear

## Infrastructure Candidates

- GCP Cloud Run deployment notes
- Firebase Hosting plus Cloud Run evaluation
- Firebase App Hosting evaluation
- Budget alert checklist
- Environment variable inventory
- Smoke-test runbook

## Deferred Questions

- Should training plans be stored as first-class records?
- Should goals support multiple active races?
- How much memory should agents retain by default?
- What data should be exportable or deletable for privacy requests?
- What is the first mobile use case that justifies `apps/mobile`?
- Which GCP target best fits the final web architecture and free-tier constraints?
- Which connected activity source should come first: Strava, Garmin, Apple Health, or file import?
- Should Strava ever be offered as a sign-in provider, or only as a connected data source?
