import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/services/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      storeId,
      selectedDeliveryIds = [],
      settleInitialBalance = false,
      paymentMethod = 'TRANSFER',
      note = '',
      customAmount,
    } = body;

    if (!storeId) {
      return NextResponse.json({ error: 'Store ID required' }, { status: 400 });
    }

    const store = await prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    let settledFromDeliveries = 0;
    const updatedIds: string[] = [];

    // 1. Сонгосон хүргэлтүүдийн төлөгдөөгүй үлдэгдлийг төлснөөр бүртгэх
    if (Array.isArray(selectedDeliveryIds) && selectedDeliveryIds.length > 0) {
      const deliveries = await prisma.deliveryRecord.findMany({
        where: {
          id: { in: selectedDeliveryIds },
          storeId,
        },
      });

      for (const record of deliveries) {
        const alreadyPaid = (record.paidCash || 0) + (record.paidTransfer || 0);
        const unpaid = Math.max(0, (record.todayDue || 0) - alreadyPaid);

        if (unpaid > 0) {
          const updateData: Record<string, unknown> = {};

          if (paymentMethod === 'CASH') {
            updateData.paidCash = (record.paidCash || 0) + unpaid;
          } else {
            updateData.paidTransfer = (record.paidTransfer || 0) + unpaid;
          }

          updateData.debtAdded = 0;
          const todayStr = new Date().toLocaleDateString('mn-MN');
          const noteText = [
            record.note,
            note ? `Тайлбар: ${note}` : null,
            `[Тооцоо хийгдсэн: ${todayStr} (${paymentMethod === 'CASH' ? 'Бэлнээр' : 'Дансаар'} +${unpaid}₮)]`,
          ]
            .filter(Boolean)
            .join(' | ');

          updateData.note = noteText;

          await prisma.deliveryRecord.update({
            where: { id: record.id },
            data: updateData,
          });

          settledFromDeliveries += unpaid;
          updatedIds.push(record.id);
        }
      }
    }

    // 2. Хуучин / хүргэлтийн бичилтгүй эхний үлдэгдэл өр
    let settledLegacy = 0;
    if (settleInitialBalance) {
      const allDeliveries = await prisma.deliveryRecord.findMany({
        where: { storeId },
      });
      const totalAllUnpaid = allDeliveries.reduce((sum, d) => {
        const paid = (d.paidCash || 0) + (d.paidTransfer || 0);
        return sum + Math.max(0, (d.todayDue || 0) - paid);
      }, 0);

      settledLegacy = Math.max(0, store.currentBalance - totalAllUnpaid);
    }

    let totalSettled = settledFromDeliveries + settledLegacy;

    // Хэрэв гараар тодорхой дүн заасан бол
    if (typeof customAmount === 'number' && customAmount > 0) {
      totalSettled = customAmount;
    }

    // Дэлгүүрийн эцсийн үлдэгдлийг шинэчлэх
    const newBalance = Math.max(0, store.currentBalance - totalSettled);

    const updatedStore = await prisma.store.update({
      where: { id: storeId },
      data: {
        currentBalance: newBalance,
      },
    });

    return NextResponse.json({
      success: true,
      updatedBalance: updatedStore.currentBalance,
      settledAmount: totalSettled,
      updatedDeliveryIds: updatedIds,
    });
  } catch (error) {
    console.error('Error settling store debt:', error);
    return NextResponse.json(
      { error: 'Тооцоо хаахад алдаа гарлаа: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
