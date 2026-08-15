// @polsia:user-owned — starter home served at /. Replace it in place, or delete
// this route group before adding another page that resolves to /.
//
// Attendly landing — AI WhatsApp employee for local service SMBs.
// Everything here is statically authored RSC content. The signup form is the
// only 'use client' island, mounted via <AttendlySignup/> at the bottom.

import {
  BellRing,
  Building2,
  CalendarCheck,
  Car,
  CheckCheck,
  MessageCircle,
  Pill,
  Scissors,
  Stethoscope,
  UserPlus,
  UtensilsCrossed,
} from 'lucide-react';
import type { Metadata } from 'next';
import { AttendlySignup } from '@/components/custom/attendly-signup';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { siteDescription, siteName } from '@/lib/site';

// Keep this a Server Component so it can export metadata.
export const metadata: Metadata = {
  title: { absolute: siteName },
  description: siteDescription,
  // Do not export an explicit openGraph object here; that suppresses the
  // file-based opengraph-image.tsx for the home route.
  alternates: { canonical: '/' },
};

const KPIs = [
  { value: '24/7', label: 'Replies' },
  { value: 'Auto', label: 'Lead capture' },
  { value: '2-way', label: 'Booking' },
  { value: 'Smart', label: 'Follow-ups' },
] as const;

const INDUSTRIES = [
  {
    icon: Stethoscope,
    name: 'Clinics',
    blurb: 'Book appointments 24/7 · Handle prescription refills',
  },
  {
    icon: UtensilsCrossed,
    name: 'Restaurants',
    blurb: 'Take reservations · Confirm bookings · Answer menu FAQs',
  },
  {
    icon: Building2,
    name: 'Real estate',
    blurb: 'Qualify leads · Schedule viewings · Follow up on inquiries',
  },
  {
    icon: Scissors,
    name: 'Salons',
    blurb: 'Book stylists · Manage waitlists · Send gentle reminders',
  },
  {
    icon: Car,
    name: 'Car dealerships',
    blurb: 'Capture test-drive bookings · Pre-qualify finance questions',
  },
  {
    icon: Pill,
    name: 'Pharmacies',
    blurb: 'Refill requests · Stock checks · Route repeats to a human',
  },
] as const;

const CAPABILITIES = [
  {
    icon: MessageCircle,
    title: 'WhatsApp support',
    body: 'A real person feels a reply in seconds — even at 11pm on a Sunday. Attendly answers questions, handles objections, and keeps the tone of your brand.',
  },
  {
    icon: UserPlus,
    title: 'Lead capture & CRM',
    body: 'Every conversation captures a name, a need, and a way back in. New leads flow straight to your inbox and CRM — no copy-paste, no missed follow-ups.',
  },
  {
    icon: CalendarCheck,
    title: 'Booking',
    body: 'Plug Attendly into Google Calendar or Cal.com. Customers pick a real open slot from your real availability — double-bookings stop happening.',
  },
  {
    icon: BellRing,
    title: 'Automatic follow-ups',
    body: 'Quiet leads come back to life. Attendly sends gentle nudges at the right moment so no warm conversation dies in an inbox.',
  },
] as const;

const STEPS = [
  {
    code: '01',
    title: 'Connect',
    body: 'Plug Attendly into your WhatsApp Business account in five minutes. No new phone, no new number, no IT project.',
  },
  {
    code: '02',
    title: 'Teach',
    body: 'Tell it your hours, services, prices, and FAQs in plain language. Attendly learns your business the way a new hire would.',
  },
  {
    code: '03',
    title: 'Go live',
    body: 'Customers message. Attendly replies, books, captures leads, and follows up. You watch the dashboard and get your evenings back.',
  },
] as const;

const ROADMAP = [
  {
    title: 'AI voice calls',
    body: "When WhatsApp isn't enough, Attendly picks up the phone and has the same conversation out loud.",
  },
  {
    title: 'Invoicing & payment links',
    body: 'Send a deposit link from the same chat. Customers pay without leaving the thread.',
  },
  {
    title: 'Outbound sales agent',
    body: 'Re-engage dormant leads and book callbacks for slow seasons on autopilot.',
  },
] as const;

