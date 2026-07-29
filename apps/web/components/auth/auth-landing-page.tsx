import {
  Activity,
  ArrowUpRight,
  Brain,
  Check,
  Gauge,
  LockKeyhole,
  Route,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { EmailPasswordPanel } from "@/components/auth/email-password-panel";
import { Button } from "@/components/ui/button";
import type { AuthMessage } from "@/lib/auth/auth-messages";
import { cn } from "@/lib/utils";

const valuePoints = [
  {
    icon: LockKeyhole,
    label: "Private training history",
  },
  {
    icon: Gauge,
    label: "Verified analytics",
  },
  {
    icon: Brain,
    label: "Personalized coaching insights",
  },
];

const metrics = [
  {
    label: "Weekly distance",
    value: "42.8 km",
    detail: "+8% vs last week",
  },
  {
    label: "Average pace",
    value: "5:18 /km",
    detail: "steady aerobic range",
  },
  {
    label: "Training load",
    value: "74",
    detail: "productive",
  },
  {
    label: "Recovery status",
    value: "Good",
    detail: "easy run suggested",
  },
];

const chartBars = [42, 58, 51, 76, 64, 88, 72];

export function AuthLandingPage({
  authMessage,
}: {
  authMessage: AuthMessage | null;
}) {
  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-background">
      <BackgroundPattern />
      <section className="relative z-10 mx-auto grid min-h-screen w-full max-w-[90rem] items-center gap-10 px-5 py-8 sm:px-8 lg:grid-cols-[minmax(0,0.48fr)_minmax(0,0.52fr)] lg:gap-12 lg:px-10 lg:py-12 xl:px-12">
        <HeroContent authMessage={authMessage} />
        <ProductPreview />
      </section>
    </main>
  );
}

function HeroContent({ authMessage }: { authMessage: AuthMessage | null }) {
  return (
    <section
      className="auth-entrance w-full max-w-[42rem]"
      aria-labelledby="landing-title"
    >
      <div className="mb-7 flex items-center gap-4">
        <BrandMark />
        <div>
          <p className="text-2xl font-semibold leading-8 text-foreground sm:text-3xl sm:leading-9">
            Laelaps
          </p>
          <p className="mt-0.5 text-sm leading-5 text-muted-foreground sm:text-base sm:leading-6">
            Running intelligence platform
          </p>
        </div>
      </div>

      <div className="mb-6 inline-flex max-w-full items-start gap-2.5 rounded-2xl border border-primary/15 bg-white/70 px-4 py-2.5 text-sm font-medium leading-6 text-muted-foreground shadow-sm backdrop-blur sm:items-center sm:rounded-full sm:text-base">
        <Sparkles
          className="h-[1.125rem] w-[1.125rem] shrink-0 text-primary"
          aria-hidden="true"
        />
        Built for evidence-backed training decisions
      </div>

      <h1
        id="landing-title"
        className="max-w-[42rem] text-5xl font-semibold leading-[1.02] tracking-normal text-foreground sm:text-6xl lg:text-[4.25rem]"
      >
        Train with clarity.
        <span className="block text-muted-foreground">
          Understand every run.
        </span>
      </h1>

      <p className="mt-6 max-w-[38rem] text-base leading-7 text-muted-foreground sm:text-lg lg:text-xl lg:leading-8">
        Laelaps turns your running history into clear training insights,
        combining trusted analytics with AI explanations that stay grounded in
        your data.
      </p>

      <div className="mt-8 w-full max-w-[28.5rem]">
        <GoogleSignInButton />
        <EmailPasswordPanel authMessage={authMessage} />
        <PrivacyNote />
      </div>
    </section>
  );
}

function PrivacyNote() {
  return (
    <p className="mt-3 flex items-start gap-2 text-sm leading-6 text-muted-foreground">
      <ShieldCheck
        className="mt-0.5 h-4 w-4 shrink-0 text-primary"
        aria-hidden="true"
      />
      Your data stays private. Authentication is handled through Supabase,
      Google OAuth, or email/password credentials.
    </p>
  );
}

function GoogleSignInButton() {
  return (
    <Button
      asChild
      size="lg"
      className="h-14 w-full rounded-xl bg-[linear-gradient(135deg,hsl(var(--primary)),#d93613)] px-6 text-base shadow-[0_18px_40px_rgba(252,76,2,0.22)] transition duration-200 hover:translate-y-[-1px] hover:shadow-[0_22px_46px_rgba(252,76,2,0.28)] focus-visible:ring-offset-background motion-reduce:transform-none"
    >
      <a href="/auth/sign-in" aria-label="Continue with Google">
        <GoogleIcon />
        Continue with Google
        <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
      </a>
    </Button>
  );
}

function ProductPreview() {
  return (
    <section
      className="auth-entrance relative mx-auto w-full max-w-[46rem] lg:justify-self-end"
      aria-label="Laelaps dashboard preview"
    >
      <div className="absolute -inset-5 -z-10 rounded-[2rem] bg-[radial-gradient(circle_at_50%_30%,rgba(252,76,2,0.14),transparent_58%)] blur-2xl" />
      <ValuePillBar />
      <div className="rounded-[2rem] border border-white/80 bg-white/80 p-2.5 shadow-[0_28px_80px_rgba(25,27,31,0.14)] backdrop-blur-xl">
        <div className="overflow-hidden rounded-[1.5rem] border border-border/80 bg-card">
          <PreviewHeader />

          <div className="grid gap-3 p-4 sm:grid-cols-2">
            {metrics.map((metric) => (
              <MetricCard key={metric.label} {...metric} />
            ))}
          </div>

          <div className="grid gap-3 border-t bg-[#fbfaf8] p-4 lg:grid-cols-[1fr_0.78fr]">
            <MileageChart />
            <InsightCard />
          </div>
        </div>
      </div>
    </section>
  );
}

