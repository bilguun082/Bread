'use client';

import React, { useState, useEffect } from 'react';
import { useDailyRun } from '@/hooks/useDailyRun';
import { useStores } from '@/hooks/useStores';
import { useReceiptPrinter } from '@/hooks/useReceiptPrinter';
import { TruckInventoryHeader } from '@/components/features/TruckInventoryHeader';
import { RouteStoreItem } from '@/components/features/RouteStoreItem';
import { DeliveryModal } from '@/components/features/DeliveryModal';
import { MorningLoadModal } from '@/components/features/MorningLoadModal';
import { ReceiptModal } from '@/components/features/ReceiptModal';
import { deliveryService } from '@/services/deliveryService';
import { Store, Product, DeliveryFormData, DeliveryRecord } from '@/types';
import { Search, RefreshCw, AlertCircle } from 'lucide-react';
import '@/app/globals.css';

export default function DeliveryRunPage() {
  const {
    selectedDate,
    dailyRun,
    remainingInCar,
    isLoading: isDailyLoading,
    updateLoadedInventory,
    refresh: refreshDailyRun,
  } = useDailyRun();

  const {
    filteredStores,
    searchQuery,
    setSearchQuery,
    isLoading: isStoresLoading,
    updateStoreBalanceLocal,
    refresh: refreshStores,
  } = useStores();

  const {
    isPrinting,
    printError,
    lastPrintedData,
    isBluetoothSupported,
    buildReceiptData,
    printBluetooth,
    printWeb,
  } = useReceiptPrinter();

  // Бүтээгдэхүүний үнийн жагсаалт
  const [products, setProducts] = useState<Product[]>([]);

  // Идэвхтэй сонгогдсон дэлгүүр (Хүргэлт хийх цонхонд)
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] =
    useState<boolean>(false);
  const [isLoadModalOpen, setIsLoadModalOpen] = useState<boolean>(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);
  const [currentReceiptData, setCurrentReceiptData] = useState<ReturnType<
    typeof buildReceiptData
  > | null>(null);

  // Бүтээгдэхүүнүүдийг ачаалах
  useEffect(() => {
    deliveryService
      .getProducts()
      .then((data) => setProducts(data))
      .catch((err) => console.error('Failed to load products:', err));
  }, []);

  // Өнөөдөр аль дэлгүүрүүд дээр хүргэлт хийгдсэн эсэхийг тодорхойлох
  const deliveredStoreIds = new Set(
    (dailyRun?.deliveries || []).map((d) => d.storeId)
  );

  // Дэлгүүрийн карт дээр дарах үед
  const handleOpenDelivery = (store: Store) => {
    setSelectedStore(store);
    setIsDeliveryModalOpen(true);
  };

  // Хүргэлтийн баримт илгээж хадгалах
  const handleDeliverySubmit = async (
    formData: DeliveryFormData,
    shouldPrint: boolean
  ): Promise<DeliveryRecord> => {
    const res = await deliveryService.recordStoreDelivery(formData);

    // 1. Орон нутгийн дэлгүүрийн балансыг шууд шинэчлэх
    updateStoreBalanceLocal(formData.storeId, res.updatedBalance);

    // 2. Өдрийн үлдэгдлийг шинэчлэх
    refreshDailyRun();

    // 3. Хэрэв чек хэвлэх сонголттой бол
    if (shouldPrint && selectedStore) {
      const receipt = buildReceiptData(
        res.record,
        selectedStore.address,
        products,
        {
          showDebtOnReceipt: formData.showDebtOnReceipt,
          paymentMethodLabel: formData.paymentMethodLabel,
        }
      );
      setCurrentReceiptData(receipt);
      setIsReceiptModalOpen(true);

      // Web Bluetooth шууд дэмжигдсэн бол автомат оролдлого хийх боломжтой
      if (isBluetoothSupported) {
        printBluetooth(receipt).catch((e) =>
          console.warn('Auto BT print failed:', e)
        );
      }
    }

    return res.record;
  };

  // Өглөөний ачилт хадгалах
  const handleSaveMorningLoad = async (counts: {
    loadedWhite: number;
    loadedWhole: number;
    loadedBaguette: number;
  }) => {
    await updateLoadedInventory(counts);
  };

  const handleRefreshAll = () => {
    refreshDailyRun();
    refreshStores();
  };

  const totalLoaded =
    (dailyRun?.loadedWhite || 0) +
    (dailyRun?.loadedWhole || 0) +
    (dailyRun?.loadedBaguette || 0);

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-1 pb-1">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Өдрийн Хүргэлт
          </h1>
          <p className="text-xs font-semibold text-slate-500">
            Ээжийн өдөр тутмын хүргэлтийн горим
          </p>
        </div>

        <button
          onClick={handleRefreshAll}
          className="w-11 h-11 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 active:scale-90 transition-all shadow-sm"
          aria-label="Шинэчлэх"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* 1. Машинд үлдсэн талхны индикатор (Том харагдацтай) */}
      <TruckInventoryHeader
        remainingInCar={remainingInCar}
        totalLoaded={totalLoaded}
        isCompleted={dailyRun?.status === 'COMPLETED'}
        onOpenLoadModal={() => setIsLoadModalOpen(true)}
        dateStr={selectedDate}
      />

      {/* 2. Дэлгүүр хайх талбар */}
      <div className="relative">
        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          placeholder="Дэлгүүрийн нэр, хаягаар хайх..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-13 pl-12 pr-4 text-base font-bold rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* 3. Маршрутын дараалсан дэлгүүрүүд */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between text-xs font-extrabold text-slate-500 px-1 uppercase tracking-wider">
          <span>Маршрутын дараалал ({filteredStores.length})</span>
          <span>
            Хүргэсэн: {deliveredStoreIds.size} / {filteredStores.length}
          </span>
        </div>

        {isStoresLoading || isDailyLoading ? (
          <div className="py-12 text-center text-slate-400 font-semibold text-sm">
            Ачаалж байна...
          </div>
        ) : filteredStores.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="font-bold text-slate-600 dark:text-slate-300">
              Дэлгүүр олдсонгүй
            </p>
          </div>
        ) : (
          filteredStores.map((store, idx) => (
            <RouteStoreItem
              key={store.id}
              store={store}
              index={idx}
              isDeliveredToday={deliveredStoreIds.has(store.id)}
              onDeliverClick={handleOpenDelivery}
            />
          ))
        )}
      </div>

      {/* Хүргэлтийн 5 секундийн Popup Modal */}
      <DeliveryModal
        isOpen={isDeliveryModalOpen}
        onClose={() => setIsDeliveryModalOpen(false)}
        store={selectedStore}
        products={products}
        onSubmit={handleDeliverySubmit}
      />

      {/* Өглөөний ачилт оруулах Modal */}
      <MorningLoadModal
        isOpen={isLoadModalOpen}
        onClose={() => setIsLoadModalOpen(false)}
        initialCounts={{
          white: dailyRun?.loadedWhite || 0,
          whole: dailyRun?.loadedWhole || 0,
          baguette: dailyRun?.loadedBaguette || 0,
        }}
        onSave={handleSaveMorningLoad}
      />

      {/* 58mm Кассын чек хэвлэх Modal */}
      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        receiptData={currentReceiptData}
        onBluetoothPrint={printBluetooth}
        onWebPrint={printWeb}
        isPrinting={isPrinting}
        printError={printError}
        isBluetoothSupported={isBluetoothSupported}
      />
    </div>
  );
}
