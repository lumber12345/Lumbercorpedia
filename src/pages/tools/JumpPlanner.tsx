import { useMemo, useState } from 'react';
import { Callout, Chip, Field, NumberInput, PageHeader, Panel, SectionHeader, SourceNote, Sparkline, Stat, Toggle } from '../../components/ui';
import { GYMS, gymById } from '../../data/gyms';
import { gainPerTrain, simulateSession, statTotal as sumStats } from '../../lib/gym';
import { money, num, statShort } from '../../lib/format';
import { useApp } from '../../lib/store';

interface HappyItem {
  id: string;
  name: string;
  happy: number;
  count: number;
  price: number;
}

/** The two jump routines community guides describe, with user-supplied numbers. */
const TEMPLATES: { id: string; name: string; note: string; items: Omit<HappyItem, 'id'>[]; ecstasy: boolean; refill: boolean }[] = [
  {
    id: 'candy',
    name: 'Candy jump',
    note: 'The budget happy jump: stack cheap candy for happiness, double it with Ecstasy, then burn everything in one sitting.',
    items: [
      { name: 'Candy / lollipops / bon bons', happy: 0, count: 48, price: 0 },
      { name: 'Xanax (energy)', happy: 0, count: 4, price: 0 },
    ],
    ecstasy: true,
    refill: false,
  },
  {
    id: 'happy',
    name: 'Full happy jump',
    note: 'The standard mid-game session: four Xanax to build a deep energy pool, high-happiness items, Ecstasy to double, then a points refill to squeeze out one more bar.',
    items: [
      { name: 'Happy items (DVDs etc.)', happy: 0, count: 5, price: 0 },
      { name: 'Xanax (energy)', happy: 0, count: 4, price: 0 },
    ],
    ecstasy: true,
    refill: true,
  },
];

