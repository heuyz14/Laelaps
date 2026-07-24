# Mastra Architecture

Status: Draft

## Executive Summary

Mastra powers the AI layer for explanation, analysis, and coaching. Agents interact with the application through typed tools that fetch authenticated data and precomputed analytics.

## Directory Shape

```text
src/mastra/
  agents/
  tools/
  prompts/
  workflows/
  schemas/
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

## Prompt Strategy

Prompts should instruct agents to:

- Use only provided tool data.
- Say when data is insufficient.
- Avoid medical certainty.
- Separate observation from recommendation.
- Prefer one actionable next step over broad advice.
