import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Bar, Callout, Chip, PageHeader, Panel, SectionHeader, SourceNote, Stat } from '../components/ui';
import { CRIMES, CRIME_MECHANICS, type Crime } from '../data/crimes';
import { num } from '../lib/format';
import { useDebounced, useQueryState } from '../lib/hooks';

function CrimeCard({ crime, maxNerve }: { crime: Crime; maxNerve: number }) {
  return (
    <Panel className="flex flex-col">
      <div className="flex items-start justify-between gap-3 px-4 pt-4">
        <div>
          <h3 className="text-base font-semibold text-slate-100">{crime.name}</h3>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <Chip tone="neutral">{crime.category ?? 'category unlisted'}</Chip>
            {crime.education?.map((code) => (
              <Chip key={code} tone="blue">
                {code}
              </Chip>
            ))}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-wider text-slate-500">Nerve to max</div>
          <div className="mono text-sm text-amber-300">{crime.nerveToMax ? num(crime.nerveToMax) : '—'}</div>
        </div>
      </div>

      {crime.nerveToMax ? (
        <div className="px-4 pt-3">
          <Bar value={crime.nerveToMax} max={maxNerve} tone={crime.nerveToMax > 12_000 ? 'red' : 'amber'} />
          <div className="mt-1 text-[10px] text-slate-500">
            ≈ {Math.ceil(crime.nerveToMax / 67)} days of natural nerve regeneration
          </div>
        </div>
      ) : null}

      <dl className="mt-3 space-y-1.5 px-4 text-xs">
        <div className="flex justify-between gap-3">
          <dt className="text-slate-500">Enhancer</dt>
          <dd className="text-slate-200">{crime.enhancer ?? '—'}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="shrink-0 text-slate-500">Tools</dt>
          <dd className="text-right text-slate-200">{crime.tools.length ? crime.tools.join(', ') : 'none'}</dd>
        </div>
      </dl>

      {crime.merits.length > 0 ? (
        <div className="mt-3 px-4">
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Merits</div>
          {crime.merits.map((merit) => (
            <div key={merit} className="text-xs text-violet-300/90">
              ★ {merit}
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-3 space-y-1.5 px-4 pb-4">
        {crime.tips.map((tip) => (
          <p key={tip} className="text-[11px] leading-relaxed text-slate-400">
            • {tip}
          </p>
        ))}
      </div>
    </Panel>
  );
}

export default function CrimesPage() {
  const [query, setQuery] = useQueryState('q');
  const debounced = useDebounced(query, 150);

  const filtered = useMemo(() => {
    const needle = debounced.trim().toLowerCase();
    if (!needle) return CRIMES;
    return CRIMES.filter(
      (crime) =>
        crime.name.toLowerCase().includes(needle) ||
        (crime.category ?? '').toLowerCase().includes(needle) ||
        (crime.enhancer ?? '').toLowerCase().includes(needle) ||
        crime.tools.join(' ').toLowerCase().includes(needle) ||
        crime.tips.join(' ').toLowerCase().includes(needle),
    );
  }, [debounced]);

  const maxNerve = Math.max(...CRIMES.map((crime) => crime.nerveToMax ?? 0));
  const known = CRIMES.filter((crime) => crime.nerveToMax !== null);
  const cheapest = [...known].sort((a, b) => (a.nerveToMax ?? 0) - (b.nerveToMax ?? 0))[0];
  const priciest = [...known].sort((a, b) => (b.nerveToMax ?? 0) - (a.nerveToMax ?? 0))[0];

  return (
    <div>
      <PageHeader
        eyebrow="Database"
        title="Crimes 2.0"
        description="Twelve crime types, each with its own skill bar, enhancer item, tool requirements and merits. The nerve figures are community records of what it took to reach 100 skill — use them to compare crime types, not to predict your own run."
        right={<Chip tone="amber">{filtered.length} of {CRIMES.length}</Chip>}
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Cheapest recorded" value={cheapest.name} hint={`≈ ${num(cheapest.nerveToMax ?? 0)} nerve`} tone="green" />
        <Stat label="Most expensive recorded" value={priciest.name} hint={`≈ ${num(priciest.nerveToMax ?? 0)} nerve`} tone="red" />
        <Stat label="Crime types" value={CRIMES.length} hint={`${known.length} with public nerve records`} />
        <Stat label="Nerve regen" value="1 / 5 min" hint="≈ 288 nerve per day before drugs or merits" />
      </div>

      <Panel className="mb-4">
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <input
            className="input"
            placeholder="Search crimes, tool names, merits or tips…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <span className="shrink-0 text-[11px] text-slate-500">
            Planning order? Cheap-to-level crimes first, then the ones that feed your build.
          </span>
        </div>
      </Panel>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((crime) => (
          <CrimeCard key={crime.id} crime={crime} maxNerve={maxNerve} />
        ))}
      </div>

      <Panel className="mt-5">
        <SectionHeader
          title="How Crimes 2.0 actually works"
          subtitle="The old nerve roulette is gone. Crimes now level like skills, and the failure states are designed to be managed."
        />
        <div className="grid gap-4 p-4 lg:grid-cols-2">
          {CRIME_MECHANICS.map((mechanic) => (
            <div key={mechanic.title} className="rounded-lg border border-ink-700/70 bg-ink-900/40 p-3">
              <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-amber-300">{mechanic.title}</h3>
              <p className="text-xs leading-relaxed text-slate-300">{mechanic.body}</p>
            </div>
          ))}
        </div>
        <SourceNote>
          Categories, enhancers and tool lists come from Torn's crime reference data and the community's Crimes 2.0
          guides. Nerve-to-max values are observations recorded by players who maxed each crime — they are relative
          indicators, not official requirements, and they move as Torn rebalances.
        </SourceNote>
      </Panel>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <Callout tone="amber" title="Level cheap, bank expensive">
          Card Skimming is the cheapest skill per nerve in the game but resolves on a long timer; Burglary is the most
          expensive and fails the most. Mixing a fast cheap crime with a slow valuable one keeps both your skill and
          your bank moving.
        </Callout>
        <Callout tone="blue" title="Education gates crimes">
          Computer Science unlocks Cracking and the hacking family, and Web Design unlocks the Bootlegging store.
          Running crimes without their education course is leaving success rate on the table.
        </Callout>
        <Callout tone="green" title="Merits are worth planning">
          Each crime type has a merit tied to a specific outcome. Reading the merit before you grind lets you bank it in
          the same run instead of repeating a hundred attempts later.
        </Callout>
      </div>

      <Panel className="mt-5">
        <SectionHeader
          title="Related tools"
          subtitle="Nerve and crime work is downstream of your energy budget — the boosters page covers that."
          right={
            <Link to="/tools/boosters" className="btn text-xs">
              Booster planner
            </Link>
          }
        />
      </Panel>
    </div>
  );
}
