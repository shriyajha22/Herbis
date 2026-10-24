'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { initialBlogs } from '@/lib/seedData';
import { Search, ArrowRight, Tag, BookOpen, Clock, Calendar, Sparkles } from 'lucide-react';

export default function BlogsPage() {
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
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`text-xs sm:text-sm font-bold px-5 py-2.5 rounded-button transition-all duration-200 ${
                  selectedCategory === cat.id
                    ? 'bg-brand-green text-white shadow-soft scale-105'
                    : 'bg-brand-beige text-brand-darkGreen hover:bg-brand-mint/40 border border-brand-mint/20 hover:border-brand-green/40'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Banner (Shown when no search query) */}
        {!cleanQuery && !selectedCategory && featuredBlog && (
          <div className="bg-white rounded-card overflow-hidden border border-brand-mint/40 shadow-card grid grid-cols-1 lg:grid-cols-2 gap-0 group">
            <div className="relative aspect-video lg:aspect-auto min-h-[280px] bg-brand-beige overflow-hidden">
              <Image
                src={featuredBlog.coverImage}
                alt={featuredBlog.title}
                fill
                priority
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <span className="absolute top-4 left-4 bg-brand-gold text-brand-darkGreen text-xs font-extrabold px-3 py-1 rounded-badge shadow-gold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Featured Article
              </span>
            </div>
            <div className="p-8 sm:p-12 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-xs text-brand-mediumGrey">
                  <span className="bg-brand-mint/30 text-brand-darkGreen font-bold px-2.5 py-0.5 rounded">
                    {featuredBlog.category}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {featuredBlog.readTime}
                  </span>
                </div>

                <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-brand-darkGreen group-hover:text-brand-green transition-colors leading-snug">
                  {featuredBlog.title}
                </h2>

                <p className="text-xs sm:text-sm text-gray-600 font-light leading-relaxed">
                  {featuredBlog.excerpt}
                </p>
              </div>

              <Link
                href={`/blogs/${featuredBlog.slug}`}
                className="inline-flex items-center gap-2 bg-brand-darkGreen hover:bg-brand-green text-white font-bold text-xs px-6 py-3 rounded-button transition-colors w-fit shadow-soft"
              >
                <span>Read Full Featured Article</span>
                <ArrowRight className="w-4 h-4 text-brand-gold" />
              </Link>
            </div>
          </div>
        )}

        {/* Blog Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-xl text-brand-darkGreen">
              {cleanQuery ? `Search Results for "${searchQuery}"` : selectedCategory ? `${selectedCategory} Articles` : 'All Articles'}
            </h3>
            <span className="text-xs text-gray-500 font-semibold">{filteredBlogs.length} articles available</span>
          </div>

          {filteredBlogs.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-card border border-brand-mint/30 p-8 space-y-3">
              <p className="font-bold text-base text-brand-darkGreen">No articles found matching &quot;{searchQuery}&quot;</p>
              <p className="text-xs text-gray-500">Try searching for alternative topics such as Butterfly Pea, Adaptogens, or Immunity.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('');
                }}
                className="bg-brand-green text-white text-xs font-bold px-4 py-2 rounded-button"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {filteredBlogs.map((blog) => (
                <Link
                  key={blog._id}
                  href={`/blogs/${blog.slug}`}
                  className="group bg-white rounded-card overflow-hidden border border-brand-mint/30 shadow-card hover:shadow-premium transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-video overflow-hidden bg-brand-beige">
                      <Image
                        src={blog.coverImage}
                        alt={blog.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-3 left-3 bg-brand-darkGreen text-brand-gold text-[10px] font-bold px-2.5 py-1 rounded-badge">
                        {blog.category}
                      </span>
                    </div>
                    <div className="p-6 space-y-3">
                      <div className="text-[11px] text-gray-400 font-medium">
                        <span>{blog.readTime}</span>
                      </div>
                      <h3 className="font-heading font-bold text-base text-brand-darkGreen group-hover:text-brand-green transition-colors leading-snug">
                        {blog.title}
                      </h3>
                      <p className="text-xs text-gray-500 font-light line-clamp-3 leading-relaxed">
                        {blog.excerpt}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 pt-0 text-xs font-bold text-brand-green flex items-center gap-1 group-hover:gap-2 transition-all">
                    <span>Read Article</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

