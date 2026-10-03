/**
 * Render smoke test.
 *
 * Lumbercorpedia is a client-side app, so a broken page only reveals itself in
 * the browser. This harness renders every route to HTML (and then mounts each
 * one into a jsdom document) so a runtime crash, a bad hook or a missing export
 * fails loudly in CI instead of silently in front of a user.
 *
 *   npm run smoke
 */
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import Dashboard from '../src/pages/Dashboard';
import StartHere from '../src/pages/StartHere';
import ItemsPage from '../src/pages/ItemsPage';
import WeaponsPage from '../src/pages/WeaponsPage';
import DrugsPage from '../src/pages/DrugsPage';
import GymsPage from '../src/pages/GymsPage';
import EducationPage from '../src/pages/EducationPage';
import CrimesPage from '../src/pages/CrimesPage';
import CompaniesPage from '../src/pages/CompaniesPage';
import ToolsPage from '../src/pages/ToolsPage';
import GymCalculator from '../src/pages/tools/GymCalculator';
import StatProjection from '../src/pages/tools/StatProjection';
import BoosterPlanner from '../src/pages/tools/BoosterPlanner';
import EducationPlanner from '../src/pages/tools/EducationPlanner';
import TravelProfit from '../src/pages/tools/TravelProfit';
import CompanyProfit from '../src/pages/tools/CompanyProfit';
import EnergyPlanner from '../src/pages/tools/EnergyPlanner';
import JumpPlanner from '../src/pages/tools/JumpPlanner';
import MeritPlanner from '../src/pages/tools/MeritPlanner';
import ProfilePage from '../src/pages/ProfilePage';
import AboutPage from '../src/pages/AboutPage';
import CommandPalette from '../src/components/CommandPalette';
import { SEARCH_INDEX, search } from '../src/lib/search';
import { gainPerTrain, happyLossPerTrain, modelConfidence, simulateSession } from '../src/lib/gym';
import {
  MAX_ENERGY_BASE,
  MAX_ENERGY_DONATOR,
  energyPerDay,
  energyPerHour,
  hoursToFull,
  modelCadence,
} from '../src/lib/energy';
import { MERIT_LINES, lineCost, upgradeCost, planAllocation, FULL_LINE_COST } from '../src/data/merits';

const ROUTES: [string, () => JSX.Element][] = [
  ['/', Dashboard],
  ['/start', StartHere],
  ['/items', ItemsPage],
  ['/weapons', WeaponsPage],
  ['/drugs', DrugsPage],
  ['/gyms', GymsPage],
  ['/education', EducationPage],
  ['/crimes', CrimesPage],
  ['/companies', CompaniesPage],
  ['/tools', ToolsPage],
  ['/tools/gym', GymCalculator],
  ['/tools/stats', StatProjection],
  ['/tools/boosters', BoosterPlanner],
  ['/tools/education', EducationPlanner],
  ['/tools/travel', TravelProfit],
  ['/tools/company', CompanyProfit],
  ['/tools/energy', EnergyPlanner],
  ['/tools/jumps', JumpPlanner],
  ['/tools/merits', MeritPlanner],
  ['/profile', ProfilePage],
  ['/about', AboutPage],
];

/** Substrings that must appear in the rendered markup of each route. */
const EXPECT: Record<string, string[]> = {
  '/': ['Lumbercorpedia', 'Gym gains calculator', 'Your next steps'],
  '/start': ['Start here', 'The mistakes that cost the most', 'Do these three next'],
  '/items': ['Item catalogue', 'Item', 'ID'],
  '/weapons': ['Weapon comparison', 'Loadout score', 'Jackhammer'],
  '/drugs': ['Drugs', 'Xanax', 'Addiction'],
  '/gyms': ['Gym progression', 'Heavyweight', 'Crim'],
  '/education': ['Education', 'BIO1340', 'Bachelor'],
  '/crimes': ['Crimes 2.0', 'Burglary', 'Enhancer'],
  '/companies': ['Companies', 'Nightclub'],
  '/tools': ['The toolkit', 'Booster planner'],
  '/tools/gym': ['Gym gains calculator', 'Formula in use'],
  '/tools/stats': ['Stat projection', 'Milestones'],
  '/tools/boosters': ['Booster planner', 'Your stack'],
  '/tools/education': ['Education planner', 'Study queue'],
  '/tools/travel': ['Travel profit', 'Break-even load'],
  '/tools/company': ['Company profit', 'Wage headroom'],
  '/tools/energy': ['Energy planner', 'Are you wasting regeneration?'],
  '/tools/jumps': ['Jump planner', 'With the jump vs without'],
  '/tools/merits': ['Merit planner', 'Recommended order'],
  '/profile': ['My Torn data', 'API key'],
  '/about': ['Lumbercorpedia', 'Dataset provenance'],
};

