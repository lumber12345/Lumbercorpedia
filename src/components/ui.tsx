import type { ReactNode } from 'react';
import { useId } from 'react';

/* ------------------------------------------------------------------ layout */

export function Panel({
  children,
  className = '',
  as: Tag = 'section',
}: {
  children: ReactNode;
  className?: string;
  as?: 'section' | 'div' | 'article';
}) {
  return <Tag className={`panel ${className}`}>{children}</Tag>;
}

export function SectionHeader({
  title,
  subtitle,
  right,
  icon,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  right?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-ink-700/70 px-4 py-3">
      <div className="flex items-start gap-3">
        {icon ? <div className="mt-0.5 text-amber-400">{icon}</div> : null}
        <div>
          <h2 className="text-sm font-semibold tracking-wide text-slate-100">{title}</h2>
          {subtitle ? <p className="mt-0.5 max-w-2xl text-xs leading-relaxed text-slate-400">{subtitle}</p> : null}
        </div>
      </div>
      {right ? <div className="flex items-center gap-2">{right}</div> : null}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  right,
}: {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow ? (
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-500">{eyebrow}</div>
        ) : null}
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-[28px]">{title}</h1>
        {description ? (
          <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-slate-400">{description}</p>
        ) : null}
      </div>
      {right ? <div className="flex flex-wrap items-center gap-2">{right}</div> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ atoms */

const TONES = {
  neutral: 'border-ink-600 bg-ink-800 text-slate-300',
  amber: 'border-amber-600/50 bg-amber-500/10 text-amber-300',
  green: 'border-emerald-600/50 bg-emerald-500/10 text-emerald-300',
  red: 'border-red-600/50 bg-red-500/10 text-red-300',
  blue: 'border-sky-600/50 bg-sky-500/10 text-sky-300',
  violet: 'border-violet-600/50 bg-violet-500/10 text-violet-300',
} as const;

export type Tone = keyof typeof TONES;

export function Chip({
  children,
  tone = 'neutral',
  title,
  className = '',
}: {
  children: ReactNode;
  tone?: Tone;
  title?: string;
  className?: string;
}) {
  return (
    <span title={title} className={`chip ${TONES[tone]} ${className}`}>
      {children}
    </span>
  );
}

export function Stat({
  label,
  value,
  hint,
  tone = 'neutral',
  className = '',
}: {
  label: ReactNode;
  value: ReactNode;
  hint?: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  const accent =
    tone === 'amber'
      ? 'text-amber-300'
      : tone === 'green'
        ? 'text-emerald-300'
        : tone === 'red'
          ? 'text-red-300'
          : tone === 'blue'
            ? 'text-sky-300'
            : 'text-white';
  return (
    <div className={`panel px-3 py-2.5 ${className}`}>
      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</div>
      <div className={`mono mt-1 text-lg font-semibold leading-tight ${accent}`}>{value}</div>
      {hint ? <div className="mt-0.5 text-[11px] leading-tight text-slate-500">{hint}</div> : null}
    </div>
  );
}

export function Callout({
  tone = 'neutral',
  title,
  children,
}: {
  tone?: Tone;
  title?: string;
  children: ReactNode;
}) {
  return (
    <div className={`rounded-lg border px-3 py-2.5 text-xs leading-relaxed ${TONES[tone]}`}>
      {title ? <div className="mb-1 font-semibold uppercase tracking-wider">{title}</div> : null}
      <div className="text-slate-300">{children}</div>
    </div>
  );
}

export function EmptyState({ title, body, action }: { title: string; body?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
      <div className="text-sm font-medium text-slate-300">{title}</div>
      {body ? <div className="max-w-md text-xs leading-relaxed text-slate-500">{body}</div> : null}
      {action}
    </div>
  );
}

export function SourceNote({ children }: { children: ReactNode }) {
  return (
    <p className="border-t border-ink-700/60 px-4 py-2.5 text-[11px] leading-relaxed text-slate-500">{children}</p>
  );
}

/* ------------------------------------------------------------------ inputs */

export function Field({
  label,
  children,
  hint,
  className = '',
}: {
  label: ReactNode;
  children: ReactNode;
  hint?: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="label">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-[11px] text-slate-500">{hint}</span> : null}
    </label>
  );
}

/** Number input that accepts shorthand: 1.5m, 250k, 2b. */
export function NumberInput({
  value,
  onChange,
  placeholder,
  min,
  max,
  step,
  suffix,
}: {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}) {
  const id = useId();
  return (
    <div className="relative">
      <input
        id={id}
        className="input mono pr-10"
        value={Number.isFinite(value) ? String(value) : ''}
        inputMode="decimal"
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        onChange={(event) => {
          const raw = event.target.value.replace(/[$,\s]/g, '');
          if (raw === '') return onChange(0);
          const shorthand = /^([\d.]+)\s*([kmbt])$/i.exec(raw);
          if (shorthand) {
            const mult = { k: 1e3, m: 1e6, b: 1e9, t: 1e12 }[shorthand[2].toLowerCase() as 'k'];
            onChange(Math.round(Number(shorthand[1]) * mult));
            return;
          }
          const parsed = Number(raw);
          if (!Number.isNaN(parsed)) onChange(Math.min(max ?? Infinity, Math.max(min ?? -Infinity, parsed)));
        }}
      />
      {suffix ? (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
          {suffix}
        </span>
      ) : null}
    </div>
  );
}

export function Select<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <select className="input" value={value} onChange={(event) => onChange(event.target.value as T)}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: ReactNode;
  hint?: ReactNode;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 rounded-lg border border-ink-700 bg-ink-850 px-3 py-2 text-left transition-colors hover:border-ink-600"
    >
      <span>
        <span className="block text-xs font-medium text-slate-200">{label}</span>
        {hint ? <span className="block text-[11px] text-slate-500">{hint}</span> : null}
      </span>
      <span
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${checked ? 'bg-amber-500' : 'bg-ink-600'}`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${checked ? 'left-[18px]' : 'left-0.5'}`}
        />
      </span>
    </button>
  );
}

