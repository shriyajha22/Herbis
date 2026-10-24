'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { initialBlogs } from '@/lib/seedData';
import { ChevronRight, Calendar, Clock, User, Share2, Tag, ArrowLeft } from 'lucide-react';

export default function BlogDetailPage({ params }: { params: { slug: string } }) {
  const blog = initialBlogs.find((b) => b.slug === params.slug || b._id === params.slug);

  if (!blog) {
    return notFound();
  }

  return (
    <div className="py-16 bg-brand-cream min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <Link href="/blogs" className="inline-flex items-center gap-2 text-xs font-bold text-brand-green hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Journal & Recipes
        </Link>

        <div className="bg-white rounded-card border border-brand-mint/30 shadow-card p-6 sm:p-10 space-y-6">
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-green bg-brand-mint/30 px-3 py-1 rounded-badge">
              {blog.category}
            </span>
            <h1 className="font-heading font-extrabold text-2xl sm:text-4xl text-brand-darkGreen leading-tight">
              {blog.title}
            </h1>

            <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t border-gray-100 font-medium">
              <Clock className="w-3.5 h-3.5 text-brand-green" />
              <span>{blog.readTime}</span>
            </div>
          </div>

          <div className="relative aspect-video rounded-image overflow-hidden bg-brand-beige">
            <Image src={blog.coverImage} alt={blog.title} fill priority className="object-cover" />
          </div>

          <div className="prose prose-slate max-w-none text-xs sm:text-sm text-gray-700 leading-relaxed space-y-4">
            <p className="font-semibold text-brand-darkGreen text-base leading-relaxed">{blog.excerpt}</p>
            <div className="whitespace-pre-line font-light text-gray-600">{blog.content}</div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Tag className="w-4 h-4 text-brand-green" />
              <span>Tags: {blog.tags.join(', ')}</span>
            </div>
            <Link
              href="/shop"
              className="bg-brand-green text-white font-bold text-xs px-5 py-2.5 rounded-button shadow-soft hover:bg-brand-darkGreen"
            >
              Shop Featured Herbal Teas
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