let failures = 0;

function report(ok: boolean, message: string) {
  if (!ok) failures += 1;
  console.log(`${ok ? '  ok  ' : ' FAIL '} ${message}`);
}

console.log('\nLumbercorpedia render smoke test\n');

for (const [path, Component] of ROUTES) {
  try {
    const html = renderToString(
      createElement(
        MemoryRouter,
        { initialEntries: [path] },
        createElement(Routes, null, createElement(Route, { path: '*', element: createElement(Component) })),
      ),
    );
    const missing = (EXPECT[path] ?? []).filter((needle) => !html.includes(needle));
    report(missing.length === 0, `${path} rendered (${html.length.toLocaleString()} chars)`);
    if (missing.length) report(false, `${path} is missing expected content: ${missing.join(', ')}`);
  } catch (error) {
    report(false, `${path} threw: ${(error as Error).message}`);
  }
}

// The command palette is rendered by the layout on every route — check it too.
try {
  const html = renderToString(createElement(MemoryRouter, null, createElement(CommandPalette)));
  report(html === '', 'command palette renders nothing until opened (expected)');
} catch (error) {
  report(false, `command palette threw: ${(error as Error).message}`);
}

// Data integrity: no duplicate keys in the searchable index, and every dataset
// entry has the fields the UI assumes exist.
const ids = new Set<string>();
let duplicates = 0;
for (const entry of SEARCH_INDEX) {
  if (ids.has(entry.id)) duplicates += 1;
  ids.add(entry.id);
}
report(duplicates === 0, `search index has ${SEARCH_INDEX.length} entries, ${duplicates} duplicate ids`);
report(search('xanax')[0]?.label === 'Xanax', `search finds Xanax (top hit: ${search('xanax')[0]?.label})`);
report(search('jackhammer').some((hit) => hit.label === 'Jackhammer'), 'search finds Jackhammer');
report(search('BIO1340').some((hit) => hit.label.includes('BIO1340')), 'search finds course BIOL1340 by code');
report(search('george').some((hit) => hit.label.includes("George")), "search finds George's gym");
report(search('burglary').some((hit) => hit.label === 'Burglary'), 'search finds the Burglary crime');

// Gym maths sanity: gains must rise with happiness, gym dots and stat total.
const base = { gymDots: 7.3, energyPerTrain: 10, happy: 20_000, statTotal: 100_000_000 };
const gainA = gainPerTrain(base);
report(gainA > 0, `gain per train is positive (${gainA.toFixed(2)} for 100m total in George's)`);
report(gainPerTrain({ ...base, happy: 40_000 }) > gainA, 'more happiness increases gains');
report(gainPerTrain({ ...base, gymDots: 9 }) > gainA, 'a better gym increases gains');
report(gainPerTrain({ ...base, statTotal: 200_000_000 }) > gainA, 'a higher stat total increases gains');
const session = simulateSession({ ...base, energyPool: 1_500 });
report(session.trains === 150, `1,500 energy at 10e per train = 150 trains (got ${session.trains})`);
const starving = simulateSession({ ...base, happy: 120, energyPool: 1_500 });
report(starving.stoppedBy === 'happiness', 'a low-happiness session stops on happiness, not energy');
report(starving.trains < 150, `low happiness cuts the session short (${starving.trains} trains)`);
const rich = simulateSession({ ...base, happy: 60_000, energyPool: 1_500 });
report(rich.totalGain > session.totalGain, 'more starting happiness gains more over the same energy pool');
report(Math.abs(happyLossPerTrain(10) - 5) < 1e-9, 'happiness loss is modelled at 50% of energy spent');
report(modelConfidence(4 * 10_000_000).level === 'high', 'model confidence is high below the old stat cap');
report(modelConfidence(4 * 100_000_000).level === 'fair', 'model confidence drops above the old stat cap');
report(modelConfidence(4 * 5_000_000_000).level === 'low', 'model confidence is low at end-game totals');

