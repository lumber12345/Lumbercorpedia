import { Link } from 'react-router-dom';
import { Callout, Chip, PageHeader, Panel, SectionHeader, SourceNote, Stat } from '../components/ui';

const SOURCES = [
  {
    dataset: 'Gyms',
    detail:
      'All 33 gyms: unlock costs, energy per train, dot values, gym-EXP thresholds and specialist requirements. Also the gain formula constants.',
    source: 'torn wiki — Gym',
    verified: '3 October 2026',
  },
  {
    dataset: 'Weapons',
    detail:
      'Damage and accuracy roll ranges, stealth, weapon type, slot, source, calibre, clip and rate of fire for primary, secondary and melee weapons.',
    source: 'torn wiki — Weapon',
    verified: '3 October 2026',
  },
  {
    dataset: 'Drugs',
    detail: 'Effect text, cooldown ranges, addiction points and overdose consequences for every drug, including Love Juice.',
    source: 'torn wiki — Drug',
    verified: '3 October 2026',
  },
  {
    dataset: 'Education',
    detail:
      'Full course tables for Biology and Computer Science, plus verified payoffs and perks for the other ten degrees. Time-reduction rules (additive since patch #334).',
    source: 'torn wiki — Education / Education:Perks',
    verified: '3 October 2026',
  },
  {
    dataset: 'Crimes',
    detail:
      'The 12 Crimes 2.0 categories, enhancer items, tool requirements, merits and mechanics. Nerve-to-max figures are community observations.',
    source: 'torn wiki crime reference + community guides',
    verified: '3 October 2026',
  },
  {
    dataset: 'Items',
    detail:
      'Item IDs from Torn\u2019s global item list, paired with categories, rarity and player-facing sources.',
    source: 'Torn global item list (API)',
    verified: '3 October 2026',
  },
  {
    dataset: 'New player roadmap',
    detail:
      'Phase checklist, costly-mistake list and daily routine. Every task is tagged verified (Torn wiki / FAQ) or community play, so you know which is a rule and which is conventional wisdom.',
    source: 'torn wiki — FAQ, Merit, Gym, Education, Travel + community guides',
    verified: '3 October 2026',
  },
  {
    dataset: 'Regeneration & merits',
    detail:
      'Energy and happiness regeneration rates, the energy cap, and the full merit upgrade list with the incremental cost curve (1, 2, 3 … 10 merits per line).',
    source: 'torn wiki — FAQ, Merit',
    verified: '3 October 2026',
  },
  {
    dataset: 'Companies',
    detail: 'Verified company specials only. No star-rating guesses, no invented per-star multipliers.',
    source: 'torn wiki — Education, Drug, Company pages',
    verified: '3 October 2026',
  },
];

