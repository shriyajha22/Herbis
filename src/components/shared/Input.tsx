import React, { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-bold text-brand-darkGreen uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full py-2.5 rounded-2xl bg-brand-cream/40 border transition-colors outline-none text-sm font-medium ${
              icon ? 'pl-10 pr-4' : 'px-4'
            } ${
              error
                ? 'border-red-400 focus:border-red-500 bg-red-50/20'
                : 'border-brand-mint/40 focus:border-brand-green focus:bg-white'
            } ${className}`}
            {...props}
          />
        </div>
        {error && <p className="text-[11px] text-red-500 font-medium">{error}</p>}
        {helperText && !error && <p className="text-[11px] text-gray-400">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
