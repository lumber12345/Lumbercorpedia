import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Bar, Callout, Chip, PageHeader, Panel, SectionHeader, SourceNote, Stat } from '../components/ui';
import { COSTLY_MISTAKES, DAILY_ROUTINE, PHASES, TASK_COUNT, type Task } from '../data/roadmap';
import { MAX_ENERGY_BASE, MAX_ENERGY_DONATOR, energyPerDay, hoursToFull } from '../lib/energy';
import { useApp } from '../lib/store';
import { clock, num } from '../lib/format';

function TaskRow({ task, done, onToggle }: { task: Task; done: boolean; onToggle: () => void }) {
  return (
    <li className="px-4 py-3">
      <div className="flex items-start gap-3">
        <button
          onClick={onToggle}
          role="checkbox"
          aria-checked={done}
          className={`mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded border text-[11px] leading-none transition-colors ${
            done
              ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
              : 'border-ink-500 text-transparent hover:border-amber-500'
          }`}
          style={{ height: 18, width: 18 }}
        >
          ✓
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-sm font-medium ${done ? 'text-slate-500 line-through' : 'text-slate-100'}`}>
              {task.title}
            </span>
            <Chip tone={task.basis === 'verified' ? 'green' : 'neutral'} title={
              task.basis === 'verified'
                ? 'Mechanic stated on Torn’s own wiki or FAQ'
                : 'Long-standing community practice, not an official rule'
            }>
              {task.basis === 'verified' ? 'verified' : 'community play'}
            </Chip>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-slate-400">{task.why}</p>
          {task.numbers ? (
            <p className="mono mt-1.5 rounded border border-ink-700/70 bg-ink-900/50 px-2 py-1 text-[11px] text-amber-300/90">
              {task.numbers}
            </p>
          ) : null}
          {task.links?.length ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {task.links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="chip border-amber-600/40 bg-amber-500/10 text-amber-300 hover:border-amber-500 hover:bg-amber-500/20"
                >
                  {link.label} →
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </li>
  );
}

export default function StartHere() {
  const roadmapDone = useApp((state) => state.roadmapDone);
  const toggleRoadmapTask = useApp((state) => state.toggleRoadmapTask);
  const resetRoadmap = useApp((state) => state.resetRoadmap);
  const newPlayer = useApp((state) => state.newPlayer);

  const done = useMemo(() => new Set(roadmapDone), [roadmapDone]);
  const percent = Math.round((done.size / TASK_COUNT) * 100);

  /** The three next things to do, in phase order. */
  const nextUp = useMemo(() => {
    const out: Task[] = [];
    for (const phase of PHASES) {
      for (const task of phase.tasks) {
        if (!done.has(task.id) && out.length < 3) out.push(task);
      }
      if (out.length >= 3) break;
    }
    return out;
  }, [done]);

  const maxEnergy = newPlayer.donator ? MAX_ENERGY_DONATOR : MAX_ENERGY_BASE;
  const perDay = energyPerDay(newPlayer.donator);
  const toFull = hoursToFull(newPlayer.currentEnergy, maxEnergy, newPlayer.donator);
  const travelUnlocked = newPlayer.level >= 15;

  return (
    <div>
      <PageHeader
        eyebrow="New players"
        title="Start here — the fastest route through Torn's early game"
        description="Torn's early game has one dominant objective (reach level 15) and a handful of expensive mistakes. Work down this list in order. Progress is saved in your browser, and every claim is tagged verified or community play."
        right={
          <>
            <Chip tone="amber">
              {done.size}/{TASK_COUNT} done
            </Chip>
            {done.size > 0 ? (
              <button className="btn btn-ghost text-xs" onClick={resetRoadmap}>
                Reset
              </button>
            ) : null}
          </>
        }
      />

      <Panel className="mb-5">
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <div className="flex-1">
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="font-medium text-slate-200">Your progress through the roadmap</span>
              <span className="mono text-amber-300">{percent}%</span>
            </div>
            <Bar value={done.size} max={TASK_COUNT} tone={percent >= 100 ? 'green' : 'amber'} />
          </div>
          <div className="grid grid-cols-3 gap-2 sm:w-auto">
            <Stat label="Level" value={newPlayer.level} tone={travelUnlocked ? 'green' : 'amber'} hint={travelUnlocked ? 'travel unlocked' : 'travel at 15'} />
            <Stat label="Energy max" value={maxEnergy} hint={newPlayer.donator ? 'donator' : 'standard'} />
            <Stat label="Bar full in" value={clock(toFull * 3600)} hint={`${num(perDay)} energy/day`} />
          </div>
        </div>
        <SourceNote>
          Level and donator status live on the{' '}
          <Link to="/tools/energy" className="link">
            energy planner
          </Link>
          , where you can also see how much regeneration you are throwing away by logging in rarely.
        </SourceNote>
      </Panel>

      <div className="mb-5 grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <SectionHeader
            title="Do these three next"
            subtitle="Pulled from the first unfinished tasks in phase order, so you always know the current step."
          />
          {nextUp.length === 0 ? (
            <div className="px-4 py-6 text-sm text-emerald-300">
              Roadmap complete. From here it is compounding: gym ladder, jumps, and stat shape.
            </div>
          ) : (
            <ol className="divide-y divide-ink-700/60">
              {nextUp.map((task, index) => (
                <li key={task.id} className="flex gap-3 px-4 py-3">
                  <span className="mono mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-amber-500/15 text-[11px] font-semibold text-amber-300">
                    {index + 1}
                  </span>
                  <div>
                    <div className="text-sm font-medium text-slate-100">{task.title}</div>
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-400">{task.numbers ?? task.why}</p>
                    {task.links?.length ? (
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {task.links.map((link) => (
                          <Link key={link.to} to={link.to} className="link text-[11px]">
                            {link.label} →
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </Panel>

        <Callout tone="amber" title="The one rule that beats all others">
          Your energy bar fills in <span className="font-semibold">exactly 5 hours</span> whether you are a donator or not
          — 100 energy at 20/hour, or 150 at 30/hour. Anything regenerated after it caps is gone forever. Log in at least
          every 5 hours, or spend the bar before you leave.
        </Callout>
      </div>

      <div className="mb-5 grid gap-4 lg:grid-cols-2">
        {PHASES.map((phase) => {
          const phaseDone = phase.tasks.filter((task) => done.has(task.id)).length;
          return (
            <Panel key={phase.id}>
              <SectionHeader
                title={phase.name}
                subtitle={`${phase.window} · ${phase.goal}`}
                right={
                  <Chip tone={phaseDone === phase.tasks.length ? 'green' : 'neutral'}>
                    {phaseDone}/{phase.tasks.length}
                  </Chip>
                }
              />
              <ul className="divide-y divide-ink-700/50">
                {phase.tasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    done={done.has(task.id)}
                    onToggle={() => toggleRoadmapTask(task.id)}
                  />
                ))}
              </ul>
            </Panel>
          );
        })}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel>
          <SectionHeader
            title="The mistakes that cost the most"
            subtitle="Ranked by how much they actually take off your progression. Every one of them is avoidable."
          />
          <div className="divide-y divide-ink-700/60">
            {COSTLY_MISTAKES.map((mistake) => (
              <div key={mistake.title} className="px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-medium text-slate-100">{mistake.title}</span>
                  <Chip tone="red">{mistake.cost}</Chip>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">{mistake.detail}</p>
                <p className="mt-1 text-[11px] text-emerald-300/90">Fix: {mistake.fix}</p>
              </div>
            ))}
          </div>
        </Panel>

        <div className="space-y-5">
          <Panel>
            <SectionHeader title="Your daily loop" subtitle="Six steps, in order. Short enough to actually follow." />
            <ol className="divide-y divide-ink-700/60">
              {DAILY_ROUTINE.map((item, index) => (
                <li key={item.step} className="flex gap-3 px-4 py-3">
                  <span className="mono mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-ink-700 text-[11px] font-semibold text-slate-200">
                    {index + 1}
                  </span>
                  <div>
                    <div className="text-sm text-slate-100">{item.step}</div>
                    <p className="mt-0.5 text-xs text-slate-400">{item.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Panel>

          <Callout tone="blue" title="Why level 15 changes everything">
            Travel unlocks at level 15: cheap plushies and flowers abroad, sellable at home, plus Switzerland for rehab
            and China for the fortune teller. Every day spent below 15 is a day of that income you never recover — which
            is why the roadmap rushes it, then slows down.
          </Callout>

          <Panel>
            <SectionHeader title="Tools built for this stage" />
            <div className="grid gap-2 p-4 sm:grid-cols-2">
              {[
                { to: '/tools/energy', label: 'Energy planner', hint: 'Stop wasting regeneration' },
                { to: '/tools/jumps', label: 'Jump planner', hint: 'Candy jump → happy jump' },
                { to: '/tools/merits', label: 'Merit planner', hint: 'Spend the first merits right' },
                { to: '/tools/gym', label: 'Gym gains', hint: 'See what each train is worth' },
                { to: '/gyms', label: 'Gym ladder', hint: 'Never train in an outgrown gym' },
                { to: '/education', label: 'Education', hint: 'What to study first' },
              ].map((tool) => (
                <Link key={tool.to} to={tool.to} className="rounded-lg border border-ink-700 bg-ink-900/40 p-3 transition-colors hover:border-amber-500/50">
                  <div className="text-xs font-medium text-slate-100">{tool.label}</div>
                  <div className="text-[11px] text-slate-500">{tool.hint}</div>
                </Link>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
