import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/services/db';
import { getTodayDateString } from '@/utils/dateUtils';
import { calculateDeliveryFigures } from '@/utils/deliveryMath';
import { Product } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get('storeId');

    if (!storeId) {
      return NextResponse.json({ error: 'Store ID required' }, { status: 400 });
    }

    const records = await prisma.deliveryRecord.findMany({
      where: { storeId },
      orderBy: { date: 'desc' },
      take: 20,
      include: {
        store: { select: { name: true } },
      },
    });

    const formatted = records.map((r) => ({
      ...r,
      storeName: r.store.name,
      date: r.date.toISOString(),
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Error fetching store deliveries:', error);
    return NextResponse.json({ error: 'Failed to fetch deliveries' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      storeId,
      deliveredWhite = 0,
      deliveredWhole = 0,
      deliveredBaguette = 0,
      returnedWhite = 0,
      returnedWhole = 0,
      returnedBaguette = 0,
      paidCash = 0,
      paidTransfer = 0,
      note,
    } = body;

    if (!storeId) {
      return NextResponse.json({ error: 'Дэлгүүр сонгогдоогүй байна' }, { status: 400 });
    }

    // 1. Дэлгүүрийн одоогийн өр үлдэгдлийг татах
    const store = await prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      return NextResponse.json({ error: 'Дэлгүүр олдсонгүй' }, { status: 404 });
    }

    // 2. Бүтээгдэхүүний үнийг баазаас татах
    const dbProducts = await prisma.product.findMany();
    const products: Product[] = dbProducts.map((p) => ({
      id: p.id,
      name: p.name,
      sku: p.sku as 'white' | 'whole' | 'baguette',
      price: p.price,
      cost: p.cost,
      sortOrder: p.sortOrder,
    }));

    // 3. Тооцоолол хийх (deliveryMath цэвэр функцээр)
    const figures = calculateDeliveryFigures({
      deliveredWhite: Number(deliveredWhite) || 0,
      deliveredWhole: Number(deliveredWhole) || 0,
      deliveredBaguette: Number(deliveredBaguette) || 0,
      returnedWhite: Number(returnedWhite) || 0,
      returnedWhole: Number(returnedWhole) || 0,
      returnedBaguette: Number(returnedBaguette) || 0,
      prevBalance: store.currentBalance,
      paidCash: Number(paidCash) || 0,
      paidTransfer: Number(paidTransfer) || 0,
      products,
    });

    const todayDate = getTodayDateString();

    // 4. Гүйлгээг Transaction дотор найдвартай гүйцэтгэх
    const result = await prisma.$transaction(async (tx) => {
      // Тухайн өдрийн DailyRun олох эсвэл үүсгэх
      let dailyRun = await tx.dailyRun.findFirst({
        where: { date: todayDate },
      });

      if (!dailyRun) {
        dailyRun = await tx.dailyRun.create({
          data: {
            date: todayDate,
            status: 'IN_PROGRESS',
            loadedWhite: 0,
            loadedWhole: 0,
            loadedBaguette: 0,
          },
        });
      }

      // Хүргэлтийн баримт үүсгэх
      const record = await tx.deliveryRecord.create({
        data: {
          dailyRunId: dailyRun.id,
          storeId: store.id,
          deliveredWhite: Number(deliveredWhite) || 0,
          deliveredWhole: Number(deliveredWhole) || 0,
          deliveredBaguette: Number(deliveredBaguette) || 0,
          returnedWhite: Number(returnedWhite) || 0,
          returnedWhole: Number(returnedWhole) || 0,
          returnedBaguette: Number(returnedBaguette) || 0,
          prevBalance: store.currentBalance,
          subtotalAmount: figures.subtotalAmount,
          returnAmount: figures.returnAmount,
          todayDue: figures.todayDue,
          totalPayable: figures.totalPayable,
          paidCash: Number(paidCash) || 0,
          paidTransfer: Number(paidTransfer) || 0,
          debtAdded: figures.debtAdded,
          newBalance: figures.newBalance,
          note: note ? String(note).trim() : null,
        },
      });

      // Дэлгүүрийн одоогийн өрийг шинэчлэх
      const updatedStore = await tx.store.update({
        where: { id: store.id },
        data: {
          currentBalance: figures.newBalance,
        },
      });

      // Машинд үлдсэн талхны тоог дахин бодох
      const allTodayDeliveries = await tx.deliveryRecord.findMany({
        where: { dailyRunId: dailyRun.id },
      });

      const totalDelivered = allTodayDeliveries.reduce(
        (acc, d) => ({
          white: acc.white + d.deliveredWhite,
          whole: acc.whole + d.deliveredWhole,
          baguette: acc.baguette + d.deliveredBaguette,
        }),
        { white: 0, whole: 0, baguette: 0 }
      );

      const remainingInCar = {
        white: Math.max(0, dailyRun.loadedWhite - totalDelivered.white),
        whole: Math.max(0, dailyRun.loadedWhole - totalDelivered.whole),
        baguette: Math.max(0, dailyRun.loadedBaguette - totalDelivered.baguette),
      };

      return {
        record: {
          ...record,
          storeName: updatedStore.name,
          date: record.date.toISOString(),
        },
        updatedBalance: updatedStore.currentBalance,
        remainingInCar,
      };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error saving delivery record:', error);
    return NextResponse.json({ error: 'Хүргэлт хадгалахад алдаа гарлаа' }, { status: 500 });
  }
}
