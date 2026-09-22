/**
 * Хөрөнгөний талхны бүтээгдэхүүний төрөл
 */
export interface Product {
  id: string;
  name: string;
  sku: 'white' | 'whole' | 'baguette';
  price: number;
  cost: number;
  sortOrder: number;
}

/**
 * Хүргэлт хийдэг дэлгүүрийн мэдээлэл
 */
export interface Store {
  id: string;
  name: string;
  ownerName?: string | null;
  phone?: string | null;
  address?: string | null;
  currentBalance: number; // > 0 бол авлага (дэлгүүр бидэнд өртэй)
  routeOrder: number;
  lastDeliveryDate?: string | null;
}

/**
 * Тухайн өдрийн ачилт ба хүргэлтийн багц
 */
export interface DailyRun {
  id: string;
  date: string; // YYYY-MM-DD
  status: 'IN_PROGRESS' | 'COMPLETED';
  loadedWhite: number;
  loadedWhole: number;
  loadedBaguette: number;
  deliveries?: DeliveryRecord[];
}

/**
 * Нэг дэлгүүрт хийсэн хүргэлт, буцаалт, төлбөрийн баримт
 */
export interface DeliveryRecord {
  id: string;
  dailyRunId?: string | null;
  storeId: string;
  storeName?: string;
  date: string; // ISO string

  // Хүргэсэн тоо
  deliveredWhite: number;
  deliveredWhole: number;
  deliveredBaguette: number;

  // Буцаалт тоо
  returnedWhite: number;
  returnedWhole: number;
  returnedBaguette: number;

  // Мөнгөн дүн
  prevBalance: number;
  subtotalAmount: number;
  returnAmount: number;
  todayDue: number;
  totalPayable: number;

  paidCash: number;
  paidTransfer: number;
  debtAdded: number;
  newBalance: number;

  note?: string | null;
}

/**
 * Хүргэлт хийх үеийн мобайл картын форм өгөгдөл
 */
export interface DeliveryFormData {
  storeId: string;
  deliveredWhite: number;
  deliveredWhole: number;
  deliveredBaguette: number;
  returnedWhite: number;
  returnedWhole: number;
  returnedBaguette: number;
  paidCash: number;
  paidTransfer: number;
  note?: string;
}

/**
 * Зардлын бичилт (Гурил, Түлш, Уут сав, Тог г.м)
 */
export interface Expense {
  id: string;
  date: string;
  category: 'Гурил' | 'Түлш' | 'Уут сав' | 'Цахилгаан' | 'Бусад';
  amount: number;
  note?: string | null;
}

/**
 * Өдрийн төгсгөлийн тооцоо, хаалтын тайлан
 */
export interface DailyCloseoutSummary {
  date: string;
  status: 'IN_PROGRESS' | 'COMPLETED';
  // Талхны баланс
  loaded: {
    white: number;
    whole: number;
    baguette: number;
    total: number;
  };
  delivered: {
    white: number;
    whole: number;
    baguette: number;
    total: number;
  };
  returned: {
    white: number;
    whole: number;
    baguette: number;
    total: number;
  };
  remainingInCar: {
    white: number;
    whole: number;
    baguette: number;
    total: number;
  };
  // Мөнгөний баланс
  totalRevenue: number;
  totalCashReceived: number;
  totalTransferReceived: number;
  totalNewDebtAdded: number;
  totalReturnsDeducted: number;
  completedStoresCount: number;
}

/**
 * 58mm кассын чект зориулсан бүтэц
 */
export interface ReceiptItem {
  name: string;
  delivered: number;
  returned: number;
  net: number;
  unitPrice: number;
  lineTotal: number;
}

export interface ReceiptData {
  receiptNumber: string;
  storeName: string;
  storeAddress?: string | null;
  dateTime: string;
  items: ReceiptItem[];
  subtotalAmount: number;
  returnAmount: number;
  todayDue: number;
  prevBalance: number;
  totalPayable: number;
  paidCash: number;
  paidTransfer: number;
  newBalance: number;
}
