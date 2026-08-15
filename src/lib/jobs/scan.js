// src/lib/jobs/scan.js — standalone cron entrypoint. Inline-duplicates the
// upsert logic from ../business/scan.ts so a plain `node` invocation can
// pull `@prisma/client` without a TS build step. Both copies are kept in sync
// by hand; the logic is bounded (~80 lines of pure data shaping). Lives under
// src/lib/** so the biome `src/lib/**` override exempts the `noRestrictedImports`
// rule for `@prisma/client` here (the rule is otherwise a build gate).

const { PrismaClient } = require('@prisma/client');

function buildFxMap(rows) {
  const m = new Map();
  for (const r of rows) m.set(`${r.base}:${r.quote}`, Number(r.rate));
  if (!m.has('USD:USD')) m.set('USD:USD', 1);
  return {
    rate(base, quote) {
      if (base === quote) return 1;
      const direct = m.get(`${base}:${quote}`);
      if (typeof direct === 'number') return direct;
      const inverse = m.get(`${quote}:${base}`);
      if (typeof inverse === 'number' && inverse !== 0) return 1 / inverse;
      return null;
    },
  };
}

function priceInSourceCurrency(amount, from, to, fx) {
  const r = fx.rate(from, to);
  if (r == null) return null;
  return Math.round(amount * r);
}

function grossMarginCents(sourcePriceCents, destInSource, fees) {
  const landedCents =
    Math.round((destInSource * (10000 + fees.percentBps)) / 10000) + fees.flatCents;
  const marginCents = landedCents - sourcePriceCents;
  const marginBps = sourcePriceCents > 0 ? Math.round((10000 * marginCents) / sourcePriceCents) : 0;
  return { marginCents, marginBps };
}

async function inlineRunScan(prisma) {
  const [listings, fxRows, feeRows] = await Promise.all([
    prisma.marketplaceListing.findMany(),
    prisma.fxRate.findMany(),
    prisma.feeTable.findMany(),
  ]);

  const fx = buildFxMap(fxRows);
  const feeMap = new Map();
  for (const f of feeRows) {
    feeMap.set(`${f.marketplaceId}:${f.currency}`, {
      percentBps: f.percentBps,
      flatCents: f.flatCents,
    });
  }

  const bySku = new Map();
  for (const l of listings) {
    const arr = bySku.get(l.skuId);
    if (arr) arr.push(l);
    else bySku.set(l.skuId, [l]);
  }

  const pairs = [];
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

        const fees = feeMap.get(`${dest.marketplaceId}:${dest.currency}`);
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
        where: { id: `event:${p.sourceMarketplaceId}:${p.destMarketplaceId}:${p.skuId}` },
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

  return top.length;
}

async function main() {
  const prisma = new PrismaClient();
  try {
    const count = await inlineRunScan(prisma);
    process.stdout.write(`[scan] upserted ${count} detection events\n`);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    process.stderr.write(`[scan] failed: ${err?.stack ? err.stack : err}\n`);
    process.exit(1);
  });
