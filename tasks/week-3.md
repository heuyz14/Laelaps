# Week 3 Tasks: Analytics and AI Foundation

Status: Draft

## Goal

Implement deterministic analytics, then expose those analytics to initial AI agents through scoped Mastra tools.

## Tasks

- Create analytics module structure.
- Implement pace calculations.
- Implement weekly and monthly mileage.
- Implement longest run and average pace.
- Implement personal record detection.
- Implement streak detection.
- Implement effort zone grouping.
- Implement comparable run selection.
- Add analytics unit tests.
- Add Mastra directory structure.
- Implement `getRunById`.
- Implement `getRecentRuns`.
- Implement `getWeeklyStats`.
- Implement `getGoal`.
- Implement `saveInsight`.
- Build run summary agent.
- Build historical analyst agent.

## Validation

- Analytics tests pass with known fixtures.
- AI tools do not accept client user IDs.
- Run summary is grounded in selected run data.
- Historical analyst states uncertainty when data is sparse.
