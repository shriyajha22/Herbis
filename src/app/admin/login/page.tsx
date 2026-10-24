'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Leaf, ShieldCheck, Lock, Mail, Eye, EyeOff, ArrowRight, KeyRound, Sparkles, CheckCircle2 } from 'lucide-react';
import { useStore } from '@/lib/storeContext';

export default function AdminLoginPage() {
  const router = useRouter();
  const { setCurrentUser, showToast } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setCurrentUser(data.user);
        showToast('Welcome back, Admin! Access Granted.', 'success');
        router.push('/admin');
      } else {
        setErrorMsg(data.message || 'Invalid admin email or password');
        showToast(data.message || 'Access Denied', 'error');
      }
    } catch (err) {
      setErrorMsg('Failed to connect to authentication server');
      showToast('Authentication connection error', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] relative flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-br from-brand-beige via-white to-brand-mint/20">
      {/* Decorative Organic Background Gradients & Glow Circles */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-brand-green/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-brand-gold/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Glassmorphism Card Container */}
      <div className="relative w-full max-w-md bg-white/90 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-card border border-brand-mint/50 space-y-8 z-10 transition-all duration-300 hover:shadow-2xl">
        
        {/* Header Badge & Title */}
        <div className="text-center space-y-4">
          <Link href="/" className="inline-block hover:scale-105 transition-transform">
            <Image
              src="/images/logo.png"
              alt="PrimeBrew Herbis Logo"
              width={180}
              height={52}
              priority
              className="h-12 w-auto mx-auto object-contain"
            />
          </Link>

          <div className="space-y-1">
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-brand-darkGreen tracking-tight">
              Admin Portal Login
            </h2>
            <p className="text-xs text-brand-brown font-semibold tracking-wide uppercase">
              PrimeBrew Herbis • Security Control
            </p>
          </div>
        </div>

        {/* Error Alert Pill */}
        {errorMsg && (
          <div className="bg-red-50/90 border border-red-200 text-red-700 text-xs rounded-2xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <Lock className="w-4 h-4 text-red-500 shrink-0" />
            <span className="font-medium">{errorMsg}</span>
          </div>
        )}

        {/* Form Controls */}
        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-brand-darkGreen uppercase tracking-wider">
              Admin Email Address
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-green transition-colors">
                <Mail className="w-5 h-5" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@primebrew.com"
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-brand-cream/40 border border-brand-mint/40 focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/10 outline-none text-sm font-medium text-brand-darkGreen placeholder-gray-400 transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-brand-darkGreen uppercase tracking-wider">
              Admin Security Password
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-green transition-colors">
                <KeyRound className="w-5 h-5" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-12 pr-12 py-3.5 rounded-2xl bg-brand-cream/40 border border-brand-mint/40 focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/10 outline-none text-sm font-medium text-brand-darkGreen placeholder-gray-400 transition-all shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-darkGreen transition-colors p-1"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-6 bg-gradient-to-r from-brand-darkGreen to-brand-green hover:from-brand-green hover:to-brand-darkGreen text-white font-bold text-sm rounded-2xl shadow-lg shadow-brand-green/20 hover:shadow-xl hover:shadow-brand-green/30 transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50 mt-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Authenticating Credentials...
              </span>
            ) : (
              <>
                <span>Log In to Admin Control Panel</span>
                <ArrowRight className="w-4 h-4 text-brand-gold group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Footer Hint Box */}
        <div className="pt-4 border-t border-brand-mint/30 flex flex-col items-center gap-3 text-center">
          <div className="flex items-center gap-1.5 text-[11px] text-brand-brown/80 font-medium bg-brand-beige/60 px-3 py-1.5 rounded-full border border-brand-mint/30">
            <CheckCircle2 className="w-3.5 h-3.5 text-brand-green" />
            <span>Secure Admin Authenticated Gateway</span>
          </div>

          <Link
            href="/"
            className="text-xs text-brand-brown hover:text-brand-green font-semibold flex items-center gap-1 transition-colors mt-1"
          >
            ← Return to Main Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
