/**
 * Torn API client.
 *
 * Requests go to Lumbercorpedia's own /api/torn bridge, which validates the
 * section/selections and forwards to api.torn.com server-side. That keeps the
 * key out of browser URLs, out of CORS preflights, and out of any third-party
 * origin.
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

export async function callTorn<T = unknown>(call: TornCall): Promise<T> {
  const res = await fetch('/api/torn', {
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

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error || `Bridge error (${res.status})`);
  }

  const envelope = (await res.json()) as { ok: boolean; data: Record<string, unknown> };
  const data = envelope.data ?? {};
  if (data && typeof data === 'object' && 'error' in data) {
    const err = data.error as TornError;
    throw new TornApiError(err);
  }
  return data as T;
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
