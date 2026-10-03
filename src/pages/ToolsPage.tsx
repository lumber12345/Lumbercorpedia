import { Link } from 'react-router-dom';
import { Callout, Chip, PageHeader, Panel, SectionHeader } from '../components/ui';
import { useApp } from '../lib/store';
import { statShort } from '../lib/format';

const TOOLS = [
  {
    to: '/tools/gym',
    name: 'Gym gains calculator',
    tag: 'Training',
    what: 'One session, modelled train by train.',
    why: 'Applies the published Torn gain formula with your gym dots, happiness, stat total and modifiers — and shows happiness burn, which most calculators skip.',
    inputs: 'Stats · happy · energy · gym · modifier',
  },
  {
    to: '/tools/stats',
    name: 'Stat projection',
    tag: 'Planning',
    what: 'Where will I be in 90 days?',
    why: 'Compounds gains day by day because gains scale with your stat total. Also runs backwards to give you a target date.',
    inputs: 'Daily energy · daily happy · target stat',
  },
  {
    to: '/tools/boosters',
    name: 'Booster planner',
    tag: 'Drugs',
    what: 'Build a stack without wrecking your account.',
    why: 'Sums energy, nerve and happiness across a sequence of drugs, tracks cooldown windows and totals the addiction you are taking on.',
    inputs: 'Drug list · doses per day',
  },
  {
    to: '/tools/education',
    name: 'Education planner',
    tag: 'Long game',
    what: 'A degree that fits your real life.',
    why: 'Sequences prerequisites, applies the additive merit/WSU/principal reductions and reports the finish date plus the working stats you bank.',
    inputs: 'Degree · merits · WSU · job perk',
  },
  {
    to: '/tools/travel',
    name: 'Travel profit calculator',
    tag: 'Money',
    what: 'Is this abroad run worth it?',
    why: 'Counts buy price, quantity, flight cost, hotel night and trade fee, then compares selling on the item market or to a bazaar.',
    inputs: 'Buy price · sell price · qty · travel cost',
  },
  {
    to: '/tools/company',
    name: 'Company profit calculator',
    tag: 'Directors',
    what: 'What does my company actually make?',
    why: 'Breaks revenue down into wages, advertising, upkeep, stock and director cut, then returns margin and the break-even wage per employee.',
    inputs: 'Revenue · staff · wages · costs',
  },
];

export default function ToolsPage() {
  const training = useApp((state) => state.training);
  const apiKey = useApp((state) => state.apiKey);
  const total = training.stats.strength + training.stats.speed + training.stats.defense + training.stats.dexterity;

  return (
    <div>
      <PageHeader
        eyebrow="Tools"
        title="The toolkit"
        description="Six calculators built on published mechanics and transparent maths. Every one shows its formula, so you can argue with the answer instead of trusting it."
        right={
          <>
            <Chip tone="amber">Stat total {statShort(total)}</Chip>
            <Chip tone={apiKey ? 'green' : 'neutral'}>{apiKey ? 'Torn key connected' : 'No key connected'}</Chip>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {TOOLS.map((tool) => (
          <Panel key={tool.to} className="flex flex-col p-4">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-base font-semibold text-slate-100">{tool.name}</h3>
              <Chip tone="neutral">{tool.tag}</Chip>
            </div>
            <p className="mt-1 text-xs font-medium text-amber-300/90">{tool.what}</p>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">{tool.why}</p>
            <div className="mt-3 text-[10px] uppercase tracking-wider text-slate-500">Inputs: {tool.inputs}</div>
            <Link to={tool.to} className="btn btn-primary mt-4 text-xs">
              Open tool
            </Link>
          </Panel>
        ))}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <Panel>
          <SectionHeader
            title="Bring your own numbers"
            subtitle="Connect a limited-access Torn API key and the calculators can be seeded with your real battle stats, bars and cooldowns."
            right={
              <Link to="/profile" className="btn text-xs">
                {apiKey ? 'Manage connection' : 'Connect a key'}
              </Link>
            }
          />
          <div className="px-4 py-3 text-xs leading-relaxed text-slate-400">
            The key is stored in your browser only. When a calculator needs data, Lumbercorpedia relays a single
            request to api.torn.com from its own server and never writes your key anywhere. Use a limited-access key with
            only the selections you need.
          </div>
        </Panel>

        <Callout tone="amber" title="Honest maths policy">
          Anything derived from a published formula is shown with that formula. Anything based on community observation
          is labelled an estimate. Anything unknowable is left blank rather than filled with a plausible-looking number.
        </Callout>
      </div>
    </div>
  );
}
