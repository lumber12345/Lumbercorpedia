import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar, Callout, Chip, PageHeader, Panel, SectionHeader, SourceNote, Stat } from '../components/ui';
import { GYMS, GYM_TIERS, type Gym, type StatKey } from '../data/gyms';
import { money, num } from '../lib/format';
import { useDebounced, usePersistentSet, useQueryState } from '../lib/hooks';

const STATS: { key: StatKey; label: string; short: string }[] = [
  { key: 'strength', label: 'Strength', short: 'STR' },
  { key: 'speed', label: 'Speed', short: 'SPD' },
  { key: 'defense', label: 'Defense', short: 'DEF' },
  { key: 'dexterity', label: 'Dexterity', short: 'DEX' },
];

function GymRow({ gym, unlocked, onToggle }: { gym: Gym; unlocked: boolean; onToggle: () => void }) {
  const maxDots = 10;
  return (
    <div className={`grid grid-cols-12 items-center gap-3 border-b border-ink-800/70 px-4 py-3 ${unlocked ? 'bg-amber-500/[0.04]' : ''}`}>
      <div className="col-span-12 flex items-start gap-3 sm:col-span-4">
        <input
          type="checkbox"
          checked={unlocked}
          onChange={onToggle}
          title="Mark as unlocked"
          className="mt-1 h-3.5 w-3.5 accent-amber-500"
        />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium text-slate-100">{gym.name}</span>
            {gym.tier === 'specialist' ? <Chip tone="violet">specialist</Chip> : null}
            {gym.tier === 'jail' ? <Chip tone="neutral">jail only</Chip> : null}
          </div>
          <div className="mt-0.5 text-[11px] text-slate-500">
            {gym.cost > 0 ? `${money(gym.cost)} to open` : 'Free'} · {gym.energy} energy per train
            {gym.expForNext ? ` · next gym at ${num(gym.expForNext)} gym EXP` : ''}
          </div>
          {gym.requirement ? <div className="mt-1 text-[11px] text-amber-300/90">Requires: {gym.requirement}</div> : null}
          {gym.notes ? <div className="mt-0.5 text-[11px] text-slate-500">{gym.notes}</div> : null}
        </div>
      </div>
      <div className="col-span-12 grid grid-cols-4 gap-3 sm:col-span-8">
        {STATS.map((stat) => {
          const value = gym.gains[stat.key];
          return (
            <div key={stat.key} title={stat.label}>
              <div className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-wider text-slate-500">
                <span>{stat.short}</span>
                <span className="mono text-slate-300">{value === null ? '—' : value.toFixed(1)}</span>
              </div>
              {value === null ? (
                <div className="h-1.5 w-full rounded-full bg-ink-800" />
              ) : (
                <Bar value={value} max={maxDots} tone={value >= 7 ? 'green' : value >= 5.5 ? 'blue' : 'amber'} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function GymsPage() {
  const [query, setQuery] = useQueryState('q');
  const [unlocked, toggleUnlocked] = usePersistentSet('lumbercorpedia.unlockedGyms');
  const [tier, setTier] = useState<string>('');
  const debounced = useDebounced(query, 150);

  const filtered = useMemo(() => {
    const needle = debounced.trim().toLowerCase();
    return GYMS.filter((gym) => {
      if (tier && gym.tier !== tier) return false;
      if (!needle) return true;
      return (
        gym.name.toLowerCase().includes(needle) ||
        (gym.requirement ?? '').toLowerCase().includes(needle) ||
        (gym.notes ?? '').toLowerCase().includes(needle)
      );
    });
  }, [debounced, tier]);

  const bestPerEnergy = useMemo(() => {
    return STATS.map((stat) => {
      const candidates = GYMS.filter((gym) => gym.gains[stat.key] !== null && gym.tier !== 'jail');
      const best = candidates.sort(
        (a, b) => (b.gains[stat.key] as number) / b.energy - (a.gains[stat.key] as number) / a.energy,
      )[0];
      return { stat, best };
    });
  }, []);

  const totalUnlockCost = useMemo(
    () => GYMS.filter((gym) => gym.tier === 'light' || gym.tier === 'middle' || gym.tier === 'heavy').reduce((sum, gym) => sum + gym.cost, 0),
    [],
  );

  return (
    <div>
      <PageHeader
        eyebrow="Database"
        title="Gym progression"
        description="Thirty-three gyms, three standard ladders and nine specialists. Gains are shown as the player-facing dots Torn displays in the gym overview — not the API's ×10 scale."
        right={<Chip tone="amber">{unlocked.size} marked unlocked</Chip>}
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Standard ladder cost" value={money(totalUnlockCost)} hint="Light through George's" tone="amber" />
        {bestPerEnergy.map(({ stat, best }) => (
          <Stat
            key={stat.key}
            label={`Best ${stat.short} per energy`}
            value={best?.name ?? '—'}
            hint={best ? `${best.gains[stat.key]} dots / ${best.energy}e` : ''}
          />
        ))}
      </div>

      <Panel className="mb-4">
        <div className="flex flex-col gap-3 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              className="input"
              placeholder="Search gyms, requirements or notes…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <span className="shrink-0 text-[11px] text-slate-500">
              Tick the box next to a gym to track your own memberships — saved in this browser.
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setTier('')}
              className={`chip ${!tier ? 'border-amber-500/60 bg-amber-500/10 text-amber-300' : 'border-ink-600 bg-ink-800 text-slate-300'}`}
            >
              All tiers
            </button>
            {GYM_TIERS.map((group) => (
              <button
                key={group.id}
                onClick={() => setTier(group.id === tier ? '' : group.id)}
                className={`chip ${
                  group.id === tier
                    ? 'border-amber-500/60 bg-amber-500/10 text-amber-300'
                    : 'border-ink-600 bg-ink-800 text-slate-300'
                }`}
              >
                {group.label}
              </button>
            ))}
          </div>
        </div>
      </Panel>

      <div className="space-y-4">
        {GYM_TIERS.filter((group) => !tier || group.id === tier).map((group) => {
          const gyms = filtered.filter((gym) => gym.tier === group.id);
          if (gyms.length === 0) return null;
          return (
            <Panel key={group.id}>
              <SectionHeader
                title={group.label}
                subtitle={group.blurb}
                right={<Chip tone="neutral">{gyms.length}</Chip>}
              />
              <div className="hidden grid-cols-12 gap-3 border-b border-ink-800 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500 sm:grid">
                <span className="col-span-4">Gym</span>
                <span className="col-span-8">Gains (dots per train)</span>
              </div>
              {gyms.map((gym) => (
                <GymRow
                  key={gym.id}
                  gym={gym}
                  unlocked={unlocked.has(gym.id)}
                  onToggle={() => toggleUnlocked(gym.id)}
                />
              ))}
            </Panel>
          );
        })}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <Callout tone="amber" title="Train where you actually gain">
          Gains scale with your stat total and your happiness, and the gym's dots are a flat multiplier. Moving up a
          tier is almost always worth the unlock fee the moment the EXP allows it — the exception is a specialist gym
          that cannot train the stat you care about.
        </Callout>
        <Callout tone="green" title="Specialist gyms are shape-gated">
          Gym 3000, Mr. Isoyamas, Total Rebound and Elites need a specific stat 25% above your second highest. If you
          train evenly you will never qualify — decide your shape before you grind.
        </Callout>
        <Callout tone="blue" title="Jail is not a dead turn">
          Crim's Gym trains Defense at 4.5 dots for 5 energy, which beats every lightweight gym. If you get jailed as a
          new player, spend the time on Defense.
        </Callout>
      </div>

      <Panel className="mt-5">
        <SectionHeader
          title="Turn this into a number"
          subtitle="The gain calculator applies the published formula with your stats, happiness and gym, and shows the happiness burn per train."
          right={
            <Link to="/tools/gym" className="btn btn-primary text-xs">
              Open gym calculator
            </Link>
          }
        />
        <SourceNote>
          Unlock costs, energy costs, dot values, gym-EXP thresholds and specialist requirements are transcribed from the
          torn wiki gym tables. Torn's API reports these dots at ×10 the values shown here.
        </SourceNote>
      </Panel>
    </div>
  );
}
