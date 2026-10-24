'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { useStore } from '@/lib/storeContext';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useStore();

  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validatingToken, setValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Validate token on mount
  useEffect(() => {
    if (!token || !email) {
      setErrorMsg('Invalid or missing password reset link parameters.');
      setValidatingToken(false);
      return;
    }

    const validateToken = async () => {
      try {
        const res = await fetch(`/api/auth/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`);
        const data = await res.json();

        if (res.ok && data.success) {
          setTokenValid(true);
        } else {
          setErrorMsg(data.message || 'Invalid or expired password reset link.');
        }
      } catch (err) {
        setErrorMsg('Failed to verify reset link validity with server.');
      } finally {
        setValidatingToken(false);
      }
    };

    validateToken();
  }, [token, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) return;

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter your password.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email, newPassword }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMsg(data.message || 'Password updated successfully!');
        showToast('Password updated! Redirecting to login...', 'success');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setErrorMsg(data.message || 'Failed to update password.');
        showToast(data.message || 'Password reset failed', 'error');
      }
    } catch (err) {
      setErrorMsg('Connection error resetting password.');
      showToast('Connection error', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (validatingToken) {
    return (
      <div className="py-12 text-center space-y-3">
        <RefreshCw className="w-8 h-8 text-brand-green animate-spin mx-auto" />
        <p className="text-xs text-gray-500 font-medium">Verifying reset link security token...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
          Set New Password
        </h1>
        <p className="text-xs text-gray-500 font-light">
          Creating new password for <strong className="font-bold text-brand-darkGreen">{email}</strong>
        </p>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-xs space-y-2 text-center">
          <AlertCircle className="w-6 h-6 text-red-600 mx-auto" />
          <p className="font-bold">{errorMsg}</p>
          <div className="pt-2">
            <Link href="/forgot-password" className="inline-block bg-brand-darkGreen text-white font-bold px-4 py-2 rounded-button">
              Request New Reset Link
            </Link>
          </div>
        </div>
      )}

      {successMsg ? (
        <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl text-center space-y-3">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
          <h3 className="font-heading font-bold text-sm text-emerald-900">Password Reset Successful!</h3>
          <p className="text-xs text-emerald-700 font-light leading-relaxed">
            Your password has been updated securely. Redirecting you to login...
          </p>
          <Link href="/login" className="inline-block bg-brand-darkGreen text-white text-xs font-bold px-6 py-2.5 rounded-button shadow-soft">
            Proceed to Login Now
          </Link>
        </div>
      ) : tokenValid ? (
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-brand-darkGreen uppercase mb-1">New Password (Min 6 chars)</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-10 py-3 rounded-2xl bg-brand-cream/40 border border-brand-mint/30 focus:bg-white focus:border-brand-green outline-none font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block font-bold text-brand-darkGreen uppercase mb-1">Confirm New Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
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
                <span>Updating Password...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-brand-gold" />
                <span>Update & Save Password</span>
              </>
            )}
          </button>
        </form>
      ) : null}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[85vh] relative flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-brand-beige via-white to-brand-mint/20">
      <div className="relative w-full max-w-md bg-white/90 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-card border border-brand-mint/50 space-y-6 z-10">
        <Suspense fallback={<div className="text-center py-8 text-xs text-gray-500">Loading page...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
