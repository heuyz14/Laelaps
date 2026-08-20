# Laelaps

### Evidence-backed training intelligence for runners.

Laelaps turns manually logged runs into clear training insight. Deterministic analytics calculate the facts—distance, pace, mileage, streaks, effort, and recovery signals—while grounded AI explains what those facts mean.

## What you can do

- Log, edit, and review runs
- Track goals and running shoes
- Explore Overview, Training, and History dashboard views
- Analyze pace, volume, streaks, effort zones, and recovery
- Ask AI questions grounded in your authenticated training data
- Choose kilometers or miles for dashboard and AI output

## Product principles

Laelaps keeps trusted calculations in the application and uses AI for explanation. User data is protected by authenticated Supabase access and row-level security.

## Demo flow

1. Sign in
2. Add a run
3. Review dashboard analytics
4. Ask a Training chat question
5. Open History to inspect the run
6. Change distance units in Settings

<details>
<summary>Run locally</summary>

### Requirements

- Node.js 20+
- pnpm 11
- Supabase project
- OpenRouter API key for AI chat (optional)

```bash
git clone https://github.com/heuyz14/Laelaps.git
cd Laelaps
corepack enable
pnpm install --frozen-lockfile
cp .env.local.example apps/web/.env.local
```

Set the safe public and server-only variable names listed in `.env.local.example`. Never commit `.env.local`.

Apply the database migrations:

```bash
cd apps/web
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
cd ../..
pnpm web:dev
```

Open [http://localhost:3000](http://localhost:3000).

Useful checks:

```bash
pnpm web:health
pnpm verify
```

Do not run `supabase db reset` against data you need to keep.

</details>

## Built with

Next.js · TypeScript · Tailwind CSS · Supabase · Vitest · Mastra · OpenRouter

## Project map

- [Roadmap](roadmap/00-master-roadmap.md)
- [Architecture](architecture/system-design.md)
- [Security](architecture/security.md)
- [AI platform](roadmap/04-phase-ai-platform.md)
- [Production plan](roadmap/05-phase-production.md)
