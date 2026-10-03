import { useMemo, useState } from 'react';
import { Bar, Callout, Chip, PageHeader, Panel, SectionHeader, SourceNote, Stat } from '../../components/ui';
import { DRUGS, type Drug } from '../../data/drugs';
import { duration, num } from '../../lib/format';

interface StackEntry {
  drug: Drug;
  doses: number;
}

const GOALS = [
  {
    id: 'training',
    label: 'Training / energy',
    blurb: 'Maximise energy and happiness while keeping addiction survivable.',
    picks: ['Xanax', 'Ecstasy', 'Cannabis'],
  },
  {
    id: 'fights',
    label: 'Fighting / war',
    blurb: 'Battle-stat boosters that do not gut your happy or your nerves.',
    picks: ['Vicodin', 'PCP', 'Opium'],
  },
  {
    id: 'crimes',
    label: 'Crimes / nerve',
    blurb: 'Nerve top-ups and hospital escapes with the least lasting damage.',
    picks: ['Cannabis', 'LSD', 'Opium'],
  },
] as const;

function effectNumbers(entry: StackEntry) {
  let energy = 0;
  let nerve = 0;
  let happy = 0;
  let happyMult = 1;
  for (const effect of entry.drug.effects) {
    if (effect.tag === 'energy') {
      const match = /\+(\d+)/.exec(effect.text);
      if (match) energy += Number(match[1]) * entry.doses;
    }
    if (effect.tag === 'nerve') {
      const match = /\+(\d+)/.exec(effect.text);
      if (match) nerve += Number(match[1]) * entry.doses;
    }
    if (effect.tag === 'happy') {
      const match = /\+([\d-]+)/.exec(effect.text);
      if (match) happy += Number(match[1]) * entry.doses;
    }
    if (effect.tag === 'happy_mult') happyMult += 1 * entry.doses;
  }
  return { energy, nerve, happy, happyMult };
}

