# AGENTS.md — Polsia Next.js Template

## What this template is

You are reading the Polsia Next.js template (template id `polsia-next-v2`, package `polsia/template-next` v0.3.0, GitHub repo `Polsia-Inc/template-next`). It is a scaffold with the shadcn baseline built in: Next.js 16 App Router, React 19, Tailwind 4 CSS-first, a broad shadcn primitive set (see `.polsia/ownership.json` for the full list) + the `cn()` helper + `components.json` + a design-token theme + a next-themes ThemeProvider, Prisma 6 as the framework-native DB client, Biome, Vitest. Nothing else.

Customer apps are not built by hand. You — the Polsia engineering agent — mutate this template through bounded edit zones declared in `.polsia/ownership.json`, then install modules from `Polsia-Inc/modules` to add reusable capabilities such as auth, billing, email, dashboards, and analytics. The shadcn baseline ships in the template — compose the base primitives in `src/components/ui/`, restyle through the theme tokens (the `brand_tokens` slot) + cva variants, and pull more primitives with `npx shadcn add`. The repo's directory shape and ownership banners are the contract that lets you edit without breaking the framework.

The human `README.md` describes the template for developers. This file is for you. Read it before doing anything else.

## You are operating on a Polsia v2 customer app

If you are reading this file, the dispatcher routed this task to engineering-agent-v2 because the `engineering-agent-v2` PostHog flag is enabled for the customer's org and the repo's `.polsia/installed.json` template id is `polsia-next-v2`. Before any action, read three state files:

- `.polsia/installed.json` — machine-owned trust anchor: installed modules, versions, install-hashes, ejected files, slot assignments, day-1 validator floor. Never hand-edit.
- `.polsia/ownership.json` — path-to-tier map; the single authority. The eng-v2 ownership gate reads this file and enforces tiers by diffing the agent's changes against it. Comment-capable source files (`.ts/.tsx/.mjs/.css/.prisma`) also carry a matching `@polsia:` banner as signage for the reader — no gate reads the banner, so it is informational only and `ownership.json` is the sole authority. JSON/`.npmrc`/`.toml` files can't host a banner and are governed by their `ownership.json` entry the same way.
- `.polsia/overrides.json` — hand-editable per-module config and auto-upgrade policy. Read but don't write unless the task is an explicit override change.

Treat these as authoritative. If you think a file is editable but `ownership.json` says framework_owned, `ownership.json` wins.

## Ownership tiers — read `.polsia/ownership.json`

Every path in this repo belongs to one of three tiers.

`framework_owned` — the framework or owning module rewrites these on upgrade. You do not edit them. Comment-capable source files carry a `// @polsia:framework-owned` banner (e.g. `src/lib/db.ts`, `src/lib/utils.ts`, `src/components/theme-provider.tsx`, `prisma.config.ts`); JSON/config files that can't host a banner (`components.json`, `tsconfig.json`, `biome.json`, `.npmrc`) are framework_owned purely by their `ownership.json` entry. Either way, `ownership.json` is the authority.

`user_owned` — the framework creates these with sane defaults at install, then never touches them. You may edit them freely. Examples: `public/**`, `src/app/not-found.tsx`, `README.md`, `.env.local`, `.polsia/overrides.json`.

`shared` — modified by multiple modules through declared slot markers. You insert content between named `@polsia:slot <name>` markers; the rest of the file is off-limits. Examples: `src/app/globals.css` (`brand_tokens` slot, palette-pool strategy), `src/app/layout.tsx` (`providers` slot, composed), `proxy.ts` (`middleware_chain` slot), `next.config.ts` (`images_remote_patterns`, `package_level_options`).

## Tier invariants — NON-NEGOTIABLE

These are declared verbatim in `.polsia/ownership.json#tier_invariants`. The validator enforces them; treat them as physics, not guidance.

