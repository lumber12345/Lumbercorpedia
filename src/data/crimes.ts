/**
 * Crimes 2.0 dataset.
 *
 * The modern crime system is skill-based: each crime type has its own 0-100
 * skill bar, its own enhancer item, and 10+ scenario branches with different
 * requirements and outcomes. Lumbercorpedia models the per-crime essentials —
 * category, enhancer, tool requirements, approximate nerve investment and the
 * merits attached — so you can plan a crime order instead of grinding blindly.
 *
 * Nerve-to-max figures are community-recorded *observations* from players who
 * maxed each crime, not official numbers. They are labelled as estimates in the
 * UI and should be read as relative magnitude ("Cracking is ~8× the nerve of
 * Card Skimming"), not as exact requirements.
 */

export interface Crime {
  id: string;
  name: string;
  /** Crime category from Torn's own reference data, where published. */
  category: string | null;
  /** Item that boosts success/gains for the whole crime type. */
  enhancer: string | null;
  /** Other items the crime's scenarios expect you to own. */
  tools: string[];
  /** Observed total nerve spent to reach 100 skill. */
  nerveToMax: number | null;
  merits: string[];
  tips: string[];
  /** Unlocked or improved by education. */
  education?: string[];
}

export const CRIMES: Crime[] = [
  {
    id: 'search-for-cash',
    name: 'Search for Cash',
    category: 'Theft',
    enhancer: 'Glasses',
    tools: ['Metal Detector', 'Cemetery Key'],
    nerveToMax: 6_400,
    merits: ['Find 7 different rotten items in Search the Trash'],
    tips: [
      'Outside of unique outcomes, always take the highest success-chance option.',
      'One of the cheapest crimes to level — a good default early grind.',
      'Failing here clears a critical-fail debuff cheaply, so keep it as your "cooldown" crime.',
    ],
  },
  {
    id: 'bootlegging',
    name: 'Bootlegging',
    category: 'Counterfeiting',
    enhancer: 'High-Speed Drive',
    tools: ['Laptop or Personal Computer', 'Pack of Blank CDs : 100'],
    nerveToMax: 7_600,
    merits: ['Reach 10,000 customers in your online store'],
    tips: [
      'CMT2230 (Web Design And Development, 1 week) unlocks the online store — do it first.',
      'You never need to run the 5-nerve variant unless you are rushing skill 100.',
      'Sell the counterfeit DVDs rather than keeping them.',
    ],
    education: ['CMT2230'],
  },
  {
    id: 'graffiti',
    name: 'Graffiti',
    category: 'Vandalism',
    enhancer: 'Paint Mask',
    tools: ['Ladder', 'Wire Cutters'],
    nerveToMax: 8_300,
    merits: ['Join a gang (happens automatically through this crime chain)'],
    tips: [
      'Nobody carried vandalism skill over from Crimes 1.0, so the medal space here is wide open.',
      'After skill 100, use Graffiti to burn off critical-fail debuffs and farm 500 reputation elsewhere.',
    ],
  },
  {
    id: 'shoplifting',
    name: 'Shoplifting',
    category: 'Theft',
    enhancer: 'Mountain Bike',
    tools: ['Metal Detector', 'Cemetery Key'],
    nerveToMax: 9_700,
    merits: ['Hold 100% notoriety in every store at the same time'],
    tips: [
      'Do the notoriety merit first — it is far easier before your skill pushes store difficulty up.',
      'Good source of special ammo if you deliberately drag the grind out.',
    ],
  },
  {
    id: 'pickpocketing',
    name: 'Pickpocketing',
    category: 'Theft',
    enhancer: 'Cut-Throat Razor',
    tools: [],
    nerveToMax: 9_400,
    merits: ['Pickpocket a police badge (unique outcome on the running police officer)'],
    tips: [
      'Targets have very different difficulties — pick the easy mark rather than the rich one.',
      'No tool requirements makes this the most flexible Theft crime for a low-inventory run.',
    ],
  },
  {
    id: 'card-skimming',
    name: 'Card Skimming',
    category: 'Fraud',
    enhancer: 'Duct Tape',
    tools: ['Spy Camera', 'Card Skimmer', 'Laptop or Personal Computer'],
    nerveToMax: 2_500,
    merits: ['Collect 250 details from a single skimmer'],
    tips: [
      'Cheapest crime in raw nerve, but it resolves on a long timer — it takes months of real time to max.',
      'Set every skimmer on bus or gas stations, then leave them until two have been lost.',
      'Best skill-per-nerve in the game; worst skill-per-hour.',
    ],
  },
  {
    id: 'burglary',
    name: 'Burglary',
    category: 'Theft',
    enhancer: 'Flashlight',
    tools: ['Credit Card', 'Jemmy', 'Window Breaker', 'Lockpicks', 'Rope', 'Skeleton Key'],
    nerveToMax: 17_400,
    merits: ['Rob every different kind of place at least once'],
    tips: [
      'Twice the nerve of any other early crime and it fails constantly — expect a long grind.',
      'Keep a full burglary kit in your inventory; missing tools convert good rolls into failures.',
    ],
  },
  {
    id: 'hustling',
    name: 'Hustling',
    category: null,
    enhancer: null,
    tools: [],
    nerveToMax: 5_772,
    merits: [],
    tips: ['Cheap to level in community records, making it a fast route to early crime experience.'],
  },
  {
    id: 'disposal',
    name: 'Disposal',
    category: null,
    enhancer: null,
    tools: [],
    nerveToMax: 5_728,
    merits: [],
    tips: ['Comfortably the fastest crime to max on record — a strong source of cheap crime experience.'],
  },
  {
    id: 'cracking',
    name: 'Cracking',
    category: null,
    enhancer: null,
    tools: [],
    nerveToMax: 21_049,
    merits: [],
    tips: [
      'In theory the most nerve-expensive crime; in practice players judge it easier than Burglary because failures are cheaper.',
      'Requires CMT1520 (Introduction to Computing) to unlock — plus Networking for the hacking crimes.',
    ],
    education: ['CMT1520', 'CMT2540', 'CMT2610'],
  },
  {
    id: 'forgery',
    name: 'Forgery',
    category: null,
    enhancer: null,
    tools: [],
    nerveToMax: null,
    merits: [],
    tips: ['Skill-gated behind the earlier crime types. No reliable public nerve-to-max record yet.'],
  },
  {
    id: 'scamming',
    name: 'Scamming',
    category: null,
    enhancer: null,
    tools: ['Laptop or Personal Computer'],
    nerveToMax: null,
    merits: [],
    tips: [
      'Needs websites and harvested email addresses — the Computer Science tree feeds it directly.',
      'Community records show it among the highest value crimes at max skill.',
    ],
    education: ['CMT2230', 'CMT2130', 'CMT2131'],
  },
];

/** Mechanics that make Crimes 2.0 different from the old nerve roulette. */
export const CRIME_MECHANICS = [
  {
    title: 'Skill, not luck',
    body: 'Each crime type levels from 0 to 100 skill. Success chance is driven by your skill, the scenario difficulty and your tools — a high-skill player fails a good scenario far less often than a low-skill one.',
  },
  {
    title: 'Reputation & experience',
    body: 'Crimes award crime experience (CE) and reputation per category. Your Crime level and the reputation you bank in each category gate the tougher scenario branches.',
  },
  {
    title: 'Critical failures',
    body: 'A critical fail applies a debuff that hurts your next attempt. The standard play is to burn a cheap crime (Graffiti, Search for Cash, Bootlegging) to clear it before returning to your main grind.',
  },
  {
    title: 'Enhancers and tools',
    body: 'Every crime type has an enhancer item that lifts the whole crime, plus scenario-specific tools. Missing a required tool is the most common cause of a lost attempt.',
  },
  {
    title: 'Heat and rigs',
    body: 'Hacking-family crimes build heat. CMT2570/CMT2128/CMT2129 cut the heat your rig components generate by up to 25% and unlock 50% overclocking.',
  },
];
