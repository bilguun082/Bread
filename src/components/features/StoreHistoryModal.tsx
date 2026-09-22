import React, { useState, useEffect } from 'react';
import { Store, DeliveryRecord } from '@/types';
import { Modal } from '@/components/common/Modal';
import { deliveryService } from '@/services/deliveryService';
import { formatTugrik } from '@/utils/currencyFormatter';
import { formatReadableDateTime } from '@/utils/dateUtils';
import { Phone, MapPin, Receipt, ArrowDownLeft } from 'lucide-react';

export interface StoreHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  store: Store | null;
  onSelectReceipt: (record: DeliveryRecord) => void;
}

export const StoreHistoryModal: React.FC<StoreHistoryModalProps> = ({
  isOpen,
  onClose,
  store,
  onSelectReceipt,
}) => {
  const [records, setRecords] = useState<DeliveryRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && store) {
      setIsLoading(true);
      deliveryService
        .getStoreDeliveries(store.id)
        .then((data) => setRecords(data))
        .catch((err) => console.error(err))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, store]);

  if (!store) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={store.name}
      subtitle="Хүргэлт ба Төлбөрийн Түүх"
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Store Info Banner */}
        <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Одоогийн үлдэгдэл өр:</span>
            <span
              className={`text-xl font-black ${
                store.currentBalance > 0 ? 'text-rose-600' : 'text-emerald-600'
              }`}
            >
              {formatTugrik(store.currentBalance)}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700">
            {store.phone && (
              <a href={`tel:${store.phone}`} className="flex items-center gap-1 font-bold text-emerald-600">
                <Phone className="w-3.5 h-3.5" />
                <span>{store.phone}</span>
              </a>
            )}
            {store.address && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{store.address}</span>
              </span>
            )}
          </div>
        </div>

        {/* History List */}
        <div>
          <h4 className="text-sm font-black text-slate-900 dark:text-white mb-2 uppercase">
            Сүүлийн хүргэлтүүд ({records.length})
          </h4>

          {isLoading ? (
            <div className="py-8 text-center text-slate-400 text-sm">Уншиж байна...</div>
          ) : records.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-sm">
              Энэ дэлгүүрт одоогоор хүргэлтийн түүх бүртгэгдээгүй байна.
            </div>
          ) : (
            <div className="space-y-3">
              {records.map((r) => {
                const totalDelivered = r.deliveredWhite + r.deliveredWhole + r.deliveredBaguette;
                const totalReturned = r.returnedWhite + r.returnedWhole + r.returnedBaguette;
                return (
                  <div
                    key={r.id}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-bold">{formatReadableDateTime(r.date)}</span>
                      <button
                        onClick={() => onSelectReceipt(r)}
                        className="inline-flex items-center gap-1 text-amber-600 font-bold hover:underline"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>Чек харах</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        Өгсөн: <span className="text-amber-600">{totalDelivered} ш</span>
                        {totalReturned > 0 && (
                          <span className="text-rose-500 text-xs ml-2">
                            (Буцаалт: {totalReturned} ш)
                          </span>
                        )}
                      </div>
                      <div className="font-black text-slate-900 dark:text-white">
                        {formatTugrik(r.todayDue)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
                      <span>Төлсөн: Бэлэн {formatTugrik(r.paidCash)} | Данс {formatTugrik(r.paidTransfer)}</span>
                      <span className="font-bold text-rose-500">
                        Үлдсэн өр: {formatTugrik(r.newBalance)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
