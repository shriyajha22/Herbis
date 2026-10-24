'use client';

import React from 'react';
import { useStore } from '@/lib/storeContext';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-24 right-5 z-50 space-y-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto p-3.5 rounded-card shadow-premium border flex items-center justify-between gap-3 text-xs font-medium animate-in fade-in slide-in-from-right-5 ${
            toast.type === 'success'
              ? 'bg-sky-950 text-white border-sky-700'
              : toast.type === 'error'
              ? 'bg-red-950 text-white border-red-700'
              : 'bg-brand-darkGreen text-white border-brand-gold/40'
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.type === 'success' && <CheckCircle className="w-4 h-4 text-sky-400 flex-shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-brand-gold flex-shrink-0" />}
            <span>{toast.message}</span>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-white/60 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
