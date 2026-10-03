/**
 * Torn API client.
 *
 * Requests go to Lumbercorpedia's own /api/torn bridge, which validates the
 * section/selections and forwards to api.torn.com server-side. That keeps the
 * key out of browser URLs, out of CORS preflights, and out of any third-party
 * origin.
 *
 * Failure handling is deliberately explicit. A reverse proxy, a container
 * network or an offline host can all produce a non-JSON error page, and the
 * difference between "your key is wrong" and "this server cannot reach Torn"
 * is the difference between a fixable problem and a confusing one.
 */

export interface TornCall {
  section: 'user' | 'faction' | 'company' | 'property' | 'market' | 'torn' | 'key';
  selections: string[];
  id?: number | string;
  key: string;
}

export interface TornError {
  code: number;
  error: string;
}

export class TornApiError extends Error {
  code: number;
  constructor(error: TornError) {
    super(error.error);
    this.code = error.code;
    this.name = 'TornApiError';
  }
}

/** A failure raised by the bridge itself (not by Torn). */
export class BridgeError extends Error {
  status: number;
  kind: BridgeKind;
  hint?: string;
  detail?: string;
  constructor(input: { message: string; status: number; kind: BridgeKind; hint?: string; detail?: string }) {
    super(input.message);
    this.name = 'BridgeError';
    this.status = input.status;
    this.kind = input.kind;
    this.hint = input.hint;
    this.detail = input.detail;
  }
}

export type BridgeKind =
  | 'blocked'
  | 'dns'
  | 'timeout'
  | 'tls'
  | 'network'
  | 'upstream'
  | 'server'
  | 'request'
  | 'http';

/**
 * Turn a failed bridge response into a usable error.
 *
 * Pure and exported so it can be tested directly — an unhelpful "Bridge error
 * (502)" is exactly the failure mode this function exists to prevent.
 */
export function describeBridgeFailure(status: number, contentType: string, bodyText: string): BridgeError {
  const trimmed = (bodyText ?? '').trim();
  let parsed: { error?: string; kind?: string; hint?: string; detail?: string } | null = null;

  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      parsed = null;
    }
  }

  if (parsed?.error) {
    return new BridgeError({
      message: parsed.error,
      status,
      kind: (parsed.kind as BridgeKind) ?? 'http',
      hint: parsed.hint,
      detail: parsed.detail,
    });
  }

  const isHtml = trimmed.startsWith('<') || contentType.includes('html');
  if (isHtml) {
    return new BridgeError({
      message: `The Lumbercorpedia server could not be reached properly — a proxy or host returned its own error page (HTTP ${status}).`,
      status,
      kind: 'network',
      hint:
        'Something between the browser and the app answered instead of the app. Check that the server is running, then run the connection check on this page.',
      detail: trimmed.slice(0, 200),
    });
  }

  if (!trimmed) {
    return new BridgeError({
      message: `The Lumbercorpedia server returned an empty response (HTTP ${status}).`,
      status,
      kind: 'server',
      hint: 'The server may have restarted or crashed mid-request. Re-run the connection check on this page.',
    });
  }

  return new BridgeError({
    message: `The bridge rejected the request (HTTP ${status}).`,
    status,
    kind: 'http',
    detail: trimmed.slice(0, 200),
  });
}

export async function callTorn<T = unknown>(call: TornCall): Promise<T> {
  let res: Response;
  try {
    res = await fetch('/api/torn', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        section: call.section,
        id: call.id ?? '',
        selections: call.selections.join(','),
        key: call.key,
        comment: 'Lumbercorpedia',
      }),
    });
  } catch (error) {
    throw new BridgeError({
      message: 'Could not reach the Lumbercorpedia server at all.',
      status: 0,
      kind: 'network',
      hint: 'The app server is not responding. If you are running the dev server, start the API with `npm run api`.',
      detail: error instanceof Error ? error.message : undefined,
    });
  }

  const bodyText = await res.text();

  if (!res.ok) {
    throw describeBridgeFailure(res.status, res.headers.get('content-type') ?? '', bodyText);
  }

  let envelope: { ok: boolean; status: number; data: Record<string, unknown> };
  try {
    envelope = JSON.parse(bodyText);
  } catch {
    throw new BridgeError({
      message: 'The bridge returned a response the app could not read.',
      status: res.status,
      kind: 'network',
      detail: bodyText.slice(0, 200),
    });
  }

  const data = envelope.data ?? {};
  if (data && typeof data === 'object' && 'error' in data) {
    throw new TornApiError(data.error as TornError);
  }
  return data as T;
}

/* --------------------------------------------------------------- diagnostics */

export interface DiagnosticStage {
  stage: 'dns' | 'tcp' | 'https';
  ok: boolean;
  ms: number;
  detail: string;
}

export interface Diagnostics {
  host: string;
  reachable: boolean;
  stages: DiagnosticStage[];
  blockingStage: DiagnosticStage['stage'] | null;
  summary: string;
  checkedAt: string;
  cached?: boolean;
  error?: string;
}

/** Ask the server whether it can actually reach api.torn.com. */
export async function checkConnection(force = false): Promise<Diagnostics> {
  try {
    const res = await fetch(`/api/diagnostics${force ? '?force=1' : ''}`);
    const text = await res.text();
    if (!res.ok) {
      const parsed = text.trim().startsWith('{') ? (JSON.parse(text) as { error?: string }) : {};
      return {
        host: 'api.torn.com',
        reachable: false,
        stages: [],
        blockingStage: null,
        summary: parsed.error ?? `Diagnostics endpoint returned HTTP ${res.status}.`,
        checkedAt: new Date().toISOString(),
        error: 'diagnostics-unavailable',
      };
    }
    return JSON.parse(text) as Diagnostics;
  } catch (error) {
    return {
      host: 'api.torn.com',
      reachable: false,
      stages: [],
      blockingStage: null,
      summary: 'Could not reach the Lumbercorpedia server to run the connection check.',
      checkedAt: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'unknown',
    };
  }
}

/** Human explanations for the Torn error codes players actually hit. */
export const TORN_ERROR_HELP: Record<number, string> = {
  1: 'The bridge sent a malformed request.',
  2: 'Torn says that API key is incorrect. Copy it again from Preferences → API.',
  5: 'Torn is rate limiting this key (100 requests/minute). Wait a moment and retry.',
  6: 'That key does not have permission for this selection — raise its access level.',
  7: 'Torn is temporarily unavailable.',
  8: 'That IP is banned from the Torn API.',
  9: 'That API key has been paused by staff.',
  10: 'The owner of that key is in federal jail.',
  11: 'That key is not a valid key format.',
  13: 'Torn could not find that user.',
  16: 'That selection requires a higher access level on your API key.',
  17: 'That user has been banned and cannot be looked up.',
  18: 'That key has been disabled by its owner.',
  19: 'That API key has expired.',
  21: 'That API key no longer exists.',
  22: 'The owner of that key is in federal jail.',
};
