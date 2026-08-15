// @polsia:user-owned
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiFetch } from '@/lib/api-client';

// Composes the template's base shadcn primitives (Button/Input/Label) styled
// through the theme tokens. Restyle via the brand_tokens slot + cva variants,
// or pull more primitives with `npx shadcn add` and compose them.
export function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [ok, setOk] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(undefined);
    // apiFetch resolves on 2xx and throws on non-2xx with the parsed body on
    // `error.cause` — so the route's { errors: { email } } (400/409) is readable.
    try {
      await apiFetch('/api/waitlist', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setOk(true);
    } catch (err) {
      const cause = (err as { cause?: { errors?: { email?: string } } }).cause;
      setError(cause?.errors?.email ?? 'Something went wrong. Please try again.');
    } finally {
      setPending(false);
    }
  }

  if (ok) {
    return (
      <p className="py-4 text-center text-sm font-medium text-foreground">
        You&apos;re on the list. We&apos;ll be in touch soon.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
      <Label htmlFor="waitlist-email">Email address</Label>
      <Input
        id="waitlist-email"
        name="email"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        aria-invalid={error ? true : undefined}
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? 'Joining…' : 'Join waitlist'}
      </Button>
    </form>
  );
}