/* ------------------------------------------------------------------ charts */

export function Bar({ value, max, tone = 'amber' }: { value: number; max: number; tone?: Tone }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  const colour =
    tone === 'green'
      ? 'bg-emerald-500/80'
      : tone === 'blue'
        ? 'bg-sky-500/80'
        : tone === 'red'
          ? 'bg-red-500/80'
          : tone === 'violet'
            ? 'bg-violet-500/80'
            : 'bg-amber-500/80';
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-700">
      <div className={`h-full rounded-full ${colour}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

/** Dependency-free sparkline for projections. */
export function Sparkline({
  points,
  height = 48,
  tone = '#f98a12',
  className = '',
}: {
  points: number[];
  height?: number;
  tone?: string;
  className?: string;
}) {
  if (points.length < 2) return <div className={`h-12 ${className}`} />;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const width = 300;
  const coords = points.map((point, index) => {
    const x = (index / (points.length - 1)) * width;
    const y = height - ((point - min) / range) * (height - 6) - 3;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });
  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className={`w-full ${className}`} height={height}>
      <polyline points={coords.join(' ')} fill="none" stroke={tone} strokeWidth="1.75" vectorEffect="non-scaling-stroke" />
      <polyline
        points={`0,${height} ${coords.join(' ')} ${width},${height}`}
        fill={tone}
        fillOpacity="0.08"
        stroke="none"
      />
    </svg>
  );
}

export function KeyValue({ items }: { items: { label: ReactNode; value: ReactNode }[] }) {
  return (
    <dl className="divide-y divide-ink-700/60">
      {items.map((item, index) => (
        <div key={index} className="flex items-baseline justify-between gap-4 px-4 py-2">
          <dt className="text-xs text-slate-400">{item.label}</dt>
          <dd className="mono text-sm font-medium text-slate-100">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