const PRICING = [
  {
    name: 'Starter',
    price: '$39',
    cadence: 'per month',
    summary: 'Ideal for solo practitioners and small shops just getting set up.',
    bullets: [
      '1 WhatsApp inbox',
      '1 calendar (Google or Cal.com)',
      '500 AI replies / month',
      'Basic FAQs and tone training',
      'Email support',
    ],
    cta: 'Join the waitlist',
    featured: false,
  },
  {
    name: 'Growth',
    price: '$99',
    cadence: 'per month',
    summary: 'For businesses where every missed reply is missed revenue.',
    bullets: [
      '2 WhatsApp inboxes per location',
      '2 calendars',
      '2,500 AI replies / month',
      'Lead capture & CRM sync',
      'Automatic follow-ups',
      'Priority support',
    ],
    cta: 'Join the waitlist',
    featured: true,
  },
  {
    name: 'Pro',
    price: '$299',
    cadence: 'per month',
    summary: 'Multi-location operations with custom workflows and a dedicated eye on your account.',
    bullets: [
      'Up to 5 WhatsApp inboxes across locations',
      'Unlimited calendars',
      '10,000 AI replies / month',
      'Custom AI workflows',
      'Voice-call add-on (coming soon)',
      'Dedicated success manager',
    ],
    cta: 'Join the waitlist',
    featured: false,
  },
] as const;

const FAQS = [
  {
    q: 'Will my customers know it’s AI?',
    a: 'Only if you want them to. Attendly signs every reply in your brand voice — same warm tone, same phrasing as your best receptionist. You can add a small disclosure if you prefer full transparency, but most businesses don’t.',
  },
  {
    q: 'Which languages does it speak?',
    a: 'Attendly understands and replies fluently in English, Spanish, Portuguese, and French out of the box. Additional languages are added on request for Growth and Pro customers.',
  },
  {
    q: 'Does it book into my existing calendar?',
    a: 'Yes. Attendly plugs into Google Calendar and Cal.com on day one. Other calendars are wired in by request, most within a few days.',
  },
  {
    q: 'What happens when it doesn’t know an answer?',
    a: 'Attendly hands off to a human instead of guessing. You get a notification with the full transcript so you can reply, teach Attendly the answer, and move on.',
  },
  {
    q: 'Do I need to install anything?',
    a: 'No new apps, no new phones, no new numbers. Attendly runs on your existing WhatsApp Business account and shows up to your customers exactly the same as always.',
  },
  {
    q: 'How does pricing work — are there per-message fees?',
    a: 'Pricing is a flat monthly fee with a generous AI reply allowance. No per-message surprise charges. WhatsApp’s own messaging fees (charged by Meta) apply and are billed transparently.',
  },
] as const;

const CHAT_THREAD = [
  {
    role: 'customer',
    text: 'Hi! Can I book a slot Tuesday at 3pm?',
    time: '11:42 AM',
  },
  {
    role: 'ai',
    text: 'Hi Maria — Tuesday at 3pm works. You’re booked with Dr. Lopez. I’ll send a reminder the morning of. See you then!',
    time: '11:42 AM',
  },
  {
    role: 'customer',
    text: 'Actually, can we move it to Wednesday morning?',
    time: '11:44 AM',
  },
  {
    role: 'ai',
    text: 'Of course — I’ve moved you to Wednesday at 10am with Dr. Lopez. Updated confirmation is on its way.',
    time: '11:44 AM',
  },
] as const;

