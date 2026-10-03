/**
 * New player roadmap.
 *
 * Torn's early game has one dominant objective and a handful of expensive
 * mistakes. This dataset encodes the route: get to level 15, protect your energy,
 * and never waste a happy bar.
 *
 * Every task carries a `basis` field. `verified` means the mechanic is stated on
 * Torn's own wiki or FAQ; `observed` means it is long-standing community
 * practice (the standard plays), which is still worth following but is not a
 * rule Torn published.
 */

export type Basis = 'verified' | 'observed';

export interface Task {
  id: string;
  title: string;
  /** The mechanic behind the advice — why this makes you progress faster. */
  why: string;
  /** Concrete numbers, when they exist. */
  numbers?: string;
  basis: Basis;
  /** Where in Lumbercorpedia this task is actioned. */
  links?: { label: string; to: string }[];
}

export interface Phase {
  id: string;
  name: string;
  window: string;
  goal: string;
  tasks: Task[];
}

export const PHASES: Phase[] = [
  {
    id: 'foundation',
    name: 'Phase 1 — Foundation',
    window: 'Day 1',
    goal: 'Stop leaking resources before you have any.',
    tasks: [
      {
        id: 'f1-login-cadence',
        title: 'Set a login rhythm of every 5 hours',
        why: 'Energy regenerates 5 points every 15 minutes (every 10 minutes for donators) and stops at your maximum. Whatever you regenerate past your maximum the moment the bar caps is simply gone.',
        numbers: '100 max energy ÷ 20/hour = a full bar every 5 hours. Donators: 150 ÷ 30/hour = also 5 hours.',
        basis: 'verified',
        links: [{ label: 'Energy planner', to: '/tools/energy' }],
      },
      {
        id: 'f2-train-not-dump',
        title: 'Spend every point of energy in the gym — never in the dump',
        why: 'Gym gains scale with your stat total and your happiness, so early energy compounds: the stats you train today make tomorrow’s trains worth more. Dumping energy produces nothing.',
        basis: 'verified',
        links: [
          { label: 'Gym gains calculator', to: '/tools/gym' },
          { label: 'Gym ladder', to: '/gyms' },
        ],
      },
      {
        id: 'f3-starter-job',
        title: 'Take a starter city job straight away',
        why: 'Working stats only grow while you are employed, and they gate the player-run companies you will want later. Free passive progress for doing nothing.',
        basis: 'verified',
      },
      {
        id: 'f4-join-faction',
        title: 'Join an active faction in your first days',
        why: 'Factions supply Xanax, armory weapons and advice to new members. The same items cost you millions you do not have yet, and the advice prevents the expensive mistakes below.',
        basis: 'observed',
      },
      {
        id: 'f5-property',
        title: 'Get out of the default property as soon as you can afford rent',
        why: 'Your maximum happiness is set by your property, and happiness drives every gym gain you will ever make. It is the highest-leverage purchase in the early game — more than any weapon.',
        numbers: 'Happiness enters the gain formula through ln(happy + 250) and a flat d·(happy + 250) term, so it lifts every single train.',
        basis: 'verified',
        links: [{ label: 'Stat projection', to: '/tools/stats' }],
      },
      {
        id: 'f6-energy-cap',
        title: 'Never buy energy items you cannot spend',
        why: 'Xanax and energy drinks push you past your maximum. If you are about to be away from the game, that energy caps and evaporates exactly like natural regeneration.',
        basis: 'verified',
        links: [{ label: 'Booster planner', to: '/tools/boosters' }],
      },
    ],
  },
  {
    id: 'unlock',
    name: 'Phase 2 — Unlock the game',
    window: 'Levels 1 → 15',
    goal: 'Reach level 15. It is the single biggest gate in Torn.',
    tasks: [
      {
        id: 'u1-why-15',
        title: 'Understand why level 15 is the target',
        why: 'Travel unlocks at level 15. Flying to buy plushies and flowers and selling them at home is the first real income a new player can generate — and every day you spend below 15 is a day of that income you never get back.',
        basis: 'verified',
        links: [{ label: 'Travel profit calculator', to: '/tools/travel' }],
      },
      {
        id: 'u2-stats-first',
        title: 'Train to roughly 300-500 total stats before hunting',
        why: 'Attacking is the fastest experience in the game, but losing produces nothing except hospital time. A few days of gym work first makes every later attack a win.',
        numbers: 'Community consensus: ~400 total stats is where leveling targets start falling reliably.',
        basis: 'observed',
        links: [{ label: 'Stat projection', to: '/tools/stats' }],
      },
      {
        id: 'u3-attack-and-leave',
        title: 'Attack and LEAVE, always',
        why: 'Leaving a defeated opponent in the street gives the most experience. Mugging and hospitalising spend extra energy for less progress — 25 energy per attack is far too expensive to waste on anything except experience.',
        basis: 'verified',
      },
      {
        id: 'u4-target-selection',
        title: 'Pick targets by level-to-stats ratio, not by name',
        why: 'The classic mistake is attacking whoever looks rich. You want opponents with a high level and low battle stats: their level sets your experience, their stats set your win chance.',
        basis: 'observed',
      },
      {
        id: 'u5-xanax-cadence',
        title: 'Start a Xanax routine as soon as you can afford it',
        why: 'Xanax is +250 energy with no level requirement and it is the reason experienced players out-pace you. Energy is the currency of every form of progress.',
        numbers: 'One Xanax = 250 energy = 50 five-energy gym trains. Cooldown 6-8 hours.',
        basis: 'verified',
        links: [
          { label: 'Drug reference', to: '/drugs' },
          { label: 'Booster planner', to: '/tools/boosters' },
        ],
      },
      {
        id: 'u6-first-education',
        title: 'Start CMT1520 (one week) and the General Studies openers',
        why: 'Introduction to Computing takes a single week and unlocks virus coding you can do in the background for a merit. GEN1112 costs a week and unlocks driving-related crimes. Education runs in real time — the sooner it starts, the sooner it finishes.',
        basis: 'verified',
        links: [
          { label: 'Education database', to: '/education' },
          { label: 'Study planner', to: '/tools/education' },
        ],
      },
      {
        id: 'u7-nerve-discipline',
        title: 'Protect your crime experience: avoid getting jailed',
        why: 'Your natural nerve bar grows with crime experience and jail takes a percentage of it away. A single careless crime at a high nerve bar can undo weeks of work.',
        numbers: 'Natural nerve bar grows in steps of 5. Jail reduces crime experience by a percentage, not a fixed amount.',
        basis: 'verified',
        links: [{ label: 'Crimes 2.0', to: '/crimes' }],
      },
      {
        id: 'u8-merits',
        title: 'Spend your first merits deliberately',
        why: 'Merits are permanent and the cost of each upgrade rises, so the first few merits matter far more than the last few. Education Length pays for itself the moment you are on a long course.',
        numbers: 'Each line costs 1, 2, 3 … 10 merits — 55 for a full 10/10 line.',
        basis: 'verified',
        links: [{ label: 'Merit planner', to: '/tools/merits' }],
      },
    ],
  },
  {
    id: 'engine',
    name: 'Phase 3 — Build the money engine',
    window: 'Level 15+',
    goal: 'Turn travel into a daily income you can fund training with.',
    tasks: [
      {
        id: 'e1-suitcase',
        title: 'Buy a suitcase before your first run',
        why: 'Travel capacity is the limiter on every trip. A suitcase permanently raises how much you can carry, which multiplies the profit of every flight you ever take.',
        numbers: 'Base capacity is 5 items. Suitcases add +2 (small), +3 (medium) or +4 (large) and do not stack.',
        basis: 'verified',
        links: [{ label: 'Travel profit calculator', to: '/tools/travel' }],
      },
      {
        id: 'e2-airstrip',
        title: 'Aim for a private island with an airstrip',
        why: 'The airstrip adds +10 travel capacity and cuts travel time. Renting one is the standard first big investment for a new player, because it pays back within days of flying.',
        basis: 'observed',
        links: [{ label: 'Travel profit calculator', to: '/tools/travel' }],
      },
      {
        id: 'e3-museum',
        title: 'Unlock the Museum with Bachelor of History',
        why: 'The Museum converts plushies, flowers and artifacts into points, and points sell for cash. It turns your travel stock into a second, demand-independent income stream instead of forcing you to sell everything on the open market.',
        basis: 'verified',
        links: [{ label: 'Education database', to: '/education' }],
      },
      {
        id: 'e4-rehab',
        title: 'Plan a Switzerland trip for rehab',
        why: 'Rehab clears addiction, which is what allows you to keep using Xanax without being thrown out of education or losing company effectiveness. Travel is unavailable below level 15 — one more reason to get there.',
        basis: 'verified',
        links: [{ label: 'Drug reference', to: '/drugs' }],
      },
      {
        id: 'e5-stop-losses',
        title: 'Stop selling losses once you can fly',
        why: 'Selling losses is a stopgap that costs you hospital time and experience. Travel earns more, per energy, with none of the downside — so treat losses as a bridge to level 15, not an income strategy.',
        basis: 'observed',
      },
    ],
  },
  {
    id: 'compound',
    name: 'Phase 4 — Compound your stats',
    window: 'Ongoing',
    goal: 'Multiply everything you have built with happiness and better gyms.',
    tasks: [
      {
        id: 'c1-gym-ladder',
        title: 'Move up the gym ladder the moment gym EXP allows',
        why: 'Gym dots are a straight multiplier on every train. Training in a gym you have outgrown is the most common way players silently waste months.',
        numbers: 'Happiness and stat total both feed the formula too — a new gym and a better property often outweigh hundreds of extra trains.',
        basis: 'verified',
        links: [
          { label: 'Gym ladder', to: '/gyms' },
          { label: 'Gym gains calculator', to: '/tools/gym' },
        ],
      },
      {
        id: 'c2-jumps',
        title: 'Learn the candy jump, then the happy jump',
        why: 'Gains scale with happiness, and happiness resets to your maximum every quarter hour. So you stack happiness above your maximum, train a thousand energy in one sitting, and bank gains you could not otherwise reach.',
        numbers: 'The standard routine: 4 Xanax to reach ~1,000 energy, happy items, one Ecstasy to double happiness, then train it all at once.',
        basis: 'verified',
        links: [{ label: 'Jump planner', to: '/tools/jumps' }],
      },
      {
        id: 'c3-gym-education',
        title: 'Take Sports Science and Health & Fitness',
        why: 'These are the only degrees that raise gym gains and passive battle stats, and they are made of many short, cheap courses. For a trainer they beat the flashier combat degrees.',
        basis: 'verified',
        links: [{ label: 'Study planner', to: '/tools/education' }],
      },
      {
        id: 'c4-stat-shape',
        title: 'Decide your stat shape before you are strong',
        why: 'Gym 3000, Mr. Isoyamas, Total Rebound and Elites each require one stat 25% above your second highest. Evenly trained players never qualify, and there is no way to fix it cheaply later.',
        basis: 'verified',
        links: [{ label: 'Gym ladder', to: '/gyms' }],
      },
      {
        id: 'c5-purposeful-fights',
        title: 'Fight with a purpose: chains, wars, and bounties',
        why: 'Attacks are expensive. Outside of leveling targets, a coordinated chain or a bounty pays you for the same energy a random mug would waste.',
        basis: 'observed',
      },
    ],
  },
];

