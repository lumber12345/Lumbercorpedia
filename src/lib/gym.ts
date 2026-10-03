/**
 * Gym mathematics.
 *
 * Torn's own wiki publishes the gain formula used by the community:
 *
 *   gain = Modifiers × GymDots × EnergyPerTrain ×
 *          [ (a·ln(Happy + b) + c) × StatTotal + d·(Happy + b) + e ]
 *
 * with the constants below. Lumbercorpedia implements that formula directly and
 * exposes the intermediate values so you can see *why* a plan gains what it
 * gains, rather than trusting a black box.
 *
 * Everything is an estimate by nature: Torn rounds, and modifiers (faction
 * upgrades, education, company specials, books, steadfast) all feed the same
 * multiplier. Treat the output as a planning tool, not a guarantee.
 */

export const GYM_FORMULA = {
  a: 3.480061091e-7,
  b: 250,
  c: 3.091619094e-6,
  d: 6.82775184551527e-5,
  e: -0.0301431777,
} as const;

/** Happiness lost per train: 40-60% of the energy used (50% is the expectation). */
export const HAPPY_LOSS_PER_ENERGY = 0.5;

/** Natural energy regeneration: 5 energy every 15 minutes. */
export const ENERGY_PER_15_MIN = 5;
export const ENERGY_PER_DAY_NATURAL = 480;

export interface GainInputs {
  /** Gym dots in player-facing units (George's = 7.3). */
  gymDots: number;
  energyPerTrain: number;
  happy: number;
  /** Sum of your four battle stats. */
  statTotal: number;
  /** Multiplier from education, faction upgrades, books, steadfast, etc. 1 = none. */
  modifier?: number;
}

/** Gain from a single train. */
export function gainPerTrain({ gymDots, energyPerTrain, happy, statTotal, modifier = 1 }: GainInputs): number {
  const { a, b, c, d, e } = GYM_FORMULA;
  const h = Math.max(0, happy);
  const inner = (a * Math.log(h + b) + c) * statTotal + d * (h + b) + e;
  return Math.max(0, modifier * gymDots * energyPerTrain * inner);
}

/** Happiness burned by a train of `energyPerTrain` energy. */
export function happyLossPerTrain(energyPerTrain: number): number {
  return energyPerTrain * HAPPY_LOSS_PER_ENERGY;
}

/** Energy regeneration time, in seconds, for a given energy deficit. */
export function regenSeconds(energy: number): number {
  return (energy / ENERGY_PER_15_MIN) * 900;
}

export interface SessionInputs extends GainInputs {
  /** Energy available for this session. */
  energyPool: number;
}

export interface SessionResult {
  trains: number;
  energyUsed: number;
  happyUsed: number;
  totalGain: number;
  finalStat: number;
  endingHappy: number;
  averageGain: number;
  /** Reason the session stopped early: energy ran out or happiness bottomed out. */
  stoppedBy: 'energy' | 'happiness';
}

/**
 * Trains an energy pool as a sequence of individual trains, because happiness
 * (and therefore every subsequent train) falls as you go. This is the whole
 * point of using a simulator instead of `gain × trains`.
 */
export function simulateSession(input: SessionInputs): SessionResult {
  const { energyPool, energyPerTrain, happy, statTotal, ...rest } = input;
  let remaining = Math.max(0, energyPool);
  let currentHappy = Math.max(0, happy);
  let currentStat = Math.max(0, statTotal);
  let total = 0;
  let trains = 0;
  const loss = happyLossPerTrain(energyPerTrain);
  let stoppedBy: SessionResult['stoppedBy'] = 'energy';

  while (remaining >= energyPerTrain && trains < 10_000) {
    if (currentHappy <= 0) {
      stoppedBy = 'happiness';
      break;
    }
    const gain = gainPerTrain({ ...rest, energyPerTrain, happy: currentHappy, statTotal: currentStat });
    total += gain;
    currentStat += gain;
    remaining -= energyPerTrain;
    trains += 1;
    currentHappy = Math.max(0, currentHappy - loss);
    if (remaining < energyPerTrain) stoppedBy = 'energy';
  }

  return {
    trains,
    energyUsed: trains * energyPerTrain,
    happyUsed: Math.max(0, happy - currentHappy),
    totalGain: total,
    finalStat: currentStat,
    endingHappy: currentHappy,
    averageGain: trains ? total / trains : 0,
    stoppedBy,
  };
}

