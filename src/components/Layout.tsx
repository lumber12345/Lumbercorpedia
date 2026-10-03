import { useEffect, useState, type ReactNode } from 'react';
import { NavLink, Link, Outlet, useLocation } from 'react-router-dom';
import CommandPalette, { usePaletteStore } from './CommandPalette';
import { useApp } from '../lib/store';

/* ------------------------------------------------------------------- icons */

const Icon = ({ path, className = 'h-4 w-4' }: { path: ReactNode; className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {path}
  </svg>
);

const ICONS = {
  home: <Icon path={<><path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z" /></>} />,
  box: <Icon path={<><path d="M21 8 12 3 3 8v8l9 5 9-5z" /><path d="M3 8l9 5 9-5M12 13v8" /></>} />,
  gun: <Icon path={<><path d="M3 12h11l3-3h4v3h-3l-3 3H8l-1 3H4l1-3H3z" /></>} />,
  pill: <Icon path={<><rect x="3" y="9" width="18" height="6" rx="3" transform="rotate(-45 12 12)" /><path d="M8.5 8.5l7 7" /></>} />,
  dumbbell: <Icon path={<><path d="M6.5 6.5v11M17.5 6.5v11M3 9v6M21 9v6M6.5 12h11" /></>} />,
  book: <Icon path={<><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" /><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20v3H6.5A2.5 2.5 0 0 1 4 20.5z" /></>} />,
  mask: <Icon path={<><path d="M3 8c0-1 1-2 2-2h14c1 0 2 1 2 2v3a7 7 0 0 1-7 7h-2a7 7 0 0 1-7-7z" /><path d="M8 11h.01M16 11h.01" /></>} />,
  briefcase: <Icon path={<><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 12h18" /></>} />,
  calc: <Icon path={<><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 7h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15v3" /></>} />,
  user: <Icon path={<><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></>} />,
  info: <Icon path={<><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>} />,
  search: <Icon path={<><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>} />,
  menu: <Icon path={<><path d="M4 7h16M4 12h16M4 17h16" /></>} />,
  close: <Icon path={<><path d="M6 6l12 12M18 6 6 18" /></>} />,
  bolt: <Icon path={<><path d="M13 2 4 14h6l-1 8 9-12h-6z" /></>} />,
  github: <Icon path={<><path d="M9 19c-4 1.5-4-2.5-6-3m12 6v-3.9a3.4 3.4 0 0 0-.9-2.6c3-.3 5-1.7 5-6a4.7 4.7 0 0 0-1.3-3.2 4.4 4.4 0 0 0-.1-3.3s-1.2-.4-3.8 1.4a11 11 0 0 0-6 0C5.3 3.6 4.1 4 4.1 4a4.4 4.4 0 0 0-.1 3.3A4.7 4.7 0 0 0 2.7 10.5c0 4.3 2 5.7 5 6a3.4 3.4 0 0 0-.9 2.6V22" /></>} />,
};

/* -------------------------------------------------------------------- nav  */

interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
  end?: boolean;
  badge?: string;
}

const NAV: { title: string; items: NavItem[] }[] = [
  {
    title: 'Database',
    items: [
      { to: '/', label: 'Dashboard', icon: ICONS.home, end: true },
      { to: '/items', label: 'Items', icon: ICONS.box },
      { to: '/weapons', label: 'Weapons', icon: ICONS.gun },
      { to: '/drugs', label: 'Drugs & Boosters', icon: ICONS.pill },
      { to: '/gyms', label: 'Gyms', icon: ICONS.dumbbell },
      { to: '/education', label: 'Education', icon: ICONS.book },
      { to: '/crimes', label: 'Crimes 2.0', icon: ICONS.mask },
      { to: '/companies', label: 'Companies', icon: ICONS.briefcase },
    ],
  },
  {
    title: 'Tools',
    items: [
      { to: '/tools', label: 'Toolkit', icon: ICONS.calc, end: true },
      { to: '/tools/gym', label: 'Gym gains', icon: ICONS.dumbbell },
      { to: '/tools/stats', label: 'Stat projection', icon: ICONS.bolt },
      { to: '/tools/boosters', label: 'Booster plan', icon: ICONS.pill },
      { to: '/tools/education', label: 'Study plan', icon: ICONS.book },
      { to: '/tools/travel', label: 'Travel profit', icon: ICONS.box },
      { to: '/tools/company', label: 'Company profit', icon: ICONS.briefcase },
    ],
  },
  {
    title: 'Account',
    items: [
      { to: '/profile', label: 'My Torn data', icon: ICONS.user },
      { to: '/about', label: 'About & sources', icon: ICONS.info },
    ],
  },
];

function BrandMark() {
  return (
    <span className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-ink-950 shadow-glow">
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
        <path d="M3 20 20 3" />
        <path d="M7 20 20 7M3 16 16 3" opacity="0.55" />
      </svg>
    </span>
  );
}

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const setPaletteOpen = usePaletteStore((state) => state.setOpen);
  const apiKey = useApp((state) => state.apiKey);

  useEffect(() => {
    setMobileOpen(false);
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  const nav = (
    <nav className="flex h-full flex-col gap-5 overflow-y-auto px-3 py-4">
      {NAV.map((group) => (
        <div key={group.title}>
          <div className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            {group.title}
          </div>
          <ul className="space-y-0.5">
            {group.items.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] transition-colors ${
                      isActive
                        ? 'bg-amber-500/10 text-amber-300 ring-1 ring-inset ring-amber-500/25'
                        : 'text-slate-300 hover:bg-ink-800 hover:text-slate-100'
                    }`
                  }
                >
                  <span className="shrink-0 opacity-90">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <div className="mt-auto rounded-lg border border-ink-700 bg-ink-850 p-3">
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span className={`h-2 w-2 rounded-full ${apiKey ? 'bg-emerald-400' : 'bg-slate-600'}`} />
          {apiKey ? 'Torn key stored locally' : 'No Torn key connected'}
        </div>
        <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500">
          {apiKey
            ? 'Your key stays in this browser and is relayed one request at a time.'
            : 'Connect a limited-access key to pull your own stats into the calculators.'}
        </p>
        <Link to="/profile" className="mt-2 inline-block text-[11px] font-medium text-amber-400 hover:text-amber-300">
          {apiKey ? 'Manage key →' : 'Connect now →'}
        </Link>
      </div>
    </nav>
  );

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-ink-800 bg-ink-900/80 backdrop-blur lg:flex lg:flex-col">
        <Link to="/" className="flex items-center gap-2.5 border-b border-ink-800 px-4 py-4">
          <BrandMark />
          <span>
            <span className="block text-[15px] font-semibold leading-tight tracking-tight text-white">
              Lumbercorpedia
            </span>
            <span className="block text-[10px] uppercase tracking-[0.16em] text-amber-500/90">Torn intelligence</span>
          </span>
        </Link>
        {nav}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 border-r border-ink-700 bg-ink-900">
            <div className="flex items-center justify-between border-b border-ink-800 px-4 py-3.5">
              <span className="flex items-center gap-2">
                <BrandMark />
                <span className="text-sm font-semibold text-white">Lumbercorpedia</span>
              </span>
              <button className="btn btn-ghost px-2 py-1" onClick={() => setMobileOpen(false)} aria-label="Close menu">
                {ICONS.close}
              </button>
            </div>
            {nav}
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-ink-800 bg-ink-900/85 backdrop-blur">
          <div className="flex items-center gap-3 px-4 py-3">
            <button
              className="btn btn-ghost px-2 py-1.5 lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              {ICONS.menu}
            </button>

            <Link to="/" className="flex items-center gap-2 lg:hidden">
              <BrandMark />
            </Link>

            <button
              onClick={() => setPaletteOpen(true)}
              className="group flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-ink-700 bg-ink-850 px-3 py-2 text-left text-sm text-slate-500 transition-colors hover:border-ink-600 hover:text-slate-300 sm:max-w-md"
            >
              {ICONS.search}
              <span className="truncate">Search everything…</span>
              <span className="ml-auto hidden shrink-0 items-center gap-0.5 sm:flex">
                <kbd className="rounded border border-ink-600 px-1 text-[10px]">⌘</kbd>
                <kbd className="rounded border border-ink-600 px-1 text-[10px]">K</kbd>
              </span>
            </button>

            <div className="ml-auto flex items-center gap-2">
              <span className="hidden items-center gap-1.5 rounded-lg border border-ink-700 bg-ink-850 px-2.5 py-1.5 text-[11px] text-slate-400 sm:flex">
                <span className={`h-1.5 w-1.5 rounded-full ${apiKey ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                {apiKey ? 'API connected' : 'Offline data'}
              </span>
              <a
                href="https://github.com/lumber12345/Lumbercorpedia"
                target="_blank"
                rel="noreferrer"
                className="btn btn-ghost px-2 py-1.5"
                aria-label="Repository"
              >
                {ICONS.github}
              </a>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 sm:px-6">
          <Outlet />
        </main>

        <footer className="border-t border-ink-800 px-4 py-6 text-[11px] leading-relaxed text-slate-500 sm:px-6">
          <p>
            Lumbercorpedia is an unofficial fan toolkit. Data is compiled from Torn's public wiki and API and is
            labelled with its provenance throughout — verify anything that matters in-game.
          </p>
          <p className="mt-1">
            Not affiliated with Torn or Chedburn Networks. Press{' '}
            <kbd className="rounded border border-ink-600 px-1">⌘K</kbd> anywhere to search.
          </p>
        </footer>
      </div>

      <CommandPalette />
    </div>
  );
}
