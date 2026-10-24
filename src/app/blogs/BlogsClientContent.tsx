'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ArrowRight, Tag, BookOpen, Clock, Calendar, Sparkles } from 'lucide-react';
import { Blog } from '@/lib/types';

interface BlogsClientContentProps {
  initialBlogs: Blog[];
}

export function BlogsClientContent({ initialBlogs }: BlogsClientContentProps) {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const cleanQuery = searchQuery.trim().toLowerCase();

  const filteredBlogs = initialBlogs.filter((blog) => {
    const matchesCategory = selectedCategory ? blog.category === selectedCategory : true;
    const matchesSearch = cleanQuery
      ? blog.title.toLowerCase().includes(cleanQuery) ||
        blog.excerpt.toLowerCase().includes(cleanQuery) ||
        blog.tags.some((t) => t.toLowerCase().includes(cleanQuery))
      : true;
    return matchesCategory && matchesSearch;
  });

  const featuredBlog = initialBlogs.find((b) => b.featured) || initialBlogs[0];

  return (
    <div className="py-16 bg-brand-cream min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-green bg-brand-mint/30 px-3.5 py-1.5 rounded-badge inline-flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" /> Herbal Knowledge & Wellness Recipes
          </span>
          <h1 className="font-heading font-extrabold text-3xl sm:text-5xl text-brand-darkGreen">
            The PrimeBrew Journal
          </h1>
          <p className="text-sm text-gray-600 font-light leading-relaxed">
            Discover authentic articles on tea brewing rituals, natural health recipes, and holistic daily wellness tips.
          </p>
        </div>

        {/* Search Bar & Categories Filter */}
        <div className="bg-white p-6 rounded-card border border-brand-mint/30 shadow-card space-y-4 max-w-4xl mx-auto">
          <div className="relative">
            <Search className="w-5 h-5 text-brand-green absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search articles by title, herb, benefit, or tag (e.g. Blue Tea, Ginger, Immunity)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-button bg-brand-cream/40 border border-brand-mint/30 focus:outline-none focus:border-brand-green text-sm"
            />
          </div>

          <div className="flex justify-center gap-3 sm:gap-4 flex-wrap pt-2 border-t border-gray-100">
            {[
              { id: '', label: 'All Articles' },
              { id: 'Tea Knowledge', label: 'Tea Knowledge' },
              { id: 'Health Tips', label: 'Health Tips' },
              { id: 'Tea Recipes', label: 'Tea Recipes' },
              { id: 'Lifestyle', label: 'Lifestyle & Wellness' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-button text-xs font-bold transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-brand-darkGreen text-brand-gold shadow-soft'
                    : 'bg-brand-cream text-gray-600 hover:bg-brand-mint/30'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Article Banner */}
        {!selectedCategory && !searchQuery && featuredBlog && (
          <div className="bg-white rounded-3xl overflow-hidden shadow-premium border border-brand-mint/30 grid grid-cols-1 lg:grid-cols-2">
            <div className="relative h-64 lg:h-auto min-h-[320px]">
              <Image
                src={featuredBlog.coverImage}
                alt={featuredBlog.title}
                fill
                className="object-cover"
              />
              <div className="absolute top-4 left-4 bg-brand-gold text-brand-darkGreen font-extrabold text-[11px] px-3 py-1 rounded-badge shadow-md flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Featured Story
              </div>
            </div>
            <div className="p-8 sm:p-12 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-4 text-xs text-gray-500 font-medium">
                  <span className="text-brand-green font-bold bg-brand-mint/20 px-2.5 py-0.5 rounded-full">
                    {featuredBlog.category}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {featuredBlog.readTime}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> {featuredBlog.publishDate}
                  </span>
                </div>
                <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-brand-darkGreen hover:text-brand-green transition-colors leading-tight">
                  <Link href={`/blogs/${featuredBlog.slug}`}>{featuredBlog.title}</Link>
                </h2>
                <p className="text-gray-600 text-sm leading-relaxed">{featuredBlog.excerpt}</p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex flex-wrap gap-1.5">
                  {featuredBlog.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                <Link
                  href={`/blogs/${featuredBlog.slug}`}
                  className="font-bold text-xs text-brand-green hover:text-brand-darkGreen flex items-center gap-1.5 transition-colors group"
                >
                  <span>Read Article</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredBlogs.length === 0 ? (
            <div className="col-span-full py-16 text-center space-y-3 bg-white rounded-card p-8 border border-gray-100">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto" />
              <h3 className="font-heading font-bold text-lg text-brand-darkGreen">No articles found</h3>
              <p className="text-xs text-gray-500">
                Try searching for another herbal ingredient, keyword, or select All Articles.
              </p>
            </div>
          ) : (
            filteredBlogs.map((blog) => (
              <article
                key={blog._id}
                className="bg-white rounded-3xl overflow-hidden border border-brand-mint/30 shadow-card hover:shadow-premium transition-all duration-300 flex flex-col group"
              >
                <div className="relative h-52 w-full overflow-hidden">
                  <Image
                    src={blog.coverImage}
                    alt={blog.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-brand-darkGreen/90 backdrop-blur-sm text-brand-gold text-[10px] font-bold px-2.5 py-1 rounded-badge">
                    {blog.category}
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-[11px] text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {blog.readTime}
                      </span>
                      <span>•</span>
                      <span>{blog.publishDate}</span>
                    </div>
                    <h3 className="font-heading font-bold text-base text-brand-darkGreen group-hover:text-brand-green transition-colors line-clamp-2">
                      <Link href={`/blogs/${blog.slug}`}>{blog.title}</Link>
                    </h3>
                    <p className="text-gray-600 text-xs line-clamp-3 leading-relaxed">{blog.excerpt}</p>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {blog.tags.slice(0, 2).map((t) => (
                        <span key={t} className="text-[10px] text-gray-400">
                          #{t}
                        </span>
                      ))}
                    </div>
                    <Link
                      href={`/blogs/${blog.slug}`}
                      className="text-xs font-bold text-brand-green flex items-center gap-1 group-hover:text-brand-darkGreen"
                    >
                      <span>Read</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
