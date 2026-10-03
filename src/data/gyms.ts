/**
 * Gym dataset — every standard, specialist and jail gym in Torn City.
 *
 * Source: torn wiki "Gym" page (standard/specialist tables + lock requirements).
 * NOTE ON UNITS: Torn's API reports gym gains as a factor of 10 higher than the
 * numbers players see in-game (Premier Fitness strength shows as 2.0 in the gym
 * but 20 in the API `gyms` selection). Lumbercorpedia stores the *player-facing*
 * number and exposes `apiDots` for anyone cross-referencing the API.
 */

export type StatKey = 'strength' | 'speed' | 'defense' | 'dexterity';

export interface GymGains {
  strength: number | null;
  speed: number | null;
  defense: number | null;
  dexterity: number | null;
}

export interface Gym {
  id: string;
  name: string;
  tier: 'light' | 'middle' | 'heavy' | 'specialist' | 'jail';
  cost: number;
  energy: number;
  gains: GymGains;
  /** Gym EXP needed to unlock the *next* standard gym. */
  expForNext?: number;
  requirement?: string;
  notes?: string;
}

const g = (s: number | null, sp: number | null, d: number | null, dx: number | null): GymGains => ({
  strength: s,
  speed: sp,
  defense: d,
  dexterity: dx,
});

export const GYMS: Gym[] = [
  // ---------------------------------------------------------------- light
  { id: 'premier', name: 'Premier Fitness', tier: 'light', cost: 10, energy: 5, gains: g(2.0, 2.0, 2.0, 2.0), expForNext: 200, notes: 'The starter gym — everyone begins here.' },
  { id: 'average-joes', name: 'Average Joes', tier: 'light', cost: 100, energy: 5, gains: g(2.4, 2.4, 2.8, 2.4), expForNext: 500, notes: 'Defense-leaning for its tier.' },
  { id: 'woodys', name: "Woody's Workout", tier: 'light', cost: 250, energy: 5, gains: g(2.8, 3.2, 3.0, 2.8), expForNext: 1000 },
  { id: 'beach-bods', name: 'Beach Bods', tier: 'light', cost: 500, energy: 5, gains: g(3.2, 3.2, 3.2, null), expForNext: 2000, notes: 'Cannot train dexterity here.' },
  { id: 'silver', name: 'Silver Gym', tier: 'light', cost: 1000, energy: 5, gains: g(3.4, 3.6, 3.4, 3.2), expForNext: 2750 },
  { id: 'pour-femme', name: 'Pour Femme', tier: 'light', cost: 2500, energy: 5, gains: g(3.4, 3.6, 3.6, 3.8), expForNext: 3000, notes: 'Best dexterity in the lightweight tier.' },
  { id: 'davies-den', name: 'Davies Den', tier: 'light', cost: 5000, energy: 5, gains: g(3.7, null, 3.7, 3.7), expForNext: 3500, notes: 'No speed training.' },
  { id: 'global', name: 'Global Gym', tier: 'light', cost: 10_000, energy: 5, gains: g(4.0, 4.0, 4.0, 4.0), expForNext: 4000, notes: 'Last lightweight gym; flat 4.0 across the board.' },

  // --------------------------------------------------------------- middle
  { id: 'knuckle-heads', name: 'Knuckle Heads', tier: 'middle', cost: 50_000, energy: 10, gains: g(4.8, 4.4, 4.0, 4.2), expForNext: 6000, notes: 'First gym to charge 10 energy per train.' },
  { id: 'pioneer', name: 'Pioneer Fitness', tier: 'middle', cost: 100_000, energy: 10, gains: g(4.4, 4.5, 4.8, 4.4), expForNext: 7000, notes: 'Once here, Crims jail gym stops being worth it.' },
  { id: 'anabolic', name: 'Anabolic Anomalies', tier: 'middle', cost: 250_000, energy: 10, gains: g(5.0, 4.5, 5.2, 4.5), expForNext: 8000 },
  { id: 'core', name: 'Core', tier: 'middle', cost: 500_000, energy: 10, gains: g(5.0, 5.2, 5.0, 5.0), expForNext: 11_000 },
  { id: 'racing-fitness', name: 'Racing Fitness', tier: 'middle', cost: 1_000_000, energy: 10, gains: g(5.0, 5.4, 4.8, 5.2), expForNext: 12_420 },
  { id: 'complete-cardio', name: 'Complete Cardio', tier: 'middle', cost: 2_000_000, energy: 10, gains: g(5.5, 5.8, 5.5, 5.2), expForNext: 18_000 },
  { id: 'legs-bums-tums', name: 'Legs, Bums and Tums', tier: 'middle', cost: 3_000_000, energy: 10, gains: g(null, 5.6, 5.6, 5.8), expForNext: 18_100, notes: 'Lower-body gym: no strength training.' },
  { id: 'deep-burn', name: 'Deep Burn', tier: 'middle', cost: 5_000_000, energy: 10, gains: g(6.0, 6.0, 6.0, 6.0), expForNext: 24_140, notes: 'Flat 6.0 — the last middleweight gym.' },

  // ---------------------------------------------------------------- heavy
  { id: 'apollo', name: 'Apollo Gym', tier: 'heavy', cost: 7_500_000, energy: 10, gains: g(6.0, 6.2, 6.4, 6.2), expForNext: 31_260 },
  { id: 'gun-shop', name: 'Gun Shop', tier: 'heavy', cost: 10_000_000, energy: 10, gains: g(6.6, 6.4, 6.2, 6.2), expForNext: 36_610, notes: 'Strength-slanted heavyweight.' },
  { id: 'force-training', name: 'Force Training', tier: 'heavy', cost: 15_000_000, energy: 10, gains: g(6.4, 6.6, 6.4, 6.8), expForNext: 46_640 },
  { id: 'cha-chas', name: "Cha Cha's", tier: 'heavy', cost: 20_000_000, energy: 10, gains: g(6.4, 6.4, 6.8, 7.0), expForNext: 56_520, notes: 'Gateway gym for the specialist Balboas / Frontline split.' },
  { id: 'atlas', name: 'Atlas', tier: 'heavy', cost: 30_000_000, energy: 10, gains: g(7.0, 6.4, 6.4, 6.6), expForNext: 67_775 },
  { id: 'last-round', name: 'Last Round', tier: 'heavy', cost: 50_000_000, energy: 10, gains: g(6.8, 6.6, 7.0, 6.6), expForNext: 84_535, notes: 'Required to unlock the Sports Science Lab.' },
  { id: 'the-edge', name: 'The Edge', tier: 'heavy', cost: 75_000_000, energy: 10, gains: g(6.8, 7.0, 7.0, 6.8), expForNext: 106_305 },
  { id: 'georges', name: "George's", tier: 'heavy', cost: 100_000_000, energy: 10, gains: g(7.3, 7.3, 7.3, 7.3), notes: 'End of the standard ladder — gym EXP stops accruing here.' },

  // ----------------------------------------------------------- specialist
  {
    id: 'balboas',
    name: 'Balboas Gym',
    tier: 'specialist',
    cost: 50_000_000,
    energy: 25,
    gains: g(null, null, 7.5, 7.5),
    requirement: "Cha Cha's unlocked; Defense + Dexterity 25% higher than Strength + Speed.",
    notes: 'Defensive specialist gym.',
  },
  {
    id: 'frontline',
    name: 'Frontline Fitness',
    tier: 'specialist',
    cost: 50_000_000,
    energy: 25,
    gains: g(7.5, 7.5, null, null),
    requirement: "Cha Cha's unlocked; Strength + Speed 25% higher than Dexterity + Defense.",
    notes: 'Offensive specialist gym.',
  },
  { id: 'gym-3000', name: 'Gym 3000', tier: 'specialist', cost: 100_000_000, energy: 50, gains: g(8.0, null, null, null), requirement: "George's unlocked; Strength 25% higher than your second-highest stat." },
  { id: 'isoyamas', name: 'Mr. Isoyamas', tier: 'specialist', cost: 100_000_000, energy: 50, gains: g(null, null, 8.0, null), requirement: "George's unlocked; Defense 25% higher than your second-highest stat." },
  { id: 'total-rebound', name: 'Total Rebound', tier: 'specialist', cost: 100_000_000, energy: 50, gains: g(null, 8.0, null, null), requirement: "George's unlocked; Speed 25% higher than your second-highest stat." },
  { id: 'elites', name: 'Elites', tier: 'specialist', cost: 100_000_000, energy: 50, gains: g(null, null, null, 8.0), requirement: "George's unlocked; Dexterity 25% higher than your second-highest stat." },
  {
    id: 'sports-science-lab',
    name: 'The Sports Science Lab',
    tier: 'specialist',
    cost: 500_000_000,
    energy: 25,
    gains: g(9.0, 9.0, 9.0, 9.0),
    requirement: 'Last Round unlocked; maximum 150 Xanax and Ecstasy taken in total.',
    notes: 'Highest flat gains you can buy — but drug-gated.',
  },
  {
    id: 'fight-club',
    name: 'Fight Club',
    tier: 'specialist',
    cost: 2_147_483_647,
    energy: 10,
    gains: g(10.0, 10.0, 10.0, 10.0),
    requirement: 'Membership by invite only.',
    notes: 'The best gym in the game and the cheapest per train. Good luck.',
  },

  // ----------------------------------------------------------------- jail
  {
    id: 'crims',
    name: "Crim's Gym (Jail)",
    tier: 'jail',
    cost: 0,
    energy: 5,
    gains: g(3.4, 3.4, 4.5, null),
    requirement: 'Only accessible while in jail.',
    notes: 'Best 5-energy defense training in the early game — better than any lightweight gym.',
  },
];

