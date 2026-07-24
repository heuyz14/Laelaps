# Recovery Agent Spec

Status: Draft  
Phase: AI Platform

## Executive Summary

The recovery agent explains fatigue and recovery signals derived from deterministic analytics. It helps runners understand when to reduce load or keep runs easy.

## Scope

In scope:

- Volume spike explanation
- Effort clustering
- Heart-rate drift explanation when data exists
- Recovery recommendation

Out of scope:

- Injury diagnosis
- Medical advice
- Treatment plans

## Functional Requirements

- Read recent training load.
- Read effort distribution.
- Read heart-rate fields when available.
- Explain signals in plain language.
- Recommend conservative recovery actions.

## Error Handling

- If heart-rate data is unavailable, omit HR-specific analysis.
- If recent data is sparse, state low confidence.

## Acceptance Criteria

- Recovery advice is grounded in metrics.
- The agent avoids medical certainty.
- Sparse data produces cautious output.
