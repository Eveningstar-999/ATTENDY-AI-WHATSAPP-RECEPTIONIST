// @polsia:user-owned
//
// Shared zod schema for the waitlist email. Safe to import from a 'use client'
// file: it has no server-only imports, so the client form can reuse the input
// TYPE without pulling in the route handler or Prisma.

import { z } from 'zod';

export const waitlistSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
});

export type WaitlistInput = z.infer<typeof waitlistSchema>;
