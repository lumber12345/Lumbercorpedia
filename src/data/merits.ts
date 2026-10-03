/**
 * Merit dataset.
 *
 * Merits are permanent, and the cost of each upgrade inside a line rises by one
 * merit per level — so the tenth upgrade costs 10 merits and a full 10/10 line
 * costs 1+2+…+10 = 55 merits. Which means the order you spend them in matters
 * enormously, and the early merits are worth many times the late ones.
 *
 * Source: torn wiki — Merit (upgrade list and per-upgrade effects).
 */

export type MeritGroup = 'training' | 'combat' | 'economy' | 'utility';

export interface MeritLine {
  id: string;
  name: string;
  group: MeritGroup;
  /** Effect of one upgrade, as text. */
  perUpgrade: string;
  /** Effect at 10/10. */
  atMax: string;
  /** Numeric value per upgrade, for the planner's scoring. */
  perUpgradeValue: number;
  /** Unit that perUpgradeValue is expressed in, for display. */
  unit: string;
  /** Who should be prioritising this. */
  goodFor: string;
  note?: string;
  /** Purely informational lines the planner does not score. */
  informational?: boolean;
}

export const MERIT_LINES: MeritLine[] = [
  // ------------------------------------------------------------- training
  {
    id: 'education-length',
    name: 'Education Length',
    group: 'training',
    perUpgrade: '-2% education course time',
    atMax: '-20% course time',
    perUpgradeValue: 2,
    unit: '% faster courses',
    goodFor: 'Every account, but especially early ones',
    note: 'Stacks additively with the WSU stock block (-10%) and the Education principal job perk (-10%) for a maximum 40% reduction. Applies to courses you have not started yet, so buying it before you queue a long course is worth weeks.',
  },
  {
    id: 'brawn',
    name: 'Brawn',
    group: 'training',
    perUpgrade: '+3% passive Strength',
    atMax: '+30% passive Strength',
    perUpgradeValue: 3,
    unit: '% Strength',
    goodFor: 'Anyone building a Strength-heavy damage build',
    note: 'Passive: it multiplies the stat rather than adding points, so its value grows as you train.',
  },
  {
    id: 'sharpness',
    name: 'Sharpness',
    group: 'training',
    perUpgrade: '+3% passive Speed',
    atMax: '+30% passive Speed',
    perUpgradeValue: 3,
    unit: '% Speed',
    goodFor: 'Speed builders and specialist-gym shapes',
  },
  {
    id: 'protection',
    name: 'Protection',
    group: 'training',
    perUpgrade: '+3% passive Defense',
    atMax: '+30% passive Defense',
    perUpgradeValue: 3,
    unit: '% Defense',
    goodFor: 'Defensive builds and Balboas / Mr. Isoyamas shapes',
  },
  {
    id: 'evasion',
    name: 'Evasion',
    group: 'training',
    perUpgrade: '+3% passive Dexterity',
    atMax: '+30% passive Dexterity',
    perUpgradeValue: 3,
    unit: '% Dexterity',
    goodFor: 'Dexterity builds and Elites shape',
  },

  // --------------------------------------------------------------- combat
  {
    id: 'critical-hit',
    name: 'Critical Hit Rate',
    group: 'combat',
    perUpgrade: '+0.5% critical hit chance',
    atMax: '+5% critical hit chance',
    perUpgradeValue: 0.5,
    unit: '% crit chance',
    goodFor: 'Fighters — base critical rate is already around 12%',
    note: 'A percentage-point increase on a ~12% base, so 10/10 is a meaningful jump in damage output over long fights.',
  },
  {
    id: 'life-points',
    name: 'Life Points',
    group: 'combat',
    perUpgrade: '+5% maximum life',
    atMax: '+50% maximum life',
    perUpgradeValue: 5,
    unit: '% max life',
    goodFor: 'New players who keep getting hospitalised',
    note: 'Timing does not matter: spending it at level 1 and levelling to 50 gives the same result as buying it at level 50.',
  },
  {
    id: 'weapon-mastery',
    name: 'Weapon Mastery (per type)',
    group: 'combat',
    perUpgrade: '+1% damage, +0.2 accuracy with that weapon type',
    atMax: '+10% damage, +2.0 accuracy',
    perUpgradeValue: 1,
    unit: '% damage',
    goodFor: 'Anyone who has settled on one weapon type',
    note: 'Eleven separate lines (rifles, pistols, shotguns, SMGs, machine guns, heavy artillery, clubbing, piercing, slashing, mechanical, temporary). Commit to one line once you know what you carry.',
  },

  // -------------------------------------------------------------- economy
  {
    id: 'bank-interest',
    name: 'Bank Interest',
    group: 'economy',
    perUpgrade: '+5% bank interest',
    atMax: '+50% bank interest',
    perUpgradeValue: 5,
    unit: '% interest',
    goodFor: 'Anyone with savings in the bank',
    note: 'Applies from your next investment, so it rewards players who actually hold money in the bank rather than in cash.',
  },
  {
    id: 'awareness',
    name: 'Awareness',
    group: 'economy',
    perUpgrade: '+20% items found in the city',
    atMax: '+200% city finds',
    perUpgradeValue: 20,
    unit: '% city finds',
    goodFor: 'Players who walk the city every day',
    note: 'Raises the quantity, not the quality, of finds. Even at 10/10 you will still have days with nothing.',
  },
  {
    id: 'masterful-looting',
    name: 'Masterful Looting',
    group: 'economy',
    perUpgrade: '+5% money from mugging',
    atMax: '+50% mugging take',
    perUpgradeValue: 5,
    unit: '% mug income',
    goodFor: 'Bounty hunters and frequent attackers',
  },
  {
    id: 'employee-effectiveness',
    name: 'Employee Effectiveness',
    group: 'economy',
    perUpgrade: '+1 employee effectiveness',
    atMax: '+10 effectiveness',
    perUpgradeValue: 1,
    unit: 'effectiveness',
    goodFor: 'Employees chasing better wages — no effect for directors',
  },

  // -------------------------------------------------------------- utility
  {
    id: 'nerve-bar',
    name: 'Nerve Bar',
    group: 'utility',
    perUpgrade: '+1 maximum nerve',
    atMax: '+10 maximum nerve',
    perUpgradeValue: 1,
    unit: 'nerve',
    goodFor: 'Crime-focused players',
    note: 'Your natural nerve bar grows from crime experience; this sits on top of it.',
  },
  {
    id: 'addiction-mitigation',
    name: 'Addiction Mitigation',
    group: 'utility',
    perUpgrade: '-2% addiction effects',
    atMax: '-20% addiction effects',
    perUpgradeValue: 2,
    unit: '% mitigation',
    goodFor: 'Anyone running a Xanax routine',
    note: 'Softens the battle-stat debuff, the company effectiveness hit and the education / gym access problems that addiction causes.',
  },
  {
    id: 'crime-progression',
    name: 'Crime Progression',
    group: 'utility',
    perUpgrade: '+1% crime experience and skill gain',
    atMax: '+10% crime experience and skill gain',
    perUpgradeValue: 1,
    unit: '% crime gain',
    goodFor: 'Crime-focused players',
  },
  {
    id: 'stealth',
    name: 'Stealth',
    group: 'utility',
    perUpgrade: '+0.2 stealth level',
    atMax: '+2.0 stealth',
    perUpgradeValue: 0.2,
    unit: 'stealth',
    goodFor: 'Players who want their hits to read as “Someone”',
  },
  {
    id: 'hospitalizing',
    name: 'Hospitalizing',
    group: 'utility',
    perUpgrade: '+5% hospital time inflicted',
    atMax: '+50% hospital time',
    perUpgradeValue: 5,
    unit: '% hospital time',
    goodFor: 'War and chain specialists',
  },
];

