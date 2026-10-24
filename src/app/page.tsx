import HomePageClient from './HomePageClient';
import { createPageMetadata, seoEntries } from '@/lib/seo';

export const metadata = createPageMetadata('/', seoEntries['/']);

export default function HomePage() {
  return <HomePageClient />;
}
