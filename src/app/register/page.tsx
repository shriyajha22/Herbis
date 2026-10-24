'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { User as UserIcon, Mail, Phone, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { useStore } from '@/lib/storeContext';
import { User as UserType } from '@/lib/types';

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/dashboard';
  const noticeMsg = searchParams.get('message') || searchParams.get('notice');

  const { setCurrentUser, showToast } = useStore();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(true);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) return;
    if (!acceptTerms) {
      showToast('Please accept the Terms & Privacy Policy to register.', 'error');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: fullName, email, phone, password }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.user) {
        setCurrentUser(data.user);
        showToast(`Welcome to PrimeBrew Herbis, ${data.user.name}! ₹250 signup bonus added.`, 'success');
        router.push(redirectPath);
      } else {
        setErrorMsg(data.message || 'Registration failed');
        showToast(data.message || 'Registration failed', 'error');
      }
    } catch (err) {
      setErrorMsg('Failed to connect to registration server');
      showToast('Connection error', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] relative flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-brand-beige via-white to-brand-mint/20">
      <div className="relative w-full max-w-md bg-white/90 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-card border border-brand-mint/50 space-y-6 z-10">
        
        {/* Redirect Notice Banner */}
        {noticeMsg && (
          <div className="bg-amber-50 border border-amber-300 text-amber-900 p-4 rounded-card text-xs flex items-start gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-bold text-amber-900">{noticeMsg}</p>
              <p className="text-[11px] text-amber-700">Create an account to place your order securely.</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center space-y-3">
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
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-brand-darkGreen">
            Create Your Account
          </h1>
          <p className="text-xs text-gray-500 font-light">
            Join the PrimeBrew Tea Circle and receive ₹250 instant cashback balance.
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-card text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-brand-darkGreen uppercase mb-1">Full Name</label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-brand-cream/40 border border-brand-mint/30 focus:bg-white focus:border-brand-green outline-none font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-brand-darkGreen uppercase mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-brand-cream/40 border border-brand-mint/30 focus:bg-white focus:border-brand-green outline-none font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-brand-darkGreen uppercase mb-1">Mobile Phone (Optional)</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter 10-digit mobile number"
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-brand-cream/40 border border-brand-mint/30 focus:bg-white focus:border-brand-green outline-none font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-brand-darkGreen uppercase mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-11 py-3 rounded-2xl bg-brand-cream/40 border border-brand-mint/30 focus:bg-white focus:border-brand-green outline-none font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-darkGreen"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-start gap-2 pt-1">
            <input
              type="checkbox"
              id="terms"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="mt-0.5 rounded text-brand-green focus:ring-brand-green"
            />
            <label htmlFor="terms" className="text-[11px] text-gray-600 font-medium leading-tight">
              I agree to the PrimeBrew Herbis{' '}
              <Link href="/terms" className="text-brand-green font-bold hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy-policy" className="text-brand-green font-bold hover:underline">
                Privacy Policy
              </Link>.
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-brand-green hover:bg-brand-darkGreen text-white font-bold text-xs rounded-2xl shadow-soft flex items-center justify-center gap-2 transition-colors mt-2 disabled:opacity-50"
          >
            <span>{loading ? 'Creating Account...' : 'Create Account & Claim ₹250 Wallet Bonus'}</span>
            <ArrowRight className="w-4 h-4 text-brand-gold" />
          </button>
        </form>

        {/* Footer */}
        <div className="pt-4 border-t border-brand-mint/30 text-center text-xs">
          <p className="text-gray-500">
            Already have an account?{' '}
            <Link
              href={redirectPath ? `/login?redirect=${encodeURIComponent(redirectPath)}&message=${encodeURIComponent(noticeMsg || '')}` : '/login'}
              className="text-brand-green font-bold hover:underline"
            >
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CustomerRegisterPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs font-bold text-brand-darkGreen">Loading Register Page...</div>}>
      <RegisterContent />
    </Suspense>
  );
}

