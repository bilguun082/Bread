import React from 'react';
import { Minus, Plus } from 'lucide-react';

export interface StepperProps {
  label: string;
  sublabel?: string;
  value: number;
  onChange: (newValue: number) => void;
  min?: number;
  max?: number;
  unitPrice?: number;
  highlightColor?: 'amber' | 'emerald' | 'rose' | 'blue';
}

/**
 * Машиндаа нэг гараараа товчлох боломжтой том хэмжээтэй Stepper
 */
export const Stepper: React.FC<StepperProps> = ({
  label,
  sublabel,
  value,
  onChange,
  min = 0,
  max = 999,
  unitPrice,
  highlightColor = 'amber',
}) => {
  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const handleQuickAdd = (amount: number) => {
    onChange(Math.min(max, value + amount));
  };

  const colorClasses = {
    amber: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30',
    emerald: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
    rose: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30',
    blue: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30',
  };

  return (
    <div className={`p-4 rounded-3xl border-2 ${colorClasses[highlightColor]} flex flex-col gap-3`}>
      {/* Label and Price */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-lg font-black text-slate-900 dark:text-white block leading-tight">
            {label}
          </span>
          {sublabel && (
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {sublabel}
            </span>
          )}
        </div>
        {unitPrice !== undefined && (
          <span className="text-sm font-bold bg-white dark:bg-slate-800 px-3 py-1 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200">
            {unitPrice.toLocaleString('mn-MN')}₮
          </span>
        )}
      </div>

      {/* Main Stepper Controls: Big [-] [NUMBER] [+] */}
      <div className="grid grid-cols-4 items-center gap-2">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={value <= min}
          className="col-span-1 h-14 rounded-2xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white border-2 border-slate-300 dark:border-slate-700 flex items-center justify-center active:scale-95 disabled:opacity-40 shadow-sm"
          aria-label="Хасах"
        >
          <Minus className="w-7 h-7 stroke-[3]" />
        </button>

        <div className="col-span-2 h-14 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-2xl flex items-center justify-center">
          <input
            type="number"
            value={value === 0 ? '' : value}
            placeholder="0"
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              onChange(isNaN(val) ? 0 : Math.max(min, Math.min(max, val)));
            }}
            className="w-full text-center text-3xl font-black bg-transparent text-slate-900 dark:text-white focus:outline-none"
          />
        </div>

        <button
          type="button"
          onClick={handleIncrement}
          disabled={value >= max}
          className="col-span-1 h-14 rounded-2xl bg-amber-500 text-white font-black flex items-center justify-center active:scale-95 disabled:opacity-40 shadow-md shadow-amber-500/20"
          aria-label="Нэмэх"
        >
          <Plus className="w-7 h-7 stroke-[3]" />
        </button>
      </div>

      {/* Quick Add Pills (+1, +5, +10) */}
      <div className="flex items-center gap-2 justify-end pt-1">
        <span className="text-xs text-slate-400 font-semibold mr-auto">Хурдан нэмэх:</span>
        <button
          type="button"
          onClick={() => handleQuickAdd(1)}
          className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 active:scale-90"
        >
          +1
        </button>
        <button
          type="button"
          onClick={() => handleQuickAdd(5)}
          className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 active:scale-90"
        >
          +5
        </button>
        <button
          type="button"
          onClick={() => handleQuickAdd(10)}
          className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 active:scale-90"
        >
          +10
        </button>
        {value > 0 && (
          <button
            type="button"
            onClick={() => onChange(0)}
            className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 text-xs font-bold active:scale-90"
          >
            0
          </button>
        )}
      </div>
    </div>
  );
};