`auth_subtree_user_owned` — `src/app/(auth)/**` is user_owned (like `(dashboard)`): build + restyle auth-area pages freely. Don't hand-roll the auth security surface — install the auth module, which owns `src/lib/auth.ts`, `src/app/api/auth/**`, the prisma auth schema and `require-auth`/`require-admin` as framework_owned.

`dashboard_subtree_user_owned` — `src/app/(dashboard)/**` is user_owned: build + iterate member-area pages (settings/admin/teams) freely. Like `(auth)`, it has no framework-owned surface of its own; module-seeded pages are yours to restyle.

`user_owned_post_install` — the framework never writes to user_owned paths after the initial install. The brand module seeds `public/` once; nothing re-touches it.

`setup_route_replaced_by_app_surface` — `src/app/(setup)/page.tsx` is the **user-owned** starter home served at `/` on a fresh clone. You replace it: edit it in place into the real home, or delete the whole `(setup)/` tree once you add a root `src/app/page.tsx` or a route-owning module takes over `/` (two pages resolving to `/` is a build error). Nothing auto-removes the tree — when a module takes over `/`, you delete `(setup)/` yourself as part of wiring the module in. Never leave `/` with no page.

`ui_baseline_in_template` — the template ships the shadcn baseline directly: `components.json` + `cn()` + a next-themes ThemeProvider (framework_owned), a committed base primitive set in `src/components/ui/**` that is AGENT-OWNED (restyle/extend via theme tokens + cva variants), and a token-driven theme. There is NO ui-core module. Restyle look-and-feel through the `brand_tokens` slot + cva variants. Pull more primitives with `npx shadcn add`.

## Your first task on a fresh customer repo

When you land in a freshly-cloned customer repo, `.polsia/installed.json#modules` is `[]` on a fresh clone — the UI baseline is in the template, not a module. `/` still serves the `(setup)` "not configured yet" placeholder until the first real app surface exists. Your first move is usually to read the customer brief and decide whether an existing module covers the requested capability.

Read the customer brief. If it asks for app-specific UI, public pages, or product workflow that no module covers, build it yourself in user-owned zones: the base shadcn set is present in `src/components/ui/`; compose it, restyle via theme tokens + cva variants, and pull more with `npx shadcn add`. Build reusable styled components in `src/components/custom/` (see `section-card.tsx`). If it implies dangerous reusable capability, propose a new module instead.

For dangerous or reusable capabilities, modules first. Use user-owned custom
code only when the work is genuinely app-specific and no catalog module covers
it.

## How to install a module

