import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { create } from 'zustand';
import { groupHits, search, type SearchHit } from '../lib/search';

/** Palette visibility lives in a tiny store so any component can open it. */
export const usePaletteStore = create<{ open: boolean; setOpen: (open: boolean) => void }>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}));

function Highlighted({ text, indices }: { text: string; indices: number[] }) {
  if (!indices.length) return <>{text}</>;
  const set = new Set(indices);
  return (
    <>
      {text.split('').map((char, index) =>
        set.has(index) ? (
          <mark key={index} className="bg-transparent font-semibold text-amber-300">
            {char}
          </mark>
        ) : (
          <span key={index}>{char}</span>
        ),
      )}
    </>
  );
}

export default function CommandPalette() {
  const { open, setOpen } = usePaletteStore();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const hits = useMemo(() => search(query, 24), [query]);
  const groups = useMemo(() => groupHits(hits), [hits]);
  const flat: SearchHit[] = useMemo(() => groups.flatMap((group) => group.hits), [groups]);

  // Global hotkeys: ⌘K / Ctrl+K to open, / to open when not typing.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const typing =
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement ||
        document.activeElement instanceof HTMLSelectElement;
      if ((event.key === 'k' && (event.metaKey || event.ctrlKey)) || (event.key === '/' && !typing)) {
        event.preventDefault();
        setOpen(true);
      }
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setOpen]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
      const timer = window.setTimeout(() => inputRef.current?.focus(), 20);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [open]);

  useEffect(() => setActive(0), [query]);

  if (!open) return null;

  const go = (hit: SearchHit) => {
    setOpen(false);
    navigate(hit.route);
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((current) => Math.min(flat.length - 1, current + 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((current) => Math.max(0, current - 1));
    } else if (event.key === 'Enter' && flat[active]) {
      event.preventDefault();
      go(flat[active]);
    }
  };

  // Keep the active row visible while arrowing through long result lists.
  useEffect(() => {
    const node = listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`);
    node?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-[10vh] backdrop-blur-sm" onClick={() => setOpen(false)}>
      <div
        className="w-full max-w-2xl overflow-hidden rounded-xl border border-ink-600 bg-ink-850 shadow-2xl animate-slide-up"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-ink-700 px-4 py-3">
          <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search items, weapons, gyms, courses, crimes, tools…"
            className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
          <button onClick={() => setOpen(false)} className="chip border-ink-600 bg-ink-800 text-slate-400">
            ESC
          </button>
        </div>

        <div ref={listRef} className="max-h-[60vh] overflow-y-auto">
          {query === '' ? (
            <div className="px-4 py-5 text-xs leading-relaxed text-slate-500">
              <p className="mb-2 font-semibold uppercase tracking-wider text-slate-400">Jump to</p>
              <div className="flex flex-wrap gap-2">
                {['xanax', 'jackhammer', "george's", 'BIO1340', 'burglary', 'travel profit', 'booster'].map((seed) => (
                  <button
                    key={seed}
                    onClick={() => setQuery(seed)}
                    className="chip border-ink-600 bg-ink-800 text-slate-300 hover:border-amber-500/60 hover:text-amber-300"
                  >
                    {seed}
                  </button>
                ))}
              </div>
            </div>
          ) : flat.length === 0 ? (
            <div className="px-4 py-8 text-center text-xs text-slate-500">
              Nothing matches “{query}”. Try an item name, an ID number, or a stat.
            </div>
          ) : (
            groups.map((group) => (
              <div key={group.kind}>
                <div className="sticky top-0 z-10 border-y border-ink-700/60 bg-ink-900/95 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 backdrop-blur">
                  {group.kind}
                </div>
                {group.hits.map((hit) => {
                  const index = flat.indexOf(hit);
                  return (
                    <button
                      key={hit.id}
                      data-index={index}
                      onMouseEnter={() => setActive(index)}
                      onClick={() => go(hit)}
                      className={`flex w-full items-center justify-between gap-4 px-4 py-2.5 text-left transition-colors ${
                        index === active ? 'bg-amber-500/10' : 'hover:bg-ink-800/70'
                      }`}
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm text-slate-100">
                          <Highlighted text={hit.label} indices={hit.indices} />
                        </span>
                        <span className="block truncate text-[11px] text-slate-500">{hit.sub}</span>
                      </span>
                      <span className="chip shrink-0 border-ink-600 bg-ink-800 text-slate-400">{hit.kind}</span>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <div className="flex items-center justify-between border-t border-ink-700 px-4 py-2 text-[11px] text-slate-500">
          <span>
            <kbd className="rounded border border-ink-600 px-1">↑</kbd>{' '}
            <kbd className="rounded border border-ink-600 px-1">↓</kbd> to move ·{' '}
            <kbd className="rounded border border-ink-600 px-1">↵</kbd> to open
          </span>
          <span>{flat.length} results</span>
        </div>
      </div>
    </div>
  );
}
