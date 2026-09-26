import React from 'react';
import { ReceiptData } from '@/types';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { formatTugrik } from '@/utils/currencyFormatter';
import { Bluetooth, Printer, CheckCircle2, AlertCircle } from 'lucide-react';

export interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiptData: ReceiptData | null;
  onBluetoothPrint: (data: ReceiptData) => Promise<boolean>;
  onWebPrint: (data: ReceiptData) => void;
  isPrinting: boolean;
  printError?: string | null;
  isBluetoothSupported: boolean;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  receiptData,
  onBluetoothPrint,
  onWebPrint,
  isPrinting,
  printError,
  isBluetoothSupported,
}) => {
  if (!receiptData) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Хүргэлтийн Чек (58mm)"
      subtitle={`Баримт №${receiptData.receiptNumber}`}
      maxWidth="sm"
    >
      <div className="space-y-4">
        {printError && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{printError}</span>
          </div>
        )}

        {/* 58mm Thermal Receipt Preview Card */}
        <div
          id="printable-receipt"
          className="bg-white text-black p-5 rounded-2xl border-2 border-dashed border-slate-300 shadow-inner font-mono text-xs leading-relaxed select-text"
        >
          {/* Header */}
          <div className="text-center pb-2 border-b border-dashed border-slate-400">
            <h4 className="text-base font-black tracking-wider">НАТУР ШИМ</h4>
            <p className="text-[10px] text-slate-600 font-bold">Хөрөнгөний талхны хүргэлт</p>
          </div>

          {/* Store & Date Info */}
          <div className="py-2 border-b border-dashed border-slate-400 space-y-0.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Огноо:</span>
              <span className="font-bold">{receiptData.dateTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Дэлгүүр:</span>
              <span className="font-bold">{receiptData.storeName}</span>
            </div>
            {receiptData.storeAddress && (
              <div className="text-[10px] text-slate-500 truncate">
                {receiptData.storeAddress}
              </div>
            )}
          </div>

          {/* Items Table */}
          <div className="py-2 border-b border-dashed border-slate-400">
            <div className="flex justify-between font-bold text-[11px] pb-1 border-b border-slate-200">
              <span className="w-1/2">Бараа / Баркод</span>
              <span className="w-1/5 text-center">Өгс/Буц</span>
              <span className="w-[30%] text-right">Дүн</span>
            </div>

            <div className="space-y-2 pt-1.5">
              {receiptData.items.map((item, idx) => (
                <div key={idx} className="border-b border-dotted border-slate-200 pb-1.5 last:border-b-0">
                  <div className="flex justify-between items-start text-[11px]">
                    <div className="w-1/2">
                      <div className="font-bold text-slate-900 leading-snug">{item.name}</div>
                      {item.barcode && (
                        <div className="text-[10px] text-slate-600 font-mono font-bold tracking-wider">
                          {item.barcode}
                        </div>
                      )}
                    </div>
                    <div className="w-1/5 text-center text-slate-700 font-medium">
                      {item.delivered}/{item.returned}
                    </div>
                    <div className="w-[30%] text-right font-black">
                      {formatTugrik(item.lineTotal)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="py-2 border-b border-dashed border-slate-400 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span>Шинэ хүргэлт:</span>
              <span className="font-bold">{formatTugrik(receiptData.subtotalAmount)}</span>
            </div>

            {receiptData.returnAmount > 0 && (
              <div className="flex justify-between text-rose-600">
                <span>Буцаалт хасалт:</span>
                <span>-{formatTugrik(receiptData.returnAmount)}</span>
              </div>
            )}

            <div className="flex justify-between font-black text-xs pt-1 border-t border-slate-300">
              <span>ӨНӨӨДӨР ТӨЛӨХ:</span>
              <span className="text-amber-800">{formatTugrik(receiptData.todayDue)}</span>
            </div>

            {/* Харилцагчийн чек дээр өмнөх өрийг зөвхөн асаасан үед харуулна */}
            {receiptData.showDebtOnReceipt && (
              <>
                <div className="flex justify-between text-slate-600 pt-1">
                  <span>Өмнөх үлдэгдэл өр:</span>
                  <span>+{formatTugrik(receiptData.prevBalance)}</span>
                </div>

                <div className="flex justify-between font-black text-sm pt-1 border-t border-slate-300">
                  <span>НИЙТ ТӨЛБӨР:</span>
                  <span>{formatTugrik(receiptData.totalPayable)}</span>
                </div>
              </>
            )}
          </div>

          {/* Payment breakdown */}
          <div className="py-2 border-b border-dashed border-slate-400 space-y-1 text-[11px]">
            {receiptData.paymentMethodLabel && (
              <div className="flex justify-between font-bold text-slate-800 pb-0.5">
                <span>Төлбөрийн хэлбэр:</span>
                <span className="font-black text-amber-900 bg-amber-100/70 px-1.5 py-0.5 rounded text-[10px]">
                  {receiptData.paymentMethodLabel}
                </span>
              </div>
            )}

            {(receiptData.paidCash > 0 || receiptData.paidTransfer > 0) ? (
              <>
                <div className="font-bold">Төлсөн:</div>
                {receiptData.paidCash > 0 && (
                  <div className="flex justify-between pl-2">
                    <span>- Бэлнээр:</span>
                    <span className="font-bold">{formatTugrik(receiptData.paidCash)}</span>
                  </div>
                )}
                {receiptData.paidTransfer > 0 && (
                  <div className="flex justify-between pl-2">
                    <span>- Дансаар:</span>
                    <span className="font-bold">{formatTugrik(receiptData.paidTransfer)}</span>
                  </div>
                )}
              </>
            ) : (
              <div className="text-[10px] text-slate-600 italic">
                * Тооцоо: Паданаас паданы хооронд тулгалт хийнэ
              </div>
            )}
          </div>

          {/* New Balance only if showDebtOnReceipt */}
          {receiptData.showDebtOnReceipt && (
            <div className="py-2 border-b-2 border-black flex justify-between font-black text-xs">
              <span>ҮЛДЭГДЭЛ ӨР:</span>
              <span className="text-sm">{formatTugrik(receiptData.newBalance)}</span>
            </div>
          )}

          {/* Signature fields */}
          <div className="pt-3 pb-1 space-y-3 text-[10px]">
            <div className="flex justify-between items-center">
              <span>Хүлээлгэн өгсөн:</span>
              <span className="border-b border-black w-28 inline-block"></span>
            </div>
            <div className="flex justify-between items-center">
              <span>Хүлээн авсан:</span>
              <span className="border-b border-black w-28 inline-block"></span>
            </div>
            <div className="text-center text-slate-500 pt-1 text-[9px]">
              Баярлалаа! Өдрийг сайхан өнгөрүүлээрэй.
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          {/* Web Bluetooth Button */}
          {isBluetoothSupported && (
            <Button
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isPrinting}
              leftIcon={<Bluetooth className="w-5 h-5 text-white" />}
              onClick={() => onBluetoothPrint(receiptData)}
            >
              Bluetooth принтерээр хэвлэх
            </Button>
          )}

          {/* Browser / AirPrint Button */}
          <Button
            variant="outline"
            size="lg"
            fullWidth
            leftIcon={<Printer className="w-5 h-5 text-slate-700 dark:text-slate-300" />}
            onClick={() => onWebPrint(receiptData)}
          >
            Хэвлэх цонх нээх (AirPrint / 58mm)
          </Button>

          <Button
            variant="ghost"
            size="md"
            fullWidth
            onClick={onClose}
          >
            Хаах
          </Button>
        </div>
      </div>
    </Modal>
  );
};
