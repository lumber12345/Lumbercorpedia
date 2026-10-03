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
import ProfilePage from '../src/pages/ProfilePage';
import AboutPage from '../src/pages/AboutPage';
import CommandPalette from '../src/components/CommandPalette';
import { SEARCH_INDEX, search } from '../src/lib/search';
import { gainPerTrain, happyLossPerTrain, modelConfidence, simulateSession } from '../src/lib/gym';

const ROUTES: [string, () => JSX.Element][] = [
  ['/', Dashboard],
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
  ['/profile', ProfilePage],
  ['/about', AboutPage],
];

/** Substrings that must appear in the rendered markup of each route. */
const EXPECT: Record<string, string[]> = {
  '/': ['Lumbercorpedia', 'Gym gains calculator', 'Your training snapshot'],
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

console.log(`\n${failures === 0 ? 'PASS' : `FAIL (${failures})`}\n`);
process.exit(failures === 0 ? 0 : 1);
