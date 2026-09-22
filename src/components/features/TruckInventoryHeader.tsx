'use client';

import React from 'react';
import { Truck, PlusCircle, CheckCircle2, Edit3 } from 'lucide-react';
import { RemainingInventory } from '@/hooks/useDailyRun';

export interface TruckInventoryHeaderProps {
  remainingInCar: RemainingInventory;
  totalLoaded: number;
  isCompleted: boolean;
  onOpenLoadModal: () => void;
  dateStr: string;
}

/**
 * Ээжийн машинд одоо үлдсэн талхны тоог байнга тод харуулах дээд самбар
 */
export const TruckInventoryHeader: React.FC<TruckInventoryHeaderProps> = ({
  remainingInCar,
  totalLoaded,
  isCompleted,
  onOpenLoadModal,
  dateStr,
}) => {
  const totalRemaining = remainingInCar.white + remainingInCar.whole + remainingInCar.baguette;

  return (
    <div className="bg-gradient-to-br from-amber-600 to-amber-700 text-white rounded-3xl p-5 shadow-xl shadow-amber-600/20 mb-5">
      {/* Top row: Status and Date */}
      <div className="flex items-center justify-between pb-3 border-b border-amber-500/50">
        <div className="flex items-center gap-2">
          <Truck className="w-6 h-6" />
          <span className="font-extrabold text-lg tracking-wide">Машинд үлдсэн талх</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-amber-800/60 px-3 py-1 rounded-full font-bold">
            {dateStr}
          </span>
          {isCompleted && (
            <span className="flex items-center gap-1 text-xs bg-emerald-500 text-white px-2.5 py-1 rounded-full font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Хаагдсан
            </span>
          )}
          <button
            type="button"
            onClick={onOpenLoadModal}
            className="flex items-center gap-1 text-xs bg-white text-amber-800 px-3 py-1.5 rounded-full font-black hover:bg-amber-50 active:scale-95 transition-all shadow cursor-pointer"
          >
            {totalLoaded === 0 ? (
              <>
                <PlusCircle className="w-4 h-4 text-amber-600" />
                <span>Ачилт оруулах</span>
              </>
            ) : (
              <>
                <Edit3 className="w-4 h-4 text-amber-600" />
                <span>Ачилт засах</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Bread Counters: Big high-contrast badges */}
      <div className="grid grid-cols-3 gap-2 pt-4">
        {/* 1-р гурил */}
        <div className="bg-white/15 backdrop-blur-md rounded-2xl p-3 flex flex-col items-center justify-center border border-white/20">
          <span className="text-xs text-amber-100 font-bold uppercase tracking-wider">1-р гурил</span>
          <span className="text-3xl font-black mt-0.5">{remainingInCar.white}</span>
          <span className="text-[10px] text-amber-200 font-medium">ширхэг</span>
        </div>

        {/* Бүхэл үр */}
        <div className="bg-white/15 backdrop-blur-md rounded-2xl p-3 flex flex-col items-center justify-center border border-white/20">
          <span className="text-xs text-amber-100 font-bold uppercase tracking-wider">Бүхэл үр</span>
          <span className="text-3xl font-black mt-0.5">{remainingInCar.whole}</span>
          <span className="text-[10px] text-amber-200 font-medium">ширхэг</span>
        </div>

        {/* Багет */}
        <div className="bg-white/15 backdrop-blur-md rounded-2xl p-3 flex flex-col items-center justify-center border border-white/20">
          <span className="text-xs text-amber-100 font-bold uppercase tracking-wider">Багет</span>
          <span className="text-3xl font-black mt-0.5">{remainingInCar.baguette}</span>
          <span className="text-[10px] text-amber-200 font-medium">ширхэг</span>
        </div>
      </div>

      {/* Summary Footer */}
      <div className="mt-3 flex items-center justify-between text-xs text-amber-100 font-semibold px-1">
        <span>Ачсан: <b>{totalLoaded} ш</b></span>
        <span>Нийт үлдсэн: <b className="text-white text-sm">{totalRemaining} ш</b></span>
      </div>
    </div>
  );
};
