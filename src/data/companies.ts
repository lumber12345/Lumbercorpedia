/**
 * Company dataset — intentionally limited to facts that can be verified from
 * Torn's own wiki, plus the mechanic model used by the profit calculator.
 *
 * Company star ratings, employee positions and per-star bonuses change often
 * (and differ per type), so Lumbercorpedia does not invent them: the company
 * page ships the verified specials plus a director-grade profitability model
 * driven entirely by *your* numbers.
 */

export interface CompanySpecial {
  name: string;
  stars: number | null;
  special: string;
  effect: string;
  verified: boolean;
  category: string;
}

export const COMPANY_SPECIALS: CompanySpecial[] = [
  {
    name: 'Fitness Center',
    stars: 1,
    special: 'Healthy Mind',
    effect: 'Spend job points to cut education time by 30 minutes per point.',
    verified: true,
    category: 'Health',
  },
  {
    name: 'Hair Salon',
    stars: 7,
    special: 'Cutting corners',
    effect: 'Spend job points to cut education time by 30 minutes per point.',
    verified: true,
    category: 'Retail',
  },
  {
    name: 'Nightclub',
    stars: 10,
    special: 'Addiction tolerance',
    effect:
      'Working in a 10* Nightclub mitigates being ejected from education courses because of your addiction level.',
    verified: true,
    category: 'Entertainment',
  },
  {
    name: 'Farm',
    stars: 5,
    special: 'Ketamine production',
    effect: 'Spend 5 job points to obtain Ketamine (the only drug produced by a company).',
    verified: true,
    category: 'Agriculture',
  },
  {
    name: 'Zoo',
    stars: 5,
    special: 'Ketamine production',
    effect: 'Spend 5 job points to obtain Ketamine (the only drug produced by a company).',
    verified: true,
    category: 'Entertainment',
  },
];

/** Star ratings matter for these thresholds — all community-observed behaviours. */
export const COMPANY_MECHANICS = [
  {
    title: 'Stars come from performance',
    body: 'A company earns stars from daily profit, customer volume and how well the director keeps staff effectiveness, environment, popularity and advertising in balance. Losing stars is as easy as gaining them.',
  },
  {
    title: 'Effectiveness is the whole game',
    body: 'Employee working stats decide effectiveness, which decides output. A company full of high-intelligence staff on a stat-matched position out-produces a bigger company of mismatched staff every time.',
  },
  {
    title: 'Director decisions feed the ledger',
    body: 'Advertising budget, stock ordering, item pricing and upgrades all move the same three dials: popularity, environment and efficiency. The calculator here works directly on your revenue and wage figures so it stays correct regardless of the current balance patch.',
  },
  {
    title: 'Addiction taxes your output',
    body: 'Drug addiction reduces company effectiveness — and that starts from your very first drug, not from when the brain icon appears. Directors are exempt, employees are not.',
  },
];

export interface ProfitInputs {
  dailyRevenue: number;
  staffCount: number;
  wageEach: number;
  advertisingPerDay: number;
  upkeepPerDay: number;
  stockCostPerDay: number;
  /** Director cut of the company bank, as a percentage. */
  directorCut: number;
}

export interface ProfitBreakdown {
  gross: number;
  wages: number;
  costs: number;
  directorPay: number;
  netBeforeCut: number;
  /** Profit left once the director's cut is taken. */
  net: number;
  netPerStaff: number;
  annualised: number;
  marginPercent: number;
}

/**
 * Transparent director math:
 *   gross        = daily revenue
 *   wages        = staff × wage
 *   costs        = advertising + upkeep + stock
 *   directorPay  = director cut × (gross − wages − costs) / 100
 *   net          = gross − wages − costs − directorPay
 */
export function computeProfit(input: ProfitInputs): ProfitBreakdown {
  const wages = input.staffCount * input.wageEach;
  const costs = input.advertisingPerDay + input.upkeepPerDay + input.stockCostPerDay;
  const netBeforeCut = input.dailyRevenue - wages - costs;
  const directorPay = Math.max(0, (netBeforeCut * input.directorCut) / 100);
  const net = netBeforeCut - directorPay;
  return {
    gross: input.dailyRevenue,
    wages,
    costs,
    directorPay,
    netBeforeCut,
    net,
    netPerStaff: input.staffCount + 1 > 0 ? net / (input.staffCount + 1) : net,
    annualised: net * 365,
    marginPercent: input.dailyRevenue > 0 ? (net / input.dailyRevenue) * 100 : 0,
  };
}

/** Break-even staff wage: the highest wage per employee that still leaves a profit. */
export function breakEvenWage(input: ProfitInputs): number {
  const costs = input.advertisingPerDay + input.upkeepPerDay + input.stockCostPerDay;
  const headroom = input.dailyRevenue - costs;
  if (input.staffCount <= 0) return headroom;
  const afterCut = headroom * (1 - input.directorCut / 100);
  return afterCut / input.staffCount;
}
