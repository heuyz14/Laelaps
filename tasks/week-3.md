# Week 3 Tasks: Analytics and AI Foundation

Status: In progress

## Goal

Implement deterministic analytics, then expose those analytics to initial AI agents through scoped Mastra tools.

## Tasks

- [x] Create analytics module structure.
- [x] Implement pace calculations.
- [x] Implement weekly and monthly mileage.
- [x] Implement longest run and average pace.
- [x] Implement personal record detection.
- [x] Implement streak detection.
- [x] Implement effort zone grouping.
- [x] Implement comparable run selection.
- [x] Add analytics unit tests.
- [x] Surface analytics outputs in the dashboard.
- [x] Decide whether dashboard analytics should query more than recent runs.
- [ ] Add Mastra directory structure.
- [x] Implement authenticated `getRunById`.
- [x] Implement authenticated `getRecentRuns`.
- [x] Implement `getWeeklyStats` from deterministic analytics.
- [x] Implement authenticated `getGoal`.
- [x] Implement authenticated `getComparableRuns` and `getRecoverySignals`.
- [x] Implement authenticated `saveInsight`.
- [x] Build provider-independent run summary agent and protected API route.
- [x] Add run-detail summary UI and AI usage telemetry.
- [x] Build historical analyst agent and protected API route.

## Validation

- Analytics tests pass with known fixtures.
- AI tools do not accept client user IDs.
- Run summary is grounded in selected run data.
- Historical analyst states uncertainty when data is sparse.
