import type { Metadata } from 'next';
import { OpportunitiesView } from '@/components/custom/opportunities-view';

export const metadata: Metadata = {
  title: 'Opportunities',
  description:
    'Top cross-marketplace price gaps the Tidefork scanner has detected — Amazon, eBay, and Walmart, dest-side fees applied, ranked by gross margin.',
  alternates: { canonical: '/opportunities' },
};

export default function OpportunitiesPage() {
  return <OpportunitiesView />;
}
