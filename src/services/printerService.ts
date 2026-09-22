import { ReceiptData } from '@/types';
import { generateEscPosBuffer, generateReceiptPlainText } from '@/utils/escposGenerator';

// Known Bluetooth printer GATT service UUIDs (Xprinter, Rongta, Gprinter, generic 58mm BLE)
const PRINTER_SERVICE_UUIDS = [
  '000018f0-0000-1000-8000-00805f9b34fb',
  'e7810a71-73ae-499d-8c15-faa9aef0c3f2',
  '49535343-fe7d-4ae5-8fa9-9fafd205e455',
  '0000ffe0-0000-1000-8000-00805f9b34fb',
  '0000ff00-0000-1000-8000-00805f9b34fb',
];

interface BluetoothDeviceExtended {
  gatt?: {
    connect: () => Promise<BluetoothRemoteGATTServerExtended>;
    connected?: boolean;
    disconnect?: () => void;
  };
}

interface BluetoothRemoteGATTServerExtended {
  getPrimaryServices: () => Promise<BluetoothRemoteGATTServiceExtended[]>;
  connected?: boolean;
}

interface BluetoothRemoteGATTServiceExtended {
  getCharacteristics: () => Promise<BluetoothRemoteGATTCharacteristicExtended[]>;
}

interface BluetoothRemoteGATTCharacteristicExtended {
  properties: {
    write?: boolean;
    writeWithoutResponse?: boolean;
  };
  writeValue: (value: BufferSource) => Promise<void>;
  writeValueWithoutResponse?: (value: BufferSource) => Promise<void>;
}

export const printerService = {
  /**
   * Web Bluetooth API дэмжигдсэн эсэхийг шалгах (Chrome, Edge, Bluefy дэмждэг)
   */
  isBluetoothSupported(): boolean {
    return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
  },

  /**
   * Web Bluetooth-ээр 58mm принтер рүү ESC/POS комманд илгээн хэвлэх
   */
  async printViaBluetooth(receiptData: ReceiptData): Promise<{ success: boolean; message: string }> {
    if (!this.isBluetoothSupported()) {
      throw new Error('Таны хөтөч Web Bluetooth дэмжихгүй байна. Chrome эсвэл Bluefy ашиглана уу.');
    }

    try {
      // 1. Ойролцоох принтер төхөөрөмж сонгох цонх гаргах
      // @ts-expect-error Web Bluetooth API type definition
      const device: BluetoothDeviceExtended = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: PRINTER_SERVICE_UUIDS,
      });

      if (!device || !device.gatt) {
        throw new Error('Принтертэй холбогдож чадсангүй.');
      }

      // 2. GATT серверт холбогдох
      const server = await device.gatt.connect();

      // 3. Бичих боломжтой characteristic хайх
      let writeCharacteristic: BluetoothRemoteGATTCharacteristicExtended | null = null;
      const services = await server.getPrimaryServices();

      for (const service of services) {
        try {
          const characteristics = await service.getCharacteristics();
          for (const char of characteristics) {
            if (char.properties.write || char.properties.writeWithoutResponse) {
              writeCharacteristic = char;
              break;
            }
          }
        } catch {
          // Дараагийн service-г турших
        }
        if (writeCharacteristic) break;
      }

      if (!writeCharacteristic) {
        throw new Error('Принтерийн бичих суваг олдсонгүй.');
      }

      // 4. Текстийг ESC/POS багц болгож илгээх
      const plainText = generateReceiptPlainText(receiptData);
      const dataBuffer = generateEscPosBuffer(plainText);

      // Bluetooth MTU хэмжээ 20-100 байт тул 64 байтаар тасалж илгээнэ
      const CHUNK_SIZE = 64;
      for (let i = 0; i < dataBuffer.length; i += CHUNK_SIZE) {
        const chunk = dataBuffer.slice(i, i + CHUNK_SIZE);
        if (writeCharacteristic.writeValueWithoutResponse) {
          await writeCharacteristic.writeValueWithoutResponse(chunk);
        } else {
          await writeCharacteristic.writeValue(chunk);
        }
        // Жижиг буфер дүүрэхээс сэргийлж 20ms хүлээнэ
        await new Promise((resolve) => setTimeout(resolve, 20));
      }

      return {
        success: true,
        message: 'Чек амжилттай хэвлэгдлээ!',
      };
    } catch (err: unknown) {
      const error = err as Error;
      if (error.name === 'NotFoundError') {
        return { success: false, message: 'Принтер сонгосонгүй цуцлагдлаа.' };
      }
      throw error;
    }
  },

  /**
   * Стандарт хөтчийн хэвлэх цонх дуудах (58mm Thermal Print CSS)
   */
  printViaBrowser(): void {
    if (typeof window !== 'undefined') {
      window.print();
    }
  },
};