export default function AboutPage() {
  return (
    <div>
      <PageHeader
        eyebrow="About"
        title="About Lumbercorpedia — and where every number comes from"
        description="A wiki is only as good as its provenance. Every dataset here names its source, and anything derived from community observation rather than published rules is labelled as an estimate."
        right={<Chip tone="amber">v1.0</Chip>}
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Datasets" value={SOURCES.length} hint="each with a named source" />
        <Stat label="Calculators" value={9} hint="formulas shown in the UI" tone="amber" />
        <Stat label="Torn API" value="v1 + v2 ready" hint="read-only, key stays local" />
        <Stat label="Data verified" value="Oct 2026" hint="against Torn's public wiki" />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Panel>
            <SectionHeader title="Dataset provenance" subtitle="Click through to the live Torn wiki page behind each dataset." />
            <div className="divide-y divide-ink-700/60">
              {SOURCES.map((row) => (
                <div key={row.dataset} className="px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-medium text-slate-100">{row.dataset}</span>
                    <div className="flex items-center gap-1.5">
                      <Chip tone="neutral">{row.source}</Chip>
                      <Chip tone="green">verified {row.verified}</Chip>
                    </div>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-slate-400">{row.detail}</p>
                </div>
              ))}
            </div>
            <SourceNote>
              Torn's wiki is community-maintained and Torn rebalances regularly. If you spot something that no longer
              matches the game, the in-game value wins — the point of this page is to make that comparison easy.
            </SourceNote>
          </Panel>

          <Panel>
            <SectionHeader title="Methodology" subtitle="Three rules the app is built on." />
            <div className="grid gap-4 p-4 sm:grid-cols-3">
              {[
                {
                  title: 'Published or labelled',
                  body: 'Numbers taken from Torn\u2019s wiki or API are cited. Numbers taken from community records are marked “estimate” in the UI itself, not in a footnote.',
                },
                {
                  title: 'Show the formula',
                  body: 'Each calculator prints the equation it uses — including the gym gain constants — so you can sanity check the result instead of taking it on faith.',
                },
                {
                  title: 'Blank beats wrong',
                  body: 'Where data is genuinely unavailable (a few company star ratings, some retired item IDs), Lumbercorpedia shows a dash and says why.',
                },
              ].map((rule) => (
                <div key={rule.title} className="rounded-lg border border-ink-700/70 bg-ink-900/40 p-3">
                  <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-amber-300">{rule.title}</h3>
                  <p className="text-xs leading-relaxed text-slate-300">{rule.body}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel>
            <SectionHeader title="Keyboard first" subtitle="Built for people who live in Torn on a second monitor." />
            <div className="grid gap-3 p-4 sm:grid-cols-2">
              {[
                ['⌘K / Ctrl+K', 'Open the global search palette'],
                ['/', 'Open search when not typing in a field'],
                ['↑ ↓ / ↵', 'Move through results and open one'],
                ['Esc', 'Close the palette or a detail drawer'],
              ].map(([keys, action]) => (
                <div key={keys} className="flex items-center gap-3 rounded-lg border border-ink-700/70 bg-ink-900/40 px-3 py-2">
                  <kbd className="rounded border border-ink-600 px-1.5 py-0.5 text-[11px] text-slate-200">{keys}</kbd>
                  <span className="text-xs text-slate-400">{action}</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="space-y-5">
          <Panel>
            <SectionHeader title="Who this is for" />
            <ul className="space-y-2 p-4 text-xs leading-relaxed text-slate-300">
              <li>• New players who need an order of operations, not a wall of text.</li>
              <li>• Returning players who forgot which gym came before George's.</li>
              <li>• Traders who need an item ID in two seconds.</li>
              <li>• Directors and faction leaders modelling real numbers.</li>
              <li>• Anyone who has ever ctrl-F'd the wiki and given up.</li>
              <li>• Brand new players who need an order of operations rather than a wall of text.</li>
            </ul>
          </Panel>

          <Panel>
            <SectionHeader title="Privacy" />
            <div className="space-y-2 p-4 text-xs leading-relaxed text-slate-300">
              <p>
                Lumbercorpedia has no accounts, no analytics and no server-side database. Your API key, favourites,
                calculator inputs and preferences live in your browser's local storage.
              </p>
              <p>
                The server exists for one reason: to relay your API calls to Torn without exposing your key to a
                third-party origin or a browser URL.
              </p>
            </div>
          </Panel>

          <Callout tone="amber" title="Unofficial and proud of it">
            Lumbercorpedia is a fan project. It is not affiliated with Torn or Chedburn Networks, and it does not try to
            be the official documentation — it tries to be the documentation that answers your question faster.
          </Callout>

          <Panel>
            <SectionHeader title="Known gaps" subtitle="Being honest about what is not finished." />
            <ul className="space-y-2 p-4 text-xs leading-relaxed text-slate-400">
              <li>• Course tables for 10 of the 12 education degrees (perks are complete).</li>
              <li>• Per-company star ratings and positions, pending a citable source.</li>
              <li>• Forgery and Scamming nerve-to-max records.</li>
              <li>• Full ammo table (calibre, clip and special-ammo availability beyond the entries shown).</li>
              <li>
                • Torn's post-2022 decreasing-rate gym curve above ~50m per stat — the published constants overstate
                gains there, and the app says so on the calculator pages instead of guessing the curve.
              </li>
              <li>
                • Live market prices for jump items and travel goods. The jump and travel planners ask you to enter the
                prices you actually see rather than publishing figures that go stale within a day.
              </li>
            </ul>
            <SourceNote>
              Contributions that add a citation are always better than contributions that add a guess.{' '}
              <Link to="/tools" className="link">
                See what is already built
              </Link>
              .
            </SourceNote>
          </Panel>
        </div>
      </div>
    </div>
  );
}
