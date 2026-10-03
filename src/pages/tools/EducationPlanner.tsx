import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Callout, Chip, Field, NumberInput, PageHeader, Panel, SectionHeader, SourceNote, Stat, Toggle } from '../../components/ui';
import { DEGREES, courseOrder, degreeTotals, reducedWeeks, type Course } from '../../data/education';
import { num } from '../../lib/format';
import { useApp } from '../../lib/store';

const VERIFIED = DEGREES.filter((degree) => degree.verified);

export default function EducationPlanner() {
  const planner = useApp((state) => state.planner);
  const setPlanner = useApp((state) => state.setPlanner);
  const [selected, setSelected] = useState<string[]>(['CMT', 'BIO']);

  const updatePlanner = (patch: Partial<typeof planner>) => setPlanner(patch);
  const hoursPerDay = planner.studyHoursPerDay;

  const plan = useMemo(() => {
    const degrees = VERIFIED.filter((degree) => selected.includes(degree.code));
    // Merge every selected degree into one dependency-ordered queue: a course is
    // available when all of its prerequisites are already in the plan.
    const all: Course[] = degrees.flatMap((degree) => courseOrder(degree));
    const remaining = [...all];
    const done = new Set<string>();
    const ordered: Course[] = [];
    let guard = 0;
    while (remaining.length && guard < 1000) {
      guard += 1;
      const next = remaining.find((course) => course.prereqs.every((prereq) => done.has(prereq)));
      if (!next) break;
      ordered.push(next);
      done.add(next.code);
      remaining.splice(remaining.indexOf(next), 1);
    }

    let cumulativeDays = 0;
    const rows = ordered.map((course) => {
      const weeks = reducedWeeks(course.weeks, planner.meritEducation, planner.wsu, planner.principal);
      const days = weeks * 7;
      cumulativeDays += days;
      return { course, weeks, days, cumulativeDays };
    });

    const totals = degrees.reduce(
      (acc, degree) => {
        const t = degreeTotals(degree);
        return {
          weeks: acc.weeks + t.weeks,
          cost: acc.cost + t.cost,
          manual: acc.manual + t.manual,
          intelligence: acc.intelligence + t.intelligence,
          endurance: acc.endurance + t.endurance,
          courses: acc.courses + degree.courses.length,
        };
      },
      { weeks: 0, cost: 0, manual: 0, intelligence: 0, endurance: 0, courses: 0 },
    );

    const reducedTotalDays = rows.reduce((sum, row) => sum + row.days, 0);
    const savedDays = totals.weeks * 7 - reducedTotalDays;
    const calendarDays = hoursPerDay >= 24 ? reducedTotalDays : reducedTotalDays * (24 / Math.max(0.5, hoursPerDay));
    const finish = new Date(Date.now() + calendarDays * 86_400_000);

    return { degrees, rows, totals, reducedTotalDays, savedDays, calendarDays, finish };
  }, [selected, planner]);

  const toggleDegree = (code: string) =>
    setSelected((current) => (current.includes(code) ? current.filter((x) => x !== code) : [...current, code]));

  return (
    <div>
      <PageHeader
        eyebrow="Tools"
        title="Education planner"
        description="Choose degrees, apply your time reductions, and get a dependency-ordered study queue with a real finish date. Reductions are applied additively, which is how Torn has calculated them since patch #334."
        right={<Chip tone="amber">{plan.rows.length} courses queued</Chip>}
      />

      <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <Panel>
          <SectionHeader title="Plan settings" />
          <div className="space-y-4 p-4">
            <div>
              <span className="label">Degrees (verified course tables only)</span>
              <div className="flex flex-wrap gap-1.5">
                {VERIFIED.map((degree) => (
                  <button
                    key={degree.code}
                    onClick={() => toggleDegree(degree.code)}
                    className={`chip ${
                      selected.includes(degree.code)
                        ? 'border-amber-500/60 bg-amber-500/10 text-amber-300'
                        : 'border-ink-600 bg-ink-800 text-slate-300 hover:border-ink-500'
                    }`}
                  >
                    {degree.name}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
                {DEGREES.length - VERIFIED.length} further degrees have verified perks but no published course table —
                see the{' '}
                <Link to="/education" className="link">
                  education database
                </Link>
                .
              </p>
            </div>

            <Field label="Education merits" hint="2% per upgrade, capped at 10 upgrades (20%).">
              <NumberInput
                value={planner.meritEducation}
                onChange={(value) => updatePlanner({ meritEducation: Math.min(20, Math.max(0, value)) })}
                suffix="%"
                max={20}
              />
            </Field>

            <Toggle
              checked={planner.wsu}
              onChange={(value) => updatePlanner({ wsu: value })}
              label="WSU stock block (1,000,000 shares)"
              hint="10% off every course length."
            />

            <Toggle
              checked={planner.principal}
              onChange={(value) => updatePlanner({ principal: value })}
              label="Education principal perk"
              hint="10% off, kept permanently once earned."
            />

            <Field
              label="Study hours per day"
              hint="24 means you are always enrolled. Lower values stretch the calendar without changing the course length."
            >
              <NumberInput
                value={hoursPerDay}
                onChange={(value) => updatePlanner({ studyHoursPerDay: Math.min(24, Math.max(1, value)) })}
                max={24}
              />
            </Field>

            <div className="rounded-lg border border-ink-700/70 bg-ink-900/40 p-3 text-[11px] leading-relaxed text-slate-400">
              Total reduction applied:{' '}
              <span className="mono text-amber-300">
                {Math.min(40, planner.meritEducation + (planner.wsu ? 10 : 0) + (planner.principal ? 10 : 0))}%
              </span>
              . Torn caps combined percentage reductions at 40%; job points and the Book of Carols shave hours on top.
            </div>
          </div>
        </Panel>

        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat label="Course time" value={`${num(plan.reducedTotalDays)} days`} hint={`${num(plan.reducedTotalDays / 7, 1)} weeks`} tone="amber" />
            <Stat label="Time saved" value={`${num(plan.savedDays)} days`} hint="versus no reductions" tone="green" />
            <Stat label="Calendar time" value={`${num(plan.calendarDays)} days`} hint={`at ${hoursPerDay}h study per day`} />
            <Stat label="Finish around" value={plan.finish.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} />
          </div>

          <Panel>
            <SectionHeader
              title="Study queue"
              subtitle="Prerequisites always come first, even when the cheaper course is later in the degree."
              right={<Chip tone="neutral">{plan.totals.courses} courses</Chip>}
            />
            <div className="max-h-[560px] overflow-y-auto">
              <table className="w-full border-collapse">
                <thead className="sticky top-0 bg-ink-900/95 backdrop-blur">
                  <tr className="border-b border-ink-700">
                    <th className="th w-12 text-center">#</th>
                    <th className="th">Course</th>
                    <th className="th">Unlock</th>
                    <th className="th text-right">Cost</th>
                    <th className="th text-right">Weeks</th>
                    <th className="th text-right">Elapsed</th>
                  </tr>
                </thead>
                <tbody>
                  {plan.rows.map((row, index) => (
                    <tr key={row.course.code} className="border-b border-ink-800/70 row-hover">
                      <td className="td text-center text-slate-500">{index + 1}</td>
                      <td className="td">
                        <div className="font-medium text-slate-100">{row.course.name}</div>
                        <div className="mono text-[10px] text-amber-300/80">{row.course.code}</div>
                      </td>
                      <td className="td max-w-[260px] text-[11px] text-emerald-300/80">{row.course.unlock ?? '—'}</td>
                      <td className="td mono text-right">${num(row.course.cost)}</td>
                      <td className="td mono text-right">
                        {row.weeks.toFixed(2)}
                        {row.weeks < row.course.weeks ? (
                          <span className="ml-1 text-[10px] text-emerald-400">−{((1 - row.weeks / row.course.weeks) * 100).toFixed(0)}%</span>
                        ) : null}
                      </td>
                      <td className="td mono text-right text-slate-400">{num(row.cumulativeDays)}d</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <SourceNote>
              Course order, prerequisites, costs and durations are transcribed from the torn wiki for Biology and
              Computer Science. Time reductions are additive per patch #334 (April 2024).
            </SourceNote>
          </Panel>

          <div className="grid gap-4 lg:grid-cols-2">
            <Panel>
              <SectionHeader title="What you bank along the way" />
              <div className="grid grid-cols-3 gap-3 p-4">
                <Stat label="Cost" value={`$${num(plan.totals.cost)}`} />
                <Stat label="Manual labour" value={num(plan.totals.manual)} tone="amber" />
                <Stat label="Intelligence" value={num(plan.totals.intelligence)} tone="blue" />
                <Stat label="Endurance" value={num(plan.totals.endurance)} />
                <Stat label="Raw weeks" value={num(plan.totals.weeks)} />
                <Stat label="With reductions" value={num(plan.reducedTotalDays / 7, 1)} tone="green" />
              </div>
              <SourceNote>
                Working stats are the sum of every course in the queue — useful for company applications long before the
                degree finishes.
              </SourceNote>
            </Panel>

            <div className="space-y-4">
              <Callout tone="amber" title="Do General Studies first">
                +10% working stats on everything you complete afterwards. Starting a long queue without it permanently
                costs you working stats.
              </Callout>
              <Callout tone="green" title="Merits compound too">
                Ten education-length merits remove 20% from every future course — including the ones you have not started
                yet. Spending them early is worth weeks.
              </Callout>
              <Callout tone="blue" title="Job points shave hours">
                Fitness Center and Hair Salon job points take 30 minutes off a course in progress. On a 7-week bachelor
                that is real time.
              </Callout>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