export default function SetupPlaceholder() {
  return (
    <main className="flex flex-col">
      {/* HERO — friendly two-column split. Left: the proposition + KPIs. Right:
          a static chat-bubble mock rendered with the Card primitive. NO JS. */}
      <section className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(110%_75%_at_15%_0%,color-mix(in_oklab,var(--brand-200)_65%,transparent),transparent_55%),radial-gradient(75%_60%_at_95%_30%,color-mix(in_oklab,var(--brand-400)_25%,transparent),transparent_60%)]"
        />

        <div className="container-page relative grid gap-14 py-section-lg lg:grid-cols-[1.4fr_1fr] lg:gap-16">
          <div className="flex flex-col gap-7">
            <div className="flex items-center gap-3 text-caption font-semibold uppercase tracking-[0.16em] text-brand-700">
              <span className="inline-block size-1.5 rounded-full bg-brand-500" />
              AI WhatsApp employee · For local SMBs
            </div>

            <h1 className="font-display text-display text-foreground">
              <span className="block">Your AI WhatsApp employee.</span>
              <span className="block text-brand-600">Always on. Always kind.</span>
            </h1>

            <p className="max-w-2xl text-body-lg text-muted-foreground">
              Attendly answers customers on WhatsApp, captures every lead, books appointments into
              your real calendar, and follows up automatically — so you stop losing revenue to
              missed messages after hours.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <a href="#signup">Join the waitlist</a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#how">See how it works</a>
              </Button>
            </div>

            <dl className="mt-2 grid max-w-2xl grid-cols-2 gap-x-8 gap-y-5 border-t border-border pt-6 sm:grid-cols-4">
              {KPIs.map((kpi) => (
                <div key={kpi.label} className="flex flex-col gap-1">
                  <dt className="font-display text-h3 tabular-nums text-foreground">{kpi.value}</dt>
                  <dd className="text-small text-muted-foreground">{kpi.label}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Right — a static chat-bubble preview, brand-tinted, purely decorative. */}
          <aside className="relative">
            <Card className="overflow-hidden">
              <CardHeader className="flex-row items-center justify-between gap-3 space-y-0 border-b border-border bg-muted/50 pb-4">
                <div className="flex items-center gap-3">
                  <div className="grid size-9 place-items-center rounded-full bg-brand-600 text-brand-50 font-semibold">
                    A
                  </div>
                  <div className="flex flex-col">
                    <span className="font-display text-h4 text-foreground">Attendly</span>
                    <span className="flex items-center gap-1.5 text-caption text-brand-600">
                      <span className="inline-block size-1.5 animate-pulse rounded-full bg-brand-500" />
                      Online · replies in seconds
                    </span>
                  </div>
                </div>
                <Badge variant="secondary">WhatsApp</Badge>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 bg-gradient-to-b from-background to-muted/30 py-6">
                {CHAT_THREAD.map((msg) => (
                  <div
                    key={`${msg.role}-${msg.text}`}
                    className={
                      msg.role === 'customer'
                        ? 'ml-auto max-w-[80%] rounded-2xl rounded-br-sm bg-brand-600 px-4 py-2.5 text-small text-brand-50 shadow-sm'
                        : 'mr-auto max-w-[80%] rounded-2xl rounded-bl-sm border border-border bg-card px-4 py-2.5 text-small text-foreground shadow-sm'
                    }
                  >
                    <p className="leading-snug">{msg.text}</p>
                    <div
                      className={
                        'mt-1 flex items-center justify-end gap-1 text-[10px] ' +
                        (msg.role === 'customer' ? 'text-brand-100/80' : 'text-muted-foreground')
                      }
                    >
                      <span>{msg.time}</span>
                      {msg.role === 'ai' ? <CheckCheck className="size-3 text-brand-600" /> : null}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </aside>
        </div>
      </section>

      {/* SOCIAL-PROOF STRIP — six industries, badge treatment. */}
      <section className="border-b border-border bg-muted/40">
        <div className="container-page py-section">
          <p className="text-eyebrow text-center">
            Built for the businesses your neighborhood runs on
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {INDUSTRIES.map(({ icon: Icon, name, blurb }) => (
              <div
                key={name}
                className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4 shadow-sm transition-[transform,box-shadow] duration-200 ease-out-expo hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-center gap-2">
                  <span className="grid size-8 place-items-center rounded-md bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <span className="font-display text-h4 text-foreground">{name}</span>
                </div>
                <p className="text-small text-muted-foreground">{blurb}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CAPABILITIES — section id #features. Four-job grid. */}
      <section id="features" className="border-b border-border">
        <div className="container-page py-section-lg">
          <div className="max-w-3xl">
            <p className="text-eyebrow">What it does</p>
            <h2 className="mt-3 font-display text-h2 text-foreground">Four jobs. One employee.</h2>
            <p className="mt-4 text-body-lg text-muted-foreground">
              Attendly handles the four conversations every local business has every day — the ones
              that happen after hours, between shifts, and while you&rsquo;re busy with the customer
              standing in front of you.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {CAPABILITIES.map(({ icon: Icon, title, body }) => (
              <Card key={title} className="lift flex h-full flex-col gap-3">
                <CardHeader className="flex-row items-center gap-3 space-y-0 pb-2">
                  <span className="grid size-10 place-items-center rounded-md bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <CardTitle className="font-display text-h4 text-foreground">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-body text-muted-foreground">{body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS — section id #how. Three numbered steps in a row at md+. */}
      <section id="how" className="border-b border-border bg-muted/40">
        <div className="container-page py-section-lg">
          <div className="max-w-3xl">
            <p className="text-eyebrow">How it works</p>
            <h2 className="mt-3 font-display text-h2 text-foreground">
              Three steps. No IT project.
            </h2>
            <p className="mt-4 text-body-lg text-muted-foreground">
              You don&rsquo;t need to be technical. You don&rsquo;t need a developer. You
              don&rsquo;t need to change how your customers reach you.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {STEPS.map(({ code, title, body }) => (
              <article
                key={code}
                className="relative flex flex-col gap-3 rounded-lg border border-border bg-card p-6 shadow-sm transition-[transform,box-shadow] duration-200 ease-out-expo hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex size-9 items-center justify-center rounded-full border border-border bg-muted font-display text-h4 tabular-nums text-brand-600">
                    {code}
                  </span>
                  <h3 className="font-display text-h4 text-foreground">{title}</h3>
                </div>
                <p className="text-body text-muted-foreground">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ROADMAP — short hint of what&rsquo;s coming (not the focus). */}
      <section className="border-b border-border">
        <div className="container-page py-section">
          <div className="grid gap-8 lg:grid-cols-[1fr_2fr] lg:gap-14">
            <div>
              <p className="text-eyebrow">Coming soon</p>
              <h2 className="mt-3 font-display text-h3 text-foreground">
                The WhatsApp MVP is just the start.
              </h2>
              <p className="mt-3 text-body text-muted-foreground">
                Customers already love the chat. We&rsquo;re building the next layer — quietly, in
                the background.
              </p>
            </div>
            <ul className="flex flex-col gap-3">
              {ROADMAP.map((item) => (
                <li
                  key={item.title}
                  className="flex flex-col gap-1 rounded-lg border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:gap-4"
                >
                  <Badge variant="secondary" className="shrink-0 self-start sm:self-center">
                    Coming soon
                  </Badge>
                  <div className="flex flex-col gap-1">
                    <span className="font-display text-h4 text-foreground">{item.title}</span>
                    <span className="text-small text-muted-foreground">{item.body}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* PRICING — section id #pricing. Three tiers; Growth is featured. */}
      <section id="pricing" className="border-b border-border bg-muted/40">
        <div className="container-page py-section-lg">
          <div className="max-w-3xl">
            <p className="text-eyebrow">Pricing</p>
            <h2 className="mt-3 font-display text-h2 text-foreground">
              Pick the size of your inbox.
            </h2>
            <p className="mt-4 text-body-lg text-muted-foreground">
              Flat monthly pricing. No per-message surprises. Cancel any time.
            </p>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {PRICING.map((tier) => (
              <Card
                key={tier.name}
                className={
                  'flex h-full flex-col gap-5 ' +
                  (tier.featured
                    ? 'border-brand-600 shadow-brand ring-1 ring-brand-600/40'
                    : 'lift')
                }
              >
                <CardHeader className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle className="font-display text-h3 text-foreground">
                      {tier.name}
                    </CardTitle>
                    {tier.featured ? <Badge>Most popular</Badge> : null}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-h2 tabular-nums text-foreground">
                      {tier.price}
                    </span>
                    <span className="text-small text-muted-foreground">{tier.cadence}</span>
                  </div>
                  <p className="text-body text-muted-foreground">{tier.summary}</p>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-5">
                  <ul className="flex flex-col gap-2">
                    {tier.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2 text-body text-foreground">
                        <CheckCheck className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    asChild
                    size="lg"
                    variant={tier.featured ? 'default' : 'outline'}
                    className="mt-auto w-full"
                  >
                    <a href="#signup">{tier.cta} →</a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ — section id #faq. Accordion. */}
      <section id="faq" className="border-b border-border">
        <div className="container-page max-w-3xl py-section-lg">
          <p className="text-eyebrow">FAQ</p>
          <h2 className="mt-3 font-display text-h2 text-foreground">
            Questions business owners ask first.
          </h2>
          <Accordion type="single" collapsible className="mt-8">
            {FAQS.map((item, i) => (
              <AccordionItem key={item.q} value={`q-${i}`}>
                <AccordionTrigger className="text-left font-display text-h4 text-foreground">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-body text-muted-foreground">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* FINAL CTA — section id #signup. Copy on the left, signup card on the right. */}
      <section id="signup" className="relative overflow-hidden border-border">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_0%,color-mix(in_oklab,var(--brand-300)_65%,transparent),transparent_70%)]"
        />
        <div className="container-page relative py-section-lg">
          <div className="grid gap-10 rounded-xl border border-border bg-card p-8 shadow-sm lg:grid-cols-[1.4fr_1fr] lg:items-center lg:p-10">
            <div>
              <p className="text-eyebrow">Join the waitlist</p>
              <h2 className="mt-3 font-display text-h2 text-foreground">
                Be first when we open in your area.
              </h2>
              <p className="mt-4 max-w-2xl text-body-lg text-muted-foreground">
                We&rsquo;re onboarding businesses city by city. Drop your email and we&rsquo;ll let
                you know the moment your area is next — no spam, no follow-on sales calls.
              </p>
            </div>
            <div className="flex justify-center lg:justify-end">
              <AttendlySignup />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