Use the `polsia_modules_install` MCP tool or the shared `polsia-modules install` CLI. Do not clone the modules repo and copy files by hand. The module manifest is the source of truth, and the installer is responsible for file writes, `.polsia/installed.json` updates, ownership updates, and validators. (Removing the `(setup)` home is NOT the installer's job — when a module takes over `/`, you delete the `(setup)/` tree yourself; see `setup_route_replaced_by_app_surface`.)

The shadcn baseline ships IN the template, not as a module:

- `components.json` (shadcn config — New York, neutral, lucide) — framework_owned
- `src/lib/utils.ts` (`cn()`) — framework_owned
- `src/components/theme-provider.tsx` (next-themes wrapper) — framework_owned
- a real design-token theme in `src/app/globals.css` (the `brand_tokens` slot)
- `src/components/ui/**` ships a POPULATED primitive set (layout, forms, overlays, navigation, feedback — see `.polsia/ownership.json` for the full list) and is **agent-owned** — restyle/extend it; pull more via `npx shadcn add`

If the MCP/CLI cannot complete a module install, escalate. Do not invent install steps.

## How to write custom business logic

Custom code is for app-specific work that no module covers. Create new files only under user-owned patterns:

- Feature routes: `src/app/(custom)/<feature>/page.tsx` (new route group, user-owned by creation).
- Domain logic: `src/lib/business/<feature>.ts`.
- Feature components: `src/components/custom/<feature>.tsx`.
- React hooks: `src/hooks/use-<feature>.ts` (agent-authored hooks are app-owned).
- Next.js config tweaks (remote image hosts, package-level options): `next.user-config.ts` — the user-owned companion that `next.config.ts` imports + merges; never edit `next.config.ts` itself.
- Browser features (microphone/camera/geolocation): flip them on in `appCapabilities` in `next.user-config.ts`. Default is OFF — the app can't even prompt, so audio/video recording never starts (this is the usual cause of "recording won't start" / "getUserMedia blocked"). `true` emits `<feature>=(self)`; the browser's own permission prompt is still the gate. Leave unused features OFF (audits flag unused device permissions). `browsing-topics` is not exposed.
- Third-party origins in the CSP (embed Stripe/YouTube/reCAPTCHA, call another API/WebSocket, load external media/fonts): add the EXACT origins to `cspExtraSources` in `next.user-config.ts` (`frameSrc`/`connectSrc`/`mediaSrc`/`fontSrc`/`imgSrc`). Default empty = same-origin only. Wildcards and `script-src`/`style-src` are deliberately not openable — the strict script-src stays the XSS rampart.
- Next.js config PLUGINS that must wrap the whole config (next-intl's `createNextIntlPlugin`, `withSentryConfig`, `@next/mdx`, bundle-analyzer): add the wrapper to `userConfigPlugins` in `next.user-config.ts`. `next.config.ts` composes them and RE-ASSERTS the security headers afterward, so you get the plugin without touching framework config. For i18n, install the `i18n` module (it ships the request config + provider) and add its plugin to `userConfigPlugins` per the module's `AGENT.md`.

Most of these directories do not exist in the scaffold; you create them. They are user-owned by virtue of being outside every framework_owned and shared pattern in `ownership.json`. Add a `// @polsia:user-owned` banner at the top of new files so future runs of the validator know.

### Navigation: make every feature reachable by the right intent

The layout renders a `SiteNav` (`src/components/custom/site-nav.tsx`) reading `src/lib/nav.ts` — both are yours to edit. When you add a page, make it reachable by the right intent: add a nav entry, a hero CTA, a card, or a contextual link — whatever fits. `nav.ts`/`SiteNav` are a CONVENIENCE, not a required contract; there is no module auto-registration. The only rule: every feature is reachable from the home page (or the dashboard, for authed features).

A `NavItem` is `{ label, href, group: 'primary' | 'secondary' | 'footer', menu?, requiresAuth?, order? }`; the global `<SiteNav/>` + `<SiteFooter/>` (mounted once in `layout.tsx`) render from that list. Use `<Button asChild>` wrapping `<Link>` for link-CTAs — never a raw styled `<a>`. `requiresAuth` items render only when a session exists; the template ships with no auth, so they stay hidden until an auth module wires the session seam in `src/components/custom/site-nav.tsx`.

**Keep the top bar short — don't pile every page into `primary`.** A `primary` item is one top-bar slot. When a site has many destinations, GROUP the related ones with `menu`: give several primary items the same `menu` value (e.g. `menu: 'Resources'` on Blog, Docs, Changelog) and they collapse into one "Resources ⌄" dropdown instead of three slots. Reserve `primary` (or `menu` triggers) for the ~3-5 destinations a visitor browses; put 1-2 conversion CTAs (Sign in / Get started) in `secondary`; route the long tail (legal, FAQ, secondary pages) to `footer`. As a backstop `SiteNav` auto-overflows any slots past a fixed cap into a trailing "More" dropdown, so the bar can never grow unusably wide — but use `menu`/`footer` deliberately rather than leaning on the overflow.

### SEO: defaults are framework — per-page metadata comes from the page

Site-wide SEO is framework plumbing — don't hand-roll it. `src/app/robots.ts` (noindex unless the deploy sets `SEO_INDEXABLE=true`), `src/app/sitemap.ts` (generated from the `src/lib/nav.ts` public routes — add a `NavItem` and the page is in the sitemap), `src/app/manifest.ts` + `src/app/icon.svg`, and the `metadataBase`/OG/Twitter/`title` template/`canonical` defaults in `layout.tsx` all ship and resolve the origin from `src/lib/site.ts`. **Set the brand: edit `src/lib/site.ts`'s `siteUrl`? No — that's the deploy origin. The product name + tagline live in `src/lib/brand.ts` (user-owned) — set `siteName`/`siteDescription` there to the founder's product on your FIRST turn; it drives the nav-bar brand, the `<title>` template, OG/Twitter, and the manifest in one place.** Per-page `title`/`description`/OG-image and structured data (JSON-LD) come from each page's own `metadata` export — they compose on top of these defaults; do not duplicate or re-implement the robots/sitemap/OG infra.

### Data plane: client pages + `/api/*` route handlers

This is the one lane all data and mutations drive in:

- Product pages are client components (`'use client'`) that render with React state/hooks and fetch through the typed helper `@/lib/api-client` (`apiFetch`). They do NOT fetch data in a Server Component body.
- Every read and write is an App Router route handler at `src/app/api/<resource>/route.ts` exporting `GET`/`POST`/etc. Handlers `import 'server-only'`, use the Prisma singleton from `@/lib/db` (the reference route ships this as a commented seam — uncomment it once your model exists), validate input with zod, and return `NextResponse.json` with correct status codes (200/201, 400 validation, 409 conflict, 500 unexpected — a 409 body round-trips through `applyServerErrors` exactly like a 400). Copy `src/app/api/example/route.ts`.
- NO Server Actions (`'use server'` is banned). NO RSC server-side data-fetch — the layout/page RSC layer is the HTML shell only (`src/app/layout.tsx` stays an async Server Component for the CSP nonce + SEO; that is the only sanctioned server render).
- Ownership of `/api` route handlers follows who shipped them: module-installed handlers are framework_owned (each module's manifest adds its own globs at install; the install integrity registry pins the files). The template's reference handler (`src/app/api/example/**`) is a concrete example you OWN — copy its shape for real resources, edit it, or delete it when building the real feature — exactly like the route handlers YOU author for app resources (app-owned). Create yours at `src/app/api/<resource>/route.ts` and modify them freely in later turns. Build product *pages* in user-owned zones; data access lands behind `/api`.
- **Typed end to end via a shared zod contract.** Define one contract per resource at `src/lib/contracts/<resource>.ts` (copy `example.ts`): the item schema, a list wrapper `z.object({ items: z.array(Item) })`, and the inferred types. The route handler AND the client page import the SAME contract, so a shape change is a `tsc` error / runtime `ZodError`, not silent drift. The client calls `apiFetch('/api/<resource>', { schema })` — `apiFetch` runs `schema.parse`, so the result is a PROVEN type, never an unchecked `as T` cast. Do NOT add SWR/react-query/axios for app data.
- **Form errors round-trip.** A handler returns validation failures as `{ errors: { <field>: <message> } }` with status 400; the client maps them onto the form with `applyServerErrors` from `@/lib/forms`. The end-to-end worked example is `src/app/(custom)/example/page.tsx`. Transient action feedback (the mutation succeeded, or failed with no field-level mapping) goes to a toast — see **Toasts** below — not an ad-hoc inline message; field-level validation stays inline on the form.

Never touch `framework_owned` files. Never write outside slot markers in `shared` files. The commit-time validator rejects both.

### UI: a base set + a theme are already here — compose and restyle through the theme

The shadcn primitive set ships POPULATED in `src/components/ui/` (layout, forms,
overlays incl. poppers, navigation, feedback — see `.polsia/ownership.json` for
the full list) — it is YOURS to restyle and extend. Every primitive works in
production: `proxy.ts` keeps `script-src` strict (nonce + `strict-dynamic`) but
allows inline styles (`style-src 'unsafe-inline'`), so Radix runtime positioning
and animation (poppers, slider, progress) are not blocked. Do NOT re-add a nonce
to `style-src`. Change look-and-feel via the theme tokens (`bg-background`,
`text-foreground`, `bg-card`, `border-border`, `bg-primary`,
`text-muted-foreground`, …) in the `brand_tokens` slot + cva variants on the
primitives — never ad-hoc per-element colors. Need a primitive not in the base
set? Run `npx shadcn@latest add <name> --yes` (the ONE allowed CLI; capability
modules — auth, billing, etc. — still come through the `polsia_modules` MCP,
never a CLI) — it lands agent-owned in `src/components/ui/`. Build STYLED,
REUSABLE components in `src/components/custom/` by composing the primitives (see
`section-card.tsx`).

### Toasts (transient user feedback)

A global toast host ships mounted — `<Toaster/>` (sonner, themed off next-themes)
lives in the `layout.tsx` `providers` slot, so there is NO provider to wire and
no per-page setup. From ANY `'use client'` component, import the imperative API
and call it:

```ts
import { toast } from 'sonner';

toast.success('Saved');
toast.error('Could not save');
toast('Heads up'); // neutral
toast.promise(savePromise, { loading: 'Saving…', success: 'Saved', error: 'Failed' });
```

Use toasts for transient action feedback — a mutation succeeded, or failed with
no field-level mapping. Keep field-level validation errors INLINE on the form
(`<FormMessage/>` + `applyServerErrors`), never in a toast. `toast` is
client-only: never call it from a route handler, `src/lib/**` server code, or a
Server Component — emit it from the client page that made the `apiFetch` call
(worked example: `src/app/(custom)/example/page.tsx`). It already ships, so do
NOT `npx shadcn add sonner`; restyle the host in `src/components/ui/sonner.tsx`
(agent-owned) or via the `brand_tokens` theme.

Root/global-mounted UI (Cmd+K palette, global keyboard listeners, app-wide overlays)
goes in `src/components/custom/global-mounts.tsx` (mounted once at the app root), not by editing `layout.tsx`.

## Slot markers in shared files

When inserting into a shared file, use the exact slot marker grammar already in the file. Slot IDs are snake_case per D22:

```
/* === BEGIN polsia-slot:brand_tokens === */
...your content here...
/* === END polsia-slot:brand_tokens === */
```

```
{/* @polsia:slot providers start */}
...your content here...
{/* @polsia:slot providers end */}
```

Content outside the markers is framework territory. The validator rejects edits that cross the boundary or omit the markers.

## Build, run, test

```
npm install
npm run dev          # http://localhost:3000 — needs env (see note)
npm run build        # needs env (see note)
npm run typecheck
npm run lint         # biome check
npm run test         # vitest run
```

**Env at dev/build time.** `next.config.ts` eagerly loads `src/lib/env.ts`, whose
schema REQUIRES `DATABASE_URL` and `NEXT_PUBLIC_APP_URL`. Validation runs at
config load, so `npm run dev` and `npm run build` **fail fast** with `Invalid
environment variables` on a clone Polsia hasn't injected into. To run locally,
either set a real `DATABASE_URL` in `.env.local` **or** prefix the command with
`SKIP_ENV_VALIDATION=1` (e.g. `SKIP_ENV_VALIDATION=1 npm run build`).
`typecheck`/`lint`/`test` need no env. In production Polsia injects the vars — do
NOT weaken the schema to make a local build pass.

The deploy pipeline's healthcheck hits `/health`. Do not break that route.

`npm run lint` enforces the biome client/server *import* boundary (`noRestrictedImports`: client pages may not import `@/lib/db`/`@prisma/client`/`server-only`/`next/headers`; route handlers, `layout.tsx`, and `src/lib/**` are exempted via `overrides`). The separate `'use server'` ban is enforced by the deploy build gate, which scans `src/` for the directive and fails the build if it finds one — Biome cannot catch it (it sees imports, not a string directive), and Next 16 has no config flag to disable Server Actions. It is NOT a cataloged `day_1_floor` validator.

Because Server Actions cannot be disabled by config and the deploy build gate rejects the directive, do not add an `experimental.serverActions` block to `next.config.ts` to try. An EXTERNAL `/api` origin (token-ready mode) is wired only by setting the `NEXT_PUBLIC_API_URL` env var (it feeds `@/lib/api-client`'s base and `proxy.ts`'s `connect-src`); never hand-edit `proxy.ts` or `next.config.ts` for it. Same-origin `/api` needs no config — `connect-src 'self'` covers it and the `proxy.ts` matcher already excludes `/api`.

## Deploy manifest — `polsia.toml`

`polsia.toml` (repo root) is the deploy manifest Polsia's pipeline reads server-side at the deployed commit. It declares `build`, `start`, `healthcheck_path`, `port_env_var`, the `[env]` sources resolved at setup (e.g. `DATABASE_URL = { source = "rdbms" }`), and any `[[crons]]`. Parsing is fail-open per field — a missing/invalid field falls back to the platform default — so it never blocks a deploy, but a wrong value silently degrades it. The build/start/health/port values mirror the platform's verified manifest for this template: **do not change them.** It is `user_owned` for ONE reason — so you can declare scheduled work.

**Recurring/scheduled work goes in `polsia.toml` `[[crons]]`, never an in-process scheduler.** Append one block per job: `name` (stable kebab slug, `/^[a-z][a-z0-9-]{0,62}$/`, unique), `schedule` (5-field POSIX cron, e.g. `"0 9 * * *"`), `command` (runs in a fresh checkout, e.g. `"node jobs/digest.js"`), and optional `dependencies` (extra npm packages for that job only). Do NOT use `setInterval`/`setTimeout`/`node-cron`/`node-schedule`/`agenda`/`bull`/long-lived workers for product behavior — they don't survive Blaxel's scale-to-zero and aren't the scheduling source of truth. If a job needs a manual trigger, expose an `/api/...` route handler that runs the same logic; the future schedule still belongs in `[[crons]]`.

## Startup seed — `src/lib/seed.ts`

Reference/lookup data that must exist BEFORE the first request — plans, categories, feature defaults, a first admin row — goes in `src/lib/seed.ts` (you own it). The framework-owned Next server hook `src/instrumentation.ts` calls `seed()` once when the server boots, on the Node runtime, AFTER the schema is applied (`polsia.toml`'s `start` runs `prisma db push` before `npm start`). Read/write through `@/lib/db` (`prisma`) directly — this is server startup, there is no request, so it does NOT go through `/api`.

It runs on EVERY deploy/boot (and can run on more than one instance at once), so every write MUST be idempotent — `upsert` or `createMany({ ..., skipDuplicates: true })`, never a bare `create`. A throw is logged and swallowed (the server still boots), so a bad seed degrades gracefully; keep it fast and small. This is NOT for recurring work (that's `[[crons]]`) or per-user/request logic (that's an `/api` route handler). The template ships an empty `seed()` (a no-op) — fill the body when you need it, leave it empty to keep seeding off, don't delete the file, and don't edit `src/instrumentation.ts` (it owns the runtime guard + fail-open envelope).

## Anti-patterns the validator rejects

- Editing `next.config.ts`, `proxy.ts`, or `src/lib/csp.ts` directly to loosen the security headers/CSP. They are framework-owned (security headers, CSP, Cache-Components policy). Use the user-owned `next.user-config.ts` seams: remote image hosts (`userRemotePatterns`), package-level options (`userNextConfig`), wrapping config plugins (`userConfigPlugins` — next-intl/Sentry/MDX/analyzer), browser features (`appCapabilities` — microphone/camera/geolocation), and extra CSP origins (`cspExtraSources` — frame/connect/media/font/img). `next.config.ts` imports, composes, and re-asserts security around them. (Module image/package contributions still splice the `images_remote_patterns` / `package_level_options` slots at install.)
- Hand-rolling the auth SECURITY surface — `src/lib/auth.ts`, `src/app/api/auth/**`, the prisma auth schema, `require-auth`/`require-admin` (framework_owned, installed by the auth module). Install the covering auth module instead. The `(auth)`/`(dashboard)` route-group PAGES are user_owned — build + restyle them freely.
- Modifying `prisma/schema/_base.prisma` (datasource + generator; framework_owned). Data modules each drop a whole governed `prisma/schema/<module>.prisma` file (file-drop, no slot splicing; protected by the module's manifest globs). Agent-authored `prisma/schema/<feature>.prisma` files are app-owned — add your own models there. Do NOT redeclare datasource or generator in any other schema file.
- Hand-editing `.polsia/installed.json` or `.polsia/ownership.json`. Both are machine-emitted.
- Editing `src/instrumentation.ts` (framework-owned) or inlining seed logic there — put idempotent startup seed logic in `src/lib/seed.ts`; the hook owns the Node-runtime guard + fail-open envelope. A non-idempotent write in `seed.ts` is a bug: it runs on every boot — use `upsert`/`skipDuplicates`.
- Deleting any `.polsia/*` file.
- Writing outside slot markers in any shared file.
- Setting `cacheComponents: true` in `next.config.ts` (D17 — off by default, Lovable-class failure surface on auth).
- Adding `middleware.ts` (D18 — Next 16 uses `proxy.ts`; the validator rejects the old name. Note: local `npm run lint` only scans `src`/`tests`, so it will NOT catch a root `middleware.ts` — rely on the validator, not lint).
- Adding palette values to `globals.css` outside the validated palette-pool range.
- Committing `.env`, `.env.local`, or any `.env*` file (gitignore enforces; the platform injects vars at deploy time).
- Adding a `'use server'` directive anywhere (Server Actions are banned; data + mutations go through `/api/*` route handlers — the deploy build gate scans for the directive and rejects it).
- Fetching data (DB or remote `fetch`) inside a Server Component body — page/layout RSC is the HTML shell only.
- Importing `@/lib/db`/`prisma`/`server-only`/`next/headers` from a `'use client'` file (Biome `noRestrictedImports` rejects it).

## When in doubt

Escalate to the operator via `complete_task` with a clarifying note. The cost of a 30-second human clarification is far below the cost of a commit-rejecting validator failure or a Lovable-class auth incident. Don't write code you're not sure about.


## Customizing the shell (without ejecting layout.tsx)

`src/app/layout.tsx` is framework-owned (re-stamped on upgrade) — do NOT edit it. Use these user-owned seams the shell imports:

- **`<html lang>` / `dir`** — `src/lib/locale.ts` (e.g. `lang: 'fr'`, `dir: 'rtl'`).
- **Viewport / browser theme-color** — `src/lib/viewport-config.ts` (defaults to your brand seed).
- **Extra `<head>` (verification meta, `preconnect`, third-party scripts)** — `src/components/custom/head-content.tsx` (use `next/script` for scripts; the CSP `nonce` is passed in).
- **App-wide React providers** — `src/components/providers.tsx`. **Global mounts/widgets** — `src/components/custom/global-mounts.tsx`. **Nav** — `src/lib/nav.ts`. **Brand name/colors** — `src/lib/brand.ts`.
- **Fonts + global CSS** — set font-family in the `brand_tokens` slot of `globals.css`; add `@font-face`/`@import` in `src/app/custom-style.css`. For a `next/font`-optimized font, create `src/lib/fonts.ts` importing from `next/font`, expose its `.variable`, and reference it in `brand_tokens` — no eject needed.
- **Error UI** — `src/app/error.tsx` / `src/app/global-error.tsx` (restyle or delete).

Eject `layout.tsx` only for a shell need none of these expose.
