import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar, Callout, Chip, Field, NumberInput, PageHeader, Panel, SectionHeader, SourceNote, Stat } from '../../components/ui';
import {
  FULL_LINE_COST,
  MAX_LEVELS,
  MERIT_LINES,
  MERIT_POINT_COST,
  lineCost,
  meritsPurchasableAtLevel,
  planAllocation,
  type Goal,
} from '../../data/merits';
import { money, num } from '../../lib/format';
import { useApp } from '../../lib/store';

const GOALS: { id: Goal; label: string; blurb: string }[] = [
  { id: 'training', label: 'Training & stats', blurb: 'Gym gains, battle stats and getting through education fastest.' },
  { id: 'combat', label: 'Fighting', blurb: 'Damage, critical hits and surviving wars.' },
  { id: 'economy', label: 'Money', blurb: 'Bank interest, city finds and mugging income.' },
  { id: 'crimes', label: 'Crimes', blurb: 'Nerve bar, crime experience and skill growth.' },
];

const GROUP_TONE = {
  training: 'amber',
  combat: 'red',
  economy: 'green',
  utility: 'blue',
} as const;

export default function MeritPlanner() {
  const prefs = useApp((state) => state.newPlayer);
  const setPrefs = useApp((state) => state.setNewPlayer);
  const [budget, setBudget] = useState(10);
  const [goal, setGoal] = useState<Goal>('training');
  const [weights, setWeights] = useState<Record<string, number>>({});

  const plan = useMemo(() => planAllocation(budget, goal, weights), [budget, goal, weights]);
  const spent = plan.reduce((sum, entry) => sum + entry.cost, 0);

  const buyableMerits = meritsPurchasableAtLevel(prefs.level);
  const pointsCost = buyableMerits * MERIT_POINT_COST;

  const setWeight = (id: string, value: number) =>
    setWeights((current) => ({ ...current, [id]: Math.max(0, Math.min(3, value)) }));

  return (
    <div>
      <PageHeader
        eyebrow="New player tools"
        title="Merit planner"
        description="Merits are permanent and their cost rises inside each line — the first upgrade costs 1 merit, the tenth costs 10, so a full line is 55. Which means the order you spend them in is worth more than the total you eventually have."
        right={
          <>
            <Chip tone="amber">{num(budget)} merits to spend</Chip>
            <Chip tone="neutral">full line = {FULL_LINE_COST}</Chip>
          </>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Cost of upgrade 1" value="1 merit" hint="Always the best value you will ever get" tone="green" />
        <Stat label="Cost of upgrade 10" value="10 merits" hint="Ten times the price of the first" tone="red" />
        <Stat label="Full 10/10 line" value={`${FULL_LINE_COST} merits`} hint="1+2+3+…+10" />
        <Stat
          label={`Buyable at level ${prefs.level}`}
          value={`${buyableMerits} merits`}
          hint={`${MERIT_POINT_COST} points each — one per 2 levels`}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
        <Panel>
          <SectionHeader title="Your situation" />
          <div className="space-y-4 p-4">
            <Field label="Merits available to spend" hint="Medals, honours, and merits bought at the points building.">
              <NumberInput value={budget} onChange={setBudget} max={2000} />
            </Field>

            <div>
              <span className="label">What are you optimising for?</span>
              <div className="space-y-1.5">
                {GOALS.map((entry) => (
                  <button
                    key={entry.id}
                    onClick={() => setGoal(entry.id)}
                    className={`w-full rounded-lg border px-3 py-2 text-left transition-colors ${
                      entry.id === goal
                        ? 'border-amber-500/60 bg-amber-500/10'
                        : 'border-ink-700 bg-ink-900/40 hover:border-ink-600'
                    }`}
                  >
                    <span className={`block text-xs font-medium ${entry.id === goal ? 'text-amber-300' : 'text-slate-200'}`}>
                      {entry.label}
                    </span>
                    <span className="block text-[11px] text-slate-500">{entry.blurb}</span>
                  </button>
                ))}
              </div>
            </div>

            <Field label="Your level" hint="Merits can be bought with points, capped at one per two levels.">
              <NumberInput value={prefs.level} onChange={(value) => setPrefs({ level: value })} max={100} />
            </Field>

            <div className="rounded-lg border border-ink-700/70 bg-ink-900/40 p-3 text-[11px] leading-relaxed text-slate-400">
              <div className="mb-1 font-semibold uppercase tracking-wider text-slate-500">Buying merits with points</div>
              At level {prefs.level} you may buy up to {buyableMerits} merit{buyableMerits === 1 ? '' : 's'} at{' '}
              {MERIT_POINT_COST} points each — {num(pointsCost)} points, or roughly{' '}
              <span className="mono text-slate-300">
                {money(pointsCost * 45_000)}
              </span>{' '}
              of points at 45k each. Merits can also be reset for points if you change your mind.
            </div>
          </div>
        </Panel>

        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat label="Spending plan" value={`${plan.length} lines`} hint={`${spent} of ${budget} merits used`} />
            <Stat label="Left over" value={num(budget - spent)} hint={budget - spent < 2 ? 'Not enough for another first upgrade' : 'Enough for more'} />
            <Stat
              label="Biggest single buy"
              value={plan[0]?.line.name ?? '—'}
              hint={plan[0] ? `${plan[0].levels} levels for ${plan[0].cost} merits` : 'Add more merits'}
              tone="amber"
            />
            <Stat label="Efficiency" value={`${budget > 0 ? ((spent / budget) * 100).toFixed(0) : 0}%`} hint="of your budget allocated" tone="green" />
          </div>

          <Panel>
            <SectionHeader
              title="Recommended order"
              subtitle="Highest value per merit first. Because each line gets more expensive while its effect stays flat, front-loading levels in a few lines beats spreading them thin."
            />
            {plan.length === 0 ? (
              <div className="px-4 py-6 text-center text-xs text-slate-500">
                Add merits above and a plan will appear here.
              </div>
            ) : (
              <div className="divide-y divide-ink-700/60">
                {plan.map((entry) => (
                  <div key={entry.line.id} className="px-4 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-100">{entry.line.name}</span>
                        <Chip tone={GROUP_TONE[entry.line.group]}>{entry.line.group}</Chip>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="mono text-xs text-amber-300">
                          {entry.levels}/{MAX_LEVELS}
                        </span>
                        <Chip tone="neutral">{entry.cost} merits</Chip>
                      </div>
                    </div>
                    <div className="mt-1.5">
                      <Bar value={entry.levels} max={MAX_LEVELS} tone={GROUP_TONE[entry.line.group]} />
                    </div>
                    <div className="mt-1.5 grid gap-2 text-[11px] sm:grid-cols-2">
                      <div className="text-slate-400">
                        <span className="text-slate-500">Per upgrade: </span>
                        {entry.line.perUpgrade}
                      </div>
                      <div className="text-emerald-300/90">
                        <span className="text-slate-500">At this level: </span>
                        {entry.levels >= MAX_LEVELS
                          ? entry.line.atMax
                          : `${entry.levels}× ${entry.line.unit.split(' ').slice(-1)[0]} of the ${MAX_LEVELS} max`}
                      </div>
                    </div>
                    {entry.line.note ? (
                      <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500">{entry.line.note}</p>
                    ) : null}
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-wider text-slate-500">Priority weight</span>
                      <button
                        className="h-6 w-6 rounded border border-ink-600 text-xs text-slate-300 hover:border-ink-500"
                        onClick={() => setWeight(entry.line.id, (weights[entry.line.id] ?? 1) - 0.5)}
                      >
                        −
                      </button>
                      <span className="mono w-8 text-center text-[11px] text-slate-300">
                        {(weights[entry.line.id] ?? 1).toFixed(1)}
                      </span>
                      <button
                        className="h-6 w-6 rounded border border-ink-600 text-xs text-slate-300 hover:border-ink-500"
                        onClick={() => setWeight(entry.line.id, (weights[entry.line.id] ?? 1) + 0.5)}
                      >
                        +
                      </button>
                      <span className="text-[11px] text-slate-500">
                        Lower this line if you do not care about it, raise it if you do.
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <SourceNote>
              Recommended order uses each line's published per-upgrade effect, weighted for your chosen goal. Education
              Length is weighted heavily for training because it compounds over every future course; Critical Hit Rate is
              weighted for combat because it applies as percentage points on a base near 12%. Change the weights if your
              priorities differ.
            </SourceNote>
          </Panel>

          <Panel>
            <SectionHeader
              title="Every merit line, with its real numbers"
              subtitle={`Costs double-checked against the incremental rule: ${MAX_LEVELS} upgrades cost ${lineCost(MAX_LEVELS)} merits.`}
            />
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-ink-700">
                    <th className="th">Line</th>
                    <th className="th">Per upgrade</th>
                    <th className="th">At 10/10</th>
                    <th className="th">Best for</th>
                    <th className="th text-right">Cost to max</th>
                  </tr>
                </thead>
                <tbody>
                  {MERIT_LINES.map((line) => (
                    <tr key={line.id} className="border-b border-ink-800/70 row-hover">
                      <td className="td">
                        <div className="font-medium text-slate-100">{line.name}</div>
                        <Chip tone={GROUP_TONE[line.group]}>{line.group}</Chip>
                      </td>
                      <td className="td text-xs text-slate-300">{line.perUpgrade}</td>
                      <td className="td text-xs text-emerald-300/90">{line.atMax}</td>
                      <td className="td max-w-[220px] text-[11px] text-slate-400">{line.goodFor}</td>
                      <td className="td mono text-right">{lineCost(MAX_LEVELS)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          <div className="grid gap-4 lg:grid-cols-3">
            <Callout tone="amber" title="Spend early, spend narrow">
              One merit spent on upgrade 1 of a line does what ten merits spent on upgrade 10 do — for a tenth of the
              price. Buying the first and second upgrade across several useful lines beats maxing one.
            </Callout>
            <Callout tone="green" title="Education Length is a time machine">
              −2% per upgrade, −20% at 10/10, stacking additively with the WSU stock block and the Education principal
              perk for a 40% reduction. Every week of courses you have not started yet gets shorter.
            </Callout>
            <Callout tone="blue" title="Resets exist">
              Merits can be reset for points (500, then 750, then 1,000… capped at 5,000), and free merit resets come
              from the Book: High School For Adults and Christmas gifts. A wrong early choice is recoverable — but not
              free.
            </Callout>
          </div>

          <Panel>
            <SectionHeader
              title="Related"
              right={
                <Link to="/tools/education" className="btn text-xs">
                  Education planner →
                </Link>
              }
            />
            <p className="px-4 py-3 text-xs leading-relaxed text-slate-400">
              Education Length merits are set on the study planner as well, so the finish dates there already account for
              them.
            </p>
          </Panel>
        </div>
      </div>
    </div>
  );
}
