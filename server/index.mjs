/**
 * Lumbercorpedia server.
 *
 * Two jobs:
 *   1. Serve the built single-page app (./dist).
 *   2. Act as a hardened bridge to the official Torn API so browser code never
 *      has to talk cross-origin to api.torn.com (and so a player's API key is
 *      never embedded in a URL we log).
 *
 * The bridge is deliberately dumb and allow-listed: no user-supplied host, no
 * user-supplied path. Sections and selections are validated against Torn's own
 * published lists.
 *
 * NETWORK REALITY: if the host this runs on has no outbound access to
 * api.torn.com (sandboxes, locked-down containers, some CI), every API call
 * fails. Rather than returning an opaque 502, this server classifies the
 * failure, exposes it at /api/diagnostics, and always answers with JSON so the
 * UI can explain what happened instead of showing a status code.
 */
import express from 'express';
import compression from 'compression';
import path from 'node:path';
import net from 'node:net';
import dns from 'node:dns';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const PORT = Number(process.env.PORT || 8787);
const HOST = process.env.HOST || '0.0.0.0';

const TORN_HOST = 'api.torn.com';
const TORN_BASE = `https://${TORN_HOST}`;
/** Kept well under typical reverse-proxy timeouts so we answer first. */
const TORN_TIMEOUT_MS = 8_000;
const CONNECT_TIMEOUT_MS = 5_000;

/** Torn API v1 sections Lumbercorpedia is allowed to relay. */
const ALLOWED_SECTIONS = new Set(['user', 'faction', 'company', 'property', 'market', 'torn', 'key']);

/** Torn API v1 selections (per the official API docs). */
const ALLOWED_SELECTIONS = new Set([
  // user
  'ammo', 'attacks', 'attacksfull', 'bars', 'battlestats', 'bazaar', 'cooldowns', 'crimes',
  'discord', 'display', 'education', 'equipment', 'events', 'gym', 'honors', 'icons', 'inventory',
  'job', 'jobpoints', 'lookup', 'medals', 'merits', 'messages', 'missions', 'money', 'networth',
  'notifications', 'perks', 'personalstats', 'profile', 'properties', 'refills', 'reports',
  'revives', 'revivesfull', 'skills', 'stocks', 'travel', 'weapons', 'workstats',
  // faction
  'applications', 'armor', 'armorynews', 'attacknews', 'attacks', 'attacksfull', 'basic',
  'chain', 'chainreport', 'chains', 'contributors', 'crimeexp', 'crimes', 'currency', 'donations',
  'fundsnews', 'medicalnews', 'membershipnews', 'news', 'positions', 'rankedwars', 'raids',
  'revives', 'revivesfull', 'stats', 'territory', 'territorynews', 'upgrades', 'weapons',
  // company
  'companies', 'detailed', 'employees', 'news', 'stock',
  // property
  'property', 'timestamp',
  // market
  'bazaar', 'itemmarket', 'pointsmarket',
  // torn
  'bank', 'cards', 'cityshops', 'competition', 'education', 'factiontree', 'gyms', 'honors',
  'itemdetails', 'items', 'itemstats', 'logcategories', 'logtypes', 'medals', 'organizedcrimes',
  'properties', 'stocks', 'territory',
  // key
  'info',
]);

// ---------------------------------------------------------------------------
// Network diagnostics
// ---------------------------------------------------------------------------

/**
 * Turn a low-level socket/DNS/fetch error into something a player can act on.
 * This is the difference between "Bridge error (502)" and "this host cannot
 * reach api.torn.com, run it somewhere with internet access".
 */
export function classifyNetworkError(error) {
  const code = error?.cause?.code ?? error?.code ?? '';
  const raw = String(error?.cause?.message ?? error?.message ?? error ?? '');

  if (code === 'ENOTFOUND' || code === 'EAI_AGAIN') {
    return {
      kind: 'dns',
      message: `Cannot resolve ${TORN_HOST} from this server — DNS is unavailable or blocked.`,
      hint: 'The host running Lumbercorpedia has no DNS egress. Every offline feature still works.',
    };
  }
  if (code === 'ECONNRESET') {
    return {
      kind: 'blocked',
      message: `The connection to ${TORN_HOST} was reset (ECONNRESET) — outbound traffic to it is being blocked or filtered.`,
      hint:
        'This is typical of a sandbox or locked-down container. Run Lumbercorpedia on a machine with internet access (or a host that allows outbound HTTPS) to use live Torn data.',
    };
  }
  if (code === 'ECONNREFUSED') {
    return {
      kind: 'blocked',
      message: `The connection to ${TORN_HOST} was refused.`,
      hint: 'A firewall or proxy is refusing outbound HTTPS from this server.',
    };
  }
  if (code === 'ETIMEDOUT' || code === 'UND_ERR_CONNECT_TIMEOUT' || code === 'UND_ERR_HEADERS_TIMEOUT') {
    return {
      kind: 'timeout',
      message: `${TORN_HOST} did not respond in time.`,
      hint: 'Either Torn is slow right now, or outbound traffic is being silently dropped.',
    };
  }
  if (code === 'CERT_HAS_EXPIRED' || code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE' || code === 'SELF_SIGNED_CERT_IN_CHAIN' || /certificate/i.test(raw)) {
    return {
      kind: 'tls',
      message: `The TLS handshake with ${TORN_HOST} failed (${code || 'certificate error'}).`,
      hint: 'Something on the network path is intercepting HTTPS. Lumbercorpedia will not bypass certificate validation.',
    };
  }
  if (error?.name === 'AbortError') {
    return {
      kind: 'timeout',
      message: `The request to ${TORN_HOST} timed out after ${TORN_TIMEOUT_MS / 1000}s.`,
      hint: 'Torn may be slow, or the network is dropping packets.',
    };
  }
  return {
    kind: 'unknown',
    message: `Could not reach ${TORN_HOST}: ${raw || 'unknown network error'}`,
    hint: 'Check the server logs for details.',
  };
}