export default function JumpPlanner() {
  const training = useApp((state) => state.training);
  const setTraining = useApp((state) => state.setTraining);
  const [items, setItems] = useState<HappyItem[]>(
    TEMPLATES[0].items.map((item, index) => ({ ...item, id: `item-${index}` })),
  );
  const [baseHappy, setBaseHappy] = useState(2_000);
  const [ecstasy, setEcstasy] = useState(true);
  const [refill, setRefill] = useState(false);
  const [energyPool, setEnergyPool] = useState(1_000);
  const [activeTemplate, setActiveTemplate] = useState('candy');

  const gym = gymById(training.gymId) ?? GYMS[0];
  const dots = gym.gains.strength ?? gym.gains.speed ?? 4;
  const total = sumStats(training.stats);
  const modifier = 1 + training.modifierPercent / 100;

  const itemHappy = items.reduce((sum, item) => sum + item.happy * item.count, 0);
  const stackedHappy = baseHappy + itemHappy;
  const jumpHappy = Math.min(99_999, ecstasy ? stackedHappy * 2 : stackedHappy);
  const itemCost = items.reduce((sum, item) => sum + item.price * item.count, 0);

  const baseline = useMemo(
    () =>
      simulateSession({
        gymDots: dots,
        energyPerTrain: gym.energy,
        happy: baseHappy,
        statTotal: total,
        energyPool,
        modifier,
      }),
    [dots, gym.energy, baseHappy, total, energyPool, modifier],
  );

  const jumped = useMemo(
    () =>
      simulateSession({
        gymDots: dots,
        energyPerTrain: gym.energy,
        happy: jumpHappy,
        statTotal: total,
        energyPool,
        modifier,
      }),
    [dots, gym.energy, jumpHappy, total, energyPool, modifier],
  );

  const extra = jumped.totalGain - baseline.totalGain;
  const costPerExtra = extra > 0 ? itemCost / extra : 0;

  // Gain-vs-happiness curve so the player can see the curve flattening.
  const curve = useMemo(() => {
    const points: number[] = [];
    for (let happy = 0; happy <= 40_000; happy += 500) {
      points.push(gainPerTrain({ gymDots: dots, energyPerTrain: gym.energy, happy, statTotal: total, modifier }));
    }
    return points;
  }, [dots, gym.energy, total, modifier]);

  const applyTemplate = (id: string) => {
    const template = TEMPLATES.find((entry) => entry.id === id);
    if (!template) return;
    setActiveTemplate(id);
    setItems(template.items.map((item, index) => ({ ...item, id: `item-${Date.now()}-${index}` })));
    setEcstasy(template.ecstasy);
    setRefill(template.refill);
    setEnergyPool(template.refill ? 1_150 : 1_000);
  };

  const updateItem = (id: string, patch: Partial<HappyItem>) =>
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));

  return (
    <div>
      <PageHeader
        eyebrow="New player tools"
        title="Jump planner"
        description="Happy jumps are how new players get a big stat session without years of training. Stack happiness above your maximum, double it with Ecstasy, then burn a deep energy pool in one sitting before the quarter-hour happy reset. Enter the numbers from your own items so the maths stays true to your market."
        right={<Chip tone="amber">{statShort(jumped.totalGain)} projected gain</Chip>}
      />

      <div className="mb-4 flex flex-wrap items-center gap-1.5">
        {TEMPLATES.map((template) => (
          <button
            key={template.id}
            onClick={() => applyTemplate(template.id)}
            className={`chip ${
              template.id === activeTemplate
                ? 'border-amber-500/60 bg-amber-500/10 text-amber-300'
                : 'border-ink-600 bg-ink-800 text-slate-300 hover:border-ink-500'
            }`}
          >
            {template.name}
          </button>
        ))}
        <span className="text-[11px] text-slate-500">
          {TEMPLATES.find((entry) => entry.id === activeTemplate)?.note}
        </span>
      </div>

      <div className="grid gap-5 lg:grid-cols-[400px_1fr]">
        <div className="space-y-5">
          <Panel>
            <SectionHeader title="Your session" />
            <div className="space-y-4 p-4">
              <Field label="Base happiness" hint="Your property's happy, before any items.">
                <NumberInput value={baseHappy} onChange={setBaseHappy} max={99_999} />
              </Field>
              <Field label="Energy for the session" hint="Four Xanax is about 1,000e; add a points refill for one more bar.">
                <NumberInput value={energyPool} onChange={setEnergyPool} />
              </Field>
              <Toggle
                checked={ecstasy}
                onChange={setEcstasy}
                label="Ecstasy (doubles happiness)"
                hint="This is what turns a good session into a jump."
              />
              <Toggle
                checked={refill}
                onChange={setRefill}
                label="Points refill at the end"
                hint="Adds roughly one full energy bar to the session."
              />
              <Field label="Gym">
                <select
                  className="input"
                  value={training.gymId}
                  onChange={(event) => setTraining({ gymId: event.target.value })}
                >
                  {GYMS.map((entry) => (
                    <option key={entry.id} value={entry.id}>
                      {entry.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Extra gains modifier %" hint="Education, faction upgrades, books.">
                <NumberInput
                  value={training.modifierPercent}
                  onChange={(value) => setTraining({ modifierPercent: value })}
                  suffix="%"
                />
              </Field>
            </div>
          </Panel>

          <Panel>
            <SectionHeader
              title="Happy items"
              subtitle="Enter the happiness and price you see in-game — Lumbercorpedia will not guess today's market."
              right={
                <button
                  className="btn btn-ghost text-xs"
                  onClick={() =>
                    setItems((current) => [...current, { id: `item-${Date.now()}`, name: 'New item', happy: 0, count: 1, price: 0 }])
                  }
                >
                  + Add
                </button>
              }
            />
            <div className="space-y-3 p-4">
              {items.map((item) => (
                <div key={item.id} className="rounded-lg border border-ink-700/70 bg-ink-900/40 p-3">
                  <div className="flex items-center gap-2">
                    <input
                      className="input flex-1 py-1.5 text-xs"
                      value={item.name}
                      onChange={(event) => updateItem(item.id, { name: event.target.value })}
                    />
                    <button
                      className="text-xs text-slate-500 hover:text-red-300"
                      onClick={() => setItems((current) => current.filter((entry) => entry.id !== item.id))}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    <label className="block">
                      <span className="mb-1 block text-[10px] uppercase tracking-wider text-slate-500">Happy each</span>
                      <NumberInput value={item.happy} onChange={(value) => updateItem(item.id, { happy: value })} />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-[10px] uppercase tracking-wider text-slate-500">Count</span>
                      <NumberInput value={item.count} onChange={(value) => updateItem(item.id, { count: value })} />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-[10px] uppercase tracking-wider text-slate-500">Price each</span>
                      <NumberInput value={item.price} onChange={(value) => updateItem(item.id, { price: value })} />
                    </label>
                  </div>
                  <div className="mt-1.5 text-[10px] text-slate-500">
                    {num(item.happy * item.count)} happy · {money(item.price * item.count)} total
                  </div>
                </div>
              ))}
              {items.length === 0 ? (
                <p className="text-xs text-slate-500">No items added — the session will run at your base happiness.</p>
              ) : null}
            </div>
          </Panel>
        </div>

        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat label="Happy in the session" value={num(jumpHappy)} hint={`base ${num(baseHappy)} + items, ${ecstasy ? 'doubled' : 'not doubled'}`} tone={ecstasy ? 'green' : 'neutral'} />
            <Stat label="Jump gain" value={statShort(jumped.totalGain)} hint={`${jumped.trains} trains`} tone="amber" />
            <Stat label="Extra from the jump" value={statShort(extra)} hint={`vs training at ${num(baseHappy)} happy`} tone="green" />
            <Stat label="Item cost" value={money(itemCost)} hint={extra > 0 ? `${money(costPerExtra)} per extra stat point` : '—'} />
          </div>

          <Panel>
            <SectionHeader
              title="With the jump vs without"
              subtitle="Both columns train the same energy pool; the only difference is the happiness you are standing on."
            />
            <div className="grid gap-4 p-4 sm:grid-cols-2">
              {[
                { label: `Training at ${num(baseHappy)} happy`, value: baseline, tone: 'neutral' as const },
                { label: `The jump at ${num(jumpHappy)} happy`, value: jumped, tone: 'green' as const },
              ].map((column) => (
                <div key={column.label} className="rounded-lg border border-ink-700/70 bg-ink-900/40 p-3">
                  <div className="text-xs font-medium text-slate-200">{column.label}</div>
                  <div className="mono mt-2 text-xl font-semibold text-amber-300">{statShort(column.value.totalGain)}</div>
                  <dl className="mt-2 space-y-1 text-[11px]">
                    {[
                      ['Trains', num(column.value.trains)],
                      ['Energy used', num(column.value.energyUsed)],
                      ['Happiness burned', num(column.value.happyUsed)],
                      ['Gain per train', statShort(column.value.averageGain)],
                      ['Stat total after', statShort(column.value.finalStat)],
                    ].map(([label, value]) => (
                      <div key={label} className="flex justify-between gap-2">
                        <dt className="text-slate-500">{label}</dt>
                        <dd className="mono text-slate-200">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </div>
            {jumped.stoppedBy === 'happiness' ? (
              <div className="px-4 pb-4">
                <Callout tone="amber" title="Happiness ran out mid-session">
                  You spent more energy than your happiness could support, so the tail of the pool gained almost nothing.
                  Either add happy items, or split the energy across two sessions.
                </Callout>
              </div>
            ) : null}
          </Panel>

          <Panel>
            <SectionHeader
              title="Where happiness stops paying"
              subtitle="Gains rise with happiness but flatten out — the curve is logarithmic, so the last happy items are worth far less than the first."
            />
            <div className="px-4 pb-3 pt-4">
              <Sparkline points={curve} height={90} />
              <div className="mt-2 flex justify-between text-[10px] text-slate-500">
                <span>0 happy</span>
                <span>20,000</span>
                <span>40,000</span>
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
                Every 500 happiness is one point on this curve. Notice how flat it gets — which is exactly why the
                standard jump stacks Xanax energy first and happiness second.
              </p>
            </div>
          </Panel>

          <div className="grid gap-4 lg:grid-cols-3">
            <Callout tone="amber" title="Order of operations">
              Fill energy with Xanax over a few hours first, then apply happiness, then train it all in one go. Doing it
              the other way around lets your happiness reset before you have the energy to use it.
            </Callout>
            <Callout tone="red" title="Watch the cooldowns and the OD risk">
              Each Xanax dose carries a 6-8 hour cooldown and an overdose chance. Four doses is a full day of planning,
              not an impulse buy — see the booster planner for the numbers.
            </Callout>
            <Callout tone="green" title="Do the cheap version first">
              A candy jump costs a fraction of a full jump and still teaches you the routine: pool energy, stack
              happiness, double it, spend it all. Practise on candy before you spend millions on DVDs.
            </Callout>
          </div>

          <Panel>
            <SectionHeader title="Why this works" />
            <SourceNote>
              Gym gains scale with happiness through <span className="mono">ln(happy + 250)</span> plus a flat
              <span className="mono"> d·(happy + 250)</span> term, so raising happiness raises every single train in the
              session. Happiness above your maximum resets to your maximum every quarter hour (15/30/45/00) unless you
              are using the Ignorance is Bliss book — which is why a jump has to be spent in one sitting. Item happiness
              and prices are entered by you rather than guessed, and Ecstasy doubling happiness is stated on the torn
              wiki.
            </SourceNote>
          </Panel>
        </div>
      </div>
    </div>
  );
}
