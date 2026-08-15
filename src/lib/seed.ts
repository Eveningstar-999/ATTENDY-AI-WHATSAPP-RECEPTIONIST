// @polsia:user-owned — deploy-time database seed. Idempotent writes only.

import 'server-only';

import type { PrismaClient } from '@prisma/client';
import { runScan } from '@/lib/business/scan';

type SkuSeed = {
  id: string;
  title: string;
  brand: string;
  category: string;
  prices: { amazon: number; ebay: number; walmart: number };
};

const SKUS: SkuSeed[] = [
  {
    id: 'sony-wh1000xm5',
    title: 'Sony WH-1000XM5 wireless noise-cancelling headphones',
    brand: 'Sony',
    category: 'audio',
    prices: { amazon: 29999, ebay: 33999, walmart: 37999 },
  },
  {
    id: 'bose-qc-ultra',
    title: 'Bose QuietComfort Ultra headphones',
    brand: 'Bose',
    category: 'audio',
    prices: { amazon: 34900, ebay: 39900, walmart: 42900 },
  },
  {
    id: 'airpods-pro-2',
    title: 'Apple AirPods Pro (2nd gen, USB-C)',
    brand: 'Apple',
    category: 'audio',
    prices: { amazon: 19900, ebay: 22400, walmart: 24900 },
  },
  {
    id: 'jbl-charge-5',
    title: 'JBL Charge 5 portable Bluetooth speaker',
    brand: 'JBL',
    category: 'audio',
    prices: { amazon: 14999, ebay: 17999, walmart: 19999 },
  },
  {
    id: 'macbook-air-m3',
    title: 'Apple MacBook Air 13" M3 (16 GB / 512 GB)',
    brand: 'Apple',
    category: 'computing',
    prices: { amazon: 139900, ebay: 148900, walmart: 159900 },
  },
  {
    id: 'thinkpad-x1-c12',
    title: 'Lenovo ThinkPad X1 Carbon Gen 12',
    brand: 'Lenovo',
    category: 'computing',
    prices: { amazon: 189900, ebay: 199900, walmart: 214900 },
  },
  {
    id: 'logi-mx-master-3s',
    title: 'Logitech MX Master 3S wireless mouse',
    brand: 'Logitech',
    category: 'computing',
    prices: { amazon: 9999, ebay: 11499, walmart: 13999 },
  },
  {
    id: 'asus-rog-strix-g16',
    title: 'ASUS ROG Strix G16 gaming laptop',
    brand: 'ASUS',
    category: 'computing',
    prices: { amazon: 159900, ebay: 174900, walmart: 189900 },
  },
  {
    id: 'dyson-v15-detect',
    title: 'Dyson V15 Detect cordless vacuum',
    brand: 'Dyson',
    category: 'home',
    prices: { amazon: 64999, ebay: 71999, walmart: 79999 },
  },
  {
    id: 'ninja-foodi-dual',
    title: 'Ninja Foodi 8-qt DualZone air fryer',
    brand: 'Ninja',
    category: 'home',
    prices: { amazon: 14999, ebay: 17999, walmart: 20499 },
  },
  {
    id: 'ring-battery-plus',
    title: 'Ring Battery Doorbell Plus',
    brand: 'Ring',
    category: 'home',
    prices: { amazon: 11999, ebay: 13999, walmart: 15999 },
  },
  {
    id: 'instant-pot-pro-8qt',
    title: 'Instant Pot Pro 8-qt multi-cooker',
    brand: 'Instant Pot',
    category: 'home',
    prices: { amazon: 12999, ebay: 14999, walmart: 17999 },
  },
];

const MARKETPLACES = [
  { id: 'amazon', displayName: 'Amazon', currency: 'USD' },
  { id: 'ebay', displayName: 'eBay', currency: 'USD' },
  { id: 'walmart', displayName: 'Walmart', currency: 'USD' },
] as const;

type MarketId = (typeof MARKETPLACES)[number]['id'];

const FX_RATES: { base: string; quote: string; rate: number }[] = [
  { base: 'USD', quote: 'USD', rate: 1 },
  { base: 'USD', quote: 'EUR', rate: 0.922 },
  { base: 'EUR', quote: 'USD', rate: 1.085 },
  { base: 'USD', quote: 'GBP', rate: 0.788 },
  { base: 'GBP', quote: 'USD', rate: 1.27 },
  { base: 'USD', quote: 'CAD', rate: 1.351 },
  { base: 'CAD', quote: 'USD', rate: 0.74 },
];

const FEE_TABLE: {
  marketplaceId: MarketId;
  currency: string;
  percentBps: number;
  flatCents: number;
}[] = [
  { marketplaceId: 'amazon', currency: 'USD', percentBps: 1500, flatCents: 30 },
  { marketplaceId: 'ebay', currency: 'USD', percentBps: 1210, flatCents: 30 },
  { marketplaceId: 'walmart', currency: 'USD', percentBps: 1500, flatCents: 60 },
];

const LISTING_URLS: Record<MarketId, (slug: string) => string> = {
  amazon: (slug) => `https://www.amazon.com/dp/${slug}`,
  ebay: (slug) => `https://www.ebay.com/itm/${slug}`,
  walmart: (slug) => `https://www.walmart.com/ip/${slug}`,
};

async function seedOne(prisma: PrismaClient): Promise<void> {
  for (const m of MARKETPLACES) {
    await prisma.marketplace.upsert({
      where: { id: m.id },
      create: { id: m.id, displayName: m.displayName, currency: m.currency },
      update: { displayName: m.displayName, currency: m.currency },
    });
  }

  for (const sku of SKUS) {
    await prisma.sku.upsert({
      where: { id: sku.id },
      create: {
        id: sku.id,
        title: sku.title,
        brand: sku.brand,
        category: sku.category,
      },
      update: { title: sku.title, brand: sku.brand, category: sku.category },
    });

    for (const m of MARKETPLACES) {
      await prisma.marketplaceListing.upsert({
        where: {
          skuId_marketplaceId: {
            skuId: sku.id,
            marketplaceId: m.id,
          },
        },
        create: {
          skuId: sku.id,
          marketplaceId: m.id,
          priceCents: sku.prices[m.id],
          currency: 'USD',
          url: LISTING_URLS[m.id](sku.id),
          inStock: true,
        },
        update: {
          priceCents: sku.prices[m.id],
          currency: 'USD',
          url: LISTING_URLS[m.id](sku.id),
          inStock: true,
        },
      });
    }
  }

  for (const f of FX_RATES) {
    await prisma.fxRate.upsert({
      where: { base_quote: { base: f.base, quote: f.quote } },
      create: { base: f.base, quote: f.quote, rate: f.rate },
      update: { rate: f.rate },
    });
  }

  for (const ft of FEE_TABLE) {
    await prisma.feeTable.upsert({
      where: {
        marketplaceId_currency: {
          marketplaceId: ft.marketplaceId,
          currency: ft.currency,
        },
      },
      create: {
        marketplaceId: ft.marketplaceId,
        currency: ft.currency,
        percentBps: ft.percentBps,
        flatCents: ft.flatCents,
      },
      update: { percentBps: ft.percentBps, flatCents: ft.flatCents },
    });
  }

  await prisma.scanMarker.upsert({
    where: { id: 1 },
    create: { id: 1, lastRunAt: new Date(), lastDetectionCount: 0 },
    update: {},
  });

  await runScan(prisma);
}

export async function seed(): Promise<void> {
  const { prisma } = await import('@/lib/db');
  await seedOne(prisma);
}