export const ALL_TASKS: Task[] = PHASES.flatMap((phase) => phase.tasks);
export const TASK_COUNT = ALL_TASKS.length;

/** Mistakes that cost new players the most, in order of how much they hurt. */
export const COSTLY_MISTAKES = [
  {
    title: 'Letting the energy bar sit full',
    cost: 'Up to 100% of your regeneration',
    detail:
      'A bar that caps while you are away is energy you paid for with real time and then threw away. Twenty-four hours at 480 energy/day is your entire progression budget.',
    fix: 'Log in at least every 5 hours, or spend before you leave.',
  },
  {
    title: 'Training in a gym you have outgrown',
    cost: '20-40% of every train, permanently',
    detail:
      'Premier Fitness is 2.0 dots; George’s is 7.3. Players who never check the ladder train for months at a third of their possible rate.',
    fix: 'Check the gym ladder whenever you unlock a new gym.',
  },
  {
    title: 'Attacking without enough stats',
    cost: 'Hospital time and lost energy',
    detail:
      'A lost attack produces no experience and puts you in hospital, where your energy keeps regenerating toward a cap you cannot spend.',
    fix: 'Train to ~400 total stats before hunting targets.',
  },
  {
    title: 'Getting jailed on a high crime experience',
    cost: 'A percentage of your natural nerve bar',
    detail:
      'Jail takes a slice of crime experience rather than a fixed amount, so the higher you have climbed the more a single red crime costs you.',
    fix: 'Stick to safe scenarios while your crime experience grows.',
  },
  {
    title: 'Mugging and hospitalising leveling targets',
    cost: '25 energy per attack',
    detail:
      'Leaving a target gives the most experience. Mugging spends extra energy for money you will earn far faster at level 15 by flying.',
    fix: 'Attack, then LEAVE. Every time.',
  },
  {
    title: 'Drugs before you can reach rehab',
    cost: 'Addiction with no way to clear it',
    detail:
      'Rehab requires travel, which requires level 15. Until then, addiction accumulates and starts costing you education enrolment and company effectiveness.',
    fix: 'Keep drug use modest until you can fly to Switzerland.',
  },
];

/** The daily loop, in order. Short enough to actually follow. */
export const DAILY_ROUTINE = [
  {
    step: 'Spend energy in the gym first',
    detail: 'Highest-value use of energy in the early game, and stats make everything else easier.',
  },
  {
    step: 'Spend the happiness you regenerated',
    detail: 'Happy resets against your maximum every quarter hour, so train while it is high rather than banking it.',
  },
  {
    step: 'Spend nerve on your safest useful crime',
    detail: 'Crime experience grows the nerve bar; jail shrinks it. Repeat the crime you reliably succeed at.',
  },
  {
    step: 'Use job points and check education progress',
    detail: 'Job points convert to cash, energy or time saved. Education is always running in the background — make sure it is.',
  },
  {
    step: 'Check for attacks to level with, if below 15',
    detail: 'Attack and leave. Experience from attacking is the fastest route to the travel unlock.',
  },
  {
    step: 'Line up your next login before the bar caps',
    detail: 'Five hours. If you will be away longer, spend the energy first.',
  },
];
