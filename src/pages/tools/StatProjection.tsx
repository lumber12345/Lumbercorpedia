import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar, Callout, Chip, Field, NumberInput, PageHeader, Panel, SectionHeader, Select, SourceNote, Sparkline, Stat } from '../../components/ui';
import { GYMS, gymById } from '../../data/gyms';
import { daysToTarget, modelConfidence, projectDays, statTotal as sumStats } from '../../lib/gym';
import { num, statShort } from '../../lib/format';
import { useApp } from '../../lib/store';

const HORIZONS = [30, 90, 180, 365];

export default function StatProjection() {
  const training = useApp((state) => state.training);
  const setTraining = useApp((state) => state.setTraining);
  const [horizon, setHorizon] = useState(90);
  const [target, setTarget] = useState(0);
  const [dailyHappy, setDailyHappy] = useState(20_000);

  const gym = gymById(training.gymId) ?? GYMS[0];
  const dots = gym.gains.strength ?? gym.gains.speed ?? 4;
  const total = sumStats(training.stats);
  const modifier = 1 + training.modifierPercent / 100;

  const confidence = modelConfidence(total);

  const projection = useMemo(
    () =>
      projectDays({
        gymDots: dots,
        energyPerTrain: gym.energy,
        happy: dailyHappy,
        statTotal: total,
        dailyEnergy: training.dailyEnergy,
        dailyHappy,
        days: horizon,
        modifier,
      }),
    [dots, gym.energy, dailyHappy, total, training.dailyEnergy, horizon, modifier],
  );

  const finalStat = projection[projection.length - 1]?.statTotal ?? total;
  const totalGain = finalStat - total;

  const targetDays = useMemo(() => {
    if (target <= 0) return null;
    return daysToTarget({
      gymDots: dots,
      energyPerTrain: gym.energy,
      happy: dailyHappy,
      statTotal: total,
      dailyEnergy: training.dailyEnergy,
      dailyHappy,
      target,
      modifier,
      maxDays: 3650,
    });
  }, [target, dots, gym.energy, dailyHappy, total, training.dailyEnergy, modifier]);

  // Milestones: when would each stat cross a round number?
  const milestones = useMemo(() => {
    const stops = [1e6, 1e7, 1e8, 1e9, 5e9, 1e10, 1e11, 5e11, 1e12].filter((value) => value > total);
    return stops.slice(0, 6).map((stop) => ({
      stop,
      days: daysToTarget({
        gymDots: dots,
        energyPerTrain: gym.energy,
        happy: dailyHappy,
        statTotal: total,
        dailyEnergy: training.dailyEnergy,
        dailyHappy,
        target: stop,
        modifier,
        maxDays: 3650,
      }),
    }));
  }, [total, dots, gym.energy, dailyHappy, training.dailyEnergy, modifier]);

  return (
    <div>
      <PageHeader
        eyebrow="Tools"
        title="Stat projection"
        description="Gains scale with your stat total, so a straight line projection is always wrong. This compounds the published formula forward day by day and stops when your input runs out."
        right={<Chip tone="neutral">{horizon} day horizon</Chip>}
      />

      <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <Panel>
          <SectionHeader title="Assumptions" />
          <div className="space-y-4 p-4">
            <Field label="Gym">
              <Select
                value={training.gymId}
                onChange={(value) => setTraining({ gymId: value })}
                options={GYMS.map((g) => ({ value: g.id, label: g.name }))}
              />
            </Field>
            <div>
              <span className="label">Starting battle stats</span>
              <div className="grid grid-cols-2 gap-3">
                {([
                  ['strength', 'Strength'],
                  ['speed', 'Speed'],
                  ['defense', 'Defense'],
                  ['dexterity', 'Dexterity'],
                ] as const).map(([key, label]) => (
                  <label key={key} className="block">
                    <span className="mb-1 block text-[11px] text-slate-400">{label}</span>
                    <NumberInput
                      value={training.stats[key]}
                      onChange={(value) => setTraining({ stats: { ...training.stats, [key]: value } })}
                    />
                  </label>
                ))}
              </div>
              <span className="mt-1.5 block text-[11px] text-slate-500">
                Stat total: <span className="mono text-slate-300">{num(total)}</span> — gains scale with this number.
              </span>
            </div>
            <Field label="Energy per day" hint="Natural 480 + Xanax + refills + armory.">
              <NumberInput value={training.dailyEnergy} onChange={(value) => setTraining({ dailyEnergy: value })} />
            </Field>
            <Field label="Happiness per day" hint="Your fully-upgraded property value, plus any Ecstasy.">
              <NumberInput value={dailyHappy} onChange={(value) => setDailyHappy(value)} max={99_999} />
            </Field>
            <Field label="Extra gains modifier %" hint="Education + faction + books.">
              <NumberInput value={training.modifierPercent} onChange={(value) => setTraining({ modifierPercent: value })} suffix="%" />
            </Field>
            <Field label="Target stat total" hint="Leave at 0 to skip the target date.">
              <NumberInput value={target} onChange={setTarget} />
            </Field>
            <div className="flex gap-1.5">
              {HORIZONS.map((value) => (
                <button
                  key={value}
                  onClick={() => setHorizon(value)}
                  className={`chip flex-1 justify-center ${
                    value === horizon
                      ? 'border-amber-500/60 bg-amber-500/10 text-amber-300'
                      : 'border-ink-600 bg-ink-800 text-slate-300'
                  }`}
                >
                  {value}d
                </button>
              ))}
            </div>
          </div>
        </Panel>

        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat label="Today" value={statShort(total)} />
            <Stat label={`In ${horizon} days`} value={statShort(finalStat)} tone="amber" />
            <Stat label="Total gain" value={statShort(totalGain)} tone="green" />
            <Stat
              label="Growth"
              value={total > 0 ? `${((finalStat / total - 1) * 100).toFixed(1)}%` : '—'}
              hint={`${(finalStat / (total || 1)).toFixed(2)}× your starting total`}
            />
          </div>

          {confidence.level !== 'high' ? (
            <Callout tone={confidence.level === 'fair' ? 'amber' : 'red'} title="Model confidence">
              {confidence.note}
            </Callout>
          ) : null}

          <Panel>
            <SectionHeader
              title="Projected stat total"
              subtitle={`Compounded daily at ${num(training.dailyEnergy)} energy and ${num(dailyHappy)} happiness in ${gym.name}.`}
            />
            <div className="px-4 pb-3 pt-4">
              <Sparkline points={projection.map((day) => day.statTotal)} height={110} />
              <div className="mt-2 flex justify-between text-[10px] text-slate-500">
                <span>Day 1 · {statShort(projection[0]?.statTotal ?? total)}</span>
                <span>
                  Day {horizon} · {statShort(finalStat)}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 border-t border-ink-700/60 p-4 sm:grid-cols-4">
              {projection
                .filter((day) => day.day % Math.max(1, Math.floor(horizon / 4)) === 0)
                .slice(0, 4)
                .map((day) => (
                  <Stat key={day.day} label={`Day ${day.day}`} value={statShort(day.statTotal)} hint={`+${statShort(day.gain)} that day`} />
                ))}
            </div>
          </Panel>

          {target > 0 ? (
            <Callout tone={targetDays === null ? 'red' : 'green'} title="Target date">
              {targetDays === null ? (
                <>At this energy rate you would never reach {statShort(target)} — the daily gain cannot outrun a target that far away. Increase energy or happiness per day.</>
              ) : (
                <>
                  Reaching <span className="font-semibold">{statShort(target)}</span> takes{' '}
                  <span className="font-semibold">{num(targetDays)} days</span> ≈{' '}
                  {num(targetDays / 30.44, 1)} months at this rate. That is{' '}
                  {num(Math.ceil((targetDays * training.dailyEnergy) / 250))} Xanax worth of energy.
                </>
              )}
            </Callout>
          ) : null}

          <Panel>
            <SectionHeader
              title="Milestones"
              subtitle="Stat totals are the milestone the game actually records — every step compounds the next one."
            />
            <div className="divide-y divide-ink-700/60">
              {milestones.map((milestone) => (
                <div key={milestone.stop} className="flex items-center justify-between gap-4 px-4 py-2.5">
                  <span className="mono text-sm text-slate-200">{statShort(milestone.stop)}</span>
                  <div className="mx-3 hidden flex-1 sm:block">
                    <Bar
                      value={milestone.days ? Math.max(0, horizon - (milestone.days ?? 0)) : 0}
                      max={horizon}
                      tone={milestone.days && milestone.days <= horizon ? 'green' : 'neutral'}
                    />
                  </div>
                  <span className={`mono text-xs ${milestone.days === null ? 'text-slate-500' : 'text-amber-300'}`}>
                    {milestone.days === null ? 'beyond 10 years' : `${num(milestone.days)} days`}
                  </span>
                </div>
              ))}
            </div>
            <SourceNote>
              Projections assume you spend every point of energy in the same gym on the same stat and start each day at
              your stated happiness. Real play includes wars, hospital time, crimes and travel — treat this as a best
              case, not a schedule.
            </SourceNote>
          </Panel>

          <div className="grid gap-4 lg:grid-cols-2">
            <Callout tone="amber" title="Energy is the lever, not the gym">
              Unless a gym cannot train your stat at all, moving up a tier is worth roughly 5-10% per step. Adding 250
              energy per day is worth far more than optimising dots.
            </Callout>
            <Panel>
              <SectionHeader
                title="Related"
                right={
                  <Link to="/tools/gym" className="btn btn-ghost text-xs">
                    Session calculator →
                  </Link>
                }
              />
              <p className="px-4 py-3 text-xs leading-relaxed text-slate-400">
                The session calculator answers the same question one day at a time, with the happiness decay curve
                visible.
              </p>
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
}
