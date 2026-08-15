// @polsia:user-owned — wraps the waitlist module's <WaitlistForm/> in branded
// card chrome so it sits cleanly in the final CTA section. The form itself
// (validation + apiFetch + success state) lives in the installed module's
// `src/components/custom/waitlist-form.tsx` — re-exported through here.

'use client';

import { WaitlistForm } from '@/components/custom/waitlist-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function AttendlySignup() {
  return (
    <Card className="w-full max-w-md shadow-brand">
      <CardHeader>
        <CardTitle className="font-display text-h3 text-foreground">
          Join the Attendly waitlist
        </CardTitle>
        <CardDescription>
          Drop your email — we&rsquo;ll let you know the moment we open in your area.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <WaitlistForm />
      </CardContent>
    </Card>
  );
}
