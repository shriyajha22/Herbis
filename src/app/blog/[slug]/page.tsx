import BlogDetailPage, {
  generateMetadata as baseGenerateMetadata,
  generateStaticParams as baseGenerateStaticParams,
} from '@/app/blogs/[slug]/page';
import type { Metadata } from 'next';
import { initialBlogs } from '@/lib/seedData';
import { notFound } from 'next/navigation';

interface BlogDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return initialBlogs.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const blog = initialBlogs.find((b) => b.slug === slug || b._id === slug);
  if (!blog) notFound();

  const seoTitle = blog.seoTitle || `${blog.title} | PrimeBrew Herbis Journal`;
  const seoDescription = blog.seoDescription || blog.excerpt;
  const canonicalUrl = `/blog/${blog.slug}`;

  return {
    title: { absolute: seoTitle },
    description: seoDescription,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: blog.title,
      description: seoDescription,
      images: [{ url: blog.coverImage, alt: blog.coverImageAlt || blog.title }],
      type: 'article',
      siteName: 'PrimeBrew Herbis',
      url: canonicalUrl,
    },
    twitter: {
      card: 'summary_large_image',
      title: blog.title,
      description: seoDescription,
      images: [blog.coverImage],
    },
  };
}

export default BlogDetailPage;