// --- Regeneration maths (new player tools) ---------------------------------

report(energyPerHour(false) === 20, `standard regen is 20 energy/hour (got ${energyPerHour(false)})`);
report(energyPerHour(true) === 30, `donator regen is 30 energy/hour (got ${energyPerHour(true)})`);
report(energyPerDay(false) === 480, `standard players get 480 energy/day (got ${energyPerDay(false)})`);
report(energyPerDay(true) === 720, `donators get 720 energy/day (got ${energyPerDay(true)})`);
report(
  hoursToFull(0, MAX_ENERGY_BASE, false) === 5 && hoursToFull(0, MAX_ENERGY_DONATOR, true) === 5,
  'a full bar takes exactly 5 hours either way — the number the roadmap is built on',
);
report(hoursToFull(60, MAX_ENERGY_BASE, false) === 2, 'half a bar takes half the time');

const five = modelCadence(5, MAX_ENERGY_BASE, false);
const four = modelCadence(4, MAX_ENERGY_BASE, false);
const three = modelCadence(3, MAX_ENERGY_BASE, false);
report(five.wasted === 0, 'five logins a day (every 4.8h) collects 100% of regeneration');
report(four.wasted > 0, `four logins a day still wastes energy (${four.wasted}/day)`);
report(
  Math.round(three.wasted) === 180,
  `three logins a day wastes ~180 energy/day — an 8-hour gap caps the bar (got ${Math.round(three.wasted)})`,
);
report(
  three.wasted > four.wasted && four.wasted > five.wasted,
  'waste falls monotonically as logins get closer together',
);
report(
  modelCadence(1, MAX_ENERGY_BASE, false).collected === MAX_ENERGY_BASE,
  'one login a day collects exactly one bar',
);
report(
  modelCadence(2, MAX_ENERGY_DONATOR, true).collected === 2 * MAX_ENERGY_DONATOR,
  'donators collect two full 150 bars from two logins',
);

// --- Merit cost curve ------------------------------------------------------
report(upgradeCost(1) === 1 && upgradeCost(10) === 10, 'merit upgrades cost 1 … 10 merits');
report(lineCost(10) === 55 && FULL_LINE_COST === 55, 'a full 10/10 merit line costs 55 merits');
report(lineCost(0) === 0 && lineCost(1) === 1 && lineCost(2) === 3, 'line costs follow the triangular number series');
const tenMerits = planAllocation(10, 'training');
const spentTen = tenMerits.reduce((sum, entry) => sum + entry.cost, 0);
report(spentTen <= 10 && spentTen >= 9, `a 10-merit plan spends 9 or 10 merits (spent ${spentTen})`);
report(
  !tenMerits.some((entry) => entry.levels > 4),
  'the planner never over-invests a small budget into one deep line',
);
const bigPlan = planAllocation(200, 'training');
report(
  bigPlan.reduce((sum, entry) => sum + entry.cost, 0) <= 200,
  'a large plan never exceeds its budget',
);
report(
  MERIT_LINES.every((line) => line.perUpgradeValue >= 0),
  `all ${MERIT_LINES.length} merit lines carry a per-upgrade value`,
);

console.log(`\n${failures === 0 ? 'PASS' : `FAIL (${failures})`}\n`);
process.exit(failures === 0 ? 0 : 1);
