import { Link } from 'react-router-dom';
import { Callout, Chip, PageHeader, Panel, SectionHeader } from '../components/ui';
import { useApp } from '../lib/store';
import { statShort } from '../lib/format';

const TOOLS = [
  {
    to: '/start',
    name: 'New player roadmap',
    tag: 'Start here',
    what: 'The order of operations for your first weeks.',
    why: 'A phased checklist — foundation, unlocking travel at level 15, building the money engine, then compounding stats — with every task tagged verified or community play.',
    inputs: 'Level · donator status · login cadence',
  },
  {
    to: '/tools/energy',
    name: 'Energy planner',
    tag: 'Start here',
    what: 'Stop throwing regeneration away.',
    why: 'Energy regenerates into a cap and anything past it is lost. This shows when your bar fills, what your login routine costs you, and what a better cadence is worth in gym trains.',
    inputs: 'Current energy · logins per day · donator',
  },
  {
    to: '/tools/jumps',
    name: 'Jump planner',
    tag: 'Stats',
    what: 'Candy jumps and happy jumps, modelled.',
    why: 'Stacks happiness above your maximum, doubles it with Ecstasy, then trains a thousand energy in one sitting — with the gain difference shown using the real gym formula.',
    inputs: 'Base happy · happy items · energy pool',
  },
  {
    to: '/tools/merits',
    name: 'Merit planner',
    tag: 'Start here',
    what: 'Where your first merits should go.',
    why: 'Merit upgrades cost 1, 2, 3 … 10 merits inside each line, so the first ones are worth ten times the last. Shows the real cost curve and recommends an order.',
    inputs: 'Merits available · what you are optimising for',
  },
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
        description="Nine tools built on published mechanics and transparent maths. Every one shows its formula, so you can argue with the answer instead of trusting it. New to Torn? Start with the roadmap, then the energy planner."
        right={
          <>
            <Chip tone="amber">Stat total {statShort(total)}</Chip>
            <Chip tone={apiKey ? 'green' : 'neutral'}>{apiKey ? 'Torn key connected' : 'No key connected'}</Chip>
          </>
        }
      />

      <Callout tone="amber" title="Brand new to Torn?">
        The single biggest early-game win is not a calculator — it is spending every point of energy before your bar caps.
        Work through the{' '}
        <Link to="/start" className="link">
          new player roadmap
        </Link>{' '}
        first, then use the rest of these tools to tune it.
      </Callout>
      <div className="mt-4" />

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
