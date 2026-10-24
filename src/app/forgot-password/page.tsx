'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, ArrowLeft, Send, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { useStore } from '@/lib/storeContext';

export default function ForgotPasswordPage() {
  const { showToast } = useStore();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [devNotice, setDevNotice] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setErrorMsg('');
    setDevNotice('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSubmitted(true);
        showToast(data.message || 'Password reset link dispatched!', 'success');
      } else {
        setErrorMsg(data.message || 'Failed to send password reset email.');
        if (data.devNotice) setDevNotice(data.devNotice);
        showToast(data.message || 'Password reset failed', 'error');
      }
    } catch (err) {
      setErrorMsg('Failed to connect to authentication server. Please check your connection.');
      showToast('Connection error', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] relative flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-brand-beige via-white to-brand-mint/20">
      <div className="relative w-full max-w-md bg-white/90 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-card border border-brand-mint/50 space-y-6 z-10">
        
        {/* Back Link */}
        <Link href="/login" className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-green hover:underline">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
        </Link>

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
          <h1 className="font-heading font-extrabold text-2xl text-brand-darkGreen">
            Reset Password
          </h1>
          <p className="text-xs text-gray-500 font-light">
            Enter your registered email address and we will send you a secure verification link.
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-2xl text-xs space-y-1">
            <div className="flex items-center gap-2 font-bold">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>Reset Error</span>
            </div>
            <p className="text-[11px] leading-relaxed">{errorMsg}</p>
            {devNotice && (
              <p className="text-[10px] font-mono text-gray-600 pt-1 border-t border-red-100">{devNotice}</p>
            )}
          </div>
        )}

        {submitted ? (
          <div className="bg-sky-50 border border-sky-200 p-6 rounded-2xl text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-sm text-sky-900">Check Your Email Inbox</h3>
            <p className="text-xs text-sky-700 font-light leading-relaxed">
              We sent a password reset verification link to <strong className="font-bold">{email}</strong>. Please click the link in your email to set a new password.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="text-xs font-bold text-brand-darkGreen hover:underline pt-2 inline-block"
            >
              Didn&apos;t receive email? Try again
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-brand-darkGreen uppercase mb-1">Your Registered Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="customer@example.com"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-brand-cream/40 border border-brand-mint/30 focus:bg-white focus:border-brand-green outline-none font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-brand-darkGreen hover:bg-brand-green text-white font-bold text-xs rounded-2xl shadow-soft flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 text-brand-gold animate-spin" />
                  <span>Verifying & Sending Reset Email...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-brand-gold" />
                  <span>Send Reset Instructions</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