export default function BoosterPlanner() {
  const [stack, setStack] = useState<StackEntry[]>([{ drug: DRUGS[0], doses: 3 }]);
  const [happyBase, setHappyBase] = useState(20_000);
  const [goal, setGoal] = useState<(typeof GOALS)[number]['id']>('training');

  const add = (drug: Drug) =>
    setStack((current) =>
      current.some((entry) => entry.drug.name === drug.name)
        ? current.map((entry) => (entry.drug.name === drug.name ? { ...entry, doses: entry.doses + 1 } : entry))
        : [...current, { drug, doses: 1 }],
    );

  const setDoses = (name: string, doses: number) =>
    setStack((current) => current.map((entry) => (entry.drug.name === name ? { ...entry, doses: Math.max(0, doses) } : entry)));

  const remove = (name: string) => setStack((current) => current.filter((entry) => entry.drug.name !== name));

  const totals = useMemo(() => {
    let energy = 0;
    let nerve = 0;
    let happy = 0;
    let happyMult = 1;
    let addiction = 0;
    let cooldown = 0;
    let doses = 0;
    for (const entry of stack) {
      const numbers = effectNumbers(entry);
      energy += numbers.energy;
      nerve += numbers.nerve;
      happy += numbers.happy;
      happyMult += numbers.happyMult - 1;
      addiction += entry.drug.addiction * entry.doses;
      // Cooldowns are sequential — the clock for dose N starts when dose N-1 ends.
      cooldown += ((entry.drug.cooldown[0] + entry.drug.cooldown[1]) / 2) * entry.doses;
      doses += entry.doses;
    }
    return { energy, nerve, happy, happyMult, addiction, cooldown, doses };
  }, [stack]);

  const maxAddiction = Math.max(...DRUGS.map((drug) => drug.addiction), 1);
  const happyTotal = Math.round(happyBase * totals.happyMult + totals.happy);
  const trainingXp = totals.energy / 250;

  const suggestion = GOALS.find((entry) => entry.id === goal)!;

  return (
    <div>
      <PageHeader
        eyebrow="Tools"
        title="Booster planner"
        description="Stack drugs without losing track of the three things that actually bite you: cooldown windows, happiness caps and addiction points. Everything here uses the effect text and cooldown ranges published on the wiki."
        right={<Chip tone="amber">{totals.doses} doses planned</Chip>}
      />

      <div className="mb-4 flex flex-wrap gap-1.5">
        {GOALS.map((entry) => (
          <button
            key={entry.id}
            onClick={() => setGoal(entry.id)}
            className={`chip ${
              entry.id === goal
                ? 'border-amber-500/60 bg-amber-500/10 text-amber-300'
                : 'border-ink-600 bg-ink-800 text-slate-300 hover:border-ink-500'
            }`}
          >
            {entry.label}
          </button>
        ))}
        <span className="self-center text-[11px] text-slate-500">{suggestion.blurb}</span>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_420px]">
        <div className="space-y-5">
          <Panel>
            <SectionHeader
              title="Available substances"
              subtitle="Click to add a dose. Cooldowns are sequential, so the plan sums them in order."
            />
            <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
              {DRUGS.map((drug) => {
                const planned = stack.find((entry) => entry.drug.name === drug.name)?.doses ?? 0;
                const recommended = (suggestion.picks as readonly string[]).includes(drug.name);
                return (
                  <button
                    key={drug.name}
                    onClick={() => add(drug)}
                    className={`flex flex-col gap-2 rounded-lg border p-3 text-left transition-colors ${
                      planned > 0
                        ? 'border-amber-500/50 bg-amber-500/[0.06]'
                        : recommended
                          ? 'border-emerald-600/40 bg-emerald-500/[0.04] hover:border-emerald-500/60'
                          : 'border-ink-700 bg-ink-900/40 hover:border-ink-600'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-slate-100">{drug.name}</span>
                      {planned > 0 ? <Chip tone="amber">×{planned}</Chip> : recommended ? <Chip tone="green">fits goal</Chip> : null}
                    </div>
                    <span className="text-[11px] leading-relaxed text-slate-400">{drug.effects[0]?.text}</span>
                    <div className="mt-auto flex items-center justify-between text-[10px] text-slate-500">
                      <span>{duration(drug.cooldown[0])}–{duration(drug.cooldown[1])} cd</span>
                      <span>{drug.addiction} addiction</span>
                    </div>
                    <Bar value={drug.addiction} max={maxAddiction} tone={drug.addiction > 20 ? 'red' : 'amber'} />
                  </button>
                );
              })}
            </div>
          </Panel>

          <Panel>
            <SectionHeader title="How this stack works out" />
            <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4">
              <Stat label="Energy" value={`+${num(totals.energy)}`} hint={`${trainingXp.toFixed(1)} Xanax-equivalents`} tone="amber" />
              <Stat label="Nerve" value={`+${num(totals.nerve)}`} hint="counts towards crimes" tone="violet" />
              <Stat label="Happy (with base)" value={num(happyTotal)} hint={`base ${num(happyBase)} × ${totals.happyMult.toFixed(1)}`} tone="green" />
              <Stat
                label="Addiction"
                value={num(totals.addiction)}
                hint={`${(totals.addiction / Math.max(1, totals.doses)).toFixed(1)} per dose`}
                tone={totals.addiction > 60 ? 'red' : 'neutral'}
              />
            </div>
            <div className="border-t border-ink-700/60 px-4 py-3">
              <div className="mb-1 flex items-center justify-between text-[11px] text-slate-500">
                <span>Sequential cooldown time</span>
                <span className="mono text-slate-300">{duration(totals.cooldown)}</span>
              </div>
              <Bar value={totals.cooldown} max={1440 * 7} tone={totals.cooldown > 1440 * 3 ? 'red' : 'blue'} />
              <div className="mt-1 text-[11px] text-slate-500">
                That is {((totals.cooldown / 1440) * 100).toFixed(0)}% of a day — you cannot dose faster than this, so
                large stacks are a plan for the week, not the hour.
              </div>
            </div>
            <SourceNote>
              Happiness above your maximum resets to your maximum every quarter hour (except with the Ignorance is Bliss
              book), so the happy figure is only real if you can spend it before the clock resets.
            </SourceNote>
          </Panel>
        </div>

        <div className="space-y-5">
          <Panel>
            <SectionHeader
              title="Your stack"
              subtitle="Adjust doses or remove substances."
              right={
                stack.length > 0 ? (
                  <button className="btn btn-ghost text-xs" onClick={() => setStack([])}>
                    Clear
                  </button>
                ) : null
              }
            />
            {stack.length === 0 ? (
              <p className="px-4 py-6 text-center text-xs text-slate-500">
                Nothing planned yet — click a substance on the left to start.
              </p>
            ) : (
              <ul className="divide-y divide-ink-700/60">
                {stack.map((entry) => {
                  const numbers = effectNumbers(entry);
                  return (
                    <li key={entry.drug.name} className="px-4 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-medium text-slate-100">{entry.drug.name}</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            className="h-6 w-6 rounded border border-ink-600 text-slate-300 hover:border-ink-500"
                            onClick={() => setDoses(entry.drug.name, entry.doses - 1)}
                          >
                            −
                          </button>
                          <span className="mono w-8 text-center text-sm text-slate-200">{entry.doses}</span>
                          <button
                            className="h-6 w-6 rounded border border-ink-600 text-slate-300 hover:border-ink-500"
                            onClick={() => setDoses(entry.drug.name, entry.doses + 1)}
                          >
                            +
                          </button>
                          <button
                            className="ml-1 text-xs text-slate-500 hover:text-red-300"
                            onClick={() => remove(entry.drug.name)}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                      <div className="mt-1 grid grid-cols-3 gap-2 text-[10px] text-slate-500">
                        <span>+{num(numbers.energy)} energy</span>
                        <span>+{num(numbers.nerve)} nerve</span>
                        <span>+{num(numbers.happy)} happy</span>
                      </div>
                      <div className="mt-1 text-[10px] text-slate-500">
                        {entry.drug.addiction * entry.doses} addiction · {duration(entry.drug.cooldown[0] * entry.doses)}–
                        {duration(entry.drug.cooldown[1] * entry.doses)} total cooldown
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>

          <Panel>
            <SectionHeader title="Base happiness" />
            <div className="p-4">
              <input
                type="range"
                min={1000}
                max={99999}
                step={500}
                value={happyBase}
                onChange={(event) => setHappyBase(Number(event.target.value))}
                className="w-full accent-amber-500"
              />
              <div className="mt-2 flex justify-between text-[11px] text-slate-500">
                <span>1,000</span>
                <span className="mono text-slate-300">{num(happyBase)} happy</span>
                <span>99,999</span>
              </div>
            </div>
          </Panel>

          <Callout tone="red" title="Watch the red bars">
            Anything above 20 addiction points per dose is a serious commitment. PCP and Speed carry permanent stat
            penalties on overdose, and Xanax overdose is a 5,000 minute hospital stay.
          </Callout>

          <Callout tone="green" title="Training checklist">
            Dose for energy, spend the happy before the quarter-hour reset, and keep a cheap crime or a Gym train ready
            so the stat debuff from Xanax costs you nothing.
          </Callout>
        </div>
      </div>
    </div>
  );
}
