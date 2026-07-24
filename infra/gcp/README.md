# Laelaps GCP Infrastructure Notes

Status: Placeholder

This directory is reserved for future Google Cloud Platform hosting and infrastructure documentation.

No deployment configuration is committed yet. The first implementation pass should choose a target after the web app architecture is known.

Likely options to evaluate:

- Cloud Run for a server-rendered web app or combined web/API service
- Firebase Hosting with Cloud Run for static hosting plus dynamic backend routes
- Firebase App Hosting if the final Next.js app fits its supported workflow

Before adding real deployment files:

- Confirm current free-tier quotas and billing requirements.
- Add budget alerts.
- Decide where secrets will live.
- Document local and production environment variables.
- Keep generated cloud state out of git.
