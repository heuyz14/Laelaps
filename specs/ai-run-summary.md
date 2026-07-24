# AI Run Summary Spec

Status: Draft  
Phase: AI Platform

## Executive Summary

The run summary agent explains a single run using deterministic analytics and recent training context. It should produce a concise, grounded summary with one improvement suggestion.

## Scope

In scope:

- Single-run explanation
- Comparison to recent history
- Positive highlight
- One improvement suggestion
- Saved insight record

Out of scope:

- Training plan generation
- Medical advice
- Race prediction

## User Stories

- As a runner, I can ask what my run means.
- As a runner, I can understand whether a run was faster, longer, or harder than usual.
- As a runner, I get one useful next-step suggestion.

## Tool Inputs

- `runId`

## Required Tools

- `getRunById`
- `getComparableRuns`
- `getWeeklyStats`
- `saveInsight`

## Prompt Strategy

The agent should:

- Use only provided tool data.
- Avoid inventing missing context.
- Separate facts from interpretation.
- Keep the suggestion specific and limited.

## Output Contract

```json
{
  "summary": "string",
  "highlights": ["string"],
  "comparison": "string",
  "suggestedImprovement": "string",
  "confidence": "low | medium | high"
}
```

## Error Handling

- If run is missing, return a not-found error.
- If comparison data is sparse, state that comparison confidence is low.
- If AI call fails, keep run detail page usable.

## Acceptance Criteria

- Output references the target run.
- Output does not calculate unsupported metrics.
- Insight can be saved and reviewed later.
