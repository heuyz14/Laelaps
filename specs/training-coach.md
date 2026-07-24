# Training Coach Spec

Status: Draft  
Phase: AI Platform

## Executive Summary

The training coach workflow produces weekly guidance using recent history, goals, deterministic metrics, and recovery signals.

## Scope

In scope:

- Weekly recommendation
- Goal-aware coaching
- Fatigue and volume review
- Next-run suggestion

Out of scope:

- Fully automated calendar planning
- Medical diagnosis
- Guaranteed race predictions

## Workflow

1. Fetch recent runs.
2. Fetch active goal.
3. Calculate weekly metrics.
4. Detect fatigue and workload changes.
5. Generate recommendation.
6. Save structured insight.

## Output Contract

```json
{
  "weeklySummary": "string",
  "recommendation": "string",
  "nextRunSuggestion": "string",
  "riskFlags": ["string"],
  "confidence": "low | medium | high"
}
```

## Prompt Strategy

- Prioritize safe, conservative training guidance.
- Avoid increasing intensity when recovery signals are poor.
- Make uncertainty explicit when history is limited.

## Acceptance Criteria

- Recommendation uses recent training data.
- Goal context changes the advice.
- Fatigue flags affect recommendations.
- Output is saved for later review.
