import { useMemo, useState } from 'react';
import { Callout, Chip, Field, NumberInput, PageHeader, Panel, SectionHeader, SourceNote, Sparkline, Stat } from '../../components/ui';
import { breakEvenWage, computeProfit } from '../../data/companies';
import { money, moneyShort, num } from '../../lib/format';

export default function CompanyProfit() {
  const [dailyRevenue, setDailyRevenue] = useState(12_000_000);
  const [staffCount, setStaffCount] = useState(10);
  const [wageEach, setWageEach] = useState(600_000);
  const [advertising, setAdvertising] = useState(250_000);
  const [upkeep, setUpkeep] = useState(120_000);
  const [stock, setStock] = useState(1_400_000);
  const [directorCut, setDirectorCut] = useState(10);

  const input = {
    dailyRevenue,
    staffCount,
    wageEach,
    advertisingPerDay: advertising,
    upkeepPerDay: upkeep,
    stockCostPerDay: stock,
    directorCut,
  };

  const result = useMemo(() => computeProfit(input), [dailyRevenue, staffCount, wageEach, advertising, upkeep, stock, directorCut]);
  const maxWage = useMemo(() => breakEvenWage(input), [dailyRevenue, staffCount, advertising, upkeep, stock, directorCut]);

  const monthly = useMemo(() => {
    const points: number[] = [];
    let cumulative = 0;
    for (let day = 1; day <= 30; day += 1) {
      cumulative += result.net;
      points.push(cumulative);
    }
    return points;
  }, [result.net]);

  const wageWarning = wageEach > maxWage;

  return (
    <div>
      <PageHeader
        eyebrow="Tools"
        title="Company profit calculator"
        description="Director-grade arithmetic: revenue in, wages and operating costs out, then the director's cut, leaving a margin you can actually compare across company types and star levels."
        right={<Chip tone={result.net >= 0 ? 'green' : 'red'}>{result.marginPercent.toFixed(1)}% margin</Chip>}
      />

      <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
        <Panel>
          <SectionHeader title="Daily figures" subtitle="Use one day of your real company ledger." />
          <div className="space-y-4 p-4">
            <Field label="Daily revenue">
              <NumberInput value={dailyRevenue} onChange={setDailyRevenue} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Employees">
                <NumberInput value={staffCount} onChange={setStaffCount} />
              </Field>
              <Field label="Wage each / day">
                <NumberInput value={wageEach} onChange={setWageEach} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Advertising / day">
                <NumberInput value={advertising} onChange={setAdvertising} />
              </Field>
              <Field label="Upkeep / day">
                <NumberInput value={upkeep} onChange={setUpkeep} />
              </Field>
            </div>
            <Field label="Stock cost / day" hint="What you paid suppliers for the goods you sold.">
              <NumberInput value={stock} onChange={setStock} />
            </Field>
            <Field label="Director cut %" hint="The share of profit that goes to the director.">
              <NumberInput value={directorCut} onChange={setDirectorCut} suffix="%" max={100} />
            </Field>
          </div>
        </Panel>

        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat label="Gross / day" value={moneyShort(result.gross)} />
            <Stat label="Total costs / day" value={moneyShort(result.wages + result.costs)} tone="red" />
            <Stat label="Net / day" value={moneyShort(result.net)} tone={result.net >= 0 ? 'green' : 'red'} hint={`${result.marginPercent.toFixed(1)}% margin`} />
            <Stat
              label="Per person / day"
              value={moneyShort(result.netPerStaff)}
              hint={`${staffCount + 1} people including you`}
            />
          </div>

          <Panel>
            <SectionHeader title="Where the money goes" subtitle="Every line is derived from your inputs — no hidden multipliers." />
            <dl className="divide-y divide-ink-700/60">
              {[
                ['Revenue', money(result.gross)],
                ['Employee wages', `− ${money(result.wages)}`],
                ['Advertising + upkeep + stock', `− ${money(result.costs)}`],
                ['Profit before director cut', money(result.netBeforeCut)],
                [`Director cut (${directorCut}%)`, `− ${money(result.directorPay)}`],
                ['Net profit to the company', money(result.net)],
              ].map(([label, value], index) => (
                <div key={label} className="flex items-center justify-between gap-4 px-4 py-2.5">
                  <dt className={`text-xs ${index === 5 ? 'font-semibold text-slate-200' : 'text-slate-400'}`}>{label}</dt>
                  <dd className={`mono text-sm ${index === 5 ? (result.net >= 0 ? 'text-emerald-300' : 'text-red-300') : 'text-slate-100'}`}>
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </Panel>

          <div className="grid gap-4 sm:grid-cols-2">
            <Panel>
              <SectionHeader title="Wage headroom" />
              <div className="p-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-slate-400">Break-even wage per employee</span>
                  <span className="mono text-lg text-amber-300">{money(maxWage)}</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-ink-700">
                  <div
                    className={`h-full rounded-full ${wageWarning ? 'bg-red-500' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min(100, maxWage > 0 ? (wageEach / maxWage) * 100 : 100)}%` }}
                  />
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
                  You are paying <span className="mono text-slate-300">{money(wageEach)}</span>, which is{' '}
                  {maxWage > 0 ? `${((wageEach / maxWage) * 100).toFixed(0)}%` : '—'} of what the company can afford
                  before it stops making money.
                </p>
              </div>
            </Panel>

            <Panel>
              <SectionHeader title="Cumulative 30-day profit" />
              <div className="px-4 pb-3 pt-4">
                <Sparkline points={monthly} height={70} tone={result.net >= 0 ? '#4ade80' : '#f87171'} />
                <div className="mt-2 flex justify-between text-[11px] text-slate-500">
                  <span>Day 1</span>
                  <span className="mono text-slate-300">30 days: {moneyShort(result.net * 30)}</span>
                </div>
              </div>
              <SourceNote>
                Assumes a steady day. Real companies swing with popularity, restocking, staff turnover and star changes.
              </SourceNote>
            </Panel>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Callout tone={wageWarning ? 'red' : 'green'} title={wageWarning ? 'You are overpaying' : 'Wages are sustainable'}>
              {wageWarning
                ? `At ${money(wageEach)} per employee the company loses money on every full-time hire. Either raise revenue, cut costs, or reduce headcount.`
                : `Every employee is currently returning more than they cost. The ceiling is ${money(maxWage)} each.`}
            </Callout>
            <Callout tone="amber" title="Headcount is not output">
              Working stats decide effectiveness and effectiveness decides output. A smaller, better-matched roster
              usually beats filling every slot with cheap labour.
            </Callout>
            <Callout tone="blue" title="Director cut matters">
              The cut applies to profit, so raising it protects your income when margins are thin and costs you little
              when they are fat. Model both numbers before you set it.
            </Callout>
          </div>

          <Panel>
            <SectionHeader title="Sanity checks" />
            <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4">
              <Stat label="Revenue / employee" value={moneyShort(staffCount > 0 ? dailyRevenue / staffCount : dailyRevenue)} />
              <Stat label="Wage share of revenue" value={`${dailyRevenue > 0 ? ((result.wages / dailyRevenue) * 100).toFixed(1) : '0'}%`} />
              <Stat label="Cost share of revenue" value={`${dailyRevenue > 0 ? ((result.costs / dailyRevenue) * 100).toFixed(1) : '0'}%`} />
              <Stat label="Annualised net" value={moneyShort(result.annualised)} tone={result.net >= 0 ? 'green' : 'red'} />
            </div>
            <SourceNote>
              Pure arithmetic on your inputs — Lumbercorpedia intentionally does not bake in per-star multipliers, because
              those change with Torn's balance patches. If you know your company's current multipliers, apply them to the
              revenue figure before entering it. Total cost lines:{' '}
              {num(staffCount * wageEach)} in wages and {num(advertising + upkeep + stock)} in operating costs per day.
            </SourceNote>
          </Panel>
        </div>
      </div>
    </div>
  );
}
