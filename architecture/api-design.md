# API Design

Status: Draft

## Executive Summary

RunLog AI should prefer server actions for form-driven mutations and API routes for agent workflows or client-side fetches that need explicit HTTP contracts.

## API Principles

- Authenticate every request that reads or writes user data.
- Validate all request bodies at the server boundary.
- Return typed errors with stable codes.
- Avoid exposing database implementation details.
- Keep AI endpoints asynchronous-friendly, even if initially implemented synchronously.

## Error Shape

```json
{
  "error": {
    "code": "RUN_NOT_FOUND",
    "message": "Run not found."
  }
}
```

## Candidate Routes

### `POST /api/runs`

Creates a run.

Request:

```json
{
  "runDate": "2026-07-24",
  "distanceMeters": 5000,
  "durationSeconds": 1800,
  "avgHeartRate": 145,
  "effort": 6,
  "notes": "Easy run"
}
```

Response:

```json
{
  "run": {
    "id": "uuid",
    "runDate": "2026-07-24"
  }
}
```

### `GET /api/runs`

Lists authenticated user's runs with optional filters.

Query parameters:

- `from`
- `to`
- `limit`
- `cursor`

### `POST /api/ai/run-summary`

Generates a grounded run summary.

Request:

```json
{
  "runId": "uuid"
}
```

Response:

```json
{
  "insightId": "uuid",
  "summary": "string",
  "highlights": ["string"],
  "suggestedImprovement": "string"
}
```

## Server Actions

Likely server actions:

- `createRun`
- `updateRun`
- `deleteRun`
- `createGoal`
- `updateGoal`
- `createShoe`
- `retireShoe`
