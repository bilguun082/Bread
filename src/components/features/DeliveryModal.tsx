import React, { useState, useEffect, useMemo } from 'react';
import { Store, Product, DeliveryFormData, DeliveryRecord } from '@/types';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Stepper } from '@/components/common/Stepper';
import { formatTugrik } from '@/utils/currencyFormatter';
import { calculateDeliveryFigures } from '@/utils/deliveryMath';
import { Printer, Save, Banknote, Landmark, Clock, ArrowDownLeft, PackageCheck, RotateCcw, CheckCheck } from 'lucide-react';

export interface DeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  store: Store | null;
  products: Product[];
  onSubmit: (formData: DeliveryFormData, shouldPrint: boolean) => Promise<DeliveryRecord>;
}

export const DeliveryModal: React.FC<DeliveryModalProps> = ({
  isOpen,
  onClose,
  store,
  products,
  onSubmit,
}) => {
  // Хүргэх тоонууд
  const [deliveredWhite, setDeliveredWhite] = useState<number>(0);
  const [deliveredWhole, setDeliveredWhole] = useState<number>(0);
  const [deliveredBaguette, setDeliveredBaguette] = useState<number>(0);

  // Буцаалтын тоонууд (өчигдрийн үлдсэн талх)
  const [returnedWhite, setReturnedWhite] = useState<number>(0);
  const [returnedWhole, setReturnedWhole] = useState<number>(0);
  const [returnedBaguette, setReturnedBaguette] = useState<number>(0);

  // Төлбөрийн дүн ба тохиргоо
  const [paidCash, setPaidCash] = useState<number>(0);
  const [paidTransfer, setPaidTransfer] = useState<number>(0);
  const [paymentMethodLabel, setPaymentMethodLabel] = useState<string>('Паданаас паданы хооронд');
  const [showDebtOnReceipt, setShowDebtOnReceipt] = useState<boolean>(false);
  const [note, setNote] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showReturns, setShowReturns] = useState<boolean>(false);

  // Модал нээгдэх үед формоо цэвэрлэх
  useEffect(() => {
    if (isOpen) {
      setDeliveredWhite(0);
      setDeliveredWhole(0);
      setDeliveredBaguette(0);
      setReturnedWhite(0);
      setReturnedWhole(0);
      setReturnedBaguette(0);
      setPaidCash(0);
      setPaidTransfer(0);
      setPaymentMethodLabel('Паданаас паданы хооронд');
      setShowDebtOnReceipt(false);
      setNote('');
      setShowReturns(false);
    }
  }, [isOpen, store]);

  // Дүнгүүдийг шууд тооцоолох (Business logic helper-ээр)
  const figures = useMemo(() => {
    return calculateDeliveryFigures({
      deliveredWhite,
      deliveredWhole,
      deliveredBaguette,
      returnedWhite,
      returnedWhole,
      returnedBaguette,
      prevBalance: store?.currentBalance || 0,
      paidCash,
      paidTransfer,
      products,
    });
  }, [
    deliveredWhite,
    deliveredWhole,
    deliveredBaguette,
    returnedWhite,
    returnedWhole,
    returnedBaguette,
    store?.currentBalance,
    paidCash,
    paidTransfer,
    products,
  ]);

  // 1. Паданаас паданы хооронд (Зээл / Дараа тооцоо)
  const handlePayConsignment = () => {
    setPaidCash(0);
    setPaidTransfer(0);
    setPaymentMethodLabel('Паданаас паданы хооронд');
  };

  // 2. Өмнөх тооцоогоо өгсөн (Өмнөх өрийг төлөх)
  const handlePayPreviousDebt = () => {
    const prev = store?.currentBalance || 0;
    if (prev <= 0) {
      alert('Энэ дэлгүүрт өмнөх өрийн үлдэгдэл байхгүй байна.');
      return;
    }
    setPaidTransfer(prev);
    setPaidCash(0);
    setPaymentMethodLabel('Өмнөх тооцоо');
  };

  // 3. Өнөөдрийнх бэлнээр
  const handlePayTodayCash = () => {
    setPaidCash(figures.todayDue > 0 ? figures.todayDue : 0);
    setPaidTransfer(0);
    setPaymentMethodLabel('Бэлнээр');
  };

  // 4. Өнөөдрийнх дансаар
  const handlePayTodayTransfer = () => {
    setPaidTransfer(figures.todayDue > 0 ? figures.todayDue : 0);
    setPaidCash(0);
    setPaymentMethodLabel('Дансаар');
  };

  // 5. Бүх тооцоог хаах
  const handlePayAll = () => {
    setPaidTransfer(figures.totalPayable > 0 ? figures.totalPayable : 0);
    setPaidCash(0);
    setPaymentMethodLabel('Бүх тооцоо');
  };

  // Хадгалах үйлдэл
  const handleSave = async (shouldPrint: boolean) => {
    if (!store) return;
    setIsSubmitting(true);
    try {
      await onSubmit(
        {
          storeId: store.id,
          deliveredWhite,
          deliveredWhole,
          deliveredBaguette,
          returnedWhite,
          returnedWhole,
          returnedBaguette,
          paidCash,
          paidTransfer,
          paymentMethodLabel,
          showDebtOnReceipt,
          note: note.trim() || undefined,
        },
        shouldPrint
      );
      onClose();
    } catch (err) {
      console.error(err);
      alert('Хадгалахад алдаа гарлаа: ' + (err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!store) return null;

  const whiteProduct = products.find((p) => p.sku === 'white');
  const wholeProduct = products.find((p) => p.sku === 'whole');
  const baguetteProduct = products.find((p) => p.sku === 'baguette');

  const hasDebt = store.currentBalance > 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={store.name}
      subtitle={store.address || undefined}
      maxWidth="lg"
    >
      <div className="space-y-5">
        {/* 1. Дэлгүүрийн өмнөх өр үлдэгдэл самбар */}
        <div
          className={`p-4 rounded-2xl flex items-center justify-between border-2 ${
            hasDebt
              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-900 text-rose-900 dark:text-rose-200'
              : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200'
          }`}
        >
          <div>
            <span className="text-xs font-bold block uppercase tracking-wider">
              Өмнөх өрийн үлдэгдэл:
            </span>
            <span className="text-2xl font-black">
              {formatTugrik(store.currentBalance)}
            </span>
          </div>
          {hasDebt ? (
            <span className="text-xs font-black bg-rose-600 text-white px-3 py-1 rounded-full">
              ӨРТЭЙ
            </span>
          ) : (
            <span className="text-xs font-black bg-emerald-600 text-white px-3 py-1 rounded-full">
              ӨРГҮЙ
            </span>
          )}
        </div>

        {/* 2. Шинээр өгсөн талхны тоо (3 төрөл) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">
              1. Хүргэсэн талхны тоо
            </label>
            <button
              type="button"
              onClick={() => setShowReturns(!showReturns)}
              className="text-xs font-bold text-amber-600 dark:text-amber-400 underline flex items-center gap-1"
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              {showReturns ? 'Буцаалт нуух' : 'Өчигдрийн буцаалт хасах (+)'}
            </button>
          </div>

          <div className="space-y-3">
            {/* 1-р гурил */}
            <Stepper
              label="1-р гурилын талх"
              sublabel="Цагаан хөрөнгөний талх"
              value={deliveredWhite}
              onChange={setDeliveredWhite}
              unitPrice={whiteProduct?.price || 4500}
              highlightColor="amber"
            />

            {/* Бүхэл үр */}
            <Stepper
              label="Бүхэл үрийн талх"
              sublabel="100% бүхэл үр"
              value={deliveredWhole}
              onChange={setDeliveredWhole}
              unitPrice={wholeProduct?.price || 5000}
              highlightColor="amber"
            />

            {/* Багет */}
            <Stepper
              label="Багет (Baguette)"
              sublabel="Уламжлалт франц багет"
              value={deliveredBaguette}
              onChange={setDeliveredBaguette}
              unitPrice={baguetteProduct?.price || 4000}
              highlightColor="amber"
            />
          </div>
        </div>

        {/* 3. Буцаалт оруулах хэсэг (дэлгүүрээс зарагдаагүй үлдсэн) */}
        {showReturns && (
          <div className="p-4 rounded-3xl bg-rose-50/70 dark:bg-rose-950/20 border-2 border-rose-200 dark:border-rose-900 space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-black text-rose-800 dark:text-rose-300">
                Буцаалт (Зарагдаагүй хуучин талх)
              </span>
              <span className="text-xs font-bold text-rose-600">
                Хасагдах дүн: -{formatTugrik(figures.returnAmount)}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  1-р гурил:
                </label>
                <input
                  type="number"
                  min="0"
                  value={returnedWhite || ''}
                  placeholder="0"
                  onChange={(e) => setReturnedWhite(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-full h-12 text-center text-xl font-black rounded-xl border border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Бүхэл үр:
                </label>
                <input
                  type="number"
                  min="0"
                  value={returnedWhole || ''}
                  placeholder="0"
                  onChange={(e) => setReturnedWhole(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-full h-12 text-center text-xl font-black rounded-xl border border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Багет:
                </label>
                <input
                  type="number"
                  min="0"
                  value={returnedBaguette || ''}
                  placeholder="0"
                  onChange={(e) => setReturnedBaguette(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-full h-12 text-center text-xl font-black rounded-xl border border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-800"
                />
              </div>
            </div>
          </div>
        )}

        {/* 4. Тооцооллын самбар (Шинэ бараа, өмнөх өр, нийт төлөх дүн) */}
        <div className="p-4 rounded-3xl bg-slate-900 text-white space-y-2">
          <div className="flex justify-between text-sm text-slate-300">
            <span>Шинэ хүргэлт:</span>
            <span className="font-bold">{formatTugrik(figures.subtotalAmount)}</span>
          </div>

          {figures.returnAmount > 0 && (
            <div className="flex justify-between text-sm text-rose-400">
              <span>Буцаалт хасалт:</span>
              <span className="font-bold">-{formatTugrik(figures.returnAmount)}</span>
            </div>
          )}

          <div className="flex justify-between text-sm text-slate-300">
            <span>Өнөөдөр төлөх дүн:</span>
            <span className="font-bold">{formatTugrik(figures.todayDue)}</span>
          </div>

          {store.currentBalance > 0 && (
            <div className="flex justify-between text-sm text-amber-300">
              <span>Өмнөх өр:</span>
              <span className="font-bold">+{formatTugrik(store.currentBalance)}</span>
            </div>
          )}

          <div className="pt-2 border-t border-slate-700 flex justify-between items-center">
            <span className="text-base font-extrabold text-white">НИЙТ ТӨЛБӨР:</span>
            <span className="text-2xl font-black text-amber-400">
              {formatTugrik(figures.totalPayable)}
            </span>
          </div>
        </div>

        {/* 5. Төлбөр бүртгэх */}
        <div className="space-y-2.5">
          <label className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider block">
            2. Төлбөр тооцоо
          </label>

          {/* Quick presets for consignment & previous settlement */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handlePayConsignment}
              className={`py-3 px-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 active:scale-95 border-2 transition-all cursor-pointer ${
                paymentMethodLabel === 'Паданаас паданы хооронд' && paidCash === 0 && paidTransfer === 0
                  ? 'bg-amber-500 text-white border-amber-600 shadow-md ring-2 ring-amber-300'
                  : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:border-amber-400'
              }`}
            >
              <PackageCheck className="w-5 h-5 flex-shrink-0" />
              <div className="text-left">
                <div className="leading-tight">Паданаас падан</div>
                <div className="text-[10px] font-medium opacity-80">Шууд төлөхгүй</div>
              </div>
            </button>

            <button
              type="button"
              onClick={handlePayPreviousDebt}
              className={`py-3 px-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 active:scale-95 border-2 transition-all cursor-pointer ${
                paymentMethodLabel === 'Өмнөх тооцоо'
                  ? 'bg-indigo-600 text-white border-indigo-700 shadow-md ring-2 ring-indigo-300'
                  : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:border-indigo-400'
              }`}
            >
              <RotateCcw className="w-5 h-5 flex-shrink-0" />
              <div className="text-left">
                <div className="leading-tight">Өмнөх тооцоо</div>
                <div className="text-[10px] font-medium opacity-80">
                  {store.currentBalance > 0 ? formatTugrik(store.currentBalance) : 'Өргүй'}
                </div>
              </div>
            </button>
          </div>

          {/* Quick presets for immediate payment */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={handlePayTodayCash}
              className={`py-2.5 px-2 rounded-2xl font-bold text-xs flex flex-col items-center gap-1 active:scale-95 border transition-all cursor-pointer ${
                paymentMethodLabel === 'Бэлнээр' && paidCash > 0
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <Banknote className="w-4 h-4 text-emerald-600" />
              <span>Өнөөдөр бэлнээр</span>
            </button>

            <button
              type="button"
              onClick={handlePayTodayTransfer}
              className={`py-2.5 px-2 rounded-2xl font-bold text-xs flex flex-col items-center gap-1 active:scale-95 border transition-all cursor-pointer ${
                paymentMethodLabel === 'Дансаар' && paidTransfer > 0
                  ? 'bg-blue-600 text-white border-blue-700 shadow-sm'
                  : 'bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 border-blue-200 hover:bg-blue-100'
              }`}
            >
              <Landmark className="w-4 h-4 text-blue-600" />
              <span>Өнөөдөр дансаар</span>
            </button>

            <button
              type="button"
              onClick={handlePayAll}
              className={`py-2.5 px-2 rounded-2xl font-bold text-xs flex flex-col items-center gap-1 active:scale-95 border transition-all cursor-pointer ${
                paymentMethodLabel === 'Бүх тооцоо'
                  ? 'bg-violet-600 text-white border-violet-700 shadow-sm'
                  : 'bg-violet-50 dark:bg-violet-950/40 text-violet-900 dark:text-violet-200 border-violet-200 hover:bg-violet-100'
              }`}
            >
              <CheckCheck className="w-4 h-4 text-violet-600" />
              <span>Бүх өрийг хаах</span>
            </button>
          </div>

          {/* Detailed Inputs */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                Бэлэн мөнгө:
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                value={paidCash === 0 ? '' : paidCash}
                placeholder="0₮"
                onChange={(e) => {
                  setPaidCash(Math.max(0, parseInt(e.target.value, 10) || 0));
                  setPaymentMethodLabel('Бэлнээр');
                }}
                className="w-full h-14 px-4 text-xl font-black rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                Дансаар шилжүүлсэн:
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                value={paidTransfer === 0 ? '' : paidTransfer}
                placeholder="0₮"
                onChange={(e) => {
                  setPaidTransfer(Math.max(0, parseInt(e.target.value, 10) || 0));
                  setPaymentMethodLabel('Дансаар');
                }}
                className="w-full h-14 px-4 text-xl font-black rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Resulting Balance Card */}
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
            <span className="text-sm font-bold text-amber-900 dark:text-amber-200">
              Эцсийн үлдэгдэл өр:
            </span>
            <span
              className={`text-xl font-black ${
                figures.newBalance > 0
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {formatTugrik(figures.newBalance)}
            </span>
          </div>

          {/* Privacy Toggle: Show Previous Debt on Printed Receipt */}
          <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
            <div className="flex flex-col pr-2">
              <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                Чек дээр өмнөх өрийг харуулах
              </span>
              <span className="text-[10px] text-slate-500">
                Сонгоогүй үед харилцагчид өмнөх өр харагдахгүй, зөвхөн өнөөдрийн падан хэвлэгдэнэ
              </span>
            </div>
            <input
              type="checkbox"
              checked={showDebtOnReceipt}
              onChange={(e) => setShowDebtOnReceipt(e.target.checked)}
              className="w-5 h-5 accent-amber-600 rounded cursor-pointer flex-shrink-0"
            />
          </label>
        </div>

        {/* Note (optional) */}
        <div>
          <input
            type="text"
            placeholder="Тэмдэглэл (заавал биш)..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full h-11 px-4 text-sm font-medium rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
          />
        </div>
      </div>

      {/* Footer Action Buttons */}
      <div className="mt-6 flex flex-col gap-3">
        {/* ХАДГАЛАХ & ЧЕК ХЭВЛЭХ (Хамгийн чухал ногоон том товч) */}
        <Button
          variant="success"
          size="xl"
          fullWidth
          isLoading={isSubmitting}
          leftIcon={<Printer className="w-7 h-7 stroke-[2.5]" />}
          onClick={() => handleSave(true)}
        >
          ХАДГАЛАХ & ЧЕК ХЭВЛЭХ
        </Button>

        {/* ЗӨВХӨН ХАДГАЛАХ */}
        <Button
          variant="outline"
          size="lg"
          fullWidth
          disabled={isSubmitting}
          leftIcon={<Save className="w-5 h-5 text-slate-500" />}
          onClick={() => handleSave(false)}
        >
          Зөвхөн хадгалах (хэвлэхгүй)
        </Button>
      </div>
    </Modal>
  );
};
