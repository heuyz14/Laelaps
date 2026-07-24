# Authentication Spec

Status: Draft  
Phase: Foundation

## Executive Summary

Authentication provides secure sign-in, sign-out, session persistence, profile creation, and protected application routes using Supabase Auth and Google OAuth.

## Scope

In scope:

- Google OAuth sign-in
- Logout
- Session persistence
- Protected routes
- Profile bootstrap after first sign-in
- Auth-aware navigation

Out of scope:

- Password authentication
- Team accounts
- Role-based administration

## User Stories

- As a runner, I can sign in with Google so I do not need a separate password.
- As a signed-in user, I can return later and remain authenticated.
- As an anonymous visitor, I cannot access private training data.

## Functional Requirements

- The app shall provide a Google OAuth sign-in entry point.
- The app shall create a profile record for new users.
- The app shall redirect anonymous users away from protected routes.
- The app shall allow signed-in users to sign out.

## Non-Functional Requirements

- Auth state changes should be reflected without stale UI.
- Auth middleware should add minimal latency.
- Auth errors should be visible and recoverable.

## UI/UX Flows

- Anonymous user opens app and sees sign-in screen.
- User signs in with Google.
- User lands on dashboard.
- User signs out and returns to public entry state.

## Database Changes

- `profiles` table keyed by `auth.users.id`.
- RLS policy requiring `id = auth.uid()`.

## API Contracts

Server utilities should expose:

- `getCurrentUser()`
- `requireUser()`
- `getUserProfile()`
- `ensureUserProfile()`

## Error Handling

- OAuth callback failure shows a generic authentication error.
- Missing session redirects to sign-in.
- Profile creation failure shows retry option.

## Security Considerations

- Never expose service role keys to the browser.
- Do not trust user IDs submitted from forms.
- Ensure OAuth redirect URLs are configured for local and production environments.

## Testing Plan

- Middleware redirects anonymous users.
- Signed-in users access protected routes.
- Profile bootstrap is idempotent.
- Logout clears authenticated UI state.

## Acceptance Criteria

- A new user can sign in and receives a profile.
- A returning user stays signed in.
- Private routes are inaccessible without a session.

## Future Enhancements

- Email magic link auth
- Account deletion flow
- Data export flow
