import { useMemo, useState } from 'react';
import { Bar, Callout, Chip, PageHeader, Panel, SectionHeader, SourceNote, Stat } from '../components/ui';
import { DRUGS, type Drug } from '../data/drugs';
import { useDebounced, useQueryState } from '../lib/hooks';
import { duration, num } from '../lib/format';

const TAG_TONE = {
  energy: 'amber',
  nerve: 'violet',
  happy: 'green',
  happy_mult: 'green',
  stat_up: 'blue',
  stat_down: 'red',
  hospital_clear: 'neutral',
  other: 'neutral',
} as const;

function DrugCard({ drug, onSelect }: { drug: Drug; onSelect: (drug: Drug) => void }) {
  const maxAddiction = Math.max(...DRUGS.map((d) => d.addiction), 1);
  return (
    <button
      onClick={() => onSelect(drug)}
      className="panel panel-hover flex flex-col gap-3 p-4 text-left"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-100">{drug.name}</h3>
            {drug.id ? (
              <Chip tone="neutral" title="Torn item id">
                ID {drug.id}
              </Chip>
            ) : null}
          </div>
          <div className="mt-0.5 text-[11px] text-slate-500">
            Cooldown {duration(drug.cooldown[0])} – {duration(drug.cooldown[1])}
          </div>
        </div>
        <Chip tone={drug.tier === 'core' ? 'amber' : drug.tier === 'utility' ? 'green' : 'neutral'}>
          {drug.tier}
        </Chip>
      </div>

      <ul className="space-y-1">
        {drug.effects.map((effect) => (
          <li key={effect.text} className="flex items-start gap-2 text-xs text-slate-300">
            <span className="mt-0.5">
              <Chip tone={TAG_TONE[effect.tag]}>{effect.tag.replace('_', ' ')}</Chip>
            </span>
            <span>{effect.text}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto">
        <div className="mb-1 flex items-center justify-between text-[11px] text-slate-500">
          <span>Addiction per dose</span>
          <span className="mono text-slate-300">{drug.addiction} pts</span>
        </div>
        <Bar value={drug.addiction} max={maxAddiction} tone={drug.addiction > 20 ? 'red' : 'amber'} />
      </div>
    </button>
  );
}

export default function DrugsPage() {
  const [query, setQuery] = useQueryState('q');
  const [selected, setSelected] = useState<Drug | null>(null);
  const debounced = useDebounced(query, 150);

  const filtered = useMemo(() => {
    const needle = debounced.trim().toLowerCase();
    if (!needle) return DRUGS;
    return DRUGS.filter(
      (drug) =>
        drug.name.toLowerCase().includes(needle) ||
        drug.usage.toLowerCase().includes(needle) ||
        drug.effects.some((effect) => effect.text.toLowerCase().includes(needle)),
    );
  }, [debounced]);

  const strongest = useMemo(() => [...DRUGS].sort((a, b) => b.addiction - a.addiction)[0], []);
  const safest = useMemo(() => [...DRUGS].sort((a, b) => a.addiction - b.addiction)[0], []);

  return (
    <div>
      <PageHeader
        eyebrow="Database"
        title="Drugs &amp; boosters"
        description="Every drug in Torn, with the exact effect text, cooldown window, addiction cost and overdose consequence. Addictive drugs are a resource — this page exists so you can spend them deliberately."
        right={<Chip tone="amber">{DRUGS.length} substances</Chip>}
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Highest addiction" value={strongest.name} hint={`${strongest.addiction} points per dose`} tone="red" />
        <Stat label="Lowest addiction" value={`${safest.name}*`} hint={`${safest.addiction} points per dose`} tone="green" />
        <Stat label="Energy standard" value="Xanax" hint="+250e, cheap and always in demand" tone="amber" />
        <Stat label="Happiness standard" value="Ecstasy" hint="Doubles your entire happy bar" tone="green" />
      </div>

      <Panel className="mb-4">
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <input
            className="input"
            placeholder="Search drugs by name, effect or use case…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <span className="shrink-0 text-[11px] text-slate-500">{filtered.length} shown</span>
        </div>
      </Panel>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((drug) => (
          <DrugCard key={drug.name} drug={drug} onSelect={setSelected} />
        ))}
      </div>

      {selected ? (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={() => setSelected(null)}>
          <div
            className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-t-2xl border border-ink-600 bg-ink-850 shadow-2xl sm:rounded-2xl animate-slide-up"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-ink-700 px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold text-white">{selected.name}</h2>
                <p className="mt-0.5 text-xs text-slate-400">
                  {selected.id ? `Item ID ${selected.id} · ` : ''}Cooldown {duration(selected.cooldown[0])} –{' '}
                  {duration(selected.cooldown[1])} · {selected.addiction} addiction points
                </p>
              </div>
              <button className="btn btn-ghost" onClick={() => setSelected(null)}>
                Close
              </button>
            </div>

            <div className="grid gap-5 p-5 sm:grid-cols-2">
              <div>
                <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Effects</h3>
                <ul className="space-y-1.5">
                  {selected.effects.map((effect) => (
                    <li key={effect.text} className="flex gap-2 text-xs text-slate-200">
                      <Chip tone={TAG_TONE[effect.tag]}>{effect.tag.replace('_', ' ')}</Chip>
                      <span>{effect.text}</span>
                    </li>
                  ))}
                </ul>
                <h3 className="mb-2 mt-4 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Overdose
                </h3>
                <ul className="space-y-1 text-xs text-red-300/90">
                  {selected.overdose.map((line) => (
                    <li key={line}>• {line}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  How to use it
                </h3>
                <p className="text-xs leading-relaxed text-slate-300">{selected.usage}</p>
                <h3 className="mb-2 mt-4 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Numbers
                </h3>
                <dl className="space-y-1 text-xs">
                  {[
                    ['Cooldown floor', duration(selected.cooldown[0])],
                    ['Cooldown ceiling', duration(selected.cooldown[1])],
                    ['Addiction per dose', `${selected.addiction} pts`],
                    ['Doses per 1,000 addiction', selected.addiction ? num(Math.floor(1000 / selected.addiction)) : '—'],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between gap-3 border-b border-ink-700/50 pb-1">
                      <dt className="text-slate-500">{label}</dt>
                      <dd className="mono text-slate-200">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <Panel className="mt-5">
        <SectionHeader
          title="Addiction, the part people get wrong"
          subtitle="Addiction and the battle-stat debuff are not the same thing — but the debuff is the easiest way to read your addiction level without going to rehab."
        />
        <div className="grid gap-4 p-4 lg:grid-cols-2">
          <ul className="space-y-2 text-xs leading-relaxed text-slate-300">
            <li>• Every drug carries some addiction, even if the brain icon has not appeared yet.</li>
            <li>• Your effectiveness in a company drops from your first drug — directors are exempt, employees are not.</li>
            <li>• You get kicked from education courses once addiction crosses a threshold (roughly a 6-7% battle-stat debuff).</li>
            <li>• The Sports Science Lab locks you out once your total Xanax + Ecstasy use passes 150.</li>
            <li>• High addiction can force you to keep a drug active just to be allowed to train.</li>
            <li>• Addiction does <span className="font-semibold text-slate-100">not</span> affect organised crime success.</li>
          </ul>
          <div className="space-y-3">
            <Callout tone="green" title="Mitigations">
              The faction special “Side Effects” and the “Addiction Mitigation” merit reduce addiction effects. Rehab in
              Switzerland clears the long-term effects entirely.
            </Callout>
            <Callout tone="amber" title="Timing beats quantity">
              Because happiness above your maximum resets to your maximum every quarter hour, drug happiness only pays
              off if you can spend it before the clock resets. Plan the stack, then burn the bar.
            </Callout>
          </div>
        </div>
        <SourceNote>
          Effects, cooldown windows, addiction values and overdose outcomes are transcribed from the torn wiki drug
          table. Cooldowns are ranges because Torn rolls them per dose. Ketamine's “*” low-addiction note is because it
          is cheap to obtain from a 5* Farm or Zoo via job points.
        </SourceNote>
      </Panel>
    </div>
  );
}