export const GYM_TIERS: { id: Gym['tier']; label: string; blurb: string }[] = [
  { id: 'light', label: 'Lightweight', blurb: '5 energy per train, gym EXP 200 → 4,000.' },
  { id: 'middle', label: 'Middleweight', blurb: '10 energy per train, gym EXP 6,000 → 24,140.' },
  { id: 'heavy', label: 'Heavyweight', blurb: '10 energy per train, gym EXP 31,260 → George\'s.' },
  { id: 'specialist', label: 'Specialist', blurb: 'Single-stat or boosted multi-stat gyms behind stat-shape requirements.' },
  { id: 'jail', label: 'Jail', blurb: 'Available while locked up.' },
];

export const gymById = (id: string): Gym | undefined => GYMS.find((x) => x.id === id);

/** Best gym (by gain) for a single stat, optionally filtered by unlocked ids. */
export function bestGymFor(stat: StatKey, unlocked?: string[]): Gym | undefined {
  return GYMS.filter((gym) => gym.gains[stat] !== null)
    .filter((gym) => (unlocked ? unlocked.includes(gym.id) : true))
    .sort((a, b) => {
      const av = (a.gains[stat] as number) / a.energy;
      const bv = (b.gains[stat] as number) / b.energy;
      return bv - av;
    })[0];
}

/** Cost per gym-exp point is not a thing in Torn, but gain-per-energy is. */
export function gainPerEnergy(gym: Gym, stat: StatKey): number | null {
  const gain = gym.gains[stat];
  if (gain === null) return null;
  return gain / gym.energy;
}
