import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

/**
 * Гар утсанд нэг гараараа дарахад тохиромжтой том хэмжээтэй, тод товчлуур
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'lg',
  isLoading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  // Mobile-first: Том товчлуурууд нь машин барьж яваа ээжид нэг гараар найдвартай дарахад зориулагдсан
  const sizeClasses = {
    sm: 'h-10 px-3 text-sm font-medium',
    md: 'h-12 px-4 text-base font-semibold',
    lg: 'h-14 px-6 text-lg font-bold min-h-[56px]', // Стандарт том товч
    xl: 'h-16 px-8 text-xl font-extrabold min-h-[64px]', // Хамгийн чухал товч (Хүргэсэн/Хадгалах)
  };

  const variantClasses = {
    primary: 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white shadow-md shadow-amber-600/20',
    success: 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-md shadow-emerald-600/20',
    secondary: 'bg-slate-800 hover:bg-slate-900 active:bg-black text-white shadow-md',
    danger: 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-md shadow-rose-600/20',
    outline: 'border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-50',
    ghost: 'bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800',
  };

  return (
    <button
      className={`
        inline-flex items-center justify-center rounded-2xl transition-all duration-150 select-none
        active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-5 w-5 text-current" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span>Түр хүлээнэ үү...</span>
        </span>
      ) : (
        <span className="flex items-center justify-center gap-2 w-full">
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </span>
      )}
    </button>
  );
};
