/**
 * One index to search everything.
 *
 * The Torn wiki makes you know which page to visit before you can find
 * anything. Lumbercorpedia builds a single flat index at module load and scores
 * it locally, so ⌘K finds an item ID, a weapon roll, a gym, a course or a
 * calculator from one box.
 */
import { ITEMS } from '../data/items';
import { WEAPONS, midAccuracy, midDamage } from '../data/weapons';
import { DRUGS } from '../data/drugs';
import { GYMS } from '../data/gyms';
import { ALL_COURSES, DEGREES } from '../data/education';
import { CRIMES } from '../data/crimes';
import { COMPANY_SPECIALS } from '../data/companies';

export type ResultKind =
  | 'Item'
  | 'Weapon'
  | 'Drug'
  | 'Gym'
  | 'Course'
  | 'Degree'
  | 'Crime'
  | 'Company'
  | 'Tool'
  | 'Page';

export interface SearchEntry {
  id: string;
  label: string;
  sub: string;
  kind: ResultKind;
  route: string;
  keywords: string;
}

export interface SearchHit extends SearchEntry {
  score: number;
  indices: number[];
}

const entries: SearchEntry[] = [];

// ---------------------------------------------------------------- databases
for (const item of ITEMS) {
  entries.push({
    id: `item:${item.id ?? item.name}`,
    label: item.name,
    sub: `${item.category}${item.id ? ` · ID ${item.id}` : ''}${item.note ? ` · ${item.note}` : ''}`,
    kind: 'Item',
    route: `/items?q=${encodeURIComponent(item.name)}`,
    keywords: `${item.category} ${item.source} ${item.note ?? ''} ${item.id ?? ''}`,
  });
}

for (const weapon of WEAPONS) {
  const dmg = midDamage(weapon);
  const acc = midAccuracy(weapon);
  entries.push({
    id: `weapon:${weapon.name}`,
    label: weapon.name,
    sub: `${weapon.type} · ${weapon.slot}${dmg ? ` · dmg ${dmg}` : ''}${acc ? ` · acc ${acc}` : ''}`,
    kind: 'Weapon',
    route: `/weapons?q=${encodeURIComponent(weapon.name)}`,
    keywords: `${weapon.type} ${weapon.slot} ${weapon.source} weapon gun melee`,
  });
}

for (const drug of DRUGS) {
  entries.push({
    id: `drug:${drug.name}`,
    label: drug.name,
    sub: `Drug · ${drug.effects[0]?.text ?? ''}`,
    kind: 'Drug',
    route: `/drugs?q=${encodeURIComponent(drug.name)}`,
    keywords: `drug booster ${drug.usage}`,
  });
}

for (const gym of GYMS) {
  entries.push({
    id: `gym:${gym.id}`,
    label: gym.name,
    sub: `Gym · ${gym.energy} energy · ${gym.gains.strength ?? '—'} str dots`,
    kind: 'Gym',
    route: `/gyms?q=${encodeURIComponent(gym.name)}`,
    keywords: `gym train gains ${gym.tier} ${gym.requirement ?? ''}`,
  });
}

for (const course of ALL_COURSES) {
  entries.push({
    id: `course:${course.code}`,
    label: `${course.code} — ${course.name}`,
    sub: `Course · ${course.weeks} week${course.weeks === 1 ? '' : 's'} · $${course.cost.toLocaleString()}`,
    kind: 'Course',
    route: `/education?q=${encodeURIComponent(course.code)}`,
    keywords: `education course ${course.degree} ${course.unlock ?? ''} ${course.name}`,
  });
}

for (const degree of DEGREES) {
  entries.push({
    id: `degree:${degree.code}`,
    label: `Bachelor path — ${degree.name}`,
    sub: `Degree · ${degree.verified ? `${degree.courses.length} courses` : 'perks verified, course table pending'}`,
    kind: 'Degree',
    route: `/education?degree=${degree.code}`,
    keywords: `education degree bachelor ${degree.name} ${degree.payoff.join(' ')}`,
  });
}

for (const crime of CRIMES) {
  entries.push({
    id: `crime:${crime.id}`,
    label: crime.name,
    sub: `Crime · ${crime.category ?? 'category n/a'}${crime.nerveToMax ? ` · ~${crime.nerveToMax.toLocaleString()} nerve` : ''}`,
    kind: 'Crime',
    route: `/crimes?q=${encodeURIComponent(crime.name)}`,
    keywords: `crime ${crime.enhancer ?? ''} ${crime.tools.join(' ')} ${crime.tips.join(' ')}`,
  });
}

for (const company of COMPANY_SPECIALS) {
  entries.push({
    id: `company:${company.name}`,
    label: `${company.name}${company.stars ? ` (${company.stars}*)` : ''}`,
    sub: `Company special · ${company.special}`,
    kind: 'Company',
    route: `/companies?q=${encodeURIComponent(company.name)}`,
    keywords: `company job ${company.special} ${company.effect} ${company.category}`,
  });
}