/** Cost of the nth upgrade in a line (1-indexed): 1, 2, 3, … */
export const upgradeCost = (n: number): number => n;

/** Total merits to reach `levels` upgrades in one line. */
export function lineCost(levels: number): number {
  const n = Math.max(0, Math.min(10, Math.floor(levels)));
  return (n * (n + 1)) / 2;
}

export const MAX_LEVELS = 10;
export const FULL_LINE_COST = lineCost(MAX_LEVELS); // 55

/** Merits are also purchasable at the points building, capped by level. */
export const MERIT_POINT_COST = 300;
export const meritsPurchasableAtLevel = (level: number): number => Math.floor(Math.max(0, level) / 2);

export type Goal = 'training' | 'combat' | 'economy' | 'crimes';

/**
 * Marginal value of the *next* upgrade in a line for a given goal. Used to rank
 * spending so the planner recommends the highest-value purchase first, exactly
 * as an experienced player would.
 */
export function priority(line: MeritLine, goal: Goal): number {
  const base = line.perUpgradeValue;
  const weights: Record<Goal, Partial<Record<string, number>>> = {
    training: { training: 1.6, economy: 0.6, combat: 0.9, utility: 0.7 },
    combat: { combat: 1.6, training: 0.8, economy: 0.5, utility: 0.9 },
    economy: { economy: 1.7, training: 0.7, combat: 0.5, utility: 0.7 },
    crimes: { utility: 1.5, economy: 0.8, training: 0.7, combat: 0.6 },
  };
  let score = base * (weights[goal][line.group] ?? 1);

  // A few lines are worth far more than their raw number suggests in context.
  if (goal === 'training' && line.id === 'education-length') score *= 3.2;
  if (goal === 'crimes' && line.id === 'crime-progression') score *= 3.0;
  if (goal === 'crimes' && line.id === 'nerve-bar') score *= 1.6;
  if (goal === 'combat' && line.id === 'critical-hit') score *= 2.4;
  if (goal === 'economy' && line.id === 'awareness') score *= 0.7; // 200% of a small number
  return score;
}

export interface Allocation {
  line: MeritLine;
  levels: number;
  cost: number;
  score: number;
}

/**
 * Greedy allocation: repeatedly buy the upgrade with the best value per merit
 * until the budget runs out. Greedy is correct here because each line's cost
 * rises while its per-upgrade value stays flat, so the marginal value per merit
 * is monotonically decreasing — the greedy choice is the optimal one.
 */
export function planAllocation(budget: number, goal: Goal, weights: Record<string, number> = {}): Allocation[] {
  const state = new Map<string, number>();
  let remaining = Math.max(0, Math.floor(budget));

  for (let guard = 0; guard < 400; guard += 1) {
    let best: { line: MeritLine; cost: number; value: number } | null = null;
    for (const line of MERIT_LINES) {
      const levels = state.get(line.id) ?? 0;
      if (levels >= MAX_LEVELS) continue;
      const cost = upgradeCost(levels + 1);
      if (cost > remaining) continue;
      const userWeight = weights[line.id] ?? 1;
      const value = (priority(line, goal) * userWeight) / cost;
      if (!best || value > best.value) best = { line, cost, value };
    }
    if (!best) break;
    state.set(best.line.id, (state.get(best.line.id) ?? 0) + 1);
    remaining -= best.cost;
  }

  return [...state.entries()]
    .map(([id, levels]) => {
      const line = MERIT_LINES.find((x) => x.id === id)!;
      return { line, levels, cost: lineCost(levels), score: priority(line, goal) };
    })
    .filter((entry) => entry.levels > 0)
    .sort((a, b) => b.score * b.levels - a.score * a.levels);
}
