// @polsia:user-owned — brand identity. Edit freely. `site.ts` re-exports
// siteName/siteDescription; `manifest.ts` + `opengraph-image.tsx` read `brandVisual`.

export const siteName = 'Attendly';
export const siteDescription =
  'Your AI WhatsApp employee — answers customers, captures leads, books appointments, and follows up automatically.';

// PWA + social-share colors. HEX only (the oklch() tokens in globals.css aren't
// readable here) — set to match your brand seed.
export const brandVisual = {
  /** PWA browser-UI / status-bar color. */
  themeColor: '#5b4ad1',
  /** PWA splash + install background. */
  backgroundColor: '#f3f1fb',
  /** Social-share (OG/Twitter) image. */
  og: {
    background: '#1a1635',
    foreground: '#ece9ff',
    /** Second line under the site name; '' hides it. */
    tagline: 'Your AI WhatsApp employee.',
  },
} as const;