// ------------------------------------------------------------------- tools
const TOOLS: SearchEntry[] = [
  ['gym-calculator', 'Gym Gains Calculator', 'Model a single training session with the real Torn formula', '/tools/gym'],
  ['stat-planner', 'Stat Projection', 'Project stats forward day by day and find your target date', '/tools/stats'],
  ['booster-planner', 'Booster Planner', 'Plan drug stacks, cooldowns and addiction', '/tools/boosters'],
  ['education-planner', 'Education Planner', 'Sequenced study plan with time reductions', '/tools/education'],
  ['travel-profit', 'Travel Profit Calculator', 'Work out whether an abroad run is worth the flight', '/tools/travel'],
  ['company-profit', 'Company Profit Calculator', 'Director-level wage, cost and margin analysis', '/tools/company'],
  ['profile', 'Connect your Torn account', 'Pull your own stats into every calculator', '/profile'],
].map(([id, label, sub, route]) => ({
  id: `tool:${id}`,
  label,
  sub,
  kind: 'Tool' as ResultKind,
  route,
  keywords: 'calculator tool planner',
}));
entries.push(...TOOLS);

const PAGES: SearchEntry[] = [
  ['/', 'Dashboard', 'Everything at a glance'],
  ['/items', 'Item Database', 'Catalogue with IDs, categories and sources'],
  ['/weapons', 'Weapon Comparison', 'Damage, accuracy, stealth and loadout score'],
  ['/drugs', 'Drug Reference', 'Effects, cooldowns, addiction and overdoses'],
  ['/gyms', 'Gym Progression', 'Every gym with costs, dots and requirements'],
  ['/education', 'Education', 'Courses, prerequisites, costs and payoffs'],
  ['/crimes', 'Crimes 2.0', 'Categories, enhancers, nerve estimates and merits'],
  ['/companies', 'Companies', 'Verified specials and the profit model'],
  ['/about', 'About & data sources', 'Where every number comes from'],
].map(([route, label, sub]) => ({
  id: `page:${route}`,
  label,
  sub,
  kind: 'Page' as ResultKind,
  route,
  keywords: 'page',
}));
entries.push(...PAGES);

export const SEARCH_INDEX = entries;

const KIND_WEIGHT: Record<ResultKind, number> = {
  Tool: 6,
  Page: 4,
  Item: 3,
  Weapon: 3,
  Drug: 3,
  Gym: 3,
  Course: 3,
  Degree: 3,
  Crime: 3,
  Company: 3,
};

/** Cheap subsequence test used as a last-resort match. */
function subsequence(haystack: string, needle: string): number[] | null {
  const indices: number[] = [];
  let h = 0;
  for (let n = 0; n < needle.length; n += 1) {
    const found = haystack.indexOf(needle[n], h);
    if (found === -1) return null;
    indices.push(found);
    h = found + 1;
  }
  return indices;
}

export function search(query: string, limit = 12): SearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const hits: SearchHit[] = [];

  for (const entry of SEARCH_INDEX) {
    const label = entry.label.toLowerCase();
    const haystack = `${label} ${entry.sub.toLowerCase()} ${entry.keywords.toLowerCase()}`;
    let score = 0;
    let indices: number[] = [];

    if (label === q) {
      score = 1000;
    } else if (label.startsWith(q)) {
      score = 800 - label.length;
    } else {
      const wordStart = label.split(/\s+/).some((word) => word.startsWith(q));
      const at = label.indexOf(q);
      if (wordStart) score = 600 - label.length;
      else if (at !== -1) score = 400 - at;
      else {
        const inHaystack = haystack.indexOf(q);
        if (inHaystack !== -1) score = 200 - Math.min(120, inHaystack);
        else {
          const seq = subsequence(haystack, q);
          if (seq) score = 80 - Math.min(40, seq[seq.length - 1] - seq[0]);
        }
      }
    }

    if (score > 0) {
      score += KIND_WEIGHT[entry.kind];
      // Highlight the query inside the label when it appears literally.
      const literal = label.indexOf(q);
      if (literal !== -1) {
        indices = Array.from({ length: q.length }, (_, i) => literal + i);
      }
      hits.push({ ...entry, score, indices });
    }
  }

  return hits.sort((a, b) => b.score - a.score || a.label.localeCompare(b.label)).slice(0, limit);
}

/** Group hits by kind for the palette's section headers. */
export function groupHits(hits: SearchHit[]): { kind: ResultKind; hits: SearchHit[] }[] {
  const order: ResultKind[] = [
    'Tool',
    'Page',
    'Item',
    'Weapon',
    'Drug',
    'Gym',
    'Course',
    'Degree',
    'Crime',
    'Company',
  ];
  return order
    .map((kind) => ({ kind, hits: hits.filter((h) => h.kind === kind) }))
    .filter((group) => group.hits.length > 0);
}