export interface PlanInputs extends GainInputs {
  /** Daily energy from natural regeneration, refills, Xanax, faction armory, etc. */
  dailyEnergy: number;
  /** Happiness you start each day with (a fully upgraded property, drug boosts, etc.). */
  dailyHappy: number;
  days: number;
}

export interface PlanDay {
  day: number;
  trains: number;
  gain: number;
  statTotal: number;
}

/**
 * Multi-day projection: each day burns `dailyEnergy` at `energyPerTrain` per
 * train, with the stat total (and therefore the gain) compounding day to day.
 */
export function projectDays(input: PlanInputs): PlanDay[] {
  const { dailyEnergy, dailyHappy, days, energyPerTrain, statTotal, ...rest } = input;
  let stat = Math.max(0, statTotal);
  const out: PlanDay[] = [];
  for (let day = 1; day <= days; day += 1) {
    const session = simulateSession({
      ...rest,
      energyPerTrain,
      happy: dailyHappy,
      statTotal: stat,
      energyPool: dailyEnergy,
    });
    stat = session.finalStat;
    out.push({ day, trains: session.trains, gain: session.totalGain, statTotal: stat });
  }
  return out;
}

/** How many days until `statTotal` reaches `target`. Returns null if it never will. */
export function daysToTarget(
  input: Omit<PlanInputs, 'days'> & { target: number; maxDays?: number },
): number | null {
  const maxDays = input.maxDays ?? 3650;
  const { dailyEnergy, dailyHappy, energyPerTrain } = input;
  let stat = Math.max(0, input.statTotal);
  if (stat >= input.target) return 0;
  for (let day = 1; day <= maxDays; day += 1) {
    const session = simulateSession({
      gymDots: input.gymDots,
      modifier: input.modifier,
      energyPerTrain,
      happy: dailyHappy,
      statTotal: stat,
      energyPool: dailyEnergy,
    });
    if (session.trains === 0) return null;
    stat = session.finalStat;
    if (stat >= input.target) return day;
  }
  return null;
}

/**
 * Where the published constants stop being trustworthy.
 *
 * Torn removed the gym stat cap in August 2022: past roughly 50,000,000 in a
 * stat, gains keep rising but at a steadily decreasing rate. The constants in
 * the published formula were fitted in the normal range, so at extreme stat
 * totals this model *overstates* gains. Lumbercorpedia says so in the UI
 * instead of pretending the curve is known.
 */
export const STAT_CAP_NOTE = 50_000_000;

export interface Confidence {
  level: 'high' | 'fair' | 'low';
  note: string;
}

export function modelConfidence(statTotalValue: number): Confidence {
  const averageStat = statTotalValue / 4;
  if (averageStat <= STAT_CAP_NOTE) {
    return {
      level: 'high',
      note: 'Your stats sit inside the range where the published constants match observed gains closely.',
    };
  }
  if (averageStat <= 10 * STAT_CAP_NOTE) {
    return {
      level: 'fair',
      note: 'Past 50m in a stat Torn applies a decreasing-rate curve that the published constants do not model. Expect this projection to read a little high.',
    };
  }
  return {
    level: 'low',
    note: 'At these stat totals Torn\u2019s decreasing-rate curve dominates and the published constants cannot reproduce it. Treat this as a direction of travel, not a number.',
  };
}

/** Sum of the four stats — the "stat total" the formula consumes. */
export function statTotal(stats: { strength: number; speed: number; defense: number; dexterity: number }): number {
  return stats.strength + stats.speed + stats.defense + stats.dexterity;
}

/**
 * Happiness budget: works out what a happiness level of X adds compared to Y,
 * which is how you justify buying a property upgrade or an Ecstasy.
 */
export function happinessDelta(gymDots: number, energyPerTrain: number, statTotalValue: number, from: number, to: number): number {
  const base = { gymDots, energyPerTrain, statTotal: statTotalValue };
  return gainPerTrain({ ...base, happy: to }) - gainPerTrain({ ...base, happy: from });
}
