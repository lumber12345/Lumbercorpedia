import { Link } from 'react-router-dom';
import { Callout, Chip, PageHeader, Panel, SectionHeader, SourceNote, Stat } from '../components/ui';
import { COMPANY_MECHANICS, COMPANY_SPECIALS } from '../data/companies';
import { useDebounced, useQueryState } from '../lib/hooks';
import { useMemo } from 'react';

export default function CompaniesPage() {
  const [query, setQuery] = useQueryState('q');
  const debounced = useDebounced(query, 150);

  const filtered = useMemo(() => {
    const needle = debounced.trim().toLowerCase();
    if (!needle) return COMPANY_SPECIALS;
    return COMPANY_SPECIALS.filter(
      (special) =>
        special.name.toLowerCase().includes(needle) ||
        special.special.toLowerCase().includes(needle) ||
        special.effect.toLowerCase().includes(needle),
    );
  }, [debounced]);

  return (
    <div>
      <PageHeader
        eyebrow="Database"
        title="Companies"
        description="Company data changes with every balance patch, so Lumbercorpedia only publishes what is verifiable — the specials Torn's own wiki documents — and gives you a profitability model that runs on your numbers instead of on guesses."
        right={<Chip tone="amber">{COMPANY_SPECIALS.length} verified specials</Chip>}
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Verified specials" value={COMPANY_SPECIALS.length} hint="from the torn wiki" />
        <Stat label="Ketamine producers" value="5* Farm / Zoo" hint="5 job points per dose" tone="green" />
        <Stat label="Education shortcut" value="Hair Salon 7*" hint="30 minutes off per job point" tone="amber" />
        <Stat label="Best addiction cover" value="Nightclub 10*" hint="Keeps you enrolled in education" />
      </div>

      <Panel className="mb-4">
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <input
            className="input"
            placeholder="Search companies or specials…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <span className="shrink-0 text-[11px] text-slate-500">{filtered.length} shown</span>
        </div>
      </Panel>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((special) => (
          <Panel key={special.name} className="flex flex-col p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-slate-100">{special.name}</h3>
                <div className="mt-0.5 text-[11px] text-slate-500">{special.category}</div>
              </div>
              {special.stars ? <Chip tone="amber">{special.stars}★</Chip> : null}
            </div>
            <div className="mt-3 rounded-lg border border-ink-700/70 bg-ink-900/40 p-3">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-amber-300">{special.special}</div>
              <p className="mt-1 text-xs leading-relaxed text-slate-300">{special.effect}</p>
            </div>
            {special.verified ? (
              <div className="mt-3 text-[10px] uppercase tracking-wider text-emerald-400/80">verified from wiki</div>
            ) : null}
          </Panel>
        ))}
      </div>

      <Panel className="mt-5">
        <SectionHeader
          title="Mechanics that decide your profit"
          subtitle="These are the rules the calculator is built on — all of them come from Torn's own documentation or long-standing community observation."
        />
        <div className="grid gap-4 p-4 lg:grid-cols-2">
          {COMPANY_MECHANICS.map((mechanic) => (
            <div key={mechanic.title} className="rounded-lg border border-ink-700/70 bg-ink-900/40 p-3">
              <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-amber-300">{mechanic.title}</h3>
              <p className="text-xs leading-relaxed text-slate-300">{mechanic.body}</p>
            </div>
          ))}
        </div>
        <SourceNote>
          Star ratings shown are the ones published on the torn wiki for each company type at the time of writing. Star
          requirements and per-star bonuses change frequently; Lumbercorpedia deliberately omits anything it cannot
          point at a source for, and the profit calculator works from your revenue and wage figures so it stays accurate
          through balance patches.
        </SourceNote>
      </Panel>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <Callout tone="amber" title="Run the numbers first">
          The profit calculator takes your revenue, wages, advertising, upkeep, stock and director cut and returns net
          profit, margin and the highest wage you can pay before you break even.
        </Callout>
        <Callout tone="blue" title="Effectiveness &gt; headcount">
          Working stats decide effectiveness, and effectiveness decides output. Matching staff intelligence to the role
          beats filling every slot.
        </Callout>
        <Callout tone="green" title="Addiction is a payroll tax">
          Employee effectiveness drops from the first drug taken. If your staff are heavy users, expect to see it in the
          daily numbers.
        </Callout>
      </div>

      <Panel className="mt-5">
        <SectionHeader
          title="Model a company"
          right={
            <Link to="/tools/company" className="btn btn-primary text-xs">
              Open profit calculator
            </Link>
          }
        />
      </Panel>
    </div>
  );
}
