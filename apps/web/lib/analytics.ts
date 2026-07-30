export type AnalyticsRun = {
  id: string;
  runDate: string;
  distanceMeters: number;
  durationSeconds: number;
  effort?: number | null;
  avgHeartRate?: number | null;
  maxHeartRate?: number | null;
};

export type PeriodMileage = {
  period: string;
  distanceMeters: number;
  runCount: number;
};

export type EffortZoneName = "easy" | "moderate" | "hard" | "unknown";

export type EffortZoneSummary = Record<
  EffortZoneName,
  {
    runCount: number;
    distanceMeters: number;
  }
>;

export type RecoverySignal = {
  kind: "volume_spike" | "hard_effort_cluster" | "elevated_heart_rate";
  severity: "low" | "medium" | "high";
  message: string;
};

export type RunAnalytics = {
  summary: {
    runCount: number;
    invalidRunCount: number;
    distanceMeters: number;
    durationSeconds: number;
    averagePaceSecondsPerKm: number | null;
    longestRunMeters: number;
  };
  weeklyMileage: PeriodMileage[];
  monthlyMileage: PeriodMileage[];
  personalRecords: {
    longestRun: AnalyticsRun | null;
    fastestPace: (AnalyticsRun & { paceSecondsPerKm: number }) | null;
  };
  streaks: {
    currentRunDayStreak: number;
    longestRunDayStreak: number;
    currentRunWeekStreak: number;
  };
  effortZones: EffortZoneSummary;
  recoverySignals: RecoverySignal[];
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function buildRunAnalytics(runs: AnalyticsRun[]): RunAnalytics {
  const { validRuns, invalidRunCount } = partitionValidRuns(runs);
  const distanceMeters = sum(validRuns, (run) => run.distanceMeters);
  const durationSeconds = sum(validRuns, (run) => run.durationSeconds);
  const longestRun = getLongestRun(validRuns);

  return {
    summary: {
      runCount: validRuns.length,
      invalidRunCount,
      distanceMeters,
      durationSeconds,
      averagePaceSecondsPerKm:
        distanceMeters > 0
          ? Math.round(durationSeconds / (distanceMeters / 1000))
          : null,
      longestRunMeters: longestRun?.distanceMeters ?? 0,
    },
    weeklyMileage: groupMileage(validRuns, getIsoWeekPeriod),
    monthlyMileage: groupMileage(validRuns, (run) => run.runDate.slice(0, 7)),
    personalRecords: {
      longestRun,
      fastestPace: getFastestPaceRun(validRuns),
    },
    streaks: getStreaks(validRuns),
    effortZones: getEffortZones(validRuns),
    recoverySignals: getRecoverySignals(validRuns),
  };
}

export function selectComparableRuns(
  runs: AnalyticsRun[],
  options: {
    targetDistanceMeters: number;
    excludeRunId?: string;
    limit?: number;
    distanceTolerance?: number;
  },
) {
  const limit = options.limit ?? 5;
  const distanceTolerance = options.distanceTolerance ?? 0.2;
  const minimumDistance =
    options.targetDistanceMeters * (1 - distanceTolerance);
  const maximumDistance =
    options.targetDistanceMeters * (1 + distanceTolerance);

  return partitionValidRuns(runs)
    .validRuns.filter((run) => run.id !== options.excludeRunId)
    .filter(
      (run) =>
        run.distanceMeters >= minimumDistance &&
        run.distanceMeters <= maximumDistance,
    )
    .sort((left, right) => {
      const leftDelta = Math.abs(
        left.distanceMeters - options.targetDistanceMeters,
      );
      const rightDelta = Math.abs(
        right.distanceMeters - options.targetDistanceMeters,
      );

      if (leftDelta !== rightDelta) {
        return leftDelta - rightDelta;
      }

      return right.runDate.localeCompare(left.runDate);
    })
    .slice(0, limit);
}

function partitionValidRuns(runs: AnalyticsRun[]) {
  const validRuns: AnalyticsRun[] = [];
  let invalidRunCount = 0;

  for (const run of runs) {
    if (isValidRun(run)) {
      validRuns.push(run);
    } else {
      invalidRunCount += 1;
    }
  }

  return {
    validRuns: validRuns.sort((left, right) =>
      left.runDate.localeCompare(right.runDate),
    ),
    invalidRunCount,
  };
}

function isValidRun(run: AnalyticsRun) {
  return (
    Number.isFinite(run.distanceMeters) &&
    Number.isFinite(run.durationSeconds) &&
    run.distanceMeters > 0 &&
    run.durationSeconds > 0 &&
    isValidIsoDate(run.runDate)
  );
}

function isValidIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return !Number.isNaN(date.getTime()) && toIsoDate(date) === value;
}

