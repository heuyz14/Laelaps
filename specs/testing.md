# Testing Spec

Status: Draft

## Executive Summary

Testing should focus on the highest-risk boundaries: analytics correctness, authentication and authorization, run CRUD, AI tool grounding, and production smoke flows.

## Scope

In scope:

- Unit tests for analytics
- Server action/API tests where practical
- RLS policy verification
- Component tests for key states
- AI evaluation scenarios
- End-to-end smoke tests

Out of scope:

- Exhaustive visual regression testing in MVP
- Load testing beyond basic sanity checks

## Test Categories

Unit tests:

- Analytics calculations
- Validation schemas
- Formatting helpers

Integration tests:

- Run CRUD
- Dashboard data loading
- Agent tool data retrieval

Security tests:

- Anonymous access blocked
- Cross-user data blocked
- Client-supplied user IDs ignored

AI evaluations:

- No data
- Sparse data
- Clear progress
- Fatigue risk
- Mixed units
- Provider failure
- Rate limit

End-to-end smoke tests:

- Sign in
- Add run
- View dashboard
- Generate run summary
- Ask historical question

## Acceptance Criteria

- Analytics tests pass before AI features are enabled.
- Auth and RLS tests cover cross-user data boundaries.
- AI evals verify grounded behavior and graceful failure.
