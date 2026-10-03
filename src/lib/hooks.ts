import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

/** Debounce a rapidly-changing value (search boxes, sliders). */
export function useDebounced<T>(value: T, delay = 180): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

/**
 * URL-backed state: pages stay shareable and the ⌘K palette can deep-link into
 * a filtered view.
 */
export function useQueryState(name: string, fallback = ''): [string, (value: string) => void] {
  const [params, setParams] = useSearchParams();
  const value = params.get(name) ?? fallback;
  const setValue = (next: string) => {
    const copy = new URLSearchParams(params);
    if (next) copy.set(name, next);
    else copy.delete(name);
    setParams(copy, { replace: true });
  };
  return [value, setValue];
}

/** localStorage-backed boolean map, used for checklists (unlocked gyms, etc.). */
export function usePersistentSet(key: string): [Set<string>, (id: string) => void, (ids: string[]) => void] {
  const [ids, setIds] = useState<string[]>(() => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(ids));
    } catch {
      /* storage full or blocked — the tool still works for this session */
    }
  }, [key, ids]);

  const set = useMemo(() => new Set(ids), [ids]);
  const toggle = (id: string) => setIds((current) => (current.includes(id) ? current.filter((x) => x !== id) : [...current, id]));
  return [set, toggle, setIds];
}

/** Copy-to-clipboard with a short-lived "copied" flag for button feedback. */
export function useCopy(timeout = 1200): [string | null, (text: string, label?: string) => void] {
  const [copied, setCopied] = useState<string | null>(null);
  useEffect(() => {
    if (!copied) return undefined;
    const timer = window.setTimeout(() => setCopied(null), timeout);
    return () => window.clearTimeout(timer);
  }, [copied, timeout]);
  const copy = (text: string, label?: string) => {
    navigator.clipboard?.writeText(text).then(
      () => setCopied(label ?? text),
      () => setCopied(null),
    );
  };
  return [copied, copy];
}

/** Rough count-up animation for dashboard headline numbers. */
export function useCountUp(target: number, duration = 700): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      setValue(Math.round(target * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);
  return value;
}
