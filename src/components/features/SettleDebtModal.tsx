import React, { useState, useEffect, useMemo } from 'react';
import { Store, DeliveryRecord } from '@/types';
import { Modal } from '@/components/common/Modal';
import { deliveryService } from '@/services/deliveryService';
import { formatTugrik } from '@/utils/currencyFormatter';
import { formatReadableDateWithDay } from '@/utils/dateUtils';
import {
  Landmark,
  Banknote,
  Check,
  CheckSquare,
  Square,
  AlertCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Receipt,
} from 'lucide-react';

export interface SettleDebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  store: Store | null;
  onSettle: (params: {
    storeId: string;
    selectedDeliveryIds: string[];
    settleInitialBalance: boolean;
    paymentMethod: 'TRANSFER' | 'CASH';
    note?: string;
  }) => Promise<void>;
}

export const SettleDebtModal: React.FC<SettleDebtModalProps> = ({
  isOpen,
  onClose,
  store,
  onSettle,
}) => {
  const [records, setRecords] = useState<DeliveryRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [includeLegacyDebt, setIncludeLegacyDebt] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<'TRANSFER' | 'CASH'>('TRANSFER');
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showPaidList, setShowPaidList] = useState<boolean>(false);

  // Дэлгүүрийн хүргэлтийн түүхийг татах
  useEffect(() => {
    if (isOpen && store) {
      setIsLoading(true);
      setSelectedIds(new Set());
      setIncludeLegacyDebt(false);
      setNote('');
      setIsSubmitting(false);

      deliveryService
        .getStoreDeliveries(store.id)
        .then((data) => {
          setRecords(data);
          // Анх нээгдэхэд төлөгдөөгүй бүх өдрүүдийг автоматаар сонгосон байвал ээжид хялбар
          const unpaidIds = data
            .filter((d) => {
              const paid = (d.paidCash || 0) + (d.paidTransfer || 0);
              return (d.todayDue || 0) - paid > 0;
            })
            .map((d) => d.id);
          setSelectedIds(new Set(unpaidIds));
        })
        .catch((err) => console.error('Failed to load store deliveries:', err))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, store]);

  // Төлөгдөөгүй болон төлөгдсөн хүргэлтүүдийг ангилах
  const { unpaidRecords, paidRecords, totalAllUnpaid, legacyDebt } = useMemo(() => {
    const unpaid: Array<{ record: DeliveryRecord; unpaidAmount: number }> = [];
    const paid: DeliveryRecord[] = [];
    let sumUnpaid = 0;

    for (const r of records) {
      const alreadyPaid = (r.paidCash || 0) + (r.paidTransfer || 0);
      const remaining = Math.max(0, (r.todayDue || 0) - alreadyPaid);
      if (remaining > 0) {
        unpaid.push({ record: r, unpaidAmount: remaining });
        sumUnpaid += remaining;
      } else {
        paid.push(r);
      }
    }

    const currentBal = store?.currentBalance || 0;
    const legacy = Math.max(0, currentBal - sumUnpaid);

    return {
      unpaidRecords: unpaid,
      paidRecords: paid,
      totalAllUnpaid: sumUnpaid,
      legacyDebt: legacy,
    };
  }, [records, store]);

  // Сонгогдсон хүргэлтүүдийн нийт хасагдах дүн
  const totalSelectedAmount = useMemo(() => {
    let sum = 0;
    for (const item of unpaidRecords) {
      if (selectedIds.has(item.record.id)) {
        sum += item.unpaidAmount;
      }
    }
    if (includeLegacyDebt) {
      sum += legacyDebt;
    }
    return sum;
  }, [unpaidRecords, selectedIds, includeLegacyDebt, legacyDebt]);

  // Сонголт хийсний дараа үлдэх өр
  const remainingDebtAfter = Math.max(
    0,
    (store?.currentBalance || 0) - totalSelectedAmount
  );

  // Сонголт сэлгэх
  const toggleSelectId = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Бүгдийг сонгох
  const handleSelectAll = () => {
    setSelectedIds(new Set(unpaidRecords.map((u) => u.record.id)));
    if (legacyDebt > 0) {
      setIncludeLegacyDebt(true);
    }
  };

  // Бүх сонголтыг арилгах
  const handleDeselectAll = () => {
    setSelectedIds(new Set());
    setIncludeLegacyDebt(false);
  };

  // Хадгалах үйлдэл
  const handleSubmit = async () => {
    if (!store) return;
    if (totalSelectedAmount <= 0) {
      alert('Тооцоо хаах ядаж нэг өдөр эсвэл үлдэгдлийг сонгоно уу.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSettle({
        storeId: store.id,
        selectedDeliveryIds: Array.from(selectedIds),
        settleInitialBalance: includeLegacyDebt,
        paymentMethod,
        note: note.trim() || undefined,
      });
      onClose();
    } catch (err) {
      console.error(err);
      alert('Тооцоо хаахад алдаа гарлаа: ' + (err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!store) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={store.name}
      subtitle="Тооцоо хаах • Өр барагдуулах"
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Одоогийн үлдэгдэл өрийн самбар */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Одоогийн үлдэгдэл өр
            </span>
            <span className="text-2xl font-black text-rose-600 dark:text-rose-400">
              {formatTugrik(store.currentBalance)}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleSelectAll}
              className="px-3 py-1.5 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 text-xs font-bold hover:bg-amber-200 active:scale-95 transition-all"
            >
              Бүгдийг сонгох
            </button>
            <button
              type="button"
              onClick={handleDeselectAll}
              className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-300 active:scale-95 transition-all"
            >
              Цэвэрлэх
            </button>
          </div>
        </div>

        {/* Төлөгдөөгүй хүргэлтүүдийн жагсаалт (Өдрөөр нь сонгох) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Төлөгдөөгүй тооцоотой өдрүүд ({unpaidRecords.length})
            </h4>
            <span className="text-xs font-bold text-slate-400">
              Төлбөр хийсэн өдрүүдийг чагтална уу
            </span>
          </div>

          {isLoading ? (
            <div className="py-8 text-center text-slate-400 text-sm">
              Хүргэлтийн түүх уншиж байна...
            </div>
          ) : unpaidRecords.length === 0 && legacyDebt === 0 ? (
            <div className="p-6 text-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200">
              <Check className="w-8 h-8 mx-auto mb-1 stroke-[3]" />
              <p className="font-bold text-sm">Энэ дэлгүүрт төлөгдөөгүй өр алга байна!</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[42vh] overflow-y-auto pr-1">
              {/* Хуучин / Анхны үлдэгдэл өр (хэрэв байгаа бол) */}
              {legacyDebt > 0 && (
                <div
                  onClick={() => setIncludeLegacyDebt(!includeLegacyDebt)}
                  className={`
                    p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between
                    ${
                      includeLegacyDebt
                        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 dark:border-amber-600 shadow-sm'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-80'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-amber-600">
                      {includeLegacyDebt ? (
                        <CheckSquare className="w-6 h-6" />
                      ) : (
                        <Square className="w-6 h-6 text-slate-300" />
                      )}
                    </div>
                    <div>
                      <h5 className="font-black text-slate-900 dark:text-white text-sm">
                        📜 Өмнөх хуучин үлдэгдэл өр
                      </h5>
                      <p className="text-xs text-slate-500 font-semibold">
                        Систем ашиглахаас өмнөх эхлэлийн өр
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-black text-slate-900 dark:text-white block">
                      {formatTugrik(legacyDebt)}
                    </span>
                    <span className="text-[10px] font-bold text-amber-600 uppercase">
                      Үлдэгдэл
                    </span>
                  </div>
                </div>
              )}

              {/* Өдрөөр хүргэгдсэн хүргэлтүүд */}
              {unpaidRecords.map(({ record, unpaidAmount }) => {
                const isSelected = selectedIds.has(record.id);
                const totalDelivered =
                  record.deliveredWhite + record.deliveredWhole + record.deliveredBaguette;
                const totalReturned =
                  record.returnedWhite + record.returnedWhole + record.returnedBaguette;

                return (
                  <div
                    key={record.id}
                    onClick={() => toggleSelectId(record.id)}
                    className={`
                      p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3
                      ${
                        isSelected
                          ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-600 shadow-sm'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 text-emerald-600">
                        {isSelected ? (
                          <CheckSquare className="w-6 h-6" />
                        ) : (
                          <Square className="w-6 h-6 text-slate-300 dark:text-slate-700" />
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-900 dark:text-white text-sm">
                            {formatReadableDateWithDay(record.date)}
                          </span>
                          {record.note && (
                            <span className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                              {record.note}
                            </span>
                          )}
                        </div>

                        {/* Хүргэсэн тоо ширхэг */}
                        <div className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-2">
                          <span>
                            Өгсөн: 1-р({record.deliveredWhite}), Бүхэл({record.deliveredWhole}), Багет({record.deliveredBaguette})
                          </span>
                          {totalReturned > 0 && (
                            <span className="text-rose-500 font-semibold">
                              (Буцаалт: {totalReturned})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Дүн ба үлдэгдэл */}
                    <div className="text-right flex-shrink-0">
                      <span className="text-base font-black text-slate-900 dark:text-white block">
                        {formatTugrik(unpaidAmount)}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 block">
                        Нийт: {formatTugrik(record.todayDue)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Төлбөрийн хэлбэр (Данс / Бэлэн) */}
        <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
            Төлбөр хүлээн авсан хэлбэр
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPaymentMethod('TRANSFER')}
              className={`
                h-12 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all border-2
                ${
                  paymentMethod === 'TRANSFER'
                    ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }
              `}
            >
              <Landmark className="w-4 h-4" />
              <span>Дансаар шилжүүлсэн</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('CASH')}
              className={`
                h-12 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all border-2
                ${
                  paymentMethod === 'CASH'
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }
              `}
            >
              <Banknote className="w-4 h-4" />
              <span>Бэлнээр өгсөн</span>
            </button>
          </div>

          <input
            type="text"
            placeholder="Гүйлгээний утга, тайлбар (сонголтоор)..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full h-11 px-3 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Өмнө нь төлөгдсөн хүргэлтүүд (Нээж харах) */}
        {paidRecords.length > 0 && (
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowPaidList(!showPaidList)}
              className="text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1"
            >
              {showPaidList ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              <span>Өмнө нь төлөгдсөн {paidRecords.length} хүргэлтийг харах</span>
            </button>

            {showPaidList && (
              <div className="mt-2 space-y-1.5 max-h-36 overflow-y-auto">
                {paidRecords.map((r) => (
                  <div
                    key={r.id}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between text-slate-500"
                  >
                    <span>{formatReadableDateWithDay(r.date)}</span>
                    <span className="font-bold text-emerald-600">
                      ✓ {formatTugrik(r.todayDue)} төлөгдсөн
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Доод хэсгийн хураангуй самбар */}
        <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-amber-900 dark:text-amber-200">
            <span>Сонгосон өдрүүд:</span>
            <span>
              {selectedIds.size} өдөр {includeLegacyDebt ? '+ хуучин үлдэгдэл' : ''}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-black text-slate-700 dark:text-slate-300">
              Хасагдах нийт дүн:
            </span>
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
              -{formatTugrik(totalSelectedAmount)}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs font-bold text-slate-500 pt-1 border-t border-amber-200/60 dark:border-amber-800/40">
            <span>Үлдэх өр:</span>
            <span
              className={`font-black ${
                remainingDebtAfter > 0 ? 'text-rose-600' : 'text-emerald-600'
              }`}
            >
              {formatTugrik(remainingDebtAfter)}
            </span>
          </div>
        </div>

        {/* Үйлдлийн товчлуурууд */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="h-14 rounded-2xl font-black text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 active:scale-95 transition-all"
          >
            Болих
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || totalSelectedAmount <= 0}
            className={`
              h-14 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md
              ${
                totalSelectedAmount > 0
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }
            `}
          >
            <Check className="w-5 h-5 stroke-[3]" />
            <span>
              {isSubmitting
                ? 'Хадгалж байна...'
                : totalSelectedAmount > 0
                ? `${formatTugrik(totalSelectedAmount)} ХАСАХ`
                : 'Өдрөө сонгоно уу'}
            </span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
