# Phase 1 Security Review Notes

Status: Open review notes  
Phase: Foundation  
Last updated: 2026-07-30

## Summary

Phase 1 uses Supabase Auth for account identity, Supabase Postgres for user-owned data, and row-level security as the primary database authorization boundary.

The implementation now supports:

- Google OAuth sign-in
- Email/password sign-up and sign-in
- Server-side session checks
- Protected dashboard routing
- Profile bootstrap after sign-in
- Initial user-owned schema and RLS policies

## Current Controls

- `.env.local` is ignored by git.
- Browser code only uses `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- No `SUPABASE_SERVICE_ROLE_KEY` usage exists in the web app.
- Auth sessions are managed through Supabase SSR cookie helpers.
- Protected `/dashboard` access checks the authenticated Supabase user.
- Email/password form input is validated with Zod before calling Supabase Auth.
- Auth error messages are generic and do not intentionally reveal account existence.
- RLS policies constrain user-owned rows with `auth.uid()`.

## Security Concerns To Revisit

### Rate Limiting

The app does not currently implement app-level rate limiting for auth entry points.

Current risk:

- `/auth/sign-in` can be repeatedly requested.
- Email/password forms can be repeatedly submitted.
- Supabase and Google provide baseline abuse controls, but the application does not yet add its own throttling.

Recommended later action:

- Add rate limiting before production.
- Consider per-IP and per-account throttles for auth attempts.
- Keep error responses generic.

### GET Sign-Out

Sign-out currently uses a `GET` route.

Current risk:

- A third-party page could trigger logout by linking to the sign-out URL.
- This is not data loss, but it is still undesirable behavior.

Recommended later action:

- Move sign-out to a POST form action before production.
- Keep CSRF exposure low by using same-site cookies and POST-only mutation routes.

### Profile Bootstrap Overwrite Behavior

`ensureUserProfile` currently upserts `display_name` from auth metadata when the dashboard loads.

Current risk:

- If users can later edit profile names inside Laelaps, a later dashboard load could overwrite that value from OAuth metadata.

Recommended later action:

- Change profile bootstrap to create missing rows only.
- Keep profile edits owned by explicit profile update actions.

### AI Tables Are Client-Insertable

`ai_insights` and `ai_usage` currently allow authenticated users to insert rows through RLS.

Current risk:

- User ownership is enforced, but the app cannot treat those rows as trusted AI-generated records if clients can write them directly.

Recommended later action:

- Before Phase 4, move trusted AI insight and AI usage writes to server-only code.
- Consider revoking direct insert/update/delete access for AI audit tables from normal authenticated clients.

### Database Constraint Tightening

Some app-level validation is stricter than database constraints.

Current risk:

- `profiles.display_name` has no database length constraint.
- `notes` and JSON fields may need size limits before upload/import/AI features expand.

Recommended later action:

- Add database-level length checks for user-editable text.
- Add input size limits on all future form actions and API routes.

### Production Headers And Deployment Hardening

Phase 1 does not yet define final production headers, CSP, monitoring, or deployment hardening.

Current risk:

- Acceptable for local MVP work.
- Not sufficient for production launch.

Recommended later action:

- Add production security headers.
- Add an error boundary.
- Add logging/observability decisions.
- Document production OAuth redirect URLs and environment variables.

## Phase 2 Entry Recommendation

Phase 2 can proceed after:

- Google OAuth sign-in is manually verified.
- Email/password sign-up and sign-in are manually verified.
- A profile row is created after first sign-in for both auth methods.
- RLS checks remain isolated for user-owned tables.

Rate limiting and production hardening should be tracked, but they do not block local Phase 2 implementation.
