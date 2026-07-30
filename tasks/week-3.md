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
- [ ] Implement `getRunById`.
- [ ] Implement `getRecentRuns`.
- [ ] Implement `getWeeklyStats`.
- [ ] Implement `getGoal`.
- [ ] Implement `saveInsight`.
- [ ] Build run summary agent.
- [ ] Build historical analyst agent.

## Validation

- Analytics tests pass with known fixtures.
- AI tools do not accept client user IDs.
- Run summary is grounded in selected run data.
- Historical analyst states uncertainty when data is sparse.
