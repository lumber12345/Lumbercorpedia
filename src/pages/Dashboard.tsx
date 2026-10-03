import { Link } from 'react-router-dom';
import { Panel, Chip, Stat, SectionHeader, Callout } from '../components/ui';
import { ITEMS } from '../data/items';
import { WEAPONS } from '../data/weapons';
import { DRUGS } from '../data/drugs';
import { GYMS } from '../data/gyms';
import { ALL_COURSES, DEGREES } from '../data/education';
import { CRIMES } from '../data/crimes';
import { useApp } from '../lib/store';
import { GYM_FORMULA, gainPerTrain, statTotal, simulateSession } from '../lib/gym';
import { statShort } from '../lib/format';
import { useCountUp } from '../lib/hooks';
import { gymById } from '../data/gyms';

const TOOLS = [
  {
    to: '/tools/gym',
    title: 'Gym gains calculator',
    body: 'Model one training session with the published Torn gain formula, including happiness burn.',
    tag: 'Most used',
  },
  {
    to: '/tools/stats',
    title: 'Stat projection',
    body: 'Compound your gym gains forward day by day and find the date you hit a target stat total.',
    tag: 'Planning',
  },
  {
    to: '/tools/boosters',
    title: 'Booster planner',
    body: 'Build a drug stack, respect cooldowns, and see exactly how much addiction you are signing up for.',
    tag: 'Drugs',
  },
  {
    to: '/tools/education',
    title: 'Study planner',
    body: 'Sequence a degree with prerequisites, merits, WSU and the Principal perk applied correctly.',
    tag: 'Long game',
  },
  {
    to: '/tools/travel',
    title: 'Travel profit',
    body: 'Decide whether an abroad run is worth the flight once you count the trade fee and hotel night.',
    tag: 'Money',
  },
  {
    to: '/tools/company',
    title: 'Company profit',
    body: 'Director-grade wage, cost and margin analysis with a break-even wage per employee.',
    tag: 'Directors',
  },
];

