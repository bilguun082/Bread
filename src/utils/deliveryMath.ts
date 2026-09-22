import { Product } from '@/types';

export interface CalculationInput {
  deliveredWhite: number;
  deliveredWhole: number;
  deliveredBaguette: number;
  returnedWhite: number;
  returnedWhole: number;
  returnedBaguette: number;
  prevBalance: number;
  paidCash: number;
  paidTransfer: number;
  products: Product[];
}

export interface CalculationResult {
  subtotalAmount: number; // Хүргэсэн барааны нийт дүн
  returnAmount: number;   // Буцаасан барааны хасагдах дүн
  todayDue: number;       // Өнөөдөр төлөх дүн (subtotal - return)
  totalPayable: number;   // Өмнөх өртэй нийлээд нийт төлөх дүн
  totalPaid: number;      // Өнөөдөр төлсөн нийт мөнгө (Бэлэн + Данс)
  debtAdded: number;      // Өнөөдрийн төлөөгүй зээлд үлдсэн хэсэг
  newBalance: number;     // Эцсийн үлдэгдэл өр
}

/**
 * Хүргэлтийн тооцоог хийх үндсэн цэвэр функц (Pure function)
 * UI компонентоос тусдаа тооцоологдох тул алдаагүй, шалгахад найдвартай.
 */
export function calculateDeliveryFigures(input: CalculationInput): CalculationResult {
  const whitePrice = input.products.find(p => p.sku === 'white')?.price || 4500;
  const wholePrice = input.products.find(p => p.sku === 'whole')?.price || 5000;
  const baguettePrice = input.products.find(p => p.sku === 'baguette')?.price || 4000;

  // Өнөөдөр шинээр өгсөн талхны дүн
  const subtotalAmount =
    (Math.max(0, input.deliveredWhite) * whitePrice) +
    (Math.max(0, input.deliveredWhole) * wholePrice) +
    (Math.max(0, input.deliveredBaguette) * baguettePrice);

  // Буцаалтын дүн (дэлгүүрээс зарагдаагүй үлдсэн өчигдрийн талх)
  const returnAmount =
    (Math.max(0, input.returnedWhite) * whitePrice) +
    (Math.max(0, input.returnedWhole) * wholePrice) +
    (Math.max(0, input.returnedBaguette) * baguettePrice);

  // Өнөөдөр дэлгүүрийн төлөх цэвэр дүн (хэрэв буцаалт нь илүү гарсан бол 0-ээс доош орж баланс хасагдаж болно)
  const todayDue = subtotalAmount - returnAmount;

  // Өмнөх өртэй нийлбэр (хэрэв өмнө нь өртэй байсан бол түүнтэй нэмэгдэнэ)
  const totalPayable = input.prevBalance + todayDue;

  // Төлсөн мөнгө
  const totalPaid = Math.max(0, input.paidCash) + Math.max(0, input.paidTransfer);

  // Шинэ үлдэгдэл өр
  // Жишээ: Нийт төлөх 100,000₮ байгаад 40,000₮ төлбөл шинэ баланс 60,000₮ өртэй үлдэнэ.
  const newBalance = totalPayable - totalPaid;

  // Өнөөдрийн хүргэлтээс өрөнд үлдсэн хэсэг (тайланд ашиглахад зориулав)
  const debtAdded = Math.max(0, todayDue - totalPaid);

  return {
    subtotalAmount,
    returnAmount,
    todayDue,
    totalPayable,
    totalPaid,
    debtAdded,
    newBalance,
  };
}
