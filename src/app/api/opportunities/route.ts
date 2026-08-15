import 'server-only';
import { NextResponse } from 'next/server';

import { runScan } from '@/lib/business/scan';
import { OpportunityList } from '@/lib/contracts/opportunities';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  let events = await prisma.detectionEvent.findMany({
    orderBy: { estimatedGrossMarginCents: 'desc' },
    take: 20,
    include: {
      sku: true,
      sourceMarketplace: true,
      destMarketplace: true,
    },
  });

  if (events.length === 0) {
    await runScan(prisma);
    events = await prisma.detectionEvent.findMany({
      orderBy: { estimatedGrossMarginCents: 'desc' },
      take: 20,
      include: {
        sku: true,
        sourceMarketplace: true,
        destMarketplace: true,
      },
    });
  }

  const marker = await prisma.scanMarker.findUnique({ where: { id: 1 } });

  const payload = OpportunityList.parse({
    items: events.map((e) => ({
      skuId: e.skuId,
      skuTitle: e.sku.title,
      category: e.sku.category,
      sourceMarketplace: e.sourceMarketplaceId,
      destMarketplace: e.destMarketplaceId,
      sourceMarketplaceName: e.sourceMarketplace.displayName,
      destMarketplaceName: e.destMarketplace.displayName,
      sourcePriceCents: e.sourcePriceCents,
      destPriceCents: e.destPriceCents,
      sourceCurrency: e.sourceMarketplace.currency,
      destCurrency: e.destMarketplace.currency,
      currency: e.currency,
      estimatedGrossMarginCents: e.estimatedGrossMarginCents,
      estimatedGrossMarginPct: e.estimatedGrossMarginBps / 100,
      detectedAt: e.detectedAt.toISOString(),
    })),
    lastScanAt: marker?.lastRunAt?.toISOString() ?? null,
  });

  return NextResponse.json(payload);
}
