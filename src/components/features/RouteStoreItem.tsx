import React from 'react';
import { Store, DeliveryRecord } from '@/types';
import { Phone, MapPin, ChevronRight, Check, Edit3, CornerDownLeft } from 'lucide-react';
import { formatTugrik } from '@/utils/currencyFormatter';

export interface RouteStoreItemProps {
  store: Store;
  index: number;
  isDeliveredToday: boolean;
  todayDelivery?: DeliveryRecord | null;
  onDeliverClick: (store: Store) => void;
}

/**
 * Маршрутын дарааллаар харагдах дэлгүүрийн карт
 */
export const RouteStoreItem: React.FC<RouteStoreItemProps> = ({
  store,
  index,
  isDeliveredToday,
  todayDelivery,
  onDeliverClick,
}) => {
  const hasDebt = store.currentBalance > 0;

  return (
    <div
      className={`
        rounded-3xl p-5 border-2 transition-all shadow-sm
        ${
          isDeliveredToday
            ? 'bg-slate-50/80 dark:bg-slate-900/60 border-emerald-300 dark:border-emerald-800'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-400'
        }
      `}
    >
      {/* Top Header: Order, Name, Debt status */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {/* Route Sequence Circle */}
          <div
            className={`
              w-9 h-9 rounded-2xl flex items-center justify-center font-black text-sm flex-shrink-0
              ${
                isDeliveredToday
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
              }
            `}
          >
            {isDeliveredToday ? <Check className="w-5 h-5 stroke-[3]" /> : index + 1}
          </div>

          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight">
              {store.name}
            </h3>
            {store.ownerName && (
              <p className="text-xs font-bold text-slate-500 mt-0.5">
                Худалдагч: {store.ownerName}
              </p>
            )}
          </div>
        </div>

        {/* Debt / Balance Badge */}
        <div className="text-right flex-shrink-0">
          <span className="text-[11px] font-bold block text-slate-400 uppercase tracking-wider">
            Үлдэгдэл
          </span>
          <span
            className={`text-lg font-black block leading-tight ${
              hasDebt
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {formatTugrik(store.currentBalance)}
          </span>
        </div>
      </div>

      {/* Address & Phone row */}
      {(store.address || store.phone) && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1.5 truncate max-w-[70%]">
            {store.address && (
              <>
                <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="truncate">{store.address}</span>
              </>
            )}
          </div>

          {store.phone && (
            <a
              href={`tel:${store.phone}`}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 px-3 py-1.5 rounded-xl text-slate-700 dark:text-slate-300 active:scale-95"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>{store.phone}</span>
            </a>
          )}
        </div>
      )}

      {/* Хүргэсэн мэдээллийн жижиг хураангуй карт */}
      {isDeliveredToday && todayDelivery && (
        <div className="mt-3.5 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs">
          <div className="flex items-center justify-between font-bold text-emerald-800 dark:text-emerald-300 pb-1.5 border-b border-emerald-200/60 dark:border-emerald-800/40">
            <span className="flex items-center gap-1">
              <Check className="w-3.5 h-3.5 stroke-[3]" /> Өнөөдөр хүргэгдсэн
            </span>
            <span className="font-extrabold text-[13px] text-emerald-900 dark:text-emerald-200">
              {formatTugrik(todayDelivery.todayDue)}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-2 text-center">
            <div className="bg-white/80 dark:bg-slate-900/80 rounded-xl p-1.5 border border-emerald-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 font-bold block">1-р гурил</span>
              <span className="text-sm font-black text-slate-900 dark:text-white">
                {todayDelivery.deliveredWhite} ш
              </span>
            </div>
            <div className="bg-white/80 dark:bg-slate-900/80 rounded-xl p-1.5 border border-emerald-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 font-bold block">Бүхэл үр</span>
              <span className="text-sm font-black text-slate-900 dark:text-white">
                {todayDelivery.deliveredWhole} ш
              </span>
            </div>
            <div className="bg-white/80 dark:bg-slate-900/80 rounded-xl p-1.5 border border-emerald-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 font-bold block">Багет</span>
              <span className="text-sm font-black text-slate-900 dark:text-white">
                {todayDelivery.deliveredBaguette} ш
              </span>
            </div>
          </div>

          {(todayDelivery.returnedWhite > 0 || todayDelivery.returnedWhole > 0 || todayDelivery.returnedBaguette > 0) && (
            <div className="mt-2 text-[11px] text-rose-600 dark:text-rose-400 font-semibold flex items-center justify-between">
              <span>Буцаалт:</span>
              <span>
                {[
                  todayDelivery.returnedWhite > 0 ? `1-р: ${todayDelivery.returnedWhite}` : null,
                  todayDelivery.returnedWhole > 0 ? `Бүхэл: ${todayDelivery.returnedWhole}` : null,
                  todayDelivery.returnedBaguette > 0 ? `Багет: ${todayDelivery.returnedBaguette}` : null,
                ]
                  .filter(Boolean)
                  .join(' | ')}
              </span>
            </div>
          )}

          <div className="mt-2 pt-2 border-t border-emerald-200/60 dark:border-emerald-800/40 flex items-center justify-between font-bold">
            <span className="text-slate-600 dark:text-slate-400">Төлсөн:</span>
            <span className="text-slate-900 dark:text-white font-black">
              {formatTugrik(todayDelivery.paidCash + todayDelivery.paidTransfer)}
            </span>
          </div>
        </div>
      )}

      {/* Big Action Button (ХҮРГЭЛТ БҮРТГЭХ эсвэл ДАХИН ЗАСАХ) */}
      <div className="mt-3.5">
        <button
          type="button"
          onClick={() => onDeliverClick(store)}
          className={`
            w-full h-14 rounded-2xl font-black text-base md:text-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-md
            ${
              isDeliveredToday
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                : 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
            }
          `}
        >
          {isDeliveredToday ? (
            <>
              <Edit3 className="w-5 h-5" />
              <span>Хүргэсэн тоог дахин засах</span>
            </>
          ) : (
            <>
              <span>ХҮРГЭЛТ БҮРТГЭХ</span>
              <ChevronRight className="w-5 h-5 stroke-[3]" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
