import React from 'react';
import { initialBlogs } from '@/lib/seedData';
import { BlogsClientContent } from './BlogsClientContent';
import { createPageMetadata, seoEntries } from '@/lib/seo';

export const metadata = createPageMetadata('/blogs', seoEntries['/blogs']);

export const revalidate = 300; // ISR: revalidate every 5 minutes

export default function BlogsPage() {
  return <BlogsClientContent initialBlogs={initialBlogs} />;
}
