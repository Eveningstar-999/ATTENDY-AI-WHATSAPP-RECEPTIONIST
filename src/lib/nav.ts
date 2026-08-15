// @polsia:user-owned — app navigation rendered by SiteNav/SiteFooter and read by
// the sitemap. Edit it as pages are added or removed.
// This list is a convenience, not module registration.

export type NavGroup = 'primary' | 'secondary' | 'footer';

export interface NavItem {
  /** Visible link text. */
  label: string;
  /** App route, e.g. '/' or '/dashboard'. */
  href: string;
  /** Where it renders: top-nav 'primary'/'secondary', or 'footer'. */
  group: NavGroup;
  /** Group `primary` items into a dropdown: items sharing a `menu` value collapse
   *  into one "<menu> ⌄" top-bar slot (e.g. `menu: 'Resources'` on Blog/Docs/
   *  Changelog). Keeps the bar short. Ignored for 'secondary'/'footer'. */
  menu?: string;
  /** When true, render only if a session exists (see site-nav.tsx). */
  requiresAuth?: boolean;
  /** Sort key within a group (ascending); unordered items fall to the end. */
  order?: number;
}

// Contact email — the product's real, provisioned inbox. Reused across CTAs.
export const CONTACT_EMAIL = 'hello@attendly.app';

// Keep the bar short: ~3-5 primary slots, group the tail with `menu`, push the
// rest to 'footer' (SiteNav overflows extras into a "More" dropdown).
export const navItems: NavItem[] = [
  // Primary — section anchors on the marketing landing.
  { label: 'Features', href: '/#features', group: 'primary', order: 0 },
  { label: 'How it works', href: '/#how', group: 'primary', order: 1 },
  { label: 'Pricing', href: '/#pricing', group: 'primary', order: 2 },
  { label: 'FAQ', href: '/#faq', group: 'primary', order: 3 },

  // Secondary — conversion CTA in the top bar.
  { label: 'Join waitlist', href: '/#signup', group: 'secondary', order: 1 },

  // Footer — long-tail links (FAQ anchor + direct contact).
  { label: 'FAQ', href: '/#faq', group: 'footer', order: 1 },
  { label: 'Contact', href: `mailto:${CONTACT_EMAIL}`, group: 'footer', order: 2 },
];