/** Raw TCP connect test — distinguishes "blocked" from "resolved but unreachable". */
function tcpConnect(host, port, timeoutMs = CONNECT_TIMEOUT_MS) {
  return new Promise((resolve) => {
    const started = Date.now();
    const socket = net.connect({ host, port });
    let settled = false;
    const done = (result) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve({ ...result, ms: Date.now() - started });
    };
    socket.setTimeout(timeoutMs);
    socket.once('connect', () => done({ ok: true }));
    socket.once('timeout', () => done({ ok: false, error: { message: 'TCP connect timed out', code: 'ETIMEDOUT' } }));
    socket.once('error', (error) => done({ ok: false, error }));
  });
}

let diagnosticsCache = null;
let diagnosticsCacheAt = 0;
const DIAGNOSTICS_TTL_MS = 10_000;

/**
 * Staged connectivity report: DNS → TCP → HTTPS → Torn API. Each stage is
 * independent so the UI can point at exactly which one fails.
 */
export async function runDiagnostics({ force = false } = {}) {
  if (!force && diagnosticsCache && Date.now() - diagnosticsCacheAt < DIAGNOSTICS_TTL_MS) {
    return { ...diagnosticsCache, cached: true };
  }

  const stages = [];

  // 1. DNS
  const dnsStart = Date.now();
  let addresses = [];
  try {
    addresses = await dns.promises.lookup(TORN_HOST, { all: true });
    stages.push({ stage: 'dns', ok: true, ms: Date.now() - dnsStart, detail: addresses.map((a) => a.address).join(', ') });
  } catch (error) {
    stages.push({ stage: 'dns', ok: false, ms: Date.now() - dnsStart, detail: classifyNetworkError(error).message });
  }

  // 2. TCP
  const tcp = await tcpConnect(TORN_HOST, 443);
  stages.push({
    stage: 'tcp',
    ok: tcp.ok,
    ms: tcp.ms,
    detail: tcp.ok ? `Opened a TCP connection to ${TORN_HOST}:443` : classifyNetworkError(tcp.error).message,
  });

  // 3. HTTPS request to Torn (no key: an auth error proves the path works)
  const httpStart = Date.now();
  let reachable = false;
  let httpDetail = 'skipped — TCP connection failed';
  try {
    const response = await fetch(`${TORN_BASE}/torn/?selections=items`, { signal: AbortSignal.timeout(TORN_TIMEOUT_MS) });
    const text = await response.text();
    reachable = true;
    httpDetail = `HTTP ${response.status} from ${TORN_HOST} (${text.slice(0, 80).trim()}…)`;
  } catch (error) {
    httpDetail = classifyNetworkError(error).message;
  }
  stages.push({ stage: 'https', ok: reachable, ms: Date.now() - httpStart, detail: httpDetail });

  const blocking = stages.find((stage) => !stage.ok);
  const result = {
    host: TORN_HOST,
    reachable,
    stages,
    blockingStage: blocking?.stage ?? null,
    /** The message the Profile page shows when live data is unavailable. */
    summary: reachable
      ? `This server can reach ${TORN_HOST}. Live Torn data is available.`
      : `This server cannot reach ${TORN_HOST}. ${
          blocking?.stage === 'tcp' || blocking?.stage === 'https'
            ? 'Outbound HTTPS is blocked or intercepted here — run Lumbercorpedia on a host with internet access to use live data.'
            : blocking?.detail ?? ''
        }`,
    checkedAt: new Date().toISOString(),
    cached: false,
  };

  diagnosticsCache = result;
  diagnosticsCacheAt = Date.now();
  return result;
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

const app = express();
app.disable('x-powered-by');
app.use(compression());
app.use(express.json({ limit: '32kb' }));

// ---------------------------------------------------------------------------
// Torn API bridge
// ---------------------------------------------------------------------------

/**
 * POST /api/torn
 * body: { section, id?, selections, key, comment? }
 * The key is used for exactly one upstream request and is never persisted.
 */
app.post('/api/torn', async (req, res) => {
  const { section, id, selections, key, comment } = req.body ?? {};

  if (typeof section !== 'string' || !ALLOWED_SECTIONS.has(section)) {
    return res.status(400).json({ error: 'Unknown Torn API section.', kind: 'request' });
  }
  if (typeof key !== 'string' || key.trim().length < 10) {
    return res.status(400).json({ error: 'A Torn API key is required for this request.', kind: 'request' });
  }
  const sel = String(selections || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (sel.length === 0) {
    return res.status(400).json({ error: 'At least one selection is required.', kind: 'request' });
  }
  const bad = sel.filter((s) => !ALLOWED_SELECTIONS.has(s));
  if (bad.length) {
    return res.status(400).json({ error: `Selection not allowed: ${bad.join(', ')}`, kind: 'request' });
  }
  const safeId = id === undefined || id === null || id === '' ? '' : String(id).replace(/[^0-9]/g, '');
  if (id !== undefined && id !== '' && safeId === '') {
    return res.status(400).json({ error: 'Numeric IDs only.', kind: 'request' });
  }

  const params = new URLSearchParams();
  params.set('selections', sel.join(','));
  params.set('key', key.trim());
  if (typeof comment === 'string' && comment) params.set('comment', comment.slice(0, 32));

  const url = `${TORN_BASE}/${section}/${safeId}?${params.toString()}`;

  try {
    const upstream = await fetch(url, {
      headers: { Accept: 'application/json', 'User-Agent': 'Lumbercorpedia/1.0' },
      signal: AbortSignal.timeout(TORN_TIMEOUT_MS),
    });
    const text = await upstream.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      return res.status(502).json({
        error: `Torn returned a non-JSON response (HTTP ${upstream.status}).`,
        kind: 'upstream',
        detail: text.slice(0, 200),
      });
    }
    // Pass Torn's own error envelope through untouched so the UI can explain it.
    return res.status(200).json({ ok: upstream.ok, status: upstream.status, data: json });
  } catch (error) {
    const classified = classifyNetworkError(error);
    // A blocked upstream is a server-environment problem (502), a slow one is a
    // timeout (504). Either way the client gets JSON with a usable message.
    return res.status(classified.kind === 'timeout' ? 504 : 502).json({
      error: classified.message,
      kind: classified.kind,
      hint: classified.hint,
      diagnostics: '/api/diagnostics',
    });
  }
});

/** Staged connectivity report so the UI can explain failures instead of guessing. */
app.get('/api/diagnostics', async (req, res) => {
  try {
    const report = await runDiagnostics({ force: req.query.force === '1' });
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: 'Diagnostics failed to run.', detail: String(error) });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'lumbercorpedia', version: '1.0.0', dist: fs.existsSync(DIST) });
});

