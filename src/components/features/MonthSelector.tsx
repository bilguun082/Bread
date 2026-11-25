'use client';

import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Check,
  RotateCcw,
} from 'lucide-react';

export interface MonthSelectorProps {
  selectedMonth: string; // "YYYY-MM"
  onChangeMonth: (month: string) => void;
}

const MONTH_NAMES_MN = [
  '1-р сар (Хулгана)',
  '2-р сар (Үхэр)',
  '3-р сар (Бар)',
  '4-р сар (Туулай)',
  '5-р сар (Луу)',
  '6-р сар (Могой)',
  '7-р сар (Морь)',
  '8-р сар (Хонь)',
  '9-р сар (Бич)',
  '10-р сар (Тахиа)',
  '11-р сар (Нохой)',
  '12-р сар (Гахай)',
];

const SHORT_MONTH_NAMES_MN = [
  '1-р сар',
  '2-р сар',
  '3-р сар',
  '4-р сар',
  '5-р сар',
  '6-р сар',
  '7-р сар',
  '8-р сар',
  '9-р сар',
  '10-р сар',
  '11-р сар',
  '12-р сар',
];

export const MonthSelector: React.FC<MonthSelectorProps> = ({
  selectedMonth,
  onChangeMonth,
}) => {
  const [isPickerOpen, setIsPickerOpen] = useState<boolean>(false);

  const [yearStr, monthStr] = selectedMonth.split('-');
  const selectedYear = parseInt(yearStr, 10) || new Date().getFullYear();
  const selectedMonthNum = parseInt(monthStr, 10) || new Date().getMonth() + 1;

  // Picker доторх түр харах жил
  const [pickerYear, setPickerYear] = useState<number>(selectedYear);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthNum = now.getMonth() + 1;
  const currentMonthStr = `${currentYear}-${String(currentMonthNum).padStart(2, '0')}`;

  const isCurrentMonth = selectedMonth === currentMonthStr;

  const handlePrevMonth = () => {
    let nextY = selectedYear;
    let nextM = selectedMonthNum - 1;
    if (nextM < 1) {
      nextY -= 1;
      nextM = 12;
    }
    onChangeMonth(`${nextY}-${String(nextM).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    let nextY = selectedYear;
    let nextM = selectedMonthNum + 1;
    if (nextM > 12) {
      nextY += 1;
      nextM = 1;
    }
    onChangeMonth(`${nextY}-${String(nextM).padStart(2, '0')}`);
  };

  const handleSelectMonth = (mNum: number) => {
    onChangeMonth(`${pickerYear}-${String(mNum).padStart(2, '0')}`);
    setIsPickerOpen(false);
  };

  const handleGoCurrentMonth = () => {
    onChangeMonth(currentMonthStr);
    setPickerYear(currentYear);
    setIsPickerOpen(false);
  };

  const openPickerModal = () => {
    setPickerYear(selectedYear);
    setIsPickerOpen(true);
  };

  // Өмнөх 3 сарын хурдан сонголтууд (Recent months pills)
  const quickRecentMonths = [0, 1, 2, 3].map((offset) => {
    const d = new Date(currentYear, currentMonthNum - 1 - offset, 1);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const str = `${y}-${String(m).padStart(2, '0')}`;
    const label = offset === 0 ? 'Энэ сар' : `${m}-р сар`;
    return { str, label, y, m };
  });

  return (
    <div className="space-y-2">
      {/* Үндсэн Том Навигатор (Өмнөх / Сар сонгох / Дараах) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-3 border-2 border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-2">
        {/* Өмнөх сар товч */}
        <button
          type="button"
          onClick={handlePrevMonth}
          className="h-12 w-12 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 active:scale-90 transition-all flex-shrink-0"
          title="Өмнөх сар"
          aria-label="Өмнөх сар"
        >
          <ChevronLeft className="w-6 h-6 stroke-[3]" />
        </button>

        {/* Төвийн сар сонгох товч (Дарж 12 сарын цэс нээх) */}
        <button
          type="button"
          onClick={openPickerModal}
          className="flex-1 h-12 px-3 rounded-2xl bg-amber-50 hover:bg-amber-100/80 dark:bg-amber-950/40 dark:hover:bg-amber-950/70 border border-amber-300 dark:border-amber-800 flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
        >
          <CalendarIcon className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <div className="text-center">
            <span className="text-base font-black text-slate-900 dark:text-white block leading-tight">
              {selectedYear} оны {selectedMonthNum}-р сар
            </span>
            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 block -mt-0.5">
              Сар солих бол энд дарна уу ▾
            </span>
          </div>
        </button>

        {/* Дараах сар товч */}
        <button
          type="button"
          onClick={handleNextMonth}
          className="h-12 w-12 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 active:scale-90 transition-all flex-shrink-0"
          title="Дараах сар"
          aria-label="Дараах сар"
        >
          <ChevronRight className="w-6 h-6 stroke-[3]" />
        </button>
      </div>

      {/* Хурдан шилжих товчлуурууд (Энэ сар, 10-р сар, 9-р сар...) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 px-1">
        <span className="text-xs font-bold text-slate-400 flex-shrink-0">
          Шууд сонгох:
        </span>
        {quickRecentMonths.map((qm) => {
          const isSelected = selectedMonth === qm.str;
          return (
            <button
              key={qm.str}
              type="button"
              onClick={() => onChangeMonth(qm.str)}
              className={`
                px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all active:scale-95 flex-shrink-0
                ${
                  isSelected
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }
              `}
            >
              {qm.label}
            </button>
          );
        })}

        {!isCurrentMonth && (
          <button
            type="button"
            onClick={handleGoCurrentMonth}
            className="ml-auto inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex-shrink-0"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Энэ сар руу очих</span>
          </button>
        )}
      </div>

      {/* 12 Сарын Сонгогч Modal Sheet */}
      {isPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header: Жил сонгох */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Сарын Тооцоо Сонгох
              </span>
              <button
                type="button"
                onClick={() => setIsPickerOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Жилийн Навигатор */}
            <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 p-2 rounded-2xl">
              <button
                type="button"
                onClick={() => setPickerYear((prev) => prev - 1)}
                className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 active:scale-90"
              >
                <ChevronLeft className="w-5 h-5 stroke-[3]" />
              </button>

              <span className="text-xl font-black text-slate-900 dark:text-white">
                {pickerYear} он
              </span>

              <button
                type="button"
                onClick={() => setPickerYear((prev) => prev + 1)}
                className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 active:scale-90"
              >
                <ChevronRight className="w-5 h-5 stroke-[3]" />
              </button>
            </div>

            {/* 12 Сарын Хүснэгт (3x4 Grid) */}
            <div className="grid grid-cols-3 gap-2.5">
              {SHORT_MONTH_NAMES_MN.map((mName, idx) => {
                const mNum = idx + 1;
                const isSelected =
                  pickerYear === selectedYear && mNum === selectedMonthNum;
                const isRealCurrent =
                  pickerYear === currentYear && mNum === currentMonthNum;

                return (
                  <button
                    key={mNum}
                    type="button"
                    onClick={() => handleSelectMonth(mNum)}
                    className={`
                      py-3.5 px-2 rounded-2xl font-black text-sm transition-all active:scale-95 flex flex-col items-center justify-center relative
                      ${
                        isSelected
                          ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25 ring-2 ring-amber-400'
                          : isRealCurrent
                          ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100'
                      }
                    `}
                  >
                    <span>{mName}</span>
                    {isSelected && (
                      <Check className="w-4 h-4 stroke-[3] mt-0.5 text-white" />
                    )}
                    {isRealCurrent && !isSelected && (
                      <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400">
                        Одоо
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Доод үйлдлүүд */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={handleGoCurrentMonth}
                className="text-xs font-black text-amber-600 dark:text-amber-400 hover:underline"
              >
                📍 Энэ сар руу очих ({currentMonthNum}-р сар)
              </button>

              <button
                type="button"
                onClick={() => setIsPickerOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                Хаах
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
