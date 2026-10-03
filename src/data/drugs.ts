/**
 * Drug ("booster") dataset.
 *
 * Source: torn wiki "Drug" page — effects, cooldowns, addiction points and
 * overdose outcomes. Item IDs cross-checked against Torn's global item list.
 */

export interface DrugEffect {
  text: string;
  /** Machine-readable tag so the planner can reason about the booster. */
  tag:
    | 'energy'
    | 'nerve'
    | 'happy'
    | 'happy_mult'
    | 'stat_up'
    | 'stat_down'
    | 'hospital_clear'
    | 'other';
}

export interface Drug {
  id: number;
  name: string;
  effects: DrugEffect[];
  cooldown: [number, number]; // minutes
  addiction: number;
  overdose: string[];
  usage: string;
  tier: 'core' | 'utility' | 'situational' | 'event';
}

export const DRUGS: Drug[] = [
  {
    id: 206,
    name: 'Xanax',
    tier: 'core',
    effects: [
      { text: '+250 Energy', tag: 'energy' },
      { text: '+75 Happiness', tag: 'happy' },
      { text: '-35% to all battle stats', tag: 'stat_down' },
    ],
    cooldown: [360, 480],
    addiction: 35,
    overdose: [
      '-100% Energy, Nerve and Happiness',
      'Hospital: 5,000 minutes',
      'Cooldown & addiction extended (~24-25 hours)',
      '100 addiction points',
    ],
    usage: 'The workhorse of Torn. Energy in exchange for a temporary stat debuff — take it when you are training or working, not when you are about to fight.',
  },
  {
    id: 197,
    name: 'Ecstasy',
    tier: 'core',
    effects: [{ text: 'Doubles Happiness', tag: 'happy_mult' }],
    cooldown: [200, 230],
    addiction: 20,
    overdose: ['-100% Energy and Happiness', '20 addiction points'],
    usage: 'The single biggest happiness multiplier. Stack it before a long training session for a large flat gain boost.',
  },
  {
    id: 198,
    name: 'Ketamine',
    tier: 'core',
    effects: [
      { text: '-20% to Strength & Speed', tag: 'stat_down' },
      { text: '+50% to Defense', tag: 'stat_up' },
    ],
    cooldown: [45, 60],
    addiction: 8,
    overdose: [
      '-100% Energy, Nerve and Happiness',
      'Hospital: 1,000 minutes',
      'Cooldown extended (24-27 hours)',
      '-20% to Strength & Speed',
      '50 addiction points',
    ],
    usage: 'Shortest cooldown in the game and cheap. Fry a few for fast energy/happy resets, at the cost of messing up your stat shape.',
  },
  {
    id: 199,
    name: 'LSD',
    tier: 'situational',
    effects: [
      { text: '+30% to Strength', tag: 'stat_up' },
      { text: '+50% to Defense', tag: 'stat_up' },
      { text: '-30% to Speed & Dexterity', tag: 'stat_down' },
      { text: '+50 Energy', tag: 'energy' },
      { text: '+200-500 Happiness', tag: 'happy' },
      { text: '+5 Nerve', tag: 'nerve' },
    ],
    cooldown: [400, 450],
    addiction: 20,
    overdose: [
      '-100% Energy and Nerve',
      '-50% Happiness',
      '-30% to Speed & Dexterity',
      'Cooldown up to ~590 minutes',
      '~50 addiction points',
    ],
    usage: 'A defensive booster with an energy top-up. Rough on your speed and dex.',
  },
  {
    id: 201,
    name: 'PCP',
    tier: 'situational',
    effects: [
      { text: '+20% to Strength & Dexterity', tag: 'stat_up' },
      { text: '+250 Happiness', tag: 'happy' },
    ],
    cooldown: [260, 400],
    addiction: 26,
    overdose: [
      '-100% Energy, Nerve and Happiness',
      'Hospital: 750-1,000 minutes',
      'Cooldown extended (26-27 hours)',
      '-10 × level to Speed (permanent)',
      '50 addiction points',
    ],
    usage: 'Happiness + balanced offensive stats. The overdose penalty permanently eats Speed, so never chain it carelessly.',
  },
  {
    id: 205,
    name: 'Vicodin',
    tier: 'situational',
    effects: [
      { text: '+25% to all battle stats', tag: 'stat_up' },
      { text: '+75 Happiness', tag: 'happy' },
    ],
    cooldown: [240, 360],
    addiction: 13,
    overdose: ['-150 Happiness', '50 addiction points'],
    usage: 'The safest all-round stat booster — its overdose only hurts happiness.',
  },
  {
    id: 204,
    name: 'Speed',
    tier: 'situational',
    effects: [
      { text: '-20% to Dexterity', tag: 'stat_down' },
      { text: '+20% to Speed', tag: 'stat_up' },
      { text: '+50 Happiness', tag: 'happy' },
    ],
    cooldown: [250, 352],
    addiction: 14,
    overdose: [
      '-100% Energy, Nerve & Happiness',
      'Hospital: 150 minutes',
      '-6 × level to Strength & Defense (permanent)',
      '50 addiction points',
    ],
    usage: 'Speed-focused fighter booster. The permanent stat loss on overdose makes it a "know what you are doing" drug.',
  },
  {
    id: 203,
    name: 'Shrooms',
    tier: 'situational',
    effects: [
      { text: '+500 Happiness', tag: 'happy' },
      { text: '-20% to all battle stats', tag: 'stat_down' },
      { text: '-25 Energy (floors at 0)', tag: 'other' },
    ],
    cooldown: [182, 237],
    addiction: 6,
    overdose: ['-100% Energy, Nerve & Happiness', 'Hospital: 100 minutes', '50 addiction points'],
    usage: 'Huge happiness for a 3-hour window. Only worth it if you can burn the whole happy bar training.',
  },
  {
    id: 200,
    name: 'Opium',
    tier: 'utility',
    effects: [
      { text: '+30% to Defense', tag: 'stat_up' },
      { text: 'Removes all standard hospital time, restores life to 50%', tag: 'hospital_clear' },
    ],
    cooldown: [120, 180],
    addiction: 10,
    overdose: ['No overdose effects recorded — the safest drug in Torn.'],
    usage: 'Instant hospital self-revive and a defensive booster. Medical Effectiveness (faction Fortitude) improves the heal.',
  },
  {
    id: 196,
    name: 'Cannabis',
    tier: 'utility',
    effects: [
      { text: '-20% to Strength', tag: 'stat_down' },
      { text: '-25% to Defense', tag: 'stat_down' },
      { text: '-35% to Speed', tag: 'stat_down' },
      { text: '+8-12 Nerve', tag: 'nerve' },
    ],
    cooldown: [60, 90],
    addiction: 1,
    overdose: ['-100% Energy and Nerve', 'Hospital: 300-350 minutes', '50 addiction points', 'Spaced Out honour bar'],
    usage: 'The cheapest nerve top-up. Barely addictive, but it wrecks your battle stats for an hour.',
  },
  {
    id: 66,
    name: 'Morphine',
    tier: 'utility',
    effects: [
      { text: 'Instant hospital release, restores life', tag: 'hospital_clear' },
      { text: 'Adds a short drug cooldown', tag: 'other' },
    ],
    cooldown: [0, 0],
    addiction: 0,
    overdose: ['Morphine cannot be overdosed.'],
    usage: 'Medical item rather than a booster — it clears hospital time without the addiction load of Opium.',
  },
  {
    id: 0,
    name: 'Love Juice',
    tier: 'event',
    effects: [
      { text: 'Reduces attack & revive cost by 10 energy', tag: 'other' },
      { text: '+50% to Speed', tag: 'stat_up' },
      { text: '+25% to Dexterity', tag: 'stat_up' },
    ],
    cooldown: [300, 480],
    addiction: 50,
    overdose: ['No overdose effects recorded.'],
    usage: "Valentine's Day only. Brutal on energy costs for chain building while the event lasts.",
  },
];

export const drugByName = (name: string): Drug | undefined =>
  DRUGS.find((d) => d.name.toLowerCase() === name.toLowerCase());

/** Rough "value" score used to sort the booster planner's suggestions. */
export function drugValue(drug: Drug): number {
  const energy = drug.effects.some((e) => e.tag === 'energy') ? 250 : 0;
  const happy = drug.effects.filter((e) => e.tag === 'happy' || e.tag === 'happy_mult').length;
  return energy + happy * 100 - drug.addiction * 2;
}