function groupMileage(
  runs: AnalyticsRun[],
  getPeriod: (run: AnalyticsRun) => string,
): PeriodMileage[] {
  const periods = new Map<string, PeriodMileage>();

  for (const run of runs) {
    const period = getPeriod(run);
    const current = periods.get(period) ?? {
      period,
      distanceMeters: 0,
      runCount: 0,
    };

    current.distanceMeters += run.distanceMeters;
    current.runCount += 1;
    periods.set(period, current);
  }

  return [...periods.values()].sort((left, right) =>
    left.period.localeCompare(right.period),
  );
}

function getIsoWeekPeriod(run: AnalyticsRun) {
  const date = parseIsoDate(run.runDate);
  const day = date.getUTCDay() || 7;
  const thursday = new Date(date);
  thursday.setUTCDate(date.getUTCDate() + 4 - day);

  const yearStart = new Date(Date.UTC(thursday.getUTCFullYear(), 0, 1));
  const week = Math.ceil(
    ((thursday.getTime() - yearStart.getTime()) / MS_PER_DAY + 1) / 7,
  );

  return `${thursday.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

function getLongestRun(runs: AnalyticsRun[]) {
  return maxBy(runs, (run) => run.distanceMeters);
}

function getFastestPaceRun(runs: AnalyticsRun[]) {
  const fastest = minBy(
    runs,
    (run) => run.durationSeconds / run.distanceMeters,
  );

  if (!fastest) {
    return null;
  }

  return {
    ...fastest,
    paceSecondsPerKm: Math.round(
      fastest.durationSeconds / (fastest.distanceMeters / 1000),
    ),
  };
}

function getStreaks(runs: AnalyticsRun[]) {
  const runDays = [...new Set(runs.map((run) => run.runDate))];
  const runWeeks = [...new Set(runs.map(getIsoWeekPeriod))];

  return {
    currentRunDayStreak: getCurrentConsecutiveDateCount(runDays),
    longestRunDayStreak: getLongestConsecutiveDateCount(runDays),
    currentRunWeekStreak: getCurrentConsecutiveWeekCount(runWeeks),
  };
}

function getCurrentConsecutiveDateCount(sortedIsoDates: string[]) {
  if (sortedIsoDates.length === 0) {
    return 0;
  }

  let count = 1;

  for (let index = sortedIsoDates.length - 1; index > 0; index -= 1) {
    const current = parseIsoDate(sortedIsoDates[index]);
    const previous = parseIsoDate(sortedIsoDates[index - 1]);

    if (current.getTime() - previous.getTime() !== MS_PER_DAY) {
      break;
    }

    count += 1;
  }

  return count;
}

function getLongestConsecutiveDateCount(sortedIsoDates: string[]) {
  if (sortedIsoDates.length === 0) {
    return 0;
  }

  let currentStreak = 1;
  let longestStreak = 1;

  for (let index = 1; index < sortedIsoDates.length; index += 1) {
    const current = parseIsoDate(sortedIsoDates[index]);
    const previous = parseIsoDate(sortedIsoDates[index - 1]);

    if (current.getTime() - previous.getTime() === MS_PER_DAY) {
      currentStreak += 1;
    } else {
      currentStreak = 1;
    }

    longestStreak = Math.max(longestStreak, currentStreak);
  }

  return longestStreak;
}

function getCurrentConsecutiveWeekCount(sortedIsoWeeks: string[]) {
  if (sortedIsoWeeks.length === 0) {
    return 0;
  }

  let count = 1;

  for (let index = sortedIsoWeeks.length - 1; index > 0; index -= 1) {
    const current = getIsoWeekStartDate(sortedIsoWeeks[index]);
    const previous = getIsoWeekStartDate(sortedIsoWeeks[index - 1]);

    if (current.getTime() - previous.getTime() !== 7 * MS_PER_DAY) {
      break;
    }

    count += 1;
  }

  return count;
}

function getEffortZones(runs: AnalyticsRun[]): EffortZoneSummary {
  const zones: EffortZoneSummary = {
    easy: { runCount: 0, distanceMeters: 0 },
    moderate: { runCount: 0, distanceMeters: 0 },
    hard: { runCount: 0, distanceMeters: 0 },
    unknown: { runCount: 0, distanceMeters: 0 },
  };

  for (const run of runs) {
    const zone = getEffortZone(run.effort);
    zones[zone].runCount += 1;
    zones[zone].distanceMeters += run.distanceMeters;
  }

  return zones;
}

function getEffortZone(effort: number | null | undefined): EffortZoneName {
  if (!effort || effort < 1 || effort > 10) {
    return "unknown";
  }

  if (effort <= 3) {
    return "easy";
  }

  if (effort <= 7) {
    return "moderate";
  }

  return "hard";
}

function getRecoverySignals(runs: AnalyticsRun[]): RecoverySignal[] {
  if (runs.length === 0) {
    return [];
  }

  const latestDate = parseIsoDate(runs[runs.length - 1].runDate);
  const latestSevenDayStart = addDays(latestDate, -6);
  const previousSevenDayStart = addDays(latestDate, -13);
  const latestWindow = runs.filter((run) =>
    isDateBetween(parseIsoDate(run.runDate), latestSevenDayStart, latestDate),
  );
  const previousWindow = runs.filter((run) =>
    isDateBetween(
      parseIsoDate(run.runDate),
      previousSevenDayStart,
      addDays(latestSevenDayStart, -1),
    ),
  );
  const signals: RecoverySignal[] = [];
  const latestDistance = sum(latestWindow, (run) => run.distanceMeters);
  const previousDistance = sum(previousWindow, (run) => run.distanceMeters);

  if (previousDistance > 0 && latestDistance > previousDistance * 1.25) {
    signals.push({
      kind: "volume_spike",
      severity: latestDistance > previousDistance * 1.5 ? "high" : "medium",
      message:
        "Latest 7-day volume is more than 25% above the previous 7 days.",
    });
  }

  const hardEfforts = latestWindow.filter(
    (run) => getEffortZone(run.effort) === "hard",
  );
  if (hardEfforts.length >= 3) {
    signals.push({
      kind: "hard_effort_cluster",
      severity: hardEfforts.length >= 4 ? "high" : "medium",
      message: `${hardEfforts.length} hard efforts in the latest 7-day window.`,
    });
  }

  const latestHeartRateRun = [...latestWindow]
    .reverse()
    .find((run) => typeof run.avgHeartRate === "number");
  const priorHeartRates = runs
    .filter((run) => run.id !== latestHeartRateRun?.id)
    .map((run) => run.avgHeartRate)
    .filter((heartRate): heartRate is number => typeof heartRate === "number");

  if (latestHeartRateRun?.avgHeartRate && priorHeartRates.length >= 3) {
    const baselineHeartRate =
      sum(priorHeartRates, (heartRate) => heartRate) / priorHeartRates.length;

    if (latestHeartRateRun.avgHeartRate > baselineHeartRate * 1.1) {
      signals.push({
        kind: "elevated_heart_rate",
        severity: "low",
        message: "Latest average heart rate is more than 10% above baseline.",
      });
    }
  }

  return signals;
}

function parseIsoDate(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(date.getUTCDate() + days);
  return next;
}

function isDateBetween(date: Date, start: Date, end: Date) {
  return date.getTime() >= start.getTime() && date.getTime() <= end.getTime();
}

function getIsoWeekStartDate(period: string) {
  const [year, week] = period.split("-W").map(Number);
  const januaryFourth = new Date(Date.UTC(year, 0, 4));
  const januaryFourthDay = januaryFourth.getUTCDay() || 7;
  const weekOneMonday = addDays(januaryFourth, 1 - januaryFourthDay);

  return addDays(weekOneMonday, (week - 1) * 7);
}

function sum<T>(items: T[], getValue: (item: T) => number) {
  return items.reduce((total, item) => total + getValue(item), 0);
}

function maxBy<T>(items: T[], getValue: (item: T) => number) {
  return items.reduce<T | null>((best, item) => {
    if (!best || getValue(item) > getValue(best)) {
      return item;
    }

    return best;
  }, null);
}

function minBy<T>(items: T[], getValue: (item: T) => number) {
  return items.reduce<T | null>((best, item) => {
    if (!best || getValue(item) < getValue(best)) {
      return item;
    }

    return best;
  }, null);
}
