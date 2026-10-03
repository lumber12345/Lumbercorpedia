import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar, Callout, Chip, Field, NumberInput, PageHeader, Panel, SectionHeader, Select, SourceNote, Sparkline, Stat } from '../../components/ui';
import { GYMS, gymById, type StatKey } from '../../data/gyms';
import {
  GYM_FORMULA,
  gainPerTrain,
  happyLossPerTrain,
  modelConfidence,
  simulateSession,
  statTotal as sumStats,
} from '../../lib/gym';
import { money, num, statShort } from '../../lib/format';
import { useApp } from '../../lib/store';
import { callTorn, type TornError } from '../../lib/tornApi';

const STAT_LABELS: { key: StatKey; label: string }[] = [
  { key: 'strength', label: 'Strength' },
  { key: 'speed', label: 'Speed' },
  { key: 'defense', label: 'Defense' },
  { key: 'dexterity', label: 'Dexterity' },
];

export default function GymCalculator() {
  const training = useApp((state) => state.training);
  const setTraining = useApp((state) => state.setTraining);
  const apiKey = useApp((state) => state.apiKey);
  const [statKey, setStatKey] = useState<StatKey>('strength');
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState<{ tone: 'green' | 'red'; text: string } | null>(null);

  const gym = gymById(training.gymId) ?? GYMS[0];
  const dots = gym.gains[statKey] ?? gym.gains.strength ?? 4;
  const modifier = 1 + training.modifierPercent / 100;
  const total = sumStats(training.stats);

  const session = useMemo(
    () =>
      simulateSession({
        gymDots: dots,
        energyPerTrain: gym.energy,
        happy: training.happy,
        statTotal: total,
        energyPool: training.dailyEnergy,
        modifier,
      }),
    [dots, gym.energy, training.happy, total, training.dailyEnergy, modifier],
  );

  const perTrain = gainPerTrain({
    gymDots: dots,
    energyPerTrain: gym.energy,
    happy: training.happy,
    statTotal: total,
    modifier,
  });

  const curve = useMemo(() => {
    const points: number[] = [];
    let happy = training.happy;
    let stat = total;
    for (let i = 0; i < Math.min(session.trains, 200); i += 1) {
      const gain = gainPerTrain({ gymDots: dots, energyPerTrain: gym.energy, happy, statTotal: stat, modifier });
      points.push(gain);
      happy = Math.max(0, happy - happyLossPerTrain(gym.energy));
      stat += gain;
    }
    return points;
  }, [session.trains, dots, gym.energy, training.happy, total, modifier]);

  const confidence = modelConfidence(total);

  const comparisons = useMemo(() => {
    const build = (happy: number, dotsValue: number) =>
      simulateSession({
        gymDots: dotsValue,
        energyPerTrain: gym.energy,
        happy,
        statTotal: total,
        energyPool: training.dailyEnergy,
        modifier,
      }).totalGain;
    const baseline = session.totalGain || 1;
    return {
      ecstasy: build(training.happy * 2, dots),
      nextGym: build(training.happy, Math.max(...GYMS.map((g) => (g.gains[statKey] ?? 0)))),
      halfHappy: build(training.happy / 2, dots),
      baseline,
    };
  }, [dots, gym.energy, training.happy, total, training.dailyEnergy, modifier, session.totalGain, statKey]);

  const importStats = async () => {
    if (!apiKey) return;
    setImporting(true);
    setImportMessage(null);
    try {
      const data = await callTorn<{ battlestats?: Record<string, number> }>({
        section: 'user',
        selections: ['battlestats'],
        key: apiKey,
      });
      const stats = data.battlestats ?? {};
      const str = Number(stats.strength ?? stats.strength_modifier ?? 0);
      if (!str) throw { code: 0, error: 'Torn did not return battle stats for this key.' } as TornError;
      setTraining({
        stats: {
          strength: Number(stats.strength ?? 0),
          speed: Number(stats.speed ?? 0),
          defense: Number(stats.defense ?? 0),
          dexterity: Number(stats.dexterity ?? 0),
        },
      });
      setImportMessage({ tone: 'green', text: 'Battle stats imported from the Torn API.' });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : typeof error === 'object' && error && 'error' in error
            ? String((error as TornError).error)
            : 'Unknown error';
      setImportMessage({ tone: 'red', text: message });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Tools"
        title="Gym gains calculator"
        description="Models a session train by train, because every train burns happiness and happiness decides the next train's value. That compounding loss is exactly what a flat “gains × energy” estimate hides."
        right={
          <>
            <Chip tone="neutral">{gym.name}</Chip>
            <Link to="/gyms" className="btn btn-ghost text-xs">
              Gym table
            </Link>
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
        <Panel>
          <SectionHeader title="Your inputs" subtitle="Saved automatically in this browser." />
          <div className="space-y-4 p-4">
            <Field label="Gym">
              <Select
                value={training.gymId}
                onChange={(value) => setTraining({ gymId: value })}
                options={GYMS.map((g) => ({ value: g.id, label: `${g.name} — ${g.energy}e per train` }))}
              />
            </Field>

            <Field label="Stat being trained">
              <Select
                value={statKey}
                onChange={(value) => setStatKey(value)}
                options={STAT_LABELS.map((stat) => ({
                  value: stat.key,
                  label:
                    gym.gains[stat.key] === null
                      ? `${stat.label} — not trainable here`
                      : `${stat.label} — ${gym.gains[stat.key]} dots`,
                }))}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              {STAT_LABELS.map((stat) => (
                <Field key={stat.key} label={stat.label}>
                  <NumberInput
                    value={training.stats[stat.key]}
                    onChange={(value) => setTraining({ stats: { ...training.stats, [stat.key]: value } })}
                  />
                </Field>
              ))}
            </div>

            <Field label="Happiness" hint="Your happy bar at the start of the session.">
              <NumberInput value={training.happy} onChange={(value) => setTraining({ happy: value })} max={99_999} />
            </Field>

            <Field label="Energy available" hint="Natural regen is 480/day; Xanax adds 250 each.">
              <NumberInput value={training.dailyEnergy} onChange={(value) => setTraining({ dailyEnergy: value })} />
            </Field>

            <Field label="Extra gains modifier %" hint="Education, faction upgrades, books and steadfast combined. E.g. SPT courses + book of gym grunting = 21.">
              <NumberInput
                value={training.modifierPercent}
                onChange={(value) => setTraining({ modifierPercent: value })}
                suffix="%"
                min={-50}
                max={300}
              />
            </Field>

            <div className="flex gap-2">
              <button className="btn flex-1" onClick={importStats} disabled={!apiKey || importing}>
                {importing ? 'Importing…' : apiKey ? 'Import my battle stats' : 'Connect a key to import'}
              </button>
            </div>
            {importMessage ? (
              <div className={`text-[11px] ${importMessage.tone === 'green' ? 'text-emerald-300' : 'text-red-300'}`}>
                {importMessage.text}
              </div>
            ) : null}

            <div className="rounded-lg border border-ink-700/70 bg-ink-900/40 p-3 text-[11px] leading-relaxed text-slate-400">
              <div className="mb-1 font-semibold uppercase tracking-wider text-slate-500">Formula in use</div>
              <div className="mono text-[10px] text-slate-300">
                gain = {modifier.toFixed(2)} × {dots} × {gym.energy} × [ (a·ln(happy+250)+c)·statTotal +
                d·(happy+250) + e ]
              </div>
              <div className="mono mt-1 text-[10px] text-slate-500">
                a={GYM_FORMULA.a.toExponential(4)} · c={GYM_FORMULA.c.toExponential(4)} · d=
                {GYM_FORMULA.d.toExponential(4)} · e={GYM_FORMULA.e}
              </div>
            </div>
          </div>
        </Panel>

        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat label="First train" value={statShort(perTrain)} hint={`${dots} dots × ${gym.energy}e`} tone="amber" />
            <Stat
              label="Session gain"
              value={statShort(session.totalGain)}
              hint={`${session.trains} trains · ${num(session.energyUsed)} energy`}
              tone="green"
            />
            <Stat
              label="Average per train"
              value={statShort(session.averageGain)}
              hint={
                perTrain > 0 ? `${((session.averageGain / perTrain) * 100).toFixed(1)}% of the first train` : '—'
              }
            />
            <Stat
              label="Happiness used"
              value={statShort(session.happyUsed)}
              hint={`ends at ${statShort(session.endingHappy)}`}
              tone={session.stoppedBy === 'happiness' ? 'red' : 'neutral'}
            />
          </div>

          {confidence.level !== 'high' ? (
            <Callout tone={confidence.level === 'fair' ? 'amber' : 'red'} title="Model confidence">
              {confidence.note}
            </Callout>
          ) : null}

          {session.stoppedBy === 'happiness' ? (
            <Callout tone="red" title="Happiness ran out first">
              You ran out of happiness before you ran out of energy, so the tail of your energy pool is doing nothing.
              Feed the session more happy (property upgrades, Ecstasy, or a lower energy-per-train gym) instead of buying
              more energy.
            </Callout>
          ) : null}

          <Panel>
            <SectionHeader
              title="Gain decay across the session"
              subtitle="Each train costs 40-60% of its energy in happiness, so gains fall as the session runs."
              right={<Chip tone="neutral">first {curve.length} trains</Chip>}
            />
            <div className="px-4 pb-2 pt-4">
              <Sparkline points={curve} height={70} />
              <div className="mt-2 flex justify-between text-[10px] text-slate-500">
                <span>Train 1: {statShort(curve[0] ?? 0)}</span>
                <span>Train {curve.length}: {statShort(curve[curve.length - 1] ?? 0)}</span>
              </div>
            </div>
            <SourceNote>
              Happiness loss is 40-60% of energy spent per train (Torn wiki). Lumbercorpedia models the midpoint — 50% —
              so real sessions will land slightly either side.
            </SourceNote>
          </Panel>

          <Panel>
            <SectionHeader title="What would change the answer?" subtitle="Same energy pool, one variable moved at a time." />
            <div className="grid gap-3 p-4 sm:grid-cols-2">
              {[
                { label: 'Doubled happiness (Ecstasy)', value: comparisons.ecstasy, tone: 'green' as const },
                {
                  label: `Best ${statKey} gym in the game`,
                  value: comparisons.nextGym,
                  tone: 'amber' as const,
                },
                { label: 'Half the happiness', value: comparisons.halfHappy, tone: 'red' as const },
                { label: 'Current setup', value: comparisons.baseline, tone: 'neutral' as const },
              ].map((row) => {
                const delta = ((row.value - comparisons.baseline) / (comparisons.baseline || 1)) * 100;
                return (
                  <div key={row.label} className="rounded-lg border border-ink-700/70 bg-ink-900/40 p-3">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-xs text-slate-400">{row.label}</span>
                      <span className="mono text-sm text-slate-100">{statShort(row.value)}</span>
                    </div>
                    <div className="mt-2">
                      <Bar value={row.value} max={Math.max(comparisons.ecstasy, comparisons.nextGym, comparisons.baseline, 1)} tone={row.tone} />
                    </div>
                    <div className="mt-1 text-[10px] text-slate-500">
                      {delta >= 0 ? '+' : ''}
                      {delta.toFixed(1)}% versus current
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>

          <Panel>
            <SectionHeader title="Cost side" subtitle="Opening a gym is a one-off; the energy you feed it is the real cost." />
            <div className="grid gap-3 p-4 sm:grid-cols-3">
              <Stat label="Unlock cost" value={money(gym.cost)} hint={gym.cost === 0 ? 'Free / automatic' : 'One-off'} />
              <Stat
                label="Energy per stat point"
                value={session.totalGain > 0 ? (num(session.energyUsed / session.totalGain, 4)) : '—'}
                hint="Lower is better"
              />
              <Stat
                label="Xanax equivalent"
                value={session.energyUsed > 0 ? num(session.energyUsed / 250, 2) : '—'}
                hint="Doses needed to fund this session"
                tone="amber"
              />
            </div>
            <SourceNote>
              Gain formula, happy-loss ranges and gym data come from the torn wiki. Results are estimates: Torn rounds
              gains, modifiers stack differently, and happiness resets to your maximum every quarter hour.
            </SourceNote>
          </Panel>
        </div>
      </div>
    </div>
  );
}
