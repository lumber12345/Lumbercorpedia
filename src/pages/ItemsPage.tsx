import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { DataTable, type Column } from '../components/DataTable';
import { Chip, PageHeader, Panel, SectionHeader, SourceNote, EmptyState, Callout } from '../components/ui';
import { ITEMS, ITEM_CATEGORIES, type Item, type Rarity } from '../data/items';
import { useCopy, useDebounced, useQueryState } from '../lib/hooks';
import { useApp } from '../lib/store';

const RARITY_TONE: Record<Rarity, 'neutral' | 'green' | 'blue' | 'amber' | 'violet'> = {
  common: 'neutral',
  uncommon: 'green',
  rare: 'blue',
  limited: 'amber',
  event: 'violet',
};

export default function ItemsPage() {
  const [query, setQuery] = useQueryState('q');
  const [category, setCategory] = useQueryState('cat');
  const [rarity, setRarity] = useQueryState('rarity');
  const [onlyFavourites, setOnlyFavourites] = useState(false);
  const [copied, copy] = useCopy();

  const favorites = useApp((state) => state.favorites);
  const toggleFavorite = useApp((state) => state.toggleFavorite);

  const debounced = useDebounced(query, 150);

  const filtered = useMemo(() => {
    const needle = debounced.trim().toLowerCase();
    return ITEMS.filter((item) => {
      if (category && item.category !== category) return false;
      if (rarity && item.rarity !== rarity) return false;
      if (onlyFavourites && !favorites.includes(`item:${item.name}`)) return false;
      if (!needle) return true;
      return (
        item.name.toLowerCase().includes(needle) ||
        item.category.toLowerCase().includes(needle) ||
        item.source.toLowerCase().includes(needle) ||
        (item.note ?? '').toLowerCase().includes(needle) ||
        String(item.id ?? '').includes(needle)
      );
    });
  }, [debounced, category, rarity, onlyFavourites, favorites]);

  const columns: Column<Item>[] = [
    {
      key: 'favourite',
      header: '',
      className: 'w-8',
      render: (item) => {
        const id = `item:${item.name}`;
        const active = favorites.includes(id);
        return (
          <button
            onClick={(event) => {
              event.stopPropagation();
              toggleFavorite(id);
            }}
            title={active ? 'Remove from favourites' : 'Save to favourites'}
            className={`text-sm transition-colors ${active ? 'text-amber-400' : 'text-slate-600 hover:text-slate-400'}`}
          >
            ★
          </button>
        );
      },
    },
    {
      key: 'id',
      header: 'ID',
      align: 'right',
      className: 'w-16',
      sortValue: (item) => item.id ?? 999_999,
      render: (item) =>
        item.id === null ? (
          <span className="text-slate-600">—</span>
        ) : (
          <button
            onClick={(event) => {
              event.stopPropagation();
              copy(String(item.id), item.name);
            }}
            title="Copy item ID"
            className="mono rounded border border-ink-700 bg-ink-800 px-1.5 py-0.5 text-[11px] text-slate-300 hover:border-amber-500/60 hover:text-amber-300"
          >
            {copied === item.name ? '✓' : item.id}
          </button>
        ),
    },
    {
      key: 'name',
      header: 'Item',
      sortValue: (item) => item.name,
      render: (item) => <span className="font-medium text-slate-100">{item.name}</span>,
    },
    {
      key: 'category',
      header: 'Category',
      sortValue: (item) => item.category,
      render: (item) => <Chip tone="neutral">{item.category}</Chip>,
    },
    {
      key: 'rarity',
      header: 'Rarity',
      sortValue: (item) => item.rarity,
      render: (item) => <Chip tone={RARITY_TONE[item.rarity]}>{item.rarity}</Chip>,
    },
    {
      key: 'source',
      header: 'Source',
      sortValue: (item) => item.source,
      render: (item) => <span className="text-xs text-slate-400">{item.source}</span>,
    },
    {
      key: 'note',
      header: 'Notes',
      render: (item) => <span className="text-xs text-slate-500">{item.note ?? ''}</span>,
    },
  ];

  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of ITEMS) map.set(item.category, (map.get(item.category) ?? 0) + 1);
    return map;
  }, []);

  return (
    <div>
      <PageHeader
        eyebrow="Database"
        title="Item catalogue"
        description="Torn never publishes item IDs in-game — they only leak out through the API once you own the item. This catalogue pairs every entry with its ID, category, rarity and where players actually get it."
        right={
          <>
            <Chip tone="amber">{filtered.length} shown</Chip>
            <Chip tone="neutral">{ITEMS.length} total</Chip>
          </>
        }
      />

      <Panel className="mb-4">
        <div className="flex flex-col gap-3 p-4">
          <input
            className="input"
            placeholder="Search by name, category, source, note — or paste an item ID…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setCategory('')}
              className={`chip ${!category ? 'border-amber-500/60 bg-amber-500/10 text-amber-300' : 'border-ink-600 bg-ink-800 text-slate-300'}`}
            >
              All categories
            </button>
            {ITEM_CATEGORIES.filter((cat) => (categoryCounts.get(cat) ?? 0) > 0).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat === category ? '' : cat)}
                className={`chip ${
                  cat === category
                    ? 'border-amber-500/60 bg-amber-500/10 text-amber-300'
                    : 'border-ink-600 bg-ink-800 text-slate-300 hover:border-ink-500'
                }`}
              >
                {cat}
                <span className="ml-1 text-[10px] text-slate-500">{categoryCounts.get(cat)}</span>
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {(['common', 'uncommon', 'rare', 'limited', 'event'] as Rarity[]).map((r) => (
              <button
                key={r}
                onClick={() => setRarity(r === rarity ? '' : r)}
                className={`chip ${
                  r === rarity
                    ? 'border-amber-500/60 bg-amber-500/10 text-amber-300'
                    : 'border-ink-600 bg-ink-800 text-slate-300 hover:border-ink-500'
                }`}
              >
                {r}
              </button>
            ))}
            <label className="ml-auto flex cursor-pointer items-center gap-2 text-xs text-slate-400">
              <input
                type="checkbox"
                checked={onlyFavourites}
                onChange={(event) => setOnlyFavourites(event.target.checked)}
                className="h-3.5 w-3.5 accent-amber-500"
              />
              Favourites only ({favorites.filter((f) => f.startsWith('item:')).length})
            </label>
          </div>
        </div>
      </Panel>

      <Panel>
        <SectionHeader
          title="Catalogue"
          subtitle="Click a column header to sort. Click an ID chip to copy it. Star anything you look up often."
        />
        {filtered.length === 0 ? (
          <EmptyState
            title="No items match those filters"
            body="Try clearing a category or searching for a broader term such as 'plushie', 'virus' or a raw ID."
          />
        ) : (
          <DataTable
            rows={filtered}
            columns={columns}
            rowKey={(item) => `${item.id ?? 'x'}-${item.name}`}
            initialSort="name"
            initialDirection="asc"
            maxHeight={720}
            dense
          />
        )}
        <SourceNote>
          IDs come from Torn's global item list. Entries marked with “—” have no published ID (usually retired or
          event-only items). Category and source data is compiled from Torn's public wiki, city shops, travel
          destinations and crime outcomes.
        </SourceNote>
      </Panel>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <Callout tone="blue" title="Why IDs matter">
          Item IDs are not shown anywhere in the Torn interface. They are required for API calls such as{' '}
          <span className="mono text-[11px]">market/&lt;id&gt;?selections=itemmarket</span> and{' '}
          <span className="mono text-[11px]">torn/?selections=itemdetails</span>, which is how trading tools and price
          trackers work. Copy one from the table above and paste it into your own tooling.
        </Callout>
        <Callout tone="amber" title="Weapons live on their own page">
          Combat gear has full damage/accuracy rolls, ammo types and a loadout score.{' '}
          <Link to="/weapons" className="link">
            Open the weapon comparison →
          </Link>
        </Callout>
      </div>
    </div>
  );
}
