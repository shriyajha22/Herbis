'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Leaf, Search, ShoppingBag, Heart, User, Menu, X, Shield, ChevronDown, CheckCircle2 } from 'lucide-react';
import { useStore } from '@/lib/storeContext';
import SearchModal from './SearchModal';

export default function Navbar() {
  const pathname = usePathname();
  const { cart, wishlist, currentUser, isCartOpen, setIsCartOpen, loginAsDemoAdmin, logout } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);

  const isWindowAdmin = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
  const isAdminPath = pathname?.startsWith('/admin');
  const isAdminUser = currentUser?.role === 'admin';

  const userDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userDropdownOpen) return;

    const handleOutsideClick = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target)
      ) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener('pointerdown', handleOutsideClick, true);

    return () => {
      document.removeEventListener('pointerdown', handleOutsideClick, true);
    };
  }, [userDropdownOpen]);


  if (isAdminPath || isWindowAdmin || isAdminUser) {
    return null;
  }

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Shop All', href: '/shop' },
    { name: 'Tea Benefits', href: '/tea-benefits' },
    { name: 'About Us', href: '/about' },
    { name: 'Blogs', href: '/blogs' },
    { name: 'FAQ', href: '/faq' },
    // { name: 'Track Order', href: '/track-order' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <>
      {/* Main Sticky Navbar */}
      <header className="sticky top-0 z-40 glass-navbar shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Official PrimeBrew Herbis Logo */}
            <Link href="/" className="flex items-center group shrink-0 py-1" title="PrimeBrew Herbis - Farm to Cup">
              <div className="relative h-10 sm:h-12 w-auto transition-transform duration-300 group-hover:scale-105">
                <Image
                  src="/images/logo.png"
                  alt="PrimeBrew Herbis Logo"
                  width={173}
                  height={50}
                  priority
                  className="h-full w-auto object-contain"
                />
              </div>
            </Link>

            {/* Desktop Navigation Links - Single Horizontal Line Guarantee */}
            <nav className="hidden lg:flex items-center space-x-2 xl:space-x-5 whitespace-nowrap">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`text-xs xl:text-sm font-medium transition-colors hover:text-brand-green relative py-1 whitespace-nowrap shrink-0 ${
                      isActive ? 'text-brand-green font-semibold' : 'text-brand-charcoal'
                    }`}
                  >
                    {link.name}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-green rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right Action Icons */}
            <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
              {/* Live Search Trigger */}
              <button
                onClick={() => setShowSearchModal(true)}
                className="p-2 text-brand-charcoal hover:text-brand-green hover:bg-brand-beige rounded-button transition-colors"
                aria-label="Search Teas"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist Link */}
              <Link
                href="/dashboard?tab=wishlist"
                className="p-2 text-brand-charcoal hover:text-brand-green hover:bg-brand-beige rounded-button transition-colors relative"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-gold text-white font-bold text-[10px] w-4 h-4 rounded-badge flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </Link>

              {/* Cart Trigger */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="p-2.5 bg-brand-green hover:bg-brand-darkGreen text-white rounded-button shadow-soft transition-all duration-300 flex items-center gap-2 group"
                aria-label="Shopping Cart"
              >
                <ShoppingBag className="w-5 h-5 text-brand-gold" />
                <span className="hidden sm:inline text-xs font-semibold">Cart</span>
                <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-badge">
                  {totalCartCount}
                </span>
              </button>

              {/* Account Dropdown */}
              <div ref={userDropdownRef} className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1.5 p-2 rounded-button text-brand-charcoal hover:bg-brand-beige transition-colors"
                >
                  <div className="w-8 h-8 rounded-badge bg-brand-mint/40 text-brand-darkGreen flex items-center justify-center font-bold text-xs border border-brand-green/30">
                    {currentUser ? currentUser.name.charAt(0) : <User className="w-4 h-4" />}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-500 hidden sm:block" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-card shadow-card border border-brand-mint/30 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    {currentUser ? (
                      <div>
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-semibold text-brand-darkGreen">{currentUser.name}</p>
                          <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
                          {currentUser.role === 'admin' && (
                            <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-badge bg-brand-mint/40 text-brand-darkGreen capitalize">
                              Role: {currentUser.role}
                            </span>
                          )}
                        </div>
                        <Link
                          href="/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="block px-4 py-2 text-sm text-brand-charcoal hover:bg-brand-beige"
                        >
                          My Account
                        </Link>
                        <button
                          onClick={() => {
                            logout();
                            setUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 border-t border-gray-100 mt-1"
                        >
                          Logout
                        </button>
                      </div>
                    ) : (
                      <div className="p-2 space-y-1">
                        <Link
                          href="/login"
                          onClick={() => setUserDropdownOpen(false)}
                          className="block px-3 py-2 text-xs font-bold text-white bg-brand-green hover:bg-brand-darkGreen rounded-button text-center transition-colors shadow-soft"
                        >
                          Sign In
                        </Link>
                        <Link
                          href="/register"
                          onClick={() => setUserDropdownOpen(false)}
                          className="block px-3 py-2 text-xs font-semibold text-brand-darkGreen bg-brand-beige hover:bg-brand-mint/30 rounded-button text-center transition-colors border border-brand-mint/30"
                        >
                          Sign Up
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Mobile Menu Hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-brand-charcoal hover:bg-brand-beige rounded-button"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-brand-cream border-b border-brand-mint/30 px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-semibold text-brand-charcoal hover:text-brand-green py-2.5 px-3 rounded-button hover:bg-brand-beige transition-colors"
              >
                {link.name}
              </Link>
            ))}

            <div className="pt-3 border-t border-brand-mint/30 flex items-center gap-2">
              {currentUser ? (
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2.5 bg-brand-darkGreen text-white text-xs font-bold rounded-button text-center shadow-soft"
                >
                  My Customer Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 py-2.5 bg-brand-green text-white text-xs font-bold rounded-button text-center shadow-soft"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 py-2.5 bg-brand-beige text-brand-darkGreen border border-brand-mint/40 text-xs font-bold rounded-button text-center"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Interactive Production-Ready Search Modal */}
      <SearchModal isOpen={showSearchModal} onClose={() => setShowSearchModal(false)} />
    </>
  );
}
