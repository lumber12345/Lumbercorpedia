import { useMemo, useState } from 'react';
import { Callout, Chip, Field, NumberInput, PageHeader, Panel, SectionHeader, SourceNote, Stat } from '../../components/ui';
import { money, moneyShort, num } from '../../lib/format';

export default function TravelProfit() {
  const [buyPrice, setBuyPrice] = useState(2_500);
  const [sellPrice, setSellPrice] = useState(3_150);
  const [quantity, setQuantity] = useState(80);
  const [flightCost, setFlightCost] = useState(60_000);
  const [tripHours, setTripHours] = useState(4);
  const [hotelCost, setHotelCost] = useState(0);
  const [feePercent, setFeePercent] = useState(5);
  const [otherCost, setOtherCost] = useState(0);
  const [tripsPerDay, setTripsPerDay] = useState(2);

  const result = useMemo(() => {
    const gross = sellPrice * quantity;
    const fees = (gross * feePercent) / 100;
    const goods = buyPrice * quantity;
    const fixed = flightCost + hotelCost + otherCost;
    const totalCost = goods + fixed + fees;
    const net = gross - fees - goods - fixed;
    const perItem = quantity > 0 ? net / quantity : 0;
    const roi = totalCost > 0 ? (net / totalCost) * 100 : 0;

    // Fixed costs are covered once enough units are sold: perUnit margin before fixed costs.
    const marginPerUnit = sellPrice - (sellPrice * feePercent) / 100 - buyPrice;
    const breakEvenUnits = marginPerUnit > 0 ? Math.ceil(fixed / marginPerUnit) : null;
    const hours = tripHours * 2 + 0.5 * tripsPerDay;
    const perHour = hours > 0 ? net / hours : 0;

    return { gross, fees, goods, fixed, totalCost, net, perItem, roi, marginPerUnit, breakEvenUnits, perHour, hours };
  }, [buyPrice, sellPrice, quantity, flightCost, hotelCost, otherCost, feePercent, tripHours, tripsPerDay]);

  const daily = result.net * tripsPerDay;

  return (
    <div>
      <PageHeader
        eyebrow="Tools"
        title="Travel profit calculator"
        description="Flying out and buying cheap is only profitable after the flight, the hotel, the trade fee and your time. Enter your own numbers — Lumbercorpedia does not assume current market prices for you."
        right={<Chip tone={result.net >= 0 ? 'green' : 'red'}>{result.net >= 0 ? 'Profitable' : 'Loss-making'}</Chip>}
      />

      <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
        <Panel>
          <SectionHeader title="The trip" />
          <div className="space-y-4 p-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Buy price abroad">
                <NumberInput value={buyPrice} onChange={setBuyPrice} />
              </Field>
              <Field label="Sell price in Torn">
                <NumberInput value={sellPrice} onChange={setSellPrice} />
              </Field>
            </div>
            <Field label="Quantity carried" hint="Respect your travel capacity — the flight is the same price either way.">
              <NumberInput value={quantity} onChange={setQuantity} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Flight cost" hint="Round trip, including any insurance.">
                <NumberInput value={flightCost} onChange={setFlightCost} />
              </Field>
              <Field label="Hotel / stay">
                <NumberInput value={hotelCost} onChange={setHotelCost} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Hours in the air (one way)">
                <NumberInput value={tripHours} onChange={setTripHours} />
              </Field>
              <Field label="Market fee %" hint="Item market fee, or your bazaar's effective cost.">
                <NumberInput value={feePercent} onChange={setFeePercent} suffix="%" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Other costs" hint="Morphine, revives, ammo…">
                <NumberInput value={otherCost} onChange={setOtherCost} />
              </Field>
              <Field label="Trips per day" hint="How many round trips you actually run.">
                <NumberInput value={tripsPerDay} onChange={setTripsPerDay} />
              </Field>
            </div>
          </div>
        </Panel>

        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat label="Net profit / trip" value={money(result.net)} tone={result.net >= 0 ? 'green' : 'red'} />
            <Stat label="Return on cost" value={`${result.roi.toFixed(1)}%`} tone={result.roi >= 0 ? 'green' : 'red'} />
            <Stat label="Profit per item" value={money(result.perItem)} hint={`${num(quantity)} items`} />
            <Stat label="Profit per hour" value={moneyShort(result.perHour)} hint={`${result.hours.toFixed(1)}h per trip`} tone="amber" />
          </div>

          <Panel>
            <SectionHeader title="Line by line" subtitle="Nothing hidden — this is the arithmetic behind the headline number." />
            <dl className="divide-y divide-ink-700/60">
              {[
                ['Gross revenue', money(result.gross), 'text-slate-100'],
                ['Market fees', `− ${money(result.fees)}`, 'text-red-300'],
                ['Goods purchased', `− ${money(result.goods)}`, 'text-red-300'],
                ['Flight, hotel, other', `− ${money(result.fixed)}`, 'text-red-300'],
                ['Net profit', money(result.net), result.net >= 0 ? 'text-emerald-300' : 'text-red-300'],
              ].map(([label, value, tone]) => (
                <div key={label} className="flex items-center justify-between gap-4 px-4 py-2.5">
                  <dt className="text-xs text-slate-400">{label}</dt>
                  <dd className={`mono text-sm font-medium ${tone}`}>{value}</dd>
                </div>
              ))}
            </dl>
          </Panel>

          <div className="grid gap-4 sm:grid-cols-2">
            <Panel>
              <SectionHeader title="Break-even load" />
              <div className="p-4">
                {result.breakEvenUnits === null ? (
                  <p className="text-xs text-red-300">
                    Your sell price does not cover the buy price plus fees — carrying more will only lose more money.
                  </p>
                ) : (
                  <>
                    <div className="mono text-2xl font-semibold text-amber-300">{num(result.breakEvenUnits)}</div>
                    <p className="mt-1 text-xs leading-relaxed text-slate-400">
                      items needed just to cover the flight, hotel and other fixed costs. You are carrying{' '}
                      <span className="text-slate-200">{num(quantity)}</span>, so every item past{' '}
                      {num(result.breakEvenUnits)} is pure profit at{' '}
                      <span className="mono text-emerald-300">{money(result.marginPerUnit)}</span> each.
                    </p>
                  </>
                )}
              </div>
            </Panel>

            <Panel>
              <SectionHeader title="Daily scale" />
              <div className="grid grid-cols-2 gap-3 p-4">
                <Stat label="Per day" value={moneyShort(daily)} tone={daily >= 0 ? 'green' : 'red'} />
                <Stat label="Per month" value={moneyShort(daily * 30)} />
                <Stat label="Per year" value={moneyShort(daily * 365)} tone="amber" />
                <Stat label="Hours per day" value={`${num(result.hours * tripsPerDay, 1)}h`} hint="Flying, not shopping" />
              </div>
              <SourceNote>
                Assumes the flight is the only time cost and that you sell everything at your entered price. Abroad stock
                is not infinite — the real limit on any run is what the shop has left.
              </SourceNote>
            </Panel>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Callout tone="amber" title="Buy where the stock is">
              City shops abroad restock on their own schedules and have limited quantity. A perfect margin is worthless
              if the shelf is empty when you land.
            </Callout>
            <Callout tone="blue" title="Fees punish small margins">
              A 5% market fee on a 3,150 sale is 158 per item. If your margin is thinner than the fee, you are flying to
              work for free.
            </Callout>
            <Callout tone="green" title="Hotel nights are optional">
              Sleeping in Torn is free but slower to heal; a hotel removes hospital time faster. If you are healthy, set
              the hotel cost to zero and pocket the difference.
            </Callout>
          </div>
        </div>
      </div>
    </div>
  );
}
