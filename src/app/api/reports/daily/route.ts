import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/services/db';
import { getTodayDateString } from '@/utils/dateUtils';
import { DailyCloseoutSummary } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date') || getTodayDateString();

    const dailyRun = await prisma.dailyRun.findFirst({
      where: { date },
      include: {
        deliveries: {
          include: {
            store: { select: { name: true } },
          },
        },
      },
    });

    if (!dailyRun) {
      const emptySummary: DailyCloseoutSummary = {
        date,
        status: 'IN_PROGRESS',
        loaded: { white: 0, whole: 0, baguette: 0, total: 0 },
        delivered: { white: 0, whole: 0, baguette: 0, total: 0 },
        returned: { white: 0, whole: 0, baguette: 0, total: 0 },
        remainingInCar: { white: 0, whole: 0, baguette: 0, total: 0 },
        totalRevenue: 0,
        totalCashReceived: 0,
        totalTransferReceived: 0,
        totalNewDebtAdded: 0,
        totalReturnsDeducted: 0,
        completedStoresCount: 0,
      };
      return NextResponse.json(emptySummary);
    }

    // Талхны нийлбэрүүд
    const delivered = dailyRun.deliveries.reduce(
      (acc, d) => ({
        white: acc.white + d.deliveredWhite,
        whole: acc.whole + d.deliveredWhole,
        baguette: acc.baguette + d.deliveredBaguette,
      }),
      { white: 0, whole: 0, baguette: 0 }
    );

    const returned = dailyRun.deliveries.reduce(
      (acc, d) => ({
        white: acc.white + d.returnedWhite,
        whole: acc.whole + d.returnedWhole,
        baguette: acc.baguette + d.returnedBaguette,
      }),
      { white: 0, whole: 0, baguette: 0 }
    );

    const loadedTotal = dailyRun.loadedWhite + dailyRun.loadedWhole + dailyRun.loadedBaguette;
    const deliveredTotal = delivered.white + delivered.whole + delivered.baguette;
    const returnedTotal = returned.white + returned.whole + returned.baguette;

    // Мөнгөний тооцоолол
    const totalRevenue = dailyRun.deliveries.reduce((sum, d) => sum + d.subtotalAmount, 0);
    const totalReturnsDeducted = dailyRun.deliveries.reduce((sum, d) => sum + d.returnAmount, 0);
    const totalCashReceived = dailyRun.deliveries.reduce((sum, d) => sum + d.paidCash, 0);
    const totalTransferReceived = dailyRun.deliveries.reduce((sum, d) => sum + d.paidTransfer, 0);
    const totalNewDebtAdded = dailyRun.deliveries.reduce((sum, d) => sum + d.debtAdded, 0);

    const summary: DailyCloseoutSummary = {
      date,
      status: dailyRun.status as 'IN_PROGRESS' | 'COMPLETED',
      loaded: {
        white: dailyRun.loadedWhite,
        whole: dailyRun.loadedWhole,
        baguette: dailyRun.loadedBaguette,
        total: loadedTotal,
      },
      delivered: {
        white: delivered.white,
        whole: delivered.whole,
        baguette: delivered.baguette,
        total: deliveredTotal,
      },
      returned: {
        white: returned.white,
        whole: returned.whole,
        baguette: returned.baguette,
        total: returnedTotal,
      },
      remainingInCar: {
        white: Math.max(0, dailyRun.loadedWhite - delivered.white),
        whole: Math.max(0, dailyRun.loadedWhole - delivered.whole),
        baguette: Math.max(0, dailyRun.loadedBaguette - delivered.baguette),
        total: Math.max(0, loadedTotal - deliveredTotal),
      },
      totalRevenue,
      totalCashReceived,
      totalTransferReceived,
      totalNewDebtAdded,
      totalReturnsDeducted,
      completedStoresCount: dailyRun.deliveries.length,
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error getting daily closeout summary:', error);
    return NextResponse.json({ error: 'Failed to get summary' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const date = body.date || getTodayDateString();

    const dailyRun = await prisma.dailyRun.findFirst({
      where: { date },
    });

    if (!dailyRun) {
      return NextResponse.json({ error: 'Тухайн өдрийн хүргэлт бүртгэгдээгүй байна' }, { status: 404 });
    }

    const updated = await prisma.dailyRun.update({
      where: { id: dailyRun.id },
      data: {
        status: dailyRun.status === 'COMPLETED' ? 'IN_PROGRESS' : 'COMPLETED',
      },
    });

    return NextResponse.json({ success: true, status: updated.status });
  } catch (error) {
    console.error('Error closing daily run:', error);
    return NextResponse.json({ error: 'Failed to close daily run' }, { status: 500 });
  }
}
