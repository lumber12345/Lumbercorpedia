import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar, Callout, Chip, Field, NumberInput, PageHeader, Panel, SectionHeader, SourceNote, Sparkline, Stat, Toggle } from '../../components/ui';
import {
  DONATOR_TICK_MINUTES,
  MAX_ENERGY_BASE,
  MAX_ENERGY_DONATOR,
  TICK_MINUTES,
  energyPerDay,
  energyPerHour,
  energyValue,
  hoursToFull,
  modelCadence,
} from '../../lib/energy';
import { clock, duration, num } from '../../lib/format';
import { useApp } from '../../lib/store';

const TRAIN_COSTS = [5, 10, 25, 50];

export default function EnergyPlanner() {
  const prefs = useApp((state) => state.newPlayer);
  const setPrefs = useApp((state) => state.setNewPlayer);
  const training = useApp((state) => state.training);
  const [trainCost, setTrainCost] = useState(training.energyPerTrain || 10);

  const max = prefs.donator ? MAX_ENERGY_DONATOR : MAX_ENERGY_BASE;
  const rate = energyPerHour(prefs.donator);
  const daily = energyPerDay(prefs.donator);
  const toFull = hoursToFull(Math.min(prefs.currentEnergy, max), max, prefs.donator);
  const cadence = useMemo(
    () => modelCadence(prefs.loginsPerDay, max, prefs.donator),
    [prefs.loginsPerDay, max, prefs.donator],
  );

  // 24-hour regeneration curve for the chosen cadence, showing where it caps.
  const curve = useMemo(() => {
    const points: number[] = [];
    let energy = Math.min(prefs.currentEnergy, max);
    const stepMinutes = 15;
    for (let minute = 0; minute <= 1440; minute += stepMinutes) {
      points.push(energy);
      if (minute % (cadence.intervalHours * 60) === 0 && minute > 0) energy = 0; // spent at login
      energy = Math.min(max, energy + (rate * stepMinutes) / 60);
    }
    return points;
  }, [prefs.currentEnergy, max, rate, cadence.intervalHours]);

  const value = energyValue(cadence.recoverable, trainCost);
  const xanaxPerDay = daily / 250;

  return (
    <div>
      <PageHeader
        eyebrow="New player tools"
        title="Energy planner"
        description="Energy is the currency of every form of progress in Torn, and it regenerates into a cap. This page tells you when your bar is full, how much of your daily regeneration you are throwing away, and what logging in more often is actually worth."
        right={<Chip tone="amber">{num(daily)} energy/day available</Chip>}
      />

      <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
        <Panel>
          <SectionHeader title="Your bars" />
          <div className="space-y-4 p-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Level">
                <NumberInput value={prefs.level} onChange={(value) => setPrefs({ level: value })} max={100} />
              </Field>
              <Field label="Logins per day" hint="How often you realistically open Torn.">
                <NumberInput value={prefs.loginsPerDay} onChange={(value) => setPrefs({ loginsPerDay: value })} max={24} />
              </Field>
            </div>

            <Field label="Current energy" hint={`Your maximum is ${max}${prefs.donator ? ' with donator status' : '. Donator status raises it to 150.'}`}>
              <NumberInput value={prefs.currentEnergy} onChange={(value) => setPrefs({ currentEnergy: value })} max={1000} />
            </Field>

            <Toggle
              checked={prefs.donator}
              onChange={(value) => setPrefs({ donator: value })}
              label="Donator / subscriber status"
              hint={`Energy regenerates every ${DONATOR_TICK_MINUTES} minutes instead of ${TICK_MINUTES}, and your maximum rises to ${MAX_ENERGY_DONATOR}.`}
            />

            <div>
              <span className="label">Gym train cost</span>
              <div className="flex gap-1.5">
                {TRAIN_COSTS.map((cost) => (
                  <button
                    key={cost}
                    onClick={() => setTrainCost(cost)}
                    className={`chip flex-1 justify-center ${
                      cost === trainCost
                        ? 'border-amber-500/60 bg-amber-500/10 text-amber-300'
                        : 'border-ink-600 bg-ink-800 text-slate-300'
                    }`}
                  >
                    {cost}e
                  </button>
                ))}
              </div>
              <span className="mt-1 block text-[11px] text-slate-500">
                Lightweight gyms cost 5, middleweight and heavyweight cost 10, specialist gyms 25 or 50.
              </span>
            </div>

            <div className="rounded-lg border border-ink-700/70 bg-ink-900/40 p-3 text-[11px] leading-relaxed text-slate-400">
              <div className="mb-1 font-semibold uppercase tracking-wider text-slate-500">Regeneration rules</div>
              <ul className="space-y-1">
                <li>• 5 energy per {TICK_MINUTES} minutes ({DONATOR_TICK_MINUTES} for donators) — {rate}/hour.</li>
                <li>• 5 happiness per {TICK_MINUTES} minutes, capped at your maximum.</li>
                <li>• 1 nerve every 5 minutes.</li>
                <li>• Energy regenerated past your maximum is lost.</li>
              </ul>
            </div>
          </div>
        </Panel>

        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat label="Bar full in" value={clock(toFull * 3600)} hint={`${num(prefs.currentEnergy)}/${max} energy now`} tone="amber" />
            <Stat label="Energy per hour" value={num(rate)} hint={prefs.donator ? 'donator rate' : 'standard rate'} />
            <Stat label="Energy per day" value={num(daily)} hint="if you never let it cap" tone="green" />
            <Stat
              label="Level 15"
              value={prefs.level >= 15 ? 'Unlocked' : `${15 - prefs.level} to go`}
              hint={prefs.level >= 15 ? 'Travel is available' : 'Travel unlocks at level 15'}
              tone={prefs.level >= 15 ? 'green' : 'neutral'}
            />
          </div>

          <Panel>
            <SectionHeader
              title="Are you wasting regeneration?"
              subtitle="Energy regenerates whether you are logged in or not, but it stops at your maximum. Gaps between logins that are longer than your bar takes to fill are pure loss."
            />
            <div className="grid gap-4 p-4 lg:grid-cols-2">
              <div>
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="max-w-[60%] text-slate-400">
                    Logging in {cadence.loginsPerDay}× per day (every {duration(cadence.intervalHours * 60)})
                  </span>
                  <span className={`mono ${cadence.wastedPercent > 25 ? 'text-red-300' : 'text-emerald-300'}`}>
                    {cadence.wastedPercent.toFixed(0)}% wasted
                  </span>
                </div>
                <Bar value={cadence.wasted} max={cadence.regenerated} tone={cadence.wastedPercent > 25 ? 'red' : 'amber'} />
                <dl className="mt-3 space-y-1.5 text-xs">
                  {[
                    ['Regenerated per day', `${num(cadence.regenerated)} energy`],
                    ['Actually collected', `${num(cadence.collected)} energy`],
                    ['Lost to the cap', `${num(cadence.wasted)} energy`],
                    ['Best realistic cadence', `${num(cadence.atFiveHours)} energy`],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between gap-3 border-b border-ink-700/50 pb-1">
                      <dt className="text-slate-500">{label}</dt>
                      <dd className="mono text-slate-200">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div className="space-y-3">
                {cadence.wasted > 0 ? (
                  <Callout tone="red" title={`You are losing ${num(cadence.wasted)} energy every day`}>
                    That is{' '}
                    <span className="font-semibold text-slate-100">{num(value.trains)} gym trains</span> at {trainCost}e
                    each, or <span className="font-semibold text-slate-100">{value.xanaxEquivalent.toFixed(2)} Xanax</span>{' '}
                    worth of energy — every single day, for as long as the routine continues.
                  </Callout>
                ) : (
                  <Callout tone="green" title="Your cadence matches your bar">
                    At this rate you never let the bar cap, so you collect 100% of your regeneration.
                  </Callout>
                )}
                <Callout tone="amber" title="The 5-hour rule">
                  A full bar takes 5 hours whether you are a donator or not (
                  {num(MAX_ENERGY_BASE)} ÷ {num(energyPerHour(false))}/hour, and {num(MAX_ENERGY_DONATOR)} ÷{' '}
                  {num(energyPerHour(true))}/hour), so you need a login roughly every 5 hours — about five a day.
                  Three logins a day means an 8-hour gap, which caps the bar and costs around 180 energy daily.
                  An eight-hour sleep is unavoidable for most people; the fix is to make the other logins tight
                  rather than to skip them.
                </Callout>
              </div>
            </div>
          </Panel>

          <Panel>
            <SectionHeader
              title="24-hour energy profile"
              subtitle="Each vertical drop is a login where you spent the bar. The flat tops are where it capped and stopped regenerating."
            />
            <div className="px-4 pb-3 pt-4">
              <Sparkline points={curve} height={110} tone={cadence.wasted > 0 ? '#f87171' : '#4ade80'} />
              <div className="mt-2 flex justify-between text-[10px] text-slate-500">
                <span>Now</span>
                <span>+6h</span>
                <span>+12h</span>
                <span>+18h</span>
                <span>+24h</span>
              </div>
            </div>
          </Panel>

          <div className="grid gap-4 lg:grid-cols-3">
            <Panel>
              <SectionHeader title="What the waste is worth" />
              <div className="grid grid-cols-2 gap-3 p-4">
                <Stat label="Gym trains" value={num(value.trains)} hint={`at ${trainCost}e per train`} tone="amber" />
                <Stat label="Xanax equivalent" value={value.xanaxEquivalent.toFixed(2)} hint="250e per dose" />
                <Stat label="Point refills" value={value.pointRefills.toFixed(2)} hint="one refill ≈ a full bar" />
                <Stat label="Energy per week" value={num(cadence.recoverable * 7)} tone="green" />
              </div>
            </Panel>

            <Panel>
              <SectionHeader title="Your daily energy budget" />
              <div className="p-4">
                <div className="text-xs leading-relaxed text-slate-400">
                  A routine at this cadence funds{' '}
                  <span className="mono text-amber-300">{num(Math.floor(cadence.collected / trainCost))}</span> gym trains
                  per day, plus whatever Xanax, drinks, refills and faction armory energy you add on top.
                </div>
                <div className="mt-3 space-y-2 text-xs">
                  {[
                    ['Natural regeneration', `${num(cadence.collected)}e`],
                    [`${xanaxPerDay >= 1 ? xanaxPerDay.toFixed(1) : '0'} Xanax (250e each)`, `${num(xanaxPerDay * 250)}e`],
                    ['Daily total', `${num(cadence.collected + xanaxPerDay * 250)}e`],
                  ].map(([label, val], index) => (
                    <div
                      key={label}
                      className={`flex justify-between border-b border-ink-700/50 pb-1 ${
                        index === 2 ? 'font-medium text-slate-200' : 'text-slate-400'
                      }`}
                    >
                      <span>{label}</span>
                      <span className="mono">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
              <SourceNote>
                Xanax figures assume one dose per day, which is roughly its 6-8 hour cooldown. Adjust for your own routine.
              </SourceNote>
            </Panel>

            <div className="space-y-4">
              <Callout tone="blue" title="Spend before you leave">
                Going to be away longer than 5 hours? Spend the bar first. Energy in stats is progress; energy in a
                capped bar is nothing.
              </Callout>
              <Callout tone="green" title="Line up Xanax with your biggest session">
                Do not dose and log off. Take the Xanax when you are ready to spend 250 energy and your happiness is at
                its highest.
              </Callout>
              <Link to="/tools/jumps" className="btn btn-primary w-full text-xs">
                Plan a jump session →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
