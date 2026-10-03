import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Callout, Chip, Field, NumberInput, PageHeader, Panel, SectionHeader, SourceNote, Stat, Toggle } from '../components/ui';
import {
  BridgeError,
  TORN_ERROR_HELP,
  TornApiError,
  callTorn,
  checkConnection,
  type Diagnostics,
} from '../lib/tornApi';
import { MAX_ENERGY_BASE, MAX_ENERGY_DONATOR } from '../lib/energy';
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
    energy?: { current: number; maximum: number };
    nerve?: { current: number; maximum: number };
    happy?: { current: number; maximum: number };
    life?: { current: number; maximum: number };
  };
  money?: { cash?: number; points?: number; tokens?: number; vault?: number };
  cooldowns?: { drug?: number; medical?: number; booster?: number };
  battlestats?: { strength: number; speed: number; defense: number; dexterity: number };
}

const STAGE_LABEL: Record<string, string> = {
  dns: 'DNS lookup of api.torn.com',
  tcp: 'TCP connection to port 443',
  https: 'HTTPS request to the Torn API',
};

function ConnectionCheck({ diagnostics, onRerun, running }: { diagnostics: Diagnostics | null; onRerun: () => void; running: boolean }) {
  return (
    <Panel>
      <SectionHeader
        title="Connection check"
        subtitle="Whether this server can actually reach api.torn.com — tested stage by stage, because DNS, TCP and HTTPS fail for different reasons."
        right={
          <button className="btn btn-ghost text-xs" onClick={onRerun} disabled={running}>
            {running ? 'Testing…' : 'Re-test'}
          </button>
        }
      />

      {!diagnostics ? (
        <div className="px-4 py-4 text-xs text-slate-500">Running the connection check…</div>
      ) : (
        <>
          <div className="flex items-center gap-2 border-b border-ink-700/60 px-4 py-2.5">
            <span
              className={`h-2 w-2 rounded-full ${
                diagnostics.reachable ? 'bg-emerald-400' : diagnostics.error ? 'bg-slate-500' : 'bg-red-400'
              }`}
            />
            <span className={`text-xs font-medium ${diagnostics.reachable ? 'text-emerald-300' : 'text-slate-200'}`}>
              {diagnostics.reachable ? 'Torn API reachable' : 'Torn API not reachable from this server'}
            </span>
            <span className="ml-auto text-[10px] text-slate-500">
              checked {new Date(diagnostics.checkedAt).toLocaleTimeString()}
            </span>
          </div>

          {diagnostics.stages.length > 0 ? (
            <ul className="divide-y divide-ink-700/50">
              {diagnostics.stages.map((stage) => (
                <li key={stage.stage} className="flex items-start gap-3 px-4 py-2.5">
                  <span className={`mt-0.5 text-[11px] ${stage.ok ? 'text-emerald-400' : 'text-red-400'}`}>
                    {stage.ok ? '✓' : '✕'}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs text-slate-200">{STAGE_LABEL[stage.stage] ?? stage.stage}</span>
                      <span className="mono shrink-0 text-[10px] text-slate-500">{stage.ms} ms</span>
                    </div>
                    <p className="mt-0.5 break-words text-[11px] text-slate-500">{stage.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="px-4 py-3">
            <p className="text-[11px] leading-relaxed text-slate-400">{diagnostics.summary}</p>
          </div>
        </>
      )}
    </Panel>
  );
}

export default function ProfilePage() {
  const apiKey = useApp((state) => state.apiKey);
  const setApiKey = useApp((state) => state.setApiKey);
  const setTraining = useApp((state) => state.setTraining);
  const training = useApp((state) => state.training);
  const prefs = useApp((state) => state.newPlayer);
  const setPrefs = useApp((state) => state.setNewPlayer);

  const [draft, setDraft] = useState(apiKey);
  const [payload, setPayload] = useState<ProfilePayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [failure, setFailure] = useState<{ message: string; hint?: string; kind?: string; detail?: string } | null>(null);
  const [diagnostics, setDiagnostics] = useState<Diagnostics | null>(null);
  const [testing, setTesting] = useState(false);

  const runCheck = useCallback(async (force = false) => {
    setTesting(true);
    const report = await checkConnection(force);
    setDiagnostics(report);
    setTesting(false);
  }, []);

  useEffect(() => {
    void runCheck(true);
  }, [runCheck]);

  const load = async () => {
    setLoading(true);
    setFailure(null);
    try {
      const data = await callTorn<ProfilePayload>({
        section: 'user',
        selections: ['profile', 'bars', 'money', 'cooldowns', 'battlestats'],
        key: draft,
      });
      setPayload(data);
      setApiKey(draft);
      // Level and donator status are visible on every profile payload, so keep
      // the new player tools in sync for free.
      if (data.profile?.level) setPrefs({ level: data.profile.level });
    } catch (caught) {
      if (caught instanceof TornApiError) {
        setFailure({ message: TORN_ERROR_HELP[caught.code] ?? caught.message, kind: 'torn', detail: `Torn error ${caught.code}` });
      } else if (caught instanceof BridgeError) {
        setFailure({ message: caught.message, hint: caught.hint, kind: caught.kind, detail: caught.detail });
      } else if (caught instanceof Error) {
        setFailure({ message: caught.message, kind: 'unknown' });
      } else {
        setFailure({ message: 'Something went wrong talking to Torn.', kind: 'unknown' });
      }
      setPayload(null);
      // A failed call is worth re-checking connectivity for: it tells the
      // player whether the problem is their key or the host.
      void runCheck(true);
    } finally {
      setLoading(false);
    }
  };

  const pushStats = () => {
    if (payload?.battlestats) {
      setTraining({
        stats: {
          strength: payload.battlestats.strength,
          speed: payload.battlestats.speed,
          defense: payload.battlestats.defense,
          dexterity: payload.battlestats.dexterity,
        },
      });
      return;
    }
    setTraining({ stats: manual.stats });
  };

  const pushBars = () => {
    setTraining({
      happy: payload?.bars?.happy?.maximum ?? manual.happy,
      dailyEnergy: (payload?.bars?.energy?.maximum ?? manual.maxEnergy) * 2,
    });
  };

  const [manual, setManual] = useState({
    stats: { ...training.stats },
    happy: training.happy,
    maxEnergy: prefs.donator ? MAX_ENERGY_DONATOR : MAX_ENERGY_BASE,
  });

  const totalStats = payload?.battlestats
    ? payload.battlestats.strength + payload.battlestats.speed + payload.battlestats.defense + payload.battlestats.dexterity
    : 0;

  const offline = diagnostics && !diagnostics.reachable;

  return (
    <div>
      <PageHeader
        eyebrow="Account"
        title="My Torn data"
        description="Pull your real stats, bars and cooldowns into every calculator. The key is stored in your browser and relayed one request at a time by the Lumbercorpedia server — it is never written to a database."
        right={
          <Chip tone={diagnostics?.reachable ? (apiKey ? 'green' : 'neutral') : 'amber'}>
            {diagnostics === null
              ? 'Checking connection…'
              : diagnostics.reachable
                ? apiKey
                  ? 'Connected'
                  : 'Torn reachable'
                : 'Torn unreachable from here'}
          </Chip>
        }
      />

      {offline ? (
        <div className="mb-5">
          <Callout tone="amber" title="Live Torn data is unavailable on this host">
            The app server cannot open a connection to api.torn.com, so importing your account will fail no matter what
            key you use — this is a network restriction on the host, not a problem with your key. Everything else in
            Lumbercorpedia runs entirely offline: all databases, the roadmap, and every calculator works with numbers
            you enter. To use live data, run the app somewhere with outbound internet access (your own machine works):
            {' '}
            <span className="mono text-[11px]">npm run build &amp;&amp; npm start</span>.
          </Callout>
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[420px_1fr]">
        <div className="space-y-5">
          <ConnectionCheck diagnostics={diagnostics} onRerun={() => void runCheck(true)} running={testing} />

          <Panel>
            <SectionHeader title="API key" subtitle="Preferences → API in Torn. A limited-access key is enough for everything here." />
            <div className="space-y-4 p-4">
              <Field label="Your key" hint="Stored locally; sent only to api.torn.com through this app's server.">
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

              {failure ? (
                <Callout tone="red" title={failure.kind === 'torn' ? 'Torn said no' : 'Import failed'}>
                  <div>{failure.message}</div>
                  {failure.hint ? <div className="mt-1.5 text-slate-400">{failure.hint}</div> : null}
                  {failure.detail ? <div className="mono mt-1.5 text-[10px] text-slate-500">{failure.detail}</div> : null}
                  {failure.kind && failure.kind !== 'torn' ? (
                    <div className="mt-2">
                      <Link to="/about" className="link">
                        What this means →
                      </Link>
                    </div>
                  ) : null}
                </Callout>
              ) : null}
            </div>
            <SourceNote>
              Requests run through <span className="mono">/api/torn</span>, which allow-lists Torn's sections and
              selections and rejects anything else. Your key is never logged or persisted server-side.
            </SourceNote>
          </Panel>

          <Panel>
            <SectionHeader
              title="No API? Enter it manually"
              subtitle="Everything the calculators need can be typed in. Useful when the API is unavailable, or if you would rather not share a key at all."
            />
            <div className="space-y-4 p-4">
              <div className="grid grid-cols-2 gap-3">
                {([
                  ['strength', 'Strength'],
                  ['speed', 'Speed'],
                  ['defense', 'Defense'],
                  ['dexterity', 'Dexterity'],
                ] as const).map(([key, label]) => (
                  <Field key={key} label={label} className="mb-0">
                    <NumberInput
                      value={manual.stats[key]}
                      onChange={(value) => setManual((current) => ({ ...current, stats: { ...current.stats, [key]: value } }))}
                    />
                  </Field>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Max happiness">
                  <NumberInput value={manual.happy} onChange={(value) => setManual((current) => ({ ...current, happy: value }))} max={99_999} />
                </Field>
                <Field label="Max energy">
                  <NumberInput value={manual.maxEnergy} onChange={(value) => setManual((current) => ({ ...current, maxEnergy: value }))} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Level">
                  <NumberInput value={prefs.level} onChange={(value) => setPrefs({ level: value })} max={100} />
                </Field>
                <div className="flex items-end">
                  <Toggle
                    checked={prefs.donator}
                    onChange={(value) => setPrefs({ donator: value })}
                    label="Donator"
                    hint="Raises energy cap"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button className="btn btn-primary text-xs" onClick={pushStats}>
                  Use these stats
                </button>
                <button className="btn text-xs" onClick={pushBars}>
                  Use these bars
                </button>
                <Link to="/tools/gym" className="btn btn-ghost text-xs">
                  Open gym calculator →
                </Link>
              </div>
            </div>
            <SourceNote>
              Manual values are written into the same store the API import uses, so every calculator treats them
              identically. Nothing is sent anywhere.
            </SourceNote>
          </Panel>

          <Callout tone="amber" title="Security habits worth keeping">
            Create a key with only the selections you need, never paste it into a site you do not control, and revoke it
            in Torn if you stop using a tool. Lumbercorpedia only asks for read access to your own profile, bars, money,
            cooldowns and battle stats.
          </Callout>
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
                  <SectionHeader
                    title="Battle stats"
                    right={
                      <button className="btn text-xs" onClick={pushStats}>
                        Use in calculators
                      </button>
                    }
                  />
                  <div className="grid grid-cols-2 gap-3 p-4">
                    <Stat label="Strength" value={statShort(payload.battlestats?.strength ?? 0)} tone="amber" />
                    <Stat label="Speed" value={statShort(payload.battlestats?.speed ?? 0)} tone="amber" />
                    <Stat label="Defense" value={statShort(payload.battlestats?.defense ?? 0)} tone="amber" />
                    <Stat label="Dexterity" value={statShort(payload.battlestats?.dexterity ?? 0)} tone="amber" />
                  </div>
                  <SourceNote>
                    Total battle stats: <span className="mono text-slate-300">{statShort(totalStats)}</span>. Torn returns
                    these as raw integers in the v1 API.
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
              <SectionHeader
                title="No live data loaded"
                subtitle={
                  diagnostics?.reachable
                    ? 'Paste a key on the left and hit verify, or enter your numbers manually.'
                    : 'This host cannot reach api.torn.com. Use the manual entry panel and the values below will drive every calculator.'
                }
              />
              <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4">
                {(['Strength', 'Speed', 'Defense', 'Dexterity'] as const).map((label, index) => {
                  const key = (['strength', 'speed', 'defense', 'dexterity'] as const)[index];
                  return <Stat key={label} label={label} value={statShort(training.stats[key])} tone="amber" />;
                })}
              </div>
              <div className="grid grid-cols-2 gap-3 px-4 pb-4 sm:grid-cols-4">
                <Stat label="Stat total" value={statShort(training.stats.strength + training.stats.speed + training.stats.defense + training.stats.dexterity)} />
                <Stat label="Happy" value={num(training.happy)} />
                <Stat label="Level" value={prefs.level} hint={prefs.level >= 15 ? 'travel unlocked' : 'travel at 15'} />
                <Stat label="Energy cap" value={prefs.donator ? MAX_ENERGY_DONATOR : MAX_ENERGY_BASE} />
              </div>
              <SourceNote>
                These are the values currently used by the gym, projection, jump and energy tools. Everything below the
                fold on this page is optional — the calculators work with or without a key.
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
