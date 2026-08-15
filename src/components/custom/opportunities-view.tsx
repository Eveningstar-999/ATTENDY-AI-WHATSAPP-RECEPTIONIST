'use client';

import { RefreshCcw } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { OpportunitiesTable } from '@/components/custom/opportunities-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiFetch } from '@/lib/api-client';
import {
  OpportunityList,
  type OpportunityList as OpportunityListType,
} from '@/lib/contracts/opportunities';

type LoadState =
  | { kind: 'loading' }
  | { kind: 'empty'; lastScanAt: string | null }
  | { kind: 'ready'; data: OpportunityListType }
  | { kind: 'error'; message: string };

const POLL_INTERVAL_MS = 10_000;
const SKELETON_ROWS = [0, 1, 2, 3, 4, 5] as const;

export function OpportunitiesView() {
  const [state, setState] = useState<LoadState>({ kind: 'loading' });
  const [scanning, setScanning] = useState(false);
  const liveRef = useRef(true);

  const refresh = useCallback(async () => {
    try {
      const data = await apiFetch('/api/opportunities', { schema: OpportunityList });
      if (!liveRef.current) return;
      setState(
        data.items.length === 0
          ? { kind: 'empty', lastScanAt: data.lastScanAt }
          : { kind: 'ready', data },
      );
    } catch (err) {
      if (!liveRef.current) return;
      setState({
        kind: 'error',
        message: err instanceof Error ? err.message : 'Could not load opportunities.',
      });
    }
  }, []);

  useEffect(() => {
    liveRef.current = true;
    void refresh();
    const id = window.setInterval(() => void refresh(), POLL_INTERVAL_MS);
    return () => {
      liveRef.current = false;
      window.clearInterval(id);
    };
  }, [refresh]);

  async function runScan() {
    setScanning(true);
    try {
      await apiFetch('/api/scan', { method: 'POST' });
      toast.success('Scan complete.');
      await refresh();
    } catch {
      toast.error('Scan failed — please try again.');
    } finally {
      setScanning(false);
    }
  }

  return (
    <main className="container-page section flex flex-col gap-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <p className="text-eyebrow">Operations console</p>
          <h1 className="text-h2 tracking-tight text-foreground">
            Cross-marketplace opportunities
          </h1>
          <p className="max-w-2xl text-body text-muted-foreground">
            Top price gaps Tidefork&apos;s scanner has detected across Amazon, eBay, and Walmart.
            Margin estimates apply destination-side marketplace fees to a USD book. Run a scan to
            refresh in place — the table polls every ten seconds.
          </p>
        </div>
        <Button
          type="button"
          variant="default"
          onClick={() => void runScan()}
          disabled={scanning || state.kind === 'loading'}
          className="shrink-0"
        >
          <RefreshCcw className={scanning ? 'size-4 animate-spin' : 'size-4'} aria-hidden />
          {scanning ? 'Scanning…' : 'Run scan now'}
        </Button>
      </header>

      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div className="flex flex-col gap-1">
            <CardTitle>Top 20 opportunities</CardTitle>
            <CardDescription>
              {state.kind === 'ready'
                ? `${state.data.items.length} ranked by estimated gross margin (USD).`
                : state.kind === 'empty'
                  ? 'No opportunities detected yet — kick off a scan to populate the ledger.'
                  : 'FX and fee tables in USD only — refresh after rates change.'}
            </CardDescription>
          </div>
          <p className="text-caption font-medium text-muted-foreground">
            {state.kind === 'ready' && state.data.lastScanAt
              ? `Last scan · ${formatRelative(state.data.lastScanAt)}`
              : state.kind === 'empty' && state.lastScanAt
                ? `Last scan · ${formatRelative(state.lastScanAt)}`
                : 'Awaiting first scan'}
          </p>
        </CardHeader>
        <CardContent className="p-0">
          {state.kind === 'loading' ? <SkeletonTable /> : null}
          {state.kind === 'error' ? (
            <p className="p-6 text-sm text-destructive" role="alert">
              {state.message}
            </p>
          ) : null}
          {state.kind === 'empty' ? (
            <div className="flex flex-col items-start gap-4 p-10">
              <p className="text-sm text-muted-foreground">
                No opportunities yet — click <span className="font-semibold">Run scan now</span>.
              </p>
            </div>
          ) : null}
          {state.kind === 'ready' ? <OpportunitiesTable items={state.data.items} /> : null}
        </CardContent>
      </Card>
    </main>
  );
}

function SkeletonTable() {
  return (
    <div className="flex flex-col gap-2 p-4">
      {SKELETON_ROWS.map((row) => (
        <div
          key={`row-${row}`}
          className="h-9 w-full animate-pulse rounded-md bg-muted/40"
          aria-hidden
        />
      ))}
    </div>
  );
}

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return iso;
  const seconds = Math.max(0, Math.round((Date.now() - then) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(iso).toLocaleString();
}
