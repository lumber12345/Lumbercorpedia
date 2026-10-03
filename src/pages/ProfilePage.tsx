import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Callout, Chip, Field, PageHeader, Panel, SectionHeader, SourceNote, Stat } from '../components/ui';
import { TORN_ERROR_HELP, callTorn, TornApiError } from '../lib/tornApi';
import { useApp } from '../lib/store';
import { clock, duration, money, num, statShort } from '../lib/format';

interface ProfilePayload {
  profile?: {
    id: number;
    name: string;
    level: number;
    rank: string;
    status?: { description?: string; state?: string; until?: number };
  };
  bars?: {
    energy?: { current: number; maximum: number; increment?: number; interval?: number };
    nerve?: { current: number; maximum: number };
    happy?: { current: number; maximum: number };
    life?: { current: number; maximum: number };
  };
  money?: { cash?: number; points?: number; tokens?: number; vault?: number };
  cooldowns?: { drug?: number; medical?: number; booster?: number };
  battlestats?: { strength: number; speed: number; defense: number; dexterity: number };
}

export default function ProfilePage() {
  const apiKey = useApp((state) => state.apiKey);
  const setApiKey = useApp((state) => state.setApiKey);
  const setTraining = useApp((state) => state.setTraining);
  const [draft, setDraft] = useState(apiKey);
  const [payload, setPayload] = useState<ProfilePayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await callTorn<ProfilePayload>({
        section: 'user',
        selections: ['profile', 'bars', 'money', 'cooldowns', 'battlestats'],
        key: draft,
      });
      setPayload(data);
      setApiKey(draft);
    } catch (caught) {
      if (caught instanceof TornApiError) {
        setError(TORN_ERROR_HELP[caught.code] ?? caught.message);
      } else if (caught instanceof Error) {
        setError(caught.message);
      } else {
        setError('Something went wrong talking to Torn.');
      }
      setPayload(null);
    } finally {
      setLoading(false);
    }
  };

  const pushStats = () => {
    if (!payload?.battlestats) return;
    setTraining({
      stats: {
        strength: payload.battlestats.strength,
        speed: payload.battlestats.speed,
        defense: payload.battlestats.defense,
        dexterity: payload.battlestats.dexterity,
      },
    });
  };

  const pushBars = () => {
    if (!payload?.bars) return;
    if (payload.bars.happy?.maximum) setTraining({ happy: payload.bars.happy.maximum });
    if (payload.bars.energy?.maximum) setTraining({ dailyEnergy: payload.bars.energy.maximum * 2 });
  };

  const totalStats = payload?.battlestats
    ? payload.battlestats.strength + payload.battlestats.speed + payload.battlestats.defense + payload.battlestats.dexterity
    : 0;

  return (
    <div>
      <PageHeader
        eyebrow="Account"
        title="My Torn data"
        description="Connect a Torn API key and Lumbercorpedia can seed every calculator with your real numbers instead of estimates. The key is stored in your browser's local storage and relayed one request at a time by the Lumbercorpedia server — it is never written to a database."
        right={<Chip tone={apiKey ? 'green' : 'neutral'}>{apiKey ? 'Connected' : 'Not connected'}</Chip>}
      />

      <div className="grid gap-5 lg:grid-cols-[420px_1fr]">
        <div className="space-y-5">
          <Panel>
            <SectionHeader title="API key" subtitle="Preferences → API in Torn. A limited-access key is enough for everything here." />
            <div className="space-y-4 p-4">
              <Field label="Your key" hint="16 characters. Stored locally, never sent anywhere except api.torn.com via this app's server.">
                <input
                  className="input mono"
                  type="password"
                  placeholder="xxxxxxxxxxxxxxxx"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value.trim())}
                  autoComplete="off"
                  spellCheck={false}
                />
              </Field>
              <div className="flex gap-2">
                <button className="btn btn-primary flex-1" onClick={load} disabled={draft.length < 10 || loading}>
                  {loading ? 'Verifying…' : 'Verify & import'}
                </button>
                {apiKey ? (
                  <button
                    className="btn"
                    onClick={() => {
                      setApiKey('');
                      setDraft('');
                      setPayload(null);
                    }}
                  >
                    Forget key
                  </button>
                ) : null}
              </div>
              {error ? <Callout tone="red" title="Torn said no">{error}</Callout> : null}
            </div>
            <SourceNote>
              Requests run through <span className="mono">/api/torn</span> on this app's own server, which allow-lists
              Torn's sections and selections and rejects anything else. Your key is never logged or persisted server-side.
            </SourceNote>
          </Panel>

          <Callout tone="amber" title="Security habits worth keeping">
            Create a key with only the selections you need, never paste it into a site you do not control, and revoke it
            in Torn if you stop using a tool. Lumbercorpedia only asks for read access to your own profile, bars, money,
            cooldowns and battle stats.
          </Callout>

          <Panel>
            <SectionHeader title="What gets imported" />
            <ul className="space-y-2 p-4 text-xs text-slate-300">
              <li>• Battle stats → the gym gains and stat projection calculators.</li>
              <li>• Bars → energy per day and starting happiness assumptions.</li>
              <li>• Money and cooldowns → displayed here for quick reference.</li>
              <li>
                • Nothing is written back to Torn — this is a read-only connection.{' '}
                <Link to="/tools/gym" className="link">
                  Open the calculator
                </Link>
                .
              </li>
            </ul>
          </Panel>
        </div>

        <div className="space-y-5">
          {payload?.profile ? (
            <>
              <Panel>
                <SectionHeader
                  title={payload.profile.name}
                  subtitle={`#${payload.profile.id} · level ${payload.profile.level} · ${payload.profile.rank}`}
                  right={
                    payload.profile.status?.description ? (
                      <Chip tone={payload.profile.status.state === 'Okay' ? 'green' : 'red'}>
                        {payload.profile.status.description}
                        {payload.profile.status.until
                          ? ` · ${duration((payload.profile.status.until * 1000 - Date.now()) / 60_000)}`
                          : ''}
                      </Chip>
                    ) : null
                  }
                />
                <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4">
                  <Stat label="Energy" value={payload.bars?.energy ? `${payload.bars.energy.current}/${payload.bars.energy.maximum}` : '—'} />
                  <Stat label="Nerve" value={payload.bars?.nerve ? `${payload.bars.nerve.current}/${payload.bars.nerve.maximum}` : '—'} />
                  <Stat label="Happy" value={payload.bars?.happy ? num(payload.bars.happy.current) : '—'} tone="green" />
                  <Stat label="Life" value={payload.bars?.life ? `${payload.bars.life.current}/${payload.bars.life.maximum}` : '—'} />
                </div>
              </Panel>

              <div className="grid gap-5 sm:grid-cols-2">
                <Panel>
                  <SectionHeader title="Battle stats" right={
                    <button className="btn text-xs" onClick={pushStats}>
                      Use in calculators
                    </button>
                  } />
                  <div className="grid grid-cols-2 gap-3 p-4">
                    <Stat label="Strength" value={statShort(payload.battlestats?.strength ?? 0)} tone="amber" />
                    <Stat label="Speed" value={statShort(payload.battlestats?.speed ?? 0)} tone="amber" />
                    <Stat label="Defense" value={statShort(payload.battlestats?.defense ?? 0)} tone="amber" />
                    <Stat label="Dexterity" value={statShort(payload.battlestats?.dexterity ?? 0)} tone="amber" />
                  </div>
                  <SourceNote>
                    Total battle stats: <span className="mono text-slate-300">{statShort(totalStats)}</span>. Torn
                    returns these as raw integers in the v1 API.
                  </SourceNote>
                </Panel>

                <Panel>
                  <SectionHeader title="Money & cooldowns" />
                  <div className="grid grid-cols-2 gap-3 p-4">
                    <Stat label="Cash on hand" value={money(payload.money?.cash ?? 0)} />
                    <Stat label="Points" value={num(payload.money?.points ?? 0)} />
                    <Stat label="Drug cooldown" value={payload.cooldowns?.drug ? clock(payload.cooldowns.drug) : 'Ready'} />
                    <Stat label="Medical cooldown" value={payload.cooldowns?.medical ? clock(payload.cooldowns.medical) : 'Ready'} />
                  </div>
                  <div className="flex gap-2 px-4 pb-4">
                    <button className="btn text-xs" onClick={pushBars}>
                      Use bars in the calculator
                    </button>
                  </div>
                </Panel>
              </div>
            </>
          ) : (
            <Panel>
              <SectionHeader title="No data loaded yet" subtitle="Paste a key on the left and hit verify." />
              <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4">
                {['Strength', 'Speed', 'Defense', 'Dexterity'].map((label) => (
                  <Stat key={label} label={label} value="—" />
                ))}
              </div>
              <SourceNote>
                Once loaded, this page shows your live bars, money, cooldowns and battle stats, and can push them
                straight into the gym and projection calculators.
              </SourceNote>
            </Panel>
          )}

          <Panel>
            <SectionHeader
              title="Which key level do I need?"
              subtitle="Everything Lumbercorpedia reads is available on a limited-access key."
            />
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-ink-700">
                    <th className="th">Selection</th>
                    <th className="th">Used for</th>
                    <th className="th">Minimum access</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['profile, bars, money', 'Identity, energy, happy and cash display', 'Public'],
                    ['battlestats', 'Calculator seeding and projections', 'Limited'],
                    ['cooldowns', 'Drug and medical timers', 'Limited'],
                  ].map(([selection, use, level]) => (
                    <tr key={selection} className="border-b border-ink-800/70">
                      <td className="td mono text-[11px] text-amber-300">{selection}</td>
                      <td className="td text-xs text-slate-300">{use}</td>
                      <td className="td text-xs text-slate-400">{level}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
