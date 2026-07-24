# Architecture Decisions

Status: Living document

## ADR-001: Deterministic Analytics Before AI

Decision: Laelaps will compute trusted metrics in application code before exposing them to agents.

Reasoning: Pace, volume, streaks, records, and recovery indicators need to be repeatable, testable, and inspectable. AI can explain these values but should not be trusted as the calculator.

Consequences:

- Analytics modules need stronger tests.
- Agent tools stay simpler.
- AI responses can be audited against known inputs.

## ADR-002: Supabase RLS as a Primary Authorization Boundary

Decision: User-owned tables will use Supabase row-level security.

Reasoning: RLS reduces the blast radius of application bugs and provides defense in depth for multi-user data.

Consequences:

- Migrations must include policies.
- Tests should verify cross-user access is blocked.

## ADR-003: Server Context Owns User Identity

Decision: Server actions, API routes, and Mastra tools will derive identity from authenticated server context.

Reasoning: Client-supplied user IDs are forgeable and should not determine ownership.

Consequences:

- Tool contracts avoid `userId` parameters.
- Data access helpers need consistent auth handling.
