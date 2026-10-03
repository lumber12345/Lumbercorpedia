import { useMemo, useState } from 'react';
import { DataTable, type Column } from '../components/DataTable';
import { Bar, Callout, Chip, PageHeader, Panel, SectionHeader, SourceNote, Stat } from '../components/ui';
import {
  WEAPONS,
  WEAPON_SLOTS,
  WEAPON_TYPES,
  loadoutScore,
  midAccuracy,
  midDamage,
  midRof,
  type Weapon,
} from '../data/weapons';
import { useDebounced, useQueryState } from '../lib/hooks';

const SLOT_TONE = { Primary: 'amber', Secondary: 'blue', Melee: 'violet' } as const;

export default function WeaponsPage() {
  const [query, setQuery] = useQueryState('q');
  const [slot, setSlot] = useQueryState('slot');
  const [type, setType] = useQueryState('type');
  const [compare, setCompare] = useState<string[]>([]);
  const debounced = useDebounced(query, 150);

  const filtered = useMemo(() => {
    const needle = debounced.trim().toLowerCase();
    return WEAPONS.filter((weapon) => {
      if (slot && weapon.slot !== slot) return false;
      if (type && weapon.type !== type) return false;
      if (!needle) return true;
      return (
        weapon.name.toLowerCase().includes(needle) ||
        weapon.type.toLowerCase().includes(needle) ||
        weapon.source.toLowerCase().includes(needle) ||
        (weapon.caliber ?? '').toLowerCase().includes(needle)
      );
    });
  }, [debounced, slot, type]);

  const bestByScore = useMemo(() => {
    const scored = WEAPONS.map((weapon) => ({ weapon, score: loadoutScore(weapon) ?? 0 })).filter((x) => x.score > 0);
    return scored.sort((a, b) => b.score - a.score).slice(0, 3);
  }, []);

  const compareWeapons = WEAPONS.filter((weapon) => compare.includes(weapon.name));

  const toggleCompare = (name: string) =>
    setCompare((current) =>
      current.includes(name) ? current.filter((x) => x !== name) : [...current, name].slice(-3),
    );

  const columns: Column<Weapon>[] = [
    {
      key: 'cmp',
      header: '',
      className: 'w-8',
      render: (weapon) => (
        <input
          type="checkbox"
          title="Add to comparison"
          checked={compare.includes(weapon.name)}
          onChange={(event) => {
            event.stopPropagation();
            toggleCompare(weapon.name);
          }}
          className="h-3.5 w-3.5 accent-amber-500"
        />
      ),
    },
    {
      key: 'name',
      header: 'Weapon',
      sortValue: (weapon) => weapon.name,
      render: (weapon) => (
        <div>
          <div className="font-medium text-slate-100">{weapon.name}</div>
          <div className="text-[11px] text-slate-500">
            {weapon.caliber ? `${weapon.caliber} · ` : ''}
            {weapon.source}
          </div>
        </div>
      ),
    },
    {
      key: 'slot',
      header: 'Slot',
      sortValue: (weapon) => weapon.slot,
      render: (weapon) => <Chip tone={SLOT_TONE[weapon.slot]}>{weapon.slot}</Chip>,
    },
    { key: 'type', header: 'Type', sortValue: (weapon) => weapon.type, render: (weapon) => weapon.type },
    {
      key: 'damage',
      header: 'Damage',
      align: 'right',
      sortValue: (weapon) => midDamage(weapon) ?? -1,
      render: (weapon) =>
        weapon.damage ? (
          <div className="mono">
            <div className="text-slate-100">{midDamage(weapon)?.toFixed(1)}</div>
            <div className="text-[10px] text-slate-500">
              {weapon.damage[0]}–{weapon.damage[1]}
            </div>
          </div>
        ) : (
          <span className="text-slate-600">—</span>
        ),
    },
    {
      key: 'accuracy',
      header: 'Accuracy',
      align: 'right',
      sortValue: (weapon) => midAccuracy(weapon) ?? -1,
      render: (weapon) =>
        weapon.accuracy ? (
          <div className="mono">
            <div className="text-slate-100">{midAccuracy(weapon)?.toFixed(1)}</div>
            <div className="text-[10px] text-slate-500">
              {weapon.accuracy[0]}–{weapon.accuracy[1]}
            </div>
          </div>
        ) : (
          <span className="text-slate-600">—</span>
        ),
    },
    {
      key: 'rof',
      header: 'RoF',
      align: 'right',
      sortValue: (weapon) => midRof(weapon),
      render: (weapon) =>
        weapon.rof ? (
          <span className="mono text-slate-300">
            {weapon.rof[0]}–{weapon.rof[1]}
          </span>
        ) : (
          <span className="text-slate-600">—</span>
        ),
    },
    {
      key: 'stealth',
      header: 'Stealth',
      align: 'right',
      sortValue: (weapon) => weapon.stealth,
      render: (weapon) => <span className="mono">{weapon.stealth.toFixed(1)}</span>,
    },
    {
      key: 'score',
      header: 'Loadout score',
      align: 'right',
      headerTitle: 'Mid damage × mid accuracy × mid rate of fire. A consistent ranking, not a combat simulation.',
      sortValue: (weapon) => loadoutScore(weapon) ?? -1,
      render: (weapon) => {
        const score = loadoutScore(weapon);
        if (score === null) return <span className="text-slate-600">—</span>;
        const max = Math.max(...WEAPONS.map((x) => loadoutScore(x) ?? 0));
        return (
          <div className="flex items-center justify-end gap-2">
            <span className="mono text-amber-300">{Math.round(score).toLocaleString()}</span>
            <div className="w-14">
              <Bar value={score} max={max} />
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Database"
        title="Weapon comparison"
        description="Every weapon in Torn rolls an accuracy and damage value inside a fixed range — so the useful comparison is the range, not one lucky roll. Sort by loadout score to find the best gun your budget and slot allow."
        right={
          <>
            <Chip tone="amber">{filtered.length} shown</Chip>
            <Chip tone="neutral">{WEAPONS.length} weapons</Chip>
          </>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        {bestByScore.map((entry, index) => (
          <Stat
            key={entry.weapon.name}
            label={`#${index + 1} by loadout score`}
            value={entry.weapon.name}
            hint={`${entry.weapon.slot} · score ${Math.round(entry.score).toLocaleString()}`}
            tone="amber"
          />
        ))}
      </div>

      <Panel className="mb-4">
        <div className="flex flex-col gap-3 p-4">
          <input
            className="input"
            placeholder="Search weapons, ammo calibres or sources…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSlot('')}
              className={`chip ${!slot ? 'border-amber-500/60 bg-amber-500/10 text-amber-300' : 'border-ink-600 bg-ink-800 text-slate-300'}`}
            >
              All slots
            </button>
            {WEAPON_SLOTS.map((s) => (
              <button
                key={s}
                onClick={() => setSlot(s === slot ? '' : s)}
                className={`chip ${
                  s === slot ? 'border-amber-500/60 bg-amber-500/10 text-amber-300' : 'border-ink-600 bg-ink-800 text-slate-300'
                }`}
              >
                {s}
              </button>
            ))}
            <span className="mx-1 h-5 w-px bg-ink-700" />
            <button
              onClick={() => setType('')}
              className={`chip ${!type ? 'border-amber-500/60 bg-amber-500/10 text-amber-300' : 'border-ink-600 bg-ink-800 text-slate-300'}`}
            >
              All types
            </button>
            {WEAPON_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setType(t === type ? '' : t)}
                className={`chip ${
                  t === type ? 'border-amber-500/60 bg-amber-500/10 text-amber-300' : 'border-ink-600 bg-ink-800 text-slate-300'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </Panel>

      {compareWeapons.length > 0 ? (
        <Panel className="mb-4">
          <SectionHeader
            title={`Comparing ${compareWeapons.length} weapon${compareWeapons.length === 1 ? '' : 's'}`}
            subtitle="Tick up to three weapons in the table to line them up side by side."
            right={
              <button className="btn btn-ghost text-xs" onClick={() => setCompare([])}>
                Clear
              </button>
            }
          />
          <div className="grid gap-3 p-4 sm:grid-cols-3">
            {compareWeapons.map((weapon) => (
              <div key={weapon.name} className="rounded-lg border border-ink-700 bg-ink-900/50 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-100">{weapon.name}</span>
                  <Chip tone={SLOT_TONE[weapon.slot]}>{weapon.slot}</Chip>
                </div>
                <dl className="mt-2 space-y-1 text-[11px]">
                  {[
                    ['Damage', weapon.damage ? `${weapon.damage[0]} – ${weapon.damage[1]}` : '—'],
                    ['Accuracy', weapon.accuracy ? `${weapon.accuracy[0]} – ${weapon.accuracy[1]}` : '—'],
                    ['Stealth', weapon.stealth.toFixed(1)],
                    ['Rate of fire', weapon.rof ? `${weapon.rof[0]} – ${weapon.rof[1]}` : '—'],
                    ['Calibre', weapon.caliber ?? '—'],
                    ['Clip', weapon.clip ? String(weapon.clip) : '—'],
                    ['Special ammo', weapon.specialAmmo ?? '—'],
                    ['Loadout score', loadoutScore(weapon) ? Math.round(loadoutScore(weapon)!).toLocaleString() : '—'],
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
        </Panel>
      ) : null}

      <Panel>
        <SectionHeader
          title="All weapons"
          subtitle="Stealth is the raw weapon value — combine it with armour and education to see your real detection chance."
        />
        <DataTable
          rows={filtered}
          columns={columns}
          rowKey={(weapon) => weapon.name}
          initialSort="score"
          maxHeight={720}
          dense
        />
        <SourceNote>
          Damage, accuracy, stealth, calibre, clip and rate-of-fire values are taken from the torn wiki weapon tables.
          “Loadout score” is Lumbercorpedia's own transparent metric — mid damage × mid accuracy × mid rate of fire. It
          ignores weapon experience, range, charms, armour and education, so use it to shortlist, not to promise.
        </SourceNote>
      </Panel>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <Callout tone="blue" title="Slot rules">
          Rifles and machine guns are Primary only. Pistols are Secondary only. Shotguns, SMGs and heavy artillery slot
          into either. Melee covers clubbing, slashing and piercing — with the slingshot, harpoon, crossbow and blowgun
          as the exceptions that can sit in a Secondary slot.
        </Callout>
        <Callout tone="amber" title="Rolls beat models">
          A well-rolled cheap gun can out-damage a badly-rolled expensive one, because every stat lands between min and
          max. When buying, read the actual roll on the item — the range here only tells you what is possible.
        </Callout>
        <Callout tone="green" title="Ammo changes the maths">
          Hollow point, tracer, piercing and incendiary ammo shift damage and hit chance, and Mathematics' Bachelor
          gives 20% ammo conservation. A “worse” gun on tracer rounds often beats a better one on standard ammo.
        </Callout>
      </div>
    </div>
  );
}
