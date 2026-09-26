import { useState } from 'react';
import { ReceiptData, DeliveryRecord, Product } from '@/types';
import { printerService } from '@/services/printerService';
import { formatReadableDateTime } from '@/utils/dateUtils';

export function useReceiptPrinter() {
  const [isPrinting, setIsPrinting] = useState<boolean>(false);
  const [printError, setPrintError] = useState<string | null>(null);
  const [lastPrintedData, setLastPrintedData] = useState<ReceiptData | null>(null);

  const isBluetoothSupported = printerService.isBluetoothSupported();

  /**
   * Хүргэлтийн баримтаас 58mm кассын чекийн өгөгдөл угсрах
   */
  const buildReceiptData = (
    record: DeliveryRecord,
    storeAddress?: string | null,
    products?: Product[],
    options?: {
      showDebtOnReceipt?: boolean;
      paymentMethodLabel?: string;
    }
  ): ReceiptData => {
    const whiteProduct = products?.find((p) => p.sku === 'white');
    const wholeProduct = products?.find((p) => p.sku === 'whole');
    const baguetteProduct = products?.find((p) => p.sku === 'baguette');

    const whitePrice = whiteProduct?.price || 4500;
    const wholePrice = wholeProduct?.price || 5000;
    const baguettePrice = baguetteProduct?.price || 4000;

    const whiteBarcode = whiteProduct?.barcode || '8658000545216';
    const wholeBarcode = wholeProduct?.barcode || '8658000545230';
    const baguetteBarcode = baguetteProduct?.barcode || '8658000545247';

    const items = [
      {
        name: whiteProduct?.name || '1-р гурил талх',
        barcode: whiteBarcode,
        delivered: record.deliveredWhite,
        returned: record.returnedWhite,
        net: record.deliveredWhite - record.returnedWhite,
        unitPrice: whitePrice,
        lineTotal: (record.deliveredWhite - record.returnedWhite) * whitePrice,
      },
      {
        name: wholeProduct?.name || 'Бүхэл үр талх',
        barcode: wholeBarcode,
        delivered: record.deliveredWhole,
        returned: record.returnedWhole,
        net: record.deliveredWhole - record.returnedWhole,
        unitPrice: wholePrice,
        lineTotal: (record.deliveredWhole - record.returnedWhole) * wholePrice,
      },
      {
        name: baguetteProduct?.name || 'Багет',
        barcode: baguetteBarcode,
        delivered: record.deliveredBaguette,
        returned: record.returnedBaguette,
        net: record.deliveredBaguette - record.returnedBaguette,
        unitPrice: baguettePrice,
        lineTotal: (record.deliveredBaguette - record.returnedBaguette) * baguettePrice,
      },
    ].filter((item) => item.delivered > 0 || item.returned > 0);

    return {
      receiptNumber: record.id.slice(-6).toUpperCase(),
      storeName: record.storeName || 'Delguur',
      storeAddress: storeAddress || null,
      dateTime: formatReadableDateTime(record.date),
      items,
      subtotalAmount: record.subtotalAmount,
      returnAmount: record.returnAmount,
      todayDue: record.todayDue,
      prevBalance: record.prevBalance,
      totalPayable: record.totalPayable,
      paidCash: record.paidCash,
      paidTransfer: record.paidTransfer,
      newBalance: record.newBalance,
      showDebtOnReceipt: options?.showDebtOnReceipt ?? false,
      paymentMethodLabel: options?.paymentMethodLabel,
    };
  };

  /**
   * Web Bluetooth-ээр 58mm принтер рүү илгээх
   */
  const printBluetooth = async (receiptData: ReceiptData): Promise<boolean> => {
    setIsPrinting(true);
    setPrintError(null);
    try {
      const result = await printerService.printViaBluetooth(receiptData);
      setLastPrintedData(receiptData);
      return result.success;
    } catch (err: unknown) {
      const msg = (err as Error).message || 'Принтерт холбогдоход алдаа гарлаа';
      setPrintError(msg);
      return false;
    } finally {
      setIsPrinting(false);
    }
  };

  /**
   * Хөтчийн хэвлэх цонх дуудах (AirPrint / Утасны стандарт хэвлэгч)
   */
  const printWeb = (receiptData: ReceiptData) => {
    setLastPrintedData(receiptData);
    printerService.printViaBrowser();
  };

  return {
    isPrinting,
    printError,
    lastPrintedData,
    setLastPrintedData,
    isBluetoothSupported,
    buildReceiptData,
    printBluetooth,
    printWeb,
  };
}
