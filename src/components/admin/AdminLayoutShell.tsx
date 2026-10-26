'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useStore } from '@/lib/storeContext';
import {
  Shield,
  Package,
  Users,
  ShoppingBag,
  MessageSquare,
  LayoutDashboard,
  LogOut,
  Bell,
  RefreshCw,
  Search,
  Menu,
  X,
  XCircle,
  ExternalLink,
} from 'lucide-react';

export function AdminLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logout, showToast, isAuthLoading } = useStore();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [isLiveConnected, setIsLiveConnected] = useState(false);

  const prevNotifIdsRef = useRef<Set<string>>(new Set());

  // Web Audio alert chime
  const playAlertChime = useCallback((type: 'order_placed' | 'order_cancelled') => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'order_placed') {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.4);
      } else {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.setValueAtTime(293.66, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.5);
      }
    } catch (e) {}
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/notifications');
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.notifications)) {
        const fetchedNotifs: any[] = data.notifications;
        setNotifications(fetchedNotifs);
        setUnreadNotifCount(data.unreadCount || 0);

        const currentSet = prevNotifIdsRef.current;
        fetchedNotifs.forEach((n) => {
          if (!currentSet.has(n._id)) {
            if (currentSet.size > 0 && !n.read) {
              const icon = n.type === 'order_cancelled' ? '❌' : '🔔';
              showToast(`${icon} ${n.message}`, n.type === 'order_cancelled' ? 'error' : 'success');
              playAlertChime(n.type === 'order_cancelled' ? 'order_cancelled' : 'order_placed');
            }
            currentSet.add(n._id);
          }
        });
      }
      setIsLiveConnected(true);
    } catch (e) {
      setIsLiveConnected(false);
    }
  }, [showToast, playAlertChime]);

  const handleMarkNotificationRead = async (notificationId?: string, markAllRead = false) => {
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId, markAllRead }),
      });
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
        setUnreadNotifCount(data.unreadCount || 0);
      }
    } catch (e) {}
  };

  useEffect(() => {
    if (!isAuthLoading && pathname !== '/admin/login' && currentUser?.role !== 'admin') {
      router.push('/admin/login');
      return;
    }

    if (currentUser?.role === 'admin') {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 5000);
      return () => clearInterval(interval);
    }
  }, [currentUser, isAuthLoading, pathname, router, fetchNotifications]);

  // If on admin login page, don't show admin chrome
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Loading state while checking auth
  if (isAuthLoading || currentUser?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-brand-green border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
          Verifying Admin Credentials...
        </p>
      </div>
    );
  }

  const navItems = [
    { label: 'Dashboard Overview', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Orders & Logistics', href: '/admin/orders', icon: Package },
    { label: 'Customer Management', href: '/admin/customers', icon: Users },
    { label: 'Product Catalog', href: '/admin/products', icon: ShoppingBag },
    { label: 'Support Queries', href: '/admin/support', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col lg:flex-row antialiased selection:bg-brand-mint selection:text-brand-darkGreen">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 bg-[#0a1e12] text-white flex flex-col justify-between transition-transform duration-300 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } shrink-0 border-r border-white/10 shadow-2xl`}
      >
        <div className="p-5 space-y-6">
          {/* Logo */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <Link href="/admin/dashboard" className="flex items-center gap-2">
              <div className="bg-white p-1.5 rounded-card shadow-soft max-w-[130px]">
                <Image
                  src="/images/logo.png"
                  alt="PrimeBrew Herbis Admin"
                  width={120}
                  height={34}
                  priority
                  className="w-full h-auto object-contain"
                />
              </div>
              <span className="text-[10px] font-extrabold tracking-widest text-brand-gold bg-white/10 px-2 py-0.5 rounded border border-brand-gold/30 uppercase">
                ADMIN
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav Links */}
          <nav className="space-y-1.5 text-xs font-semibold">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href === '/admin/dashboard' && pathname === '/admin');

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-button transition-colors ${
                    isActive
                      ? 'bg-brand-green text-white font-bold shadow-soft'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 text-brand-gold" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            <div className="pt-2 border-t border-white/10">
              <Link
                href="/"
                onClick={() => setSidebarOpen(false)}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-button text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
              >
                <ExternalLink className="w-4 h-4 text-brand-gold" />
                <span>View Storefront</span>
              </Link>
            </div>
          </nav>
        </div>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-white/10 bg-[#07160c] space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-brand-gold text-brand-darkGreen font-extrabold flex items-center justify-center text-sm shadow-gold">
              {currentUser.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
              <p className="text-[10px] text-gray-400 truncate">{currentUser.email}</p>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              router.push('/admin/login');
            }}
            className="w-full bg-red-900/40 hover:bg-red-800/80 text-red-200 border border-red-700/50 font-bold text-xs py-2 px-3 rounded-button flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Admin Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-button"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-brand-green" />
              <span className="text-xs font-bold text-brand-darkGreen uppercase tracking-wider">
                Admin Control Center
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-button text-xs font-bold text-brand-darkGreen bg-brand-cream border border-brand-mint/40 hover:bg-brand-mint/30 transition-colors shadow-sm"
              title="Browse customer storefront"
            >
              <ExternalLink className="w-3.5 h-3.5 text-brand-green" />
              <span className="hidden sm:inline">Storefront</span>
            </Link>

            {isLiveConnected && (
              <span className="hidden sm:inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full text-[10px] font-extrabold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>● LIVE STREAM</span>
              </span>
            )}

            <button
              onClick={() => {
                fetchNotifications();
                showToast('Refreshed notification stream', 'info');
              }}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-button transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="p-2 text-gray-700 hover:bg-gray-100 rounded-button relative transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5 text-brand-darkGreen" />
                {unreadNotifCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white font-extrabold text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-soft animate-bounce">
                    {unreadNotifCount}
                  </span>
                )}
              </button>

              {showNotifDropdown && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-card shadow-2xl border border-gray-200 z-50 overflow-hidden text-xs">
                  <div className="p-3.5 bg-brand-darkGreen text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-brand-gold" />
                      <span className="font-extrabold text-sm">Store Notifications</span>
                    </div>
                    {unreadNotifCount > 0 && (
                      <button
                        onClick={() => handleMarkNotificationRead(undefined, true)}
                        className="text-[10px] font-bold text-brand-beige hover:text-white underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-gray-500 space-y-1">
                        <Bell className="w-8 h-8 text-gray-300 mx-auto" />
                        <p className="font-semibold">No notifications recorded.</p>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n._id}
                          onClick={() => {
                            handleMarkNotificationRead(n._id);
                            setShowNotifDropdown(false);
                            if (n.orderNumber || n.orderId) {
                              router.push('/admin/orders');
                            }
                          }}
                          className={`p-3.5 cursor-pointer transition-colors flex items-start gap-3 hover:bg-gray-50 ${
                            !n.read ? 'bg-amber-50/60 font-semibold' : 'bg-white text-gray-600'
                          }`}
                        >
                          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-brand-cream text-brand-darkGreen">
                            <Bell className="w-4 h-4 text-brand-green" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-800 leading-snug">{n.message}</p>
                            <p className="text-[10px] text-gray-400 mt-1">
                              {new Date(n.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