function ValuePillBar() {
  return (
    <ul className="mb-4 grid w-full gap-3 text-sm text-foreground sm:grid-cols-3">
      {valuePoints.map((item) => (
        <li
          key={item.label}
          className="grid min-h-20 grid-cols-[2.5rem_minmax(0,1fr)] items-center gap-3 rounded-2xl border border-border/80 bg-white/70 px-4 py-3.5 shadow-sm backdrop-blur"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <item.icon className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="text-balance font-medium leading-5">
            {item.label}
          </span>
        </li>
      ))}
    </ul>
  );
}

function PreviewHeader() {
  return (
    <div className="flex flex-col items-start justify-between gap-3 border-b bg-white px-4 py-3.5 sm:flex-row sm:items-center sm:gap-4 sm:px-5">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
          This week
        </p>
        <h2 className="mt-1 text-lg font-semibold text-foreground">
          Training dashboard
        </h2>
      </div>
      <div className="flex items-center gap-2 rounded-full border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground">
        <Activity className="h-3.5 w-3.5 text-primary" aria-hidden="true" />7
        runs logged
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <article className="rounded-2xl border border-border/80 bg-white p-3.5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2.5 text-2xl font-semibold tracking-normal text-foreground">
        {value}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
    </article>
  );
}

function MileageChart() {
  return (
    <article className="rounded-2xl border border-border/80 bg-white p-3.5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Mileage trend
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Last 7 training days
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
          <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
          +12%
        </div>
      </div>

      <div
        className="mt-4 flex h-32 items-end gap-2"
        role="img"
        aria-label="Mileage chart showing a steady upward training trend across seven days"
      >
        {chartBars.map((height, index) => (
          <div
            key={height}
            className="flex flex-1 flex-col items-center gap-2"
            aria-hidden="true"
          >
            <div
              className={cn(
                "w-full rounded-t-xl bg-gradient-to-t from-primary to-[#e43d18] opacity-85 shadow-sm",
                index === chartBars.length - 2 && "opacity-100",
              )}
              style={{ height: `${height}%` }}
            />
            <span className="text-[0.68rem] font-medium text-muted-foreground">
              {["M", "T", "W", "T", "F", "S", "S"][index]}
            </span>
          </div>
        ))}
      </div>
    </article>
  );
}

function InsightCard() {
  return (
    <article className="flex min-h-full flex-col justify-between rounded-2xl border border-primary/15 bg-[linear-gradient(145deg,#fff8f4,#ffffff_58%)] p-3.5 shadow-sm">
      <div>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
          <Sparkles className="h-5 w-5" aria-hidden="true" />
        </div>
        <h3 className="mt-4 text-sm font-semibold text-foreground">
          AI insight
        </h3>
        <p className="mt-2.5 text-lg font-semibold leading-snug text-foreground">
          Your easy-run pace is becoming more consistent.
        </p>
        <p className="mt-2.5 text-sm leading-6 text-muted-foreground">
          Similar-effort runs varied by only 4 seconds per kilometer this week,
          a sign your aerobic base is stabilizing.
        </p>
      </div>
      <div className="mt-4 flex items-center gap-2 text-sm font-medium text-primary">
        <Check className="h-4 w-4" aria-hidden="true" />
        Grounded in verified metrics
      </div>
    </article>
  );
}

function BrandMark() {
  return (
    <div
      className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,hsl(var(--primary)),#d93613)] text-primary-foreground shadow-[0_16px_36px_rgba(252,76,2,0.24)] sm:h-[4.5rem] sm:w-[4.5rem]"
      aria-hidden="true"
    >
      <Route className="h-8 w-8 sm:h-9 sm:w-9" strokeWidth={2.4} />
    </div>
  );
}

function BackgroundPattern() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <div className="absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.08] blur-3xl" />
      <div className="absolute left-[58%] top-[60%] h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d93613]/[0.06] blur-3xl" />
      <svg
        className="absolute inset-x-0 top-20 mx-auto h-[32rem] w-full max-w-6xl text-primary/[0.08]"
        viewBox="0 0 1120 520"
        fill="none"
      >
        <path
          d="M8 392C146 238 255 487 399 311C529 151 650 119 760 213C863 301 958 268 1112 94"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="8 14"
        />
        <path
          d="M68 462C191 322 313 376 421 236C538 85 668 58 794 142C902 214 988 186 1076 42"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="3 18"
        />
      </svg>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="#fff"
        d="M21.6 12.23c0-.72-.06-1.25-.18-1.8h-9.2v3.56h5.4c-.11.9-.7 2.25-2.02 3.16l-.02.12 2.93 2.27.2.02c1.86-1.72 2.89-4.25 2.89-7.33Z"
      />
      <path
        fill="#fff"
        d="M12.22 21.8c2.65 0 4.88-.87 6.5-2.37l-3.1-2.4c-.82.57-1.93.98-3.4.98a5.91 5.91 0 0 1-5.59-4.08l-.11.01-3.05 2.36-.04.11a9.8 9.8 0 0 0 8.79 5.39Z"
      />
      <path
        fill="#fff"
        d="M6.63 13.93a6.04 6.04 0 0 1-.32-1.93c0-.67.12-1.32.31-1.93l-.01-.13-3.09-2.39-.1.05a9.78 9.78 0 0 0 0 8.8l3.21-2.47Z"
      />
      <path
        fill="#fff"
        d="M12.22 5.99c1.84 0 3.08.8 3.79 1.46l2.77-2.7A9.45 9.45 0 0 0 12.22 2a9.8 9.8 0 0 0-8.8 5.4l3.2 2.48a5.94 5.94 0 0 1 5.6-3.89Z"
      />
    </svg>
  );
}
