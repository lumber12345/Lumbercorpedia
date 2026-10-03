import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Callout, Chip, PageHeader, Panel, SectionHeader, SourceNote, Stat } from '../components/ui';
import { DataTable, type Column } from '../components/DataTable';
import { DEGREES, degreeTotals, type Course, type DegreeCode } from '../data/education';
import { money, num } from '../lib/format';
import { useQueryState } from '../lib/hooks';

export default function EducationPage() {
  const [degreeParam, setDegreeParam] = useQueryState('degree');
  const [query, setQuery] = useQueryState('q');

  const activeCode = (degreeParam || 'BIO') as DegreeCode;
  const active = DEGREES.find((degree) => degree.code === activeCode) ?? DEGREES[0];

  const totals = active.courses.length > 0 ? degreeTotals(active) : null;

  const courseRows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return active.courses;
    return active.courses.filter(
      (course) =>
        course.name.toLowerCase().includes(needle) ||
        course.code.toLowerCase().includes(needle) ||
        (course.unlock ?? '').toLowerCase().includes(needle) ||
        course.prereqs.join(' ').toLowerCase().includes(needle),
    );
  }, [active, query]);

  const grandTotal = useMemo(
    () =>
      DEGREES.filter((degree) => degree.courses.length > 0).reduce(
        (acc, degree) => {
          const t = degreeTotals(degree);
          return { weeks: acc.weeks + t.weeks, cost: acc.cost + t.cost };
        },
        { weeks: 0, cost: 0 },
      ),
    [],
  );

  const columns: Column<Course>[] = [
    {
      key: 'code',
      header: 'Code',
      sortValue: (course) => course.code,
      render: (course) => <span className="mono text-[11px] text-amber-300">{course.code}</span>,
    },
    {
      key: 'name',
      header: 'Course',
      sortValue: (course) => course.name,
      render: (course) => (
        <div>
          <div className="font-medium text-slate-100">{course.name}</div>
          {course.unlock ? <div className="text-[11px] text-emerald-300/80">{course.unlock}</div> : null}
        </div>
      ),
    },
    {
      key: 'prereqs',
      header: 'Prerequisites',
      render: (course) =>
        course.prereqs.length === 0 ? (
          <span className="text-slate-600">none</span>
        ) : (
          <span className="mono text-[11px] text-slate-400">{course.prereqs.join(', ')}</span>
        ),
    },
    { key: 'cost', header: 'Cost', align: 'right', sortValue: (course) => course.cost, render: (course) => <span className="mono">{money(course.cost)}</span> },
    { key: 'weeks', header: 'Weeks', align: 'right', sortValue: (course) => course.weeks, render: (course) => <span className="mono">{course.weeks}</span> },
    { key: 'manual', header: 'MAN', align: 'right', sortValue: (course) => course.manual, render: (course) => <span className="mono">{num(course.manual)}</span> },
    { key: 'intel', header: 'INT', align: 'right', sortValue: (course) => course.intelligence, render: (course) => <span className="mono">{num(course.intelligence)}</span> },
    { key: 'end', header: 'END', align: 'right', sortValue: (course) => course.endurance, render: (course) => <span className="mono">{num(course.endurance)}</span> },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Database"
        title="Education"
        description="Twelve bachelor paths, dozens of courses, and prerequisites that decide the order you can take them in. Two degrees are modelled course-by-course here; the rest carry their verified payoffs while their course tables are still being transcribed."
        right={
          <Link to="/tools/education" className="btn btn-primary text-sm">
            Build a study plan
          </Link>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Degrees" value={DEGREES.length} hint={`${DEGREES.filter((d) => d.verified).length} fully modelled`} />
        <Stat label="Courses modelled" value={grandTotal.weeks === 0 ? 0 : DEGREES.flatMap((d) => d.courses).length} hint="with exact costs and durations" />
        <Stat label="Weeks in those tables" value={num(grandTotal.weeks)} hint="before any time reductions" tone="amber" />
        <Stat label="Combined cost" value={money(grandTotal.cost)} hint="for the modelled degrees" />
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {DEGREES.map((degree) => (
          <button
            key={degree.code}
            onClick={() => setDegreeParam(degree.code)}
            className={`chip ${
              degree.code === active.code
                ? 'border-amber-500/60 bg-amber-500/10 text-amber-300'
                : 'border-ink-600 bg-ink-800 text-slate-300 hover:border-ink-500'
            }`}
          >
            {degree.name}
            {!degree.verified ? <span className="ml-1 text-[10px] text-slate-500">partial</span> : null}
          </button>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Panel>
            <SectionHeader
              title={`${active.name}${active.bachelor ? ` · ${active.bachelor}` : ''}`}
              subtitle={
                active.verified
                  ? 'Every course, prerequisite, cost and working-stat reward, transcribed from the torn wiki.'
                  : 'Perks and unlocks are verified; the individual course table for this degree is not yet transcribed.'
              }
              right={
                active.verified ? (
                  <input
                    className="input max-w-[220px]"
                    placeholder="Filter courses…"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                ) : (
                  <Chip tone="amber">partial data</Chip>
                )
              }
            />

            {active.verified ? (
              <>
                <DataTable
                  rows={courseRows}
                  columns={columns}
                  rowKey={(course) => course.code}
                  initialSort="weeks"
                  initialDirection="desc"
                  dense
                  maxHeight={620}
                />
                {totals ? (
                  <div className="grid grid-cols-2 gap-3 border-t border-ink-700/60 p-4 sm:grid-cols-5">
                    <Stat label="Total weeks" value={num(totals.weeks)} tone="amber" />
                    <Stat label="Total cost" value={money(totals.cost)} />
                    <Stat label="Manual labour" value={num(totals.manual)} />
                    <Stat label="Intelligence" value={num(totals.intelligence)} tone="blue" />
                    <Stat label="Endurance" value={num(totals.endurance)} />
                  </div>
                ) : null}
              </>
            ) : (
              <div className="space-y-4 p-4">
                <div>
                  <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    What it unlocks
                  </h3>
                  <ul className="space-y-1.5 text-xs text-slate-200">
                    {active.payoff.map((line) => (
                      <li key={line}>• {line}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Course perks
                  </h3>
                  <ul className="space-y-1.5 text-xs text-emerald-300/90">
                    {active.perks.map((line) => (
                      <li key={line}>• {line}</li>
                    ))}
                  </ul>
                </div>
                {active.courseCount ? (
                  <div className="text-[11px] text-slate-500">
                    Community records put this degree at {active.courseCount} courses. Lumbercorpedia lists it without
                    per-course numbers rather than guessing them — the honest option while the table is unverified.
                  </div>
                ) : null}
              </div>
            )}
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel>
            <SectionHeader title="Payoff at a glance" />
            <ul className="space-y-2 p-4 text-xs text-slate-300">
              {active.payoff.map((line) => (
                <li key={line} className="flex gap-2">
                  <span className="text-amber-400">→</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
            {active.notes ? <SourceNote>{active.notes}</SourceNote> : null}
          </Panel>

          <Panel>
            <SectionHeader title="Shortening education time" subtitle="Reductions are additive since patch #334 (April 2024)." />
            <div className="space-y-3 p-4 text-xs text-slate-300">
              <div className="flex items-center justify-between">
                <span>Education merits (2% each, max 10)</span>
                <span className="mono text-amber-300">-20%</span>
              </div>
              <div className="flex items-center justify-between">
                <span>WSU stock block (1,000,000 shares)</span>
                <span className="mono text-amber-300">-10%</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Education principal job perk</span>
                <span className="mono text-amber-300">-10%</span>
              </div>
              <div className="flex items-center justify-between border-t border-ink-700/60 pt-2">
                <span className="font-medium text-slate-200">Maximum combined</span>
                <span className="mono font-semibold text-emerald-300">-40%</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-500">
                On top of the percentages, Fitness Center and Hair Salon job points each shave 30 minutes off a course in
                progress, and a Book of Carols removes 6 hours.
              </p>
            </div>
          </Panel>

          <Callout tone="green" title="Take Gen Studies first">
            Bachelor of General Studies grants +10% working stats to every education you complete afterwards. Doing it
            late wastes a big multiplier.
          </Callout>
        </div>
      </div>

      <Panel className="mt-5">
        <SectionHeader
          title="All degree payoffs"
          subtitle="Compare what each path actually gives you before committing weeks of your life."
        />
        <div className="grid gap-0 divide-y divide-ink-700/60 sm:grid-cols-2 sm:divide-y-0">
          {DEGREES.map((degree) => (
            <button
              key={degree.code}
              onClick={() => setDegreeParam(degree.code)}
              className="flex flex-col gap-1 px-4 py-3 text-left transition-colors hover:bg-ink-800/60"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-slate-100">{degree.name}</span>
                <div className="flex shrink-0 items-center gap-1">
                  {degree.bachelor ? <Chip tone="neutral">{degree.bachelor}</Chip> : null}
                  {degree.verified ? <Chip tone="green">full</Chip> : <Chip tone="amber">partial</Chip>}
                </div>
              </div>
              <span className="text-[11px] leading-relaxed text-slate-500">{degree.payoff[0]}</span>
            </button>
          ))}
        </div>
        <SourceNote>
          Course tables for Biology and Computer Science (codes, prerequisites, costs, working stats, weeks and unlocks)
          are transcribed from the torn wiki. Perks for the remaining degrees come from the wiki's Education:Perks page.
          Nothing in this dataset is invented — degrees marked “partial” simply have no verified per-course table yet.
        </SourceNote>
      </Panel>
    </div>
  );
}
