'use client';

import React, { useState, useEffect } from 'react';
import { useStores } from '@/hooks/useStores';
import { useReceiptPrinter } from '@/hooks/useReceiptPrinter';
import { Store, DeliveryRecord, Product } from '@/types';
import { deliveryService } from '@/services/deliveryService';
import { AddStoreModal } from '@/components/features/AddStoreModal';
import { EditStoreModal } from '@/components/features/EditStoreModal';
import { StoreHistoryModal } from '@/components/features/StoreHistoryModal';
import { ReceiptModal } from '@/components/features/ReceiptModal';
import { formatTugrik } from '@/utils/currencyFormatter';
import { Plus, Search, Phone, History, MapPin, RefreshCw, Edit3, Trash2 } from 'lucide-react';

export default function StoresPage() {
  const {
    stores,
    filteredStores,
    searchQuery,
    setSearchQuery,
    totalReceivables,
    isLoading,
    addStore,
    updateStore,
    deleteStore,
    refresh,
  } = useStores();

  const {
    isPrinting,
    printError,
    isBluetoothSupported,
    buildReceiptData,
    printBluetooth,
    printWeb,
  } = useReceiptPrinter();

  const [products, setProducts] = useState<Product[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [selectedEditStore, setSelectedEditStore] = useState<Store | null>(null);
  const [selectedHistoryStore, setSelectedHistoryStore] = useState<Store | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);
  const [selectedReceiptData, setSelectedReceiptData] = useState<ReturnType<typeof buildReceiptData> | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);

  useEffect(() => {
    deliveryService
      .getProducts()
      .then((data) => setProducts(data))
      .catch((err) => console.error(err));
  }, []);

  const handleOpenEdit = (store: Store) => {
    setSelectedEditStore(store);
    setIsEditModalOpen(true);
  };

  const handleDeleteStoreClick = async (store: Store) => {
    const isConfirmed = confirm(
      `"${store.name}" дэлгүүрийг жагсаалтаас устгах уу?\n\nАнхаар: Энэ дэлгүүртэй холбоотой хүргэлтийн түүх хамт устахыг анхаарна уу.`
    );
    if (!isConfirmed) return;

    try {
      await deleteStore(store.id);
      refresh();
    } catch (err) {
      console.error(err);
      alert('Дэлгүүр устгахад алдаа гарлаа: ' + (err as Error).message);
    }
  };

  const handleOpenHistory = (store: Store) => {
    setSelectedHistoryStore(store);
    setIsHistoryModalOpen(true);
  };

  const handleSelectReceiptFromHistory = (record: DeliveryRecord) => {
    if (!selectedHistoryStore) return;
    const receipt = buildReceiptData(
      record,
      selectedHistoryStore.address,
      products
    );
    setSelectedReceiptData(receipt);
    setIsReceiptModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-1 pb-1">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Дэлгүүрүүд ба Тооцоо
          </h1>
          <p className="text-xs font-semibold text-slate-500">
            Өр авлага ба харилцагчийн бүртгэл
          </p>
        </div>

        <button
          type="button"
          onClick={refresh}
          className="w-11 h-11 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 active:scale-90 transition-all shadow-sm cursor-pointer"
          aria-label="Шинэчлэх"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Total Receivables Hero Banner */}
      <div className="bg-gradient-to-br from-rose-600 to-rose-700 text-white rounded-3xl p-5 shadow-xl shadow-rose-600/20">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-rose-100 font-extrabold uppercase tracking-wider block">
              Нийт авлага (Дэлгүүрүүдийн өр)
            </span>
            <span className="text-3xl font-black mt-1 block">
              {formatTugrik(totalReceivables)}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 bg-white text-rose-700 px-4 py-2.5 rounded-2xl text-xs font-black shadow hover:bg-rose-50 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-rose-600 stroke-[3]" />
            <span>Дэлгүүр нэмэх</span>
          </button>
        </div>

        <div className="mt-4 pt-3 border-t border-rose-500/50 flex items-center justify-between text-xs text-rose-100 font-semibold">
          <span>
            Бүртгэлтэй: <b>{stores.length} дэлгүүр</b>
          </span>
          <span>
            Өртэй:{' '}
            <b>{stores.filter((s) => s.currentBalance > 0).length} дэлгүүр</b>
          </span>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          placeholder="Дэлгүүрийн нэр, худалдагч, утсаар хайх..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-13 pl-12 pr-4 text-base font-bold rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* Stores List */}
      <div className="space-y-3 pt-1">
        {isLoading ? (
          <div className="py-12 text-center text-slate-400 font-semibold text-sm">
            Уншиж байна...
          </div>
        ) : filteredStores.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
            <p className="font-bold text-slate-600 dark:text-slate-300">
              Дэлгүүр олдсонгүй
            </p>
          </div>
        ) : (
          filteredStores.map((store) => {
            const hasDebt = store.currentBalance > 0;
            return (
              <div
                key={store.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-sm space-y-3 transition-all hover:border-amber-400"
              >
                {/* Store Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-black flex items-center justify-center">
                        {store.routeOrder || 1}
                      </span>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight">
                        {store.name}
                      </h3>
                    </div>
                    {store.ownerName && (
                      <p className="text-xs font-bold text-slate-500 mt-1 pl-8">
                        Эзэн: {store.ownerName}
                      </p>
                    )}
                  </div>

                  {/* Outstanding Debt Badge */}
                  <div className="text-right flex-shrink-0">
                    <span className="text-[10px] font-bold block text-slate-400 uppercase tracking-wider">
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

                {/* Location / Address */}
                {store.address && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium truncate">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{store.address}</span>
                  </div>
                )}

                {/* Action Buttons Row 1: Call & History */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  {store.phone ? (
                    <a
                      href={`tel:${store.phone}`}
                      className="flex-1 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 flex items-center justify-center gap-1.5 text-xs font-black active:scale-95 transition-all"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{store.phone}</span>
                    </a>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => handleOpenHistory(store)}
                    className="flex-1 h-11 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 flex items-center justify-center gap-1.5 text-xs font-black active:scale-95 transition-all cursor-pointer"
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>Түүх & Чек</span>
                  </button>
                </div>

                {/* Action Buttons Row 2: Edit & Delete */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(store)}
                    className="flex-1 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 text-xs font-bold active:scale-95 transition-all cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Мэдээлэл засах</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteStoreClick(store)}
                    className="h-10 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 flex items-center justify-center gap-1.5 text-xs font-bold active:scale-95 transition-all cursor-pointer"
                    title="Дэлгүүр устгах"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Устгах</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal to add new store */}
      <AddStoreModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddStore={async (input) => {
          await addStore(input);
          refresh();
        }}
      />

      {/* Modal to edit existing store */}
      <EditStoreModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        store={selectedEditStore}
        onUpdateStore={async (id, updates) => {
          await updateStore(id, updates);
          refresh();
        }}
      />

      {/* Modal to view store deliveries and payment history */}
      <StoreHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        store={selectedHistoryStore}
        onSelectReceipt={handleSelectReceiptFromHistory}
      />

      {/* Modal to reprint receipt */}
      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        receiptData={selectedReceiptData}
        onBluetoothPrint={printBluetooth}
        onWebPrint={printWeb}
        isPrinting={isPrinting}
        printError={printError}
        isBluetoothSupported={isBluetoothSupported}
      />
    </div>
  );
}
