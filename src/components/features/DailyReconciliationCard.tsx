import React, { useState } from 'react';
import { DailyCloseoutSummary } from '@/types';
import { formatTugrik } from '@/utils/currencyFormatter';
import { Button } from '@/components/common/Button';
import {
  CheckCircle2,
  AlertTriangle,
  Wallet,
  Landmark,
  FileText,
  Package,
  Store as StoreIcon,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export interface DailyReconciliationCardProps {
  summary: DailyCloseoutSummary;
  onToggleClose: () => Promise<void>;
  isClosing: boolean;
}

export const DailyReconciliationCard: React.FC<DailyReconciliationCardProps> = ({
  summary,
  onToggleClose,
  isClosing,
}) => {
  const isCompleted = summary.status === 'COMPLETED';
  const [isStoresOpen, setIsStoresOpen] = useState<boolean>(false);

  return (
    <div className="space-y-5">
      {/* 1. Талхны тооцоо (Ачсан, хүргэсэн, буцаалт, үлдсэн) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border-2 border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-600" />
            <h3 className="font-black text-lg text-slate-900 dark:text-white">
              1. Талхны тооцоо (Биет)
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setIsStoresOpen(!isStoresOpen)}
            className="inline-flex items-center gap-1.5 text-xs font-black bg-amber-100 hover:bg-amber-200 text-amber-900 dark:bg-amber-950 dark:hover:bg-amber-900 dark:text-amber-300 px-3 py-1.5 rounded-2xl active:scale-95 transition-all shadow-sm border border-amber-300 dark:border-amber-800 cursor-pointer"
            title="Дэлгүүр тус бүрийн хүргэсэн талхны тоог харах"
          >
            <StoreIcon className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
            <span>{summary.completedStoresCount} дэлгүүрт хүргэсэн</span>
            {isStoresOpen ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* 4 Cards: Loaded, Delivered, Returned, Leftover */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Ачсан */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="text-xs font-bold text-slate-500 uppercase">Ачсан</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {summary.loaded.total} <span className="text-xs font-medium">ш</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              1-р: {summary.loaded.white} | Бүх: {summary.loaded.whole} | Баг: {summary.loaded.baguette}
            </div>
          </div>

          {/* Хүргэсэн */}
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase">
              Хүргэсэн
            </span>
            <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
              {summary.delivered.total} <span className="text-xs font-medium">ш</span>
            </div>
            <div className="text-[10px] text-emerald-600/80 mt-1">
              1-р: {summary.delivered.white} | Бүх: {summary.delivered.whole} | Баг: {summary.delivered.baguette}
            </div>
          </div>

          {/* Буцаалт */}
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
            <span className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase">
              Буцаалт
            </span>
            <div className="text-2xl font-black text-rose-700 dark:text-rose-300 mt-1">
              {summary.returned.total} <span className="text-xs font-medium">ш</span>
            </div>
            <div className="text-[10px] text-rose-600/80 mt-1">
              1-р: {summary.returned.white} | Бүх: {summary.returned.whole} | Баг: {summary.returned.baguette}
            </div>
          </div>

          {/* Машинд үлдсэн */}
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
            <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase">
              Гэрт үлдсэн
            </span>
            <div className="text-2xl font-black text-amber-700 dark:text-amber-300 mt-1">
              {summary.remainingInCar.total} <span className="text-xs font-medium">ш</span>
            </div>
            <div className="text-[10px] text-amber-600/80 mt-1">
              1-р: {summary.remainingInCar.white} | Бүх: {summary.remainingInCar.whole} | Баг: {summary.remainingInCar.baguette}
            </div>
          </div>
        </div>

        {/* Хүргэсэн дэлгүүрүүдийн нарийвчилсан задаргаа (Accordion) */}
        {isStoresOpen && (
          <div className="pt-4 border-t-2 border-slate-100 dark:border-slate-800 space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-black text-sm text-slate-900 dark:text-white uppercase flex items-center gap-1.5">
                  <StoreIcon className="w-4 h-4 text-amber-600" />
                  <span>
                    Дэлгүүр тус бүрт хүргэсэн талхны тоо ({summary.deliveries?.length || summary.completedStoresCount})
                  </span>
                </h4>
                <p className="text-[11px] text-slate-400">
                  Энэ өдөр ямар талх хэдэн ширхэг хүргэснийг эндээс харна уу
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsStoresOpen(false)}
                className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
              >
                Хураах ▴
              </button>
            </div>

            {(!summary.deliveries || summary.deliveries.length === 0) ? (
              <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                Энэ өдөр хүргэлтийн задаргаа хараахан байхгүй байна.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                {summary.deliveries.map((item, index) => (
                  <div
                    key={item.id || index}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 space-y-2"
                  >
                    {/* Дэлгүүрийн нэр ба нийт талх, дүн */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 font-black text-xs flex items-center justify-center flex-shrink-0">
                          {index + 1}
                        </span>
                        <div>
                          <h5 className="font-black text-sm text-slate-900 dark:text-white leading-tight">
                            {item.storeName}
                          </h5>
                          {item.note && (
                            <p className="text-[10px] text-slate-400 mt-0.5">{item.note}</p>
                          )}
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span className="text-sm font-black text-slate-900 dark:text-white block">
                          {formatTugrik(item.todayDue)}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block">
                          Нийт: {item.totalDelivered} ш талх
                        </span>
                      </div>
                    </div>

                    {/* Ямар талх хичнээн ширхэг хүргэсэн задаргаа */}
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200/60 dark:border-slate-700">
                        <span className="text-[10px] text-slate-400 font-bold block">1-р гурил</span>
                        <span className="text-sm font-black text-slate-900 dark:text-white">
                          {item.deliveredWhite} ш
                        </span>
                        {item.returnedWhite > 0 && (
                          <span className="text-[10px] text-rose-500 font-semibold block">
                            (-{item.returnedWhite} буц)
                          </span>
                        )}
                      </div>

                      <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200/60 dark:border-slate-700">
                        <span className="text-[10px] text-slate-400 font-bold block">Бүхэл үр</span>
                        <span className="text-sm font-black text-slate-900 dark:text-white">
                          {item.deliveredWhole} ш
                        </span>
                        {item.returnedWhole > 0 && (
                          <span className="text-[10px] text-rose-500 font-semibold block">
                            (-{item.returnedWhole} буц)
                          </span>
                        )}
                      </div>

                      <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200/60 dark:border-slate-700">
                        <span className="text-[10px] text-slate-400 font-bold block">Багет</span>
                        <span className="text-sm font-black text-slate-900 dark:text-white">
                          {item.deliveredBaguette} ш
                        </span>
                        {item.returnedBaguette > 0 && (
                          <span className="text-[10px] text-rose-500 font-semibold block">
                            (-{item.returnedBaguette} буц)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Төлбөр & Өр */}
                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/60 dark:border-slate-700 font-semibold text-slate-500">
                      <span>
                        Төлсөн: Бэлэн {formatTugrik(item.paidCash)} | Данс {formatTugrik(item.paidTransfer)}
                      </span>
                      {item.debtAdded > 0 ? (
                        <span className="font-bold text-rose-500">
                          Үлдсэн өр: +{formatTugrik(item.debtAdded)}
                        </span>
                      ) : (
                        <span className="font-bold text-emerald-600">
                          ✓ Төлбөр бүрэн
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. Мөнгөний тооцоо (Түрийвчинд тоолох бэлэн мөнгө, дансны орлого, өр) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border-2 border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-600" />
            <h3 className="font-black text-lg text-slate-900 dark:text-white">
              2. Мөнгөний тооцоо (Касс)
            </h3>
          </div>
          <span className="text-xs font-bold text-slate-500">
            Нийт борлуулалт: <b>{formatTugrik(summary.totalRevenue)}</b>
          </span>
        </div>

        <div className="space-y-3">
          {/* Түрийвчинд байх БЭЛЭН МӨНГӨ (Хамгийн чухал тоо!) */}
          <div className="p-4 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black">
                ₮
              </div>
              <div>
                <span className="text-xs font-extrabold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide">
                  Ээжийн түрийвчинд байх бэлэн мөнгө
                </span>
                <p className="text-xs text-slate-500">Яг одоо бэлнээр тоолох дүн</p>
              </div>
            </div>
            <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
              {formatTugrik(summary.totalCashReceived)}
            </span>
          </div>

          {/* ДАНСААР ОРСОН МӨНГӨ */}
          <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black">
                <Landmark className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-extrabold text-blue-800 dark:text-blue-300 uppercase">
                  Дансаар орсон мөнгө
                </span>
                <p className="text-xs text-slate-500">Банкны апп дээрээ тулгах</p>
              </div>
            </div>
            <span className="text-xl font-black text-blue-700 dark:text-blue-400">
              {formatTugrik(summary.totalTransferReceived)}
            </span>
          </div>

          {/* ШИНЭЭР ҮҮССЭН ӨР (ЗЭЭЛ) */}
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-black">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-extrabold text-rose-800 dark:text-rose-300 uppercase">
                  Шинээр үүссэн зээл (Өр)
                </span>
                <p className="text-xs text-slate-500">Сүүлд авахаар тохирсон дүн</p>
              </div>
            </div>
            <span className="text-xl font-black text-rose-700 dark:text-rose-400">
              {formatTugrik(summary.totalNewDebtAdded)}
            </span>
          </div>
        </div>
      </div>

      {/* 3. ӨДРИЙГ ХААХ ТОМ ТОВЧ */}
      <div className="pt-2">
        <Button
          variant={isCompleted ? 'outline' : 'success'}
          size="xl"
          fullWidth
          isLoading={isClosing}
          leftIcon={
            isCompleted ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            ) : (
              <CheckCircle2 className="w-6 h-6 text-white" />
            )
          }
          onClick={onToggleClose}
        >
          {isCompleted ? 'Өдөр хаагдсан (Буцааж нээх)' : 'ӨНӨӨДРИЙН ХААЛТ ХИЙХ'}
        </Button>
      </div>
    </div>
  );
};
