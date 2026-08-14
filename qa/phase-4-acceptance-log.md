# Phase 4 Acceptance Log: AI Platform

Status: Complete for the local MVP. Production hosting and OAuth deployment configuration remain release tasks.

## Delivered

- Authenticated AI tools derive the user from the server Supabase session. No tool accepts a client-supplied `userId`.
- Provider-independent agents cover run summaries, historical analysis, training coaching, and recovery analysis.
- OpenRouter provider configuration uses the free model router or explicit `:free` model variants without exposing server keys to the browser.
- Structured Zod output contracts reject malformed provider responses before persistence.
- Insights are stored in `ai_insights` and can be retrieved through `getSavedInsights` and `GET /api/ai/insights`.
- Usage telemetry is written to `ai_usage` for success, error, and skipped/not-configured paths.
- The Training dashboard includes recovery and historical review controls with loading, error, empty, and success states.
- Mastra 1.58 is registered in `apps/web/mastra` with typed tools, four agents, and a committed run-summary workflow. Existing routes keep the provider adapter as the stable application boundary.

## Verification

Run from `laelaps/`:

```bash
pnpm verify
```

This runs formatting, ESLint, TypeScript, Vitest, and the Next production build. Unit coverage includes analytics, provider parsing, run summary, historical analysis, training coach, recovery analysis, and UI behavior.

## Required Local Configuration

Copy `.env.local.example` to `.env.local` and set the existing Supabase values. AI requests require `OPENROUTER_API_KEY`. `OPENROUTER_MODEL` is optional and defaults to `openrouter/free`; if set, it must be `openrouter/free` or a specific OpenRouter model ID ending in `:free`. `MASTRA_MODEL` is optional and only controls the registered Mastra model identifier.

Core run logging and analytics continue to work when AI configuration or the upstream provider is unavailable.
