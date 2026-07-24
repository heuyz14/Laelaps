# Observability Spec

Status: Draft  
Phase: Production

## Executive Summary

Observability should make application failures, AI failures, and unusual usage visible without collecting unnecessary sensitive data.

## Scope

In scope:

- Error logging
- AI usage records
- Basic latency tracking
- User-safe diagnostic events

Out of scope:

- Paid observability stack in MVP
- Full session replay
- Sensitive prompt transcript storage

## Events

Recommended events:

- Auth failure
- Run create/update/delete failure
- AI request started
- AI request completed
- AI request failed
- Rate limit hit

## AI Usage Tracking

Store:

- User ID
- Agent name
- Tool names
- Status
- Latency
- Timestamp

Avoid storing:

- Full private notes unless explicitly needed
- Access tokens
- Provider secrets

## Acceptance Criteria

- AI failures can be diagnosed.
- Core app errors are visible during development.
- Logs do not leak secrets.
