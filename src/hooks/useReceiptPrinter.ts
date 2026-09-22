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
    products?: Product[]
  ): ReceiptData => {
    const whitePrice = products?.find((p) => p.sku === 'white')?.price || 4500;
    const wholePrice = products?.find((p) => p.sku === 'whole')?.price || 5000;
    const baguettePrice = products?.find((p) => p.sku === 'baguette')?.price || 4000;

    const items = [
      {
        name: '1-r guril',
        delivered: record.deliveredWhite,
        returned: record.returnedWhite,
        net: record.deliveredWhite - record.returnedWhite,
        unitPrice: whitePrice,
        lineTotal: (record.deliveredWhite - record.returnedWhite) * whitePrice,
      },
      {
        name: 'Bukhel ur',
        delivered: record.deliveredWhole,
        returned: record.returnedWhole,
        net: record.deliveredWhole - record.returnedWhole,
        unitPrice: wholePrice,
        lineTotal: (record.deliveredWhole - record.returnedWhole) * wholePrice,
      },
      {
        name: 'Baguette',
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
