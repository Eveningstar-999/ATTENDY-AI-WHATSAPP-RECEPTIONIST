import { ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Opportunity } from '@/lib/contracts/opportunities';

const currencyFormatters = new Map<string, Intl.NumberFormat>();

function getCurrencyFormatter(currency: string): Intl.NumberFormat {
  let f = currencyFormatters.get(currency);
  if (!f) {
    f = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    });
    currencyFormatters.set(currency, f);
  }
  return f;
}

function formatMoney(amount: number, currency: string): string {
  return getCurrencyFormatter(currency).format(amount);
}

const MARKETPLACE_VARIANTS: Record<string, 'default' | 'secondary' | 'outline'> = {
  amazon: 'default',
  ebay: 'secondary',
  walmart: 'outline',
};

const MARKETPLACE_LABEL_FALLBACK = 'Marketplace';

function marketplaceVariant(slug: string): 'default' | 'secondary' | 'outline' {
  return MARKETPLACE_VARIANTS[slug] ?? 'outline';
}

function marketplaceLabel(slug: string, name: string): string {
  return name && name !== slug ? name : MARKETPLACE_LABEL_FALLBACK;
}

function formatRelativeShort(iso: string): string {
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return iso;
  const seconds = Math.max(0, Math.round((Date.now() - then) / 1000));
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.round(hours / 24)}d`;
}

export function OpportunitiesTable({ items }: { items: Opportunity[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/30 hover:bg-muted/30">
          <TableHead className="min-w-[14rem]">SKU</TableHead>
          <TableHead className="text-right">Source price</TableHead>
          <TableHead>Destination</TableHead>
          <TableHead className="text-right">Dest. price</TableHead>
          <TableHead className="text-right">Est. margin</TableHead>
          <TableHead className="text-right">Margin&nbsp;%</TableHead>
          <TableHead className="text-right">Detected</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => {
          const positive = item.estimatedGrossMarginCents > 0;
          return (
            <TableRow key={`${item.skuId}:${item.sourceMarketplace}:${item.destMarketplace}`}>
              <TableCell>
                <div className="flex flex-col">
                  <span className="text-body font-medium text-foreground">{item.skuTitle}</span>
                  <span className="text-caption text-muted-foreground">
                    <span className="font-mono">{item.skuId}</span>
                    <span className="mx-1.5 opacity-60">·</span>
                    <span className="capitalize">{item.category}</span>
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-right font-mono text-sm tabular-nums">
                <div className="flex items-center justify-end gap-2">
                  <Badge variant={marketplaceVariant(item.sourceMarketplace)}>
                    {marketplaceLabel(item.sourceMarketplace, item.sourceMarketplaceName)}
                  </Badge>
                </div>
                <span className="mt-1 inline-block">
                  {formatMoney(item.sourcePriceCents / 100, item.sourceCurrency)}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 text-sm">
                  <ArrowRight className="size-3.5 text-brand-500" aria-hidden />
                  <Badge variant={marketplaceVariant(item.destMarketplace)}>
                    {marketplaceLabel(item.destMarketplace, item.destMarketplaceName)}
                  </Badge>
                </div>
              </TableCell>
              <TableCell className="text-right font-mono text-sm tabular-nums">
                {formatMoney(item.destPriceCents / 100, item.destCurrency)}
              </TableCell>
              <TableCell
                className={`text-right font-mono text-sm font-semibold tabular-nums ${
                  positive ? 'text-brand-600' : 'text-destructive'
                }`}
              >
                {formatMoney(item.estimatedGrossMarginCents / 100, item.currency)}
              </TableCell>
              <TableCell
                className={`text-right font-mono text-caption tabular-nums ${
                  positive ? 'text-brand-600' : 'text-destructive'
                }`}
              >
                {item.estimatedGrossMarginPct.toFixed(1)}%
              </TableCell>
              <TableCell className="text-right text-caption text-muted-foreground">
                {formatRelativeShort(item.detectedAt)}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
