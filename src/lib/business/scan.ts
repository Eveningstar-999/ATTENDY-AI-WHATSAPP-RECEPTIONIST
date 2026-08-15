import 'server-only';
import type { PrismaClient } from '@prisma/client';

const FX_KEY_SEP = ':';
const feeKey = (marketplaceId: string, currency: string) =>
  `${marketplaceId}${FX_KEY_SEP}${currency}`;
const fxKey = (base: string, quote: string) => `${base}${FX_KEY_SEP}${quote}`;

export interface FxMap {
  rate(base: string, quote: string): number | null;
}

interface FeeEntry {
  percentBps: number;
  flatCents: number;
}

export function buildFxMap(rows: { base: string; quote: string; rate: unknown }[]): FxMap {
  const m = new Map<string, number>();
  for (const r of rows) m.set(fxKey(r.base, r.quote), Number(r.rate));
  if (!m.has(fxKey('USD', 'USD'))) m.set(fxKey('USD', 'USD'), 1);
  return {
    rate(base: string, quote: string): number | null {
      if (base === quote) return 1;
      const direct = m.get(fxKey(base, quote));
      if (typeof direct === 'number') return direct;
      const inverse = m.get(fxKey(quote, base));
      if (typeof inverse === 'number' && inverse !== 0) return 1 / inverse;
      return null;
    },
  };
}

export function priceInSourceCurrency(
  priceCents: number,
  fromCurrency: string,
  toCurrency: string,
  fx: FxMap,
): number | null {
  const r = fx.rate(fromCurrency, toCurrency);
  if (r == null) return null;
  return Math.round(priceCents * r);
}

export function grossMarginCents(
  sourcePriceCents: number,
  destPriceCentsInSource: number,
  fees: FeeEntry,
): { marginCents: number; marginBps: number } {
  const landedCents =
    Math.round((destPriceCentsInSource * (10000 + fees.percentBps)) / 10000) + fees.flatCents;
  const marginCents = landedCents - sourcePriceCents;
  const marginBps = sourcePriceCents > 0 ? Math.round((10000 * marginCents) / sourcePriceCents) : 0;
  return { marginCents, marginBps };
}

interface OpportunityPair {
  skuId: string;
  sourceMarketplaceId: string;
  destMarketplaceId: string;
  sourcePriceCents: number;
  destPriceCents: number;
  currency: string;
  estimatedGrossMarginCents: number;
  estimatedGrossMarginBps: number;
}

export async function runScan(prisma: PrismaClient): Promise<{ count: number }> {
  const listings = await prisma.marketplaceListing.findMany();
  const fxRows = await prisma.fxRate.findMany();
  const feeRows = await prisma.feeTable.findMany();

  const fx = buildFxMap(fxRows);
  const feeMap = new Map<string, FeeEntry>();
  for (const f of feeRows) {
    feeMap.set(feeKey(f.marketplaceId, f.currency), {
      percentBps: f.percentBps,
      flatCents: f.flatCents,
    });
  }

  const bySku = new Map<string, typeof listings>();
  for (const l of listings) {
    const arr = bySku.get(l.skuId);
    if (arr) arr.push(l);
    else bySku.set(l.skuId, [l]);
  }

  const pairs: OpportunityPair[] = [];
  for (const [skuId, skuListings] of bySku) {
    for (const source of skuListings) {
      for (const dest of skuListings) {
        if (source.marketplaceId === dest.marketplaceId) continue;
        if (source.priceCents <= 0) continue;

        const destInSource = priceInSourceCurrency(
          dest.priceCents,
          dest.currency,
          source.currency,
          fx,
        );
        if (destInSource == null) continue;

        const fees = feeMap.get(feeKey(dest.marketplaceId, dest.currency));
        if (!fees) continue;

        const { marginCents, marginBps } = grossMarginCents(source.priceCents, destInSource, fees);
        if (marginCents < 0) continue;

        pairs.push({
          skuId,
          sourceMarketplaceId: source.marketplaceId,
          destMarketplaceId: dest.marketplaceId,
          sourcePriceCents: source.priceCents,
          destPriceCents: dest.priceCents,
          currency: source.currency,
          estimatedGrossMarginCents: marginCents,
          estimatedGrossMarginBps: marginBps,
        });
      }
    }
  }

  pairs.sort((a, b) => b.estimatedGrossMarginCents - a.estimatedGrossMarginCents);
  const top = pairs.slice(0, 20);

  await prisma.$transaction(async (tx) => {
    for (const p of top) {
      await tx.detectionEvent.upsert({
        where: {
          id: `event:${p.sourceMarketplaceId}:${p.destMarketplaceId}:${p.skuId}`,
        },
        create: {
          id: `event:${p.sourceMarketplaceId}:${p.destMarketplaceId}:${p.skuId}`,
          skuId: p.skuId,
          sourceMarketplaceId: p.sourceMarketplaceId,
          destMarketplaceId: p.destMarketplaceId,
          sourcePriceCents: p.sourcePriceCents,
          destPriceCents: p.destPriceCents,
          currency: p.currency,
          estimatedGrossMarginCents: p.estimatedGrossMarginCents,
          estimatedGrossMarginBps: p.estimatedGrossMarginBps,
        },
        update: {
          sourcePriceCents: p.sourcePriceCents,
          destPriceCents: p.destPriceCents,
          currency: p.currency,
          estimatedGrossMarginCents: p.estimatedGrossMarginCents,
          estimatedGrossMarginBps: p.estimatedGrossMarginBps,
          detectedAt: new Date(),
        },
      });
    }
    await tx.scanMarker.upsert({
      where: { id: 1 },
      create: { id: 1, lastRunAt: new Date(), lastDetectionCount: top.length },
      update: { lastRunAt: new Date(), lastDetectionCount: top.length },
    });
  });

  return { count: top.length };
}
