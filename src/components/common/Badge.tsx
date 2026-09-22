import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'neutral' | 'success' | 'danger' | 'warning' | 'primary';
  size?: 'sm' | 'md' | 'lg';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
}) => {
  const variantClasses = {
    neutral: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
    danger: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300',
    warning: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
    primary: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300',
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 font-bold',
    md: 'text-sm px-3 py-1 font-bold',
    lg: 'text-base px-4 py-1.5 font-extrabold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full ${sizeClasses[size]} ${variantClasses[variant]}`}
    >
      {children}
    </span>
  );
};
