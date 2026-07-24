# AI Memory Spec

Status: Draft  
Phase: AI Platform

## Executive Summary

AI memory stores durable coaching context such as goals, preferences, and saved insights. Memory should improve personalization without becoming an uncontrolled transcript store.

## Scope

In scope:

- Active goals
- Coaching preferences
- Saved structured insights
- Relevant historical summaries

Out of scope:

- Full chat transcript storage by default
- Sensitive health diagnosis storage
- Cross-user shared memory

## Memory Types

User profile memory:

- Preferred units
- Display name
- Coaching tone preference

Goal memory:

- Active target
- Target date
- Goal status

Insight memory:

- Run summaries
- Weekly coaching outputs
- Recovery observations

## Retention Principles

- Store structured facts over raw conversation text.
- Allow future deletion/export.
- Keep memory user-scoped.
- Avoid storing unnecessary sensitive notes.

## Acceptance Criteria

- Agents can retrieve active goals.
- Saved insights are linked to a user and optional run.
- Memory does not bypass RLS or authenticated access.
