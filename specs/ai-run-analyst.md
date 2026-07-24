# AI Run Analyst Spec

Status: Draft  
Phase: AI Platform

## Executive Summary

The historical analyst answers questions about progress, training changes, and why recent runs may feel different. It uses precomputed trends and recent run context.

## Scope

In scope:

- Trend explanation
- Recent history analysis
- Goal-aware answers
- Evidence-backed response structure

Out of scope:

- Open-ended medical diagnosis
- Arbitrary SQL analysis
- Long-term plan generation

## User Stories

- As a runner, I can ask if I am improving.
- As a runner, I can ask why a recent run felt harder.
- As a runner, I can ask what changed in my training.

## Tools

- `getRecentRuns`
- `getWeeklyStats`
- `getGoal`
- `getRecoverySignals`

## Output Structure

- Direct answer
- Evidence from metrics
- Likely contributors
- Caveats
- Suggested next action

## Security Considerations

- The agent must not receive broad database access.
- The agent must not accept raw user IDs.
- User question text should be stored only when needed.

## Testing Plan

- No data scenario
- Sparse data scenario
- Clear improvement scenario
- Fatigue-risk scenario
- AI provider failure

## Acceptance Criteria

- Answers cite available metrics.
- Agent admits when data is insufficient.
- Response remains bounded and non-medical.
