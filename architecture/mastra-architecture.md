# Mastra Architecture

Status: Implemented for local MVP

## Executive Summary

Mastra is planned to power the AI layer for explanation, analysis, and coaching. The initial provider-independent tool contracts are being built first so agents can only fetch authenticated data and precomputed analytics.

The application uses provider-independent domain agents behind an
OpenAI-compatible server adapter, with Mastra 1.58 providing the typed runtime
registry in `apps/web/mastra`. This keeps provider configuration server-only and
allows the application routes to retain stable, testable boundaries.

## Directory Shape

```text
apps/web/mastra/
  index.ts
  tools.ts
```

## Agents

Run summary agent:

- Explains a single run.
- Compares the run to recent history.
- Highlights positives.
- Suggests one improvement.

Historical analyst agent:

- Answers trend questions.
- Explains changes in pace, volume, effort, and consistency.
- Identifies likely contributors without overstating certainty.

Training coach:

- Reviews recent history and active goals.
- Generates weekly recommendations.
- Flags risk from sudden workload changes.

Recovery agent:

- Looks for fatigue signals.
- Explains recovery needs.
- Avoids medical diagnosis.

## Tool Rules

- Tools must never accept `userId` from the client.
- Tools must derive user identity from authenticated server context.
- Tools must not expose arbitrary SQL.
- Tools should return compact, typed domain objects.
- Tools should log usage metadata.

## Initial Tools

- `getRunById`
- `getRecentRuns`
- `getWeeklyStats`
- `getGoal`
- `getComparableRuns`
- `getRecoverySignals`
- `saveInsight`
- `getSavedInsights`

## Prompt Strategy

Prompts should instruct agents to:

- Use only provided tool data.
- Say when data is insufficient.
- Avoid medical certainty.
- Separate observation from recommendation.
- Prefer one actionable next step over broad advice.
