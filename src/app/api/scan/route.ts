import 'server-only';
import { NextResponse } from 'next/server';

import { runScan } from '@/lib/business/scan';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST() {
  const { count } = await runScan(prisma);
  return NextResponse.json({ scannedAt: new Date().toISOString(), count }, { status: 200 });
}
