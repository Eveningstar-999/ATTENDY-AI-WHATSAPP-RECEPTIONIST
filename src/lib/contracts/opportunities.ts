import { z } from 'zod';

export const Opportunity = z.object({
  skuId: z.string(),
  skuTitle: z.string(),
  category: z.string(),
  sourceMarketplace: z.string(),
  destMarketplace: z.string(),
  sourceMarketplaceName: z.string(),
  destMarketplaceName: z.string(),
  sourcePriceCents: z.number().int(),
  destPriceCents: z.number().int(),
  sourceCurrency: z.string(),
  destCurrency: z.string(),
  currency: z.string(),
  estimatedGrossMarginCents: z.number().int(),
  estimatedGrossMarginPct: z.number(),
  detectedAt: z.string(),
});

export const OpportunityList = z.object({
  items: z.array(Opportunity),
  lastScanAt: z.string().nullable(),
});

export type Opportunity = z.infer<typeof Opportunity>;
export type OpportunityList = z.infer<typeof OpportunityList>;
