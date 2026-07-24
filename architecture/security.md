# Security

Status: Draft

## Executive Summary

RunLog AI stores personal training data, goals, and AI-generated coaching notes. Security must focus on authentication, authorization, RLS, scoped AI tools, safe logging, and privacy-conscious data retention.

## Security Requirements

- All user-owned records must be protected by RLS.
- Server code must not trust client-supplied ownership fields.
- AI tools must use authenticated context.
- Secrets must only be stored in environment variables.
- Logs must avoid sensitive free-text run notes where practical.
- Production OAuth redirect URLs must be explicit.

## Threat Model

Primary risks:

- User reads or modifies another user's runs.
- Client submits a forged `user_id`.
- AI tool exposes broad database access.
- Prompt injection causes agent to ignore tool boundaries.
- Logs capture sensitive training notes.
- Environment variables leak into client bundle.

## Controls

- Supabase RLS policies on all user-owned tables.
- Server-side ownership checks for mutations.
- Schema validation for every write path.
- Tool allowlist for AI access.
- Rate limiting for AI routes.
- Clear separation of public and server-only environment variables.

## AI Safety Boundary

AI output is guidance, not a source of truth. Trusted numeric metrics must come from application analytics. If an agent cannot retrieve enough context, it should state the limitation and avoid guessing.