// Unknown API routes must answer with JSON, never an HTML page.
app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Unknown Lumbercorpedia API route.', kind: 'request' });
});

// Any unhandled error under /api also answers with JSON. Without this, an
// exception mid-request turns into an HTML error page and the client can only
// report a bare status code.
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  if (req.path.startsWith('/api')) {
    console.error('[lumbercorpedia] api error:', error);
    return res.status(500).json({ error: 'Unexpected server error.', kind: 'server', detail: String(error?.message ?? error) });
  }
  return next(error);
});

// ---------------------------------------------------------------------------
// Static app
// ---------------------------------------------------------------------------

if (fs.existsSync(DIST)) {
  app.use(
    express.static(DIST, {
      index: false,
      setHeaders(res, filePath) {
        if (filePath.includes(`${path.sep}assets${path.sep}`)) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        }
      },
    }),
  );
  app.get('*', (_req, res) => res.sendFile(path.join(DIST, 'index.html')));
} else {
  app.get('*', (_req, res) =>
    res
      .status(200)
      .send(
        '<pre style="font:14px ui-monospace;padding:32px;color:#e6e9ee;background:#0d1014">' +
          'Lumbercorpedia server is running, but no production build was found.\n\n' +
          '  npm run build   # build the app\n' +
          '  npm start       # serve it\n\n' +
          'While developing, run the Vite dev server instead:\n\n' +
          '  npm run dev\n' +
          '  npx vite        # (in a second shell, if you want HMR UI)</pre>',
      ),
  );
}

app.listen(PORT, HOST, async () => {
  console.log(`[lumbercorpedia] listening on http://${HOST}:${PORT}`);
  const report = await runDiagnostics({ force: true });
  if (report.reachable) {
    console.log(`[lumbercorpedia] Torn API reachable (${report.stages.map((s) => `${s.stage}:${s.ok ? 'ok' : 'fail'}`).join(' ')})`);
  } else {
    console.warn(`[lumbercorpedia] WARNING: cannot reach ${TORN_HOST} — live Torn data unavailable.`);
    console.warn(`[lumbercorpedia]   ${report.summary}`);
    console.warn('[lumbercorpedia]   Everything else (databases, calculators, roadmap) works offline.');
  }
});