export default function Dashboard() {
  const training = useApp((state) => state.training);
  const apiKey = useApp((state) => state.apiKey);
  const gym = gymById(training.gymId) ?? GYMS[0];

  const totalItems = useCountUp(ITEMS.length);
  const totalWeapons = useCountUp(WEAPONS.length);

  const total = statTotal(training.stats);
  const perTrain = gainPerTrain({
    gymDots: gym.gains.strength ?? gym.gains.speed ?? 4,
    energyPerTrain: training.energyPerTrain,
    happy: training.happy,
    statTotal: total,
    modifier: 1 + training.modifierPercent / 100,
  });
  const session = simulateSession({
    gymDots: gym.gains.strength ?? gym.gains.speed ?? 4,
    energyPerTrain: training.energyPerTrain,
    happy: training.happy,
    statTotal: total,
    energyPool: training.dailyEnergy,
    modifier: 1 + training.modifierPercent / 100,
  });

  return (
    <div className="space-y-6">
      <Panel className="overflow-hidden">
        <div className="relative px-5 py-7 sm:px-8 sm:py-9">
          <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:repeating-linear-gradient(115deg,transparent_0,transparent_18px,rgba(249,138,18,0.9)_18px,rgba(249,138,18,0.9)_19px)]" />
          <div className="relative max-w-3xl">
            <Chip tone="amber" className="mb-3">
              Torn intelligence, upgraded
            </Chip>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-[34px]">
              Every item, gym, course and crime in one searchable place.
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              The Torn wiki makes you know which page to open. Lumbercorpedia indexes the whole game into one search
              box, then adds the calculators the wiki never shipped: real gym-gain maths, booster stacking, study
              sequencing and director-grade profit analysis.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link to="/items" className="btn btn-primary">
                Browse the item database
              </Link>
              <Link to="/tools/gym" className="btn">
                Open gym calculator
              </Link>
              <Link to="/profile" className="btn btn-ghost">
                {apiKey ? 'Your Torn data' : 'Connect your Torn key'}
              </Link>
            </div>
          </div>
        </div>
      </Panel>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="Items" value={totalItems} hint="with IDs & sources" />
        <Stat label="Weapons" value={totalWeapons} hint="verified stat ranges" />
        <Stat label="Drugs" value={DRUGS.length} hint="effects & overdoses" />
        <Stat label="Gyms" value={GYMS.length} hint="all tiers" />
        <Stat label="Courses" value={ALL_COURSES.length} hint={`${DEGREES.length} degree paths`} />
        <Stat label="Crime types" value={CRIMES.length} hint="Crimes 2.0" />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Panel>
            <SectionHeader
              title="Your training snapshot"
              subtitle="From the preferences saved in your browser — open a calculator to change them."
              right={
                <Link to="/tools/gym" className="btn btn-ghost text-xs">
                  Tune →
                </Link>
              }
            />
            <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4">
              <Stat label="Stat total" value={statShort(total)} tone="amber" />
              <Stat label="Gain / train" value={statShort(perTrain)} hint={`${gym.name} · ${training.energyPerTrain}e`} />
              <Stat
                label="Session gain"
                value={statShort(session.totalGain)}
                hint={`${session.trains} trains · ${statShort(session.energyUsed)} energy`}
              />
              <Stat
                label="Happy burn"
                value={statShort(session.happyUsed)}
                hint={`ends at ${statShort(session.endingHappy)} happy`}
              />
            </div>
            <div className="border-t border-ink-700/60 px-4 py-3 text-[11px] leading-relaxed text-slate-500">
              Uses the community-published formula{' '}
              <span className="mono text-slate-400">
                gain = dots × energy × [(a·ln(happy+250)+c)·statTotal + d·(happy+250) + e]
              </span>{' '}
              with a = {GYM_FORMULA.a.toExponential(3)}, d = {GYM_FORMULA.d.toExponential(3)}. Estimates only — Torn
              rounds and your modifiers will differ.
            </div>
          </Panel>

          <Panel>
            <SectionHeader title="The toolkit" subtitle="Six calculators that answer the questions the wiki leaves you to work out yourself." />
            <div className="grid gap-3 p-4 sm:grid-cols-2">
              {TOOLS.map((tool) => (
                <Link
                  key={tool.to}
                  to={tool.to}
                  className="panel panel-hover group flex flex-col gap-1.5 p-3.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-100 group-hover:text-amber-300">{tool.title}</span>
                    <Chip tone="neutral">{tool.tag}</Chip>
                  </div>
                  <span className="text-[11px] leading-relaxed text-slate-500">{tool.body}</span>
                </Link>
              ))}
            </div>
          </Panel>
        </div>

        <div className="space-y-5">
          <Panel>
            <SectionHeader title="New player path" subtitle="The order that avoids wasted weeks." />
            <ol className="divide-y divide-ink-700/60 text-xs">
              {[
                ['Start GEN1112 + GEN2113', 'One and two weeks, unlock driving crimes and crime access.'],
                ['Do CMT1520 immediately', 'A single week unlocks virus coding you can do in the background for a merit.'],
                ['Then Health & Fitness → Sports Science', 'Cheap, fast, permanent passive stats and gym gains.'],
                ['Gym: average up to Deep Burn', 'Never retrain in a gym you have outgrown; open the next one when EXP allows.'],
                ['Set your xanax cadence', 'Energy is your stat currency — plan drugs around training, not fights.'],
              ].map(([title, body], index) => (
                <li key={title} className="flex gap-3 px-4 py-3">
                  <span className="mono mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-amber-500/15 text-[11px] font-semibold text-amber-300">
                    {index + 1}
                  </span>
                  <span>
                    <span className="block font-medium text-slate-200">{title}</span>
                    <span className="block text-slate-500">{body}</span>
                  </span>
                </li>
              ))}
            </ol>
          </Panel>

          <Callout tone="amber" title="Where the numbers come from">
            Every dataset in Lumbercorpedia records its provenance. Gyms, drugs, weapons, education tables and crime
            mechanics are taken from Torn's public wiki; community observations (like nerve-to-max records) are labelled
            as estimates.{' '}
            <Link to="/about" className="link">
              Read the source notes
            </Link>
            .
          </Callout>
        </div>
      </div>
    </div>
  );
}
