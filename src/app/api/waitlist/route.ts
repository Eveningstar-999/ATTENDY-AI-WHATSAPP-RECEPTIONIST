// @polsia:user-owned
//
// POST /api/waitlist — plain REST route handler that writes a WaitlistEntry.
// Lives under /api, which proxy.ts's matcher excludes (no CSP/nonce, not proxied).
//
// The POST is intentionally PUBLIC — anyone can join the waitlist.
// Do NOT add a public GET that lists signups here: the emails are PII. To let the
// founder VIEW signups, gate that view/route behind the auth module's role
// (install better-auth + use requireAdmin) — never list signups on a public route
// or page. (Only expose them publicly if the founder EXPLICITLY asks for one.)

import 'server-only';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { waitlistSchema } from '@/lib/waitlist/schema';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const body = await req.json();
  const result = waitlistSchema.safeParse({ email: body.email });
  if (!result.success) {
    const message = result.error.flatten().fieldErrors.email?.[0];
    return NextResponse.json({ errors: { email: message } }, { status: 400 });
  }

  try {
    await prisma.waitlistEntry.create({ data: { email: result.data.email } });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err: unknown) {
    const isUniqueViolation = err instanceof Error && err.message.includes('Unique constraint');
    if (isUniqueViolation) {
      return NextResponse.json(
        { errors: { email: "You're already on the waitlist." } },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { errors: { email: 'Something went wrong. Please try again.' } },
      { status: 500 },
    );
  }
}
