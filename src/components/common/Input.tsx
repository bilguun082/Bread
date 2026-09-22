import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  suffix?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  suffix,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-base font-bold text-slate-800 dark:text-slate-100">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        <input
          id={inputId}
          className={`
            w-full h-14 px-4 text-lg font-semibold rounded-2xl border-2 transition-colors
            bg-white dark:bg-slate-800 text-slate-900 dark:text-white
            focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500
            ${error ? 'border-rose-500' : 'border-slate-300 dark:border-slate-600'}
            ${suffix ? 'pr-12' : ''}
            ${className}
          `}
          {...props}
        />
        {suffix && (
          <span className="absolute right-4 text-slate-500 font-bold text-base pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
      {error && <span className="text-sm font-semibold text-rose-500">{error}</span>}
      {helperText && !error && <span className="text-xs text-slate-500">{helperText}</span>}
    </div>
  );
};
