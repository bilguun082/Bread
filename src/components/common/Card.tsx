import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  highlighted?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  highlighted = false,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`
        bg-white dark:bg-slate-900 rounded-3xl p-5 border-2 transition-all
        ${highlighted ? 'border-amber-500 shadow-lg shadow-amber-500/10' : 'border-slate-200 dark:border-slate-800 shadow-sm'}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};
