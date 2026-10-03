/**
 * Energy, nerve and happiness regeneration.
 *
 * Verified against Torn's own FAQ:
 *   - 5 energy and 5 happiness per 15 minutes; energy is every 10 minutes for donators.
 *   - 1 nerve every 5 minutes.
 *   - Energy and happiness both cap at your maximum; anything regenerated past
 *     the cap is lost.
 *
 * The practical consequence — and the single most useful number in this file —
 * is that a full energy bar takes exactly 5 hours whether you are a donator or
 * not, because the donator bonus raises both the regeneration rate and the
 * maximum.
 */

export const TICK_MINUTES = 15;
export const ENERGY_PER_TICK = 5;
export const HAPPY_PER_TICK = 5;
export const NERVE_MINUTES = 5;
export const DONATOR_TICK_MINUTES = 10;

export const MAX_ENERGY_BASE = 100;
export const MAX_ENERGY_DONATOR = 150;

/** Energy per hour for a given energy bar configuration. */
export function energyPerHour(donator: boolean): number {
  const minutes = donator ? DONATOR_TICK_MINUTES : TICK_MINUTES;
  return (ENERGY_PER_TICK * 60) / minutes;
}

export function energyPerDay(donator: boolean): number {
  return energyPerHour(donator) * 24;
}

/** Hours until the bar is full, given current energy and maximum. */
export function hoursToFull(current: number, max: number, donator: boolean): number {
  const rate = energyPerHour(donator);
  if (rate <= 0) return 0;
  return Math.max(0, (max - current) / rate);
}

export interface CadenceResult {
  /** Logins per day the player reports. */
  loginsPerDay: number;
  /** Hours between logins. */
  intervalHours: number;
  /** Energy actually collected per day, assuming the bar starts empty each session. */
  collected: number;
  /** Energy regenerated per day in total. */
  regenerated: number;
  /** Energy lost to the cap. */
  wasted: number;
  wastedPercent: number;
  /** What the same routine yields with a 5-hour cadence. */
  atFiveHours: number;
  /** Extra energy per day available purely from logging in more often. */
  recoverable: number;
}

/**
 * Models a simple, realistic routine: log in `loginsPerDay` times, evenly
 * spaced, and spend the whole bar each time. Energy regenerated beyond the cap
 * between logins is lost.
 */
export function modelCadence(loginsPerDay: number, max: number, donator: boolean): CadenceResult {
  const rate = energyPerHour(donator);
  const safeLogins = Math.max(1, Math.min(48, loginsPerDay));
  const intervalHours = 24 / safeLogins;
  const regeneratedPerInterval = rate * intervalHours;
  const collectedPerInterval = Math.min(max, regeneratedPerInterval);
  const collected = collectedPerInterval * safeLogins;
  const regenerated = energyPerDay(donator);
  const wasted = Math.max(0, regenerated - collected);

  // A five-hour cadence is the theoretical optimum: the bar never caps.
  const optimalLogins = Math.max(1, Math.ceil(24 / (max / rate)));
  const optimalCollected = Math.min(regenerated, max * optimalLogins);

  return {
    loginsPerDay: safeLogins,
    intervalHours,
    collected,
    regenerated,
    wasted,
    wastedPercent: regenerated > 0 ? (wasted / regenerated) * 100 : 0,
    atFiveHours: optimalCollected,
    recoverable: Math.max(0, optimalCollected - collected),
  };
}

/** Trains available from an energy pool, and what it is worth in Xanax. */
export function energyValue(energy: number, trainCost = 10) {
  return {
    trains: Math.floor(energy / trainCost),
    xanaxEquivalent: energy / 250,
    pointRefills: energy / MAX_ENERGY_DONATOR,
  };
}

/** Local clock time at which the bar is full. */
export function fullAt(current: number, max: number, donator: boolean, from = new Date()): Date {
  const hours = hoursToFull(current, max, donator);
  return new Date(from.getTime() + hours * 3_600_000);
}
