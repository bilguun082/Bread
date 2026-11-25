import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/services/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const today = new Date();
    const defaultMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    const month = searchParams.get('month') || defaultMonth; // YYYY-MM

    // Бүтээгдэхүүний өртөг татах
    const products = await prisma.product.findMany();
    const costMap: Record<string, number> = {};
    for (const p of products) {
      costMap[p.sku] = p.cost;
    }

    // Огнооны хязгаарыг найдвартай тооцоолох (UTC сарын эхлэл ба дараа сарын эхлэл)
    const [yearStr, monthStr] = month.split('-');
    const year = parseInt(yearStr, 10);
    const m = parseInt(monthStr, 10);
    const startDate = new Date(Date.UTC(year, m - 1, 1, 0, 0, 0, 0));
    const nextMonthYear = m === 12 ? year + 1 : year;
    const nextMonth = m === 12 ? 1 : m + 1;
    const endDate = new Date(Date.UTC(nextMonthYear, nextMonth - 1, 1, 0, 0, 0, 0));

    // Тухайн сарын бүх хүргэлтүүдийг татах
    const deliveries = await prisma.deliveryRecord.findMany({
      where: {
        OR: [
          {
            date: {
              gte: startDate,
              lt: endDate,
            },
          },
          {
            dailyRun: {
              date: {
                startsWith: month,
              },
            },
          },
        ],
      },
      include: {
        store: { select: { id: true, name: true } },
        dailyRun: { select: { date: true } },
      },
      orderBy: { date: 'asc' },
    });

    let totalRevenue = 0;
    let totalCostOfGoods = 0;
    let totalBreadDelivered = 0;
    let deliveredWhiteTotal = 0;
    let deliveredWholeTotal = 0;
    let deliveredBaguetteTotal = 0;
    let returnedTotal = 0;
    let totalCashReceived = 0;
    let totalTransferReceived = 0;
    let totalDebtAdded = 0;

    // Өдрөөр нь бүлэглэх
    const dailyMap: Record<
      string,
      {
        date: string;
        breadDelivered: number;
        revenue: number;
        cashReceived: number;
        transferReceived: number;
        debtAdded: number;
      }
    > = {};

    // Дэлгүүрээр нь бүлэглэх
    const storeMap: Record<
      string,
      {
        storeId: string;
        storeName: string;
        breadDelivered: number;
        totalAmount: number;
        paidAmount: number;
      }
    > = {};

    for (const d of deliveries) {
      const dRevenue = d.todayDue || 0;
      totalRevenue += dRevenue;

      const whiteCost = (d.deliveredWhite || 0) * (costMap['white'] || 2200);
      const wholeCost = (d.deliveredWhole || 0) * (costMap['whole'] || 2500);
      const bagCost = (d.deliveredBaguette || 0) * (costMap['baguette'] || 1800);
      totalCostOfGoods += whiteCost + wholeCost + bagCost;

      const breadThisDelivery =
        (d.deliveredWhite || 0) + (d.deliveredWhole || 0) + (d.deliveredBaguette || 0);
      totalBreadDelivered += breadThisDelivery;
      deliveredWhiteTotal += d.deliveredWhite || 0;
      deliveredWholeTotal += d.deliveredWhole || 0;
      deliveredBaguetteTotal += d.deliveredBaguette || 0;
      returnedTotal +=
        (d.returnedWhite || 0) + (d.returnedWhole || 0) + (d.returnedBaguette || 0);

      const dCash = d.paidCash || 0;
      const dTransfer = d.paidTransfer || 0;
      const dDebt = d.debtAdded || 0;
      totalCashReceived += dCash;
      totalTransferReceived += dTransfer;
      totalDebtAdded += dDebt;

      // Өдрөөр бүлэглэх
      const dayDateStr =
        d.dailyRun?.date ||
        (d.date instanceof Date ? d.date.toISOString().split('T')[0] : String(d.date).split('T')[0]);

      if (!dailyMap[dayDateStr]) {
        dailyMap[dayDateStr] = {
          date: dayDateStr,
          breadDelivered: 0,
          revenue: 0,
          cashReceived: 0,
          transferReceived: 0,
          debtAdded: 0,
        };
      }
      dailyMap[dayDateStr].breadDelivered += breadThisDelivery;
      dailyMap[dayDateStr].revenue += dRevenue;
      dailyMap[dayDateStr].cashReceived += dCash;
      dailyMap[dayDateStr].transferReceived += dTransfer;
      dailyMap[dayDateStr].debtAdded += dDebt;

      // Дэлгүүрээр бүлэглэх
      const sId = d.storeId;
      const sName = d.store?.name || 'Тодорхойгүй дэлгүүр';
      if (!storeMap[sId]) {
        storeMap[sId] = {
          storeId: sId,
          storeName: sName,
          breadDelivered: 0,
          totalAmount: 0,
          paidAmount: 0,
        };
      }
      storeMap[sId].breadDelivered += breadThisDelivery;
      storeMap[sId].totalAmount += dRevenue;
      storeMap[sId].paidAmount += dCash + dTransfer;
    }

    const grossProfit = totalRevenue - totalCostOfGoods;

    // Тухайн сарын зардлууд
    const expenses = await prisma.expense.findMany({
      where: {
        date: {
          startsWith: month,
        },
      },
      orderBy: { date: 'desc' },
    });

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = grossProfit - totalExpenses;
    const totalCollected = totalCashReceived + totalTransferReceived;

    const dailyDeliveries = Object.values(dailyMap).sort((a, b) =>
      b.date.localeCompare(a.date)
    );

    const storeBreakdown = Object.values(storeMap).sort(
      (a, b) => b.totalAmount - a.totalAmount
    );

    return NextResponse.json({
      month,
      totalRevenue,
      totalCostOfGoods,
      grossProfit,
      totalExpenses,
      netProfit,
      totalBreadDelivered,
      breadBreakdown: {
        white: deliveredWhiteTotal,
        whole: deliveredWholeTotal,
        baguette: deliveredBaguetteTotal,
        returned: returnedTotal,
      },
      totalCashReceived,
      totalTransferReceived,
      totalCollected,
      totalDebtAdded,
      dailyDeliveries,
      storeBreakdown,
      expenses,
    });
  } catch (error) {
    console.error('Error fetching monthly P&L:', error);
    return NextResponse.json({ error: 'Failed to fetch monthly P&L' }, { status: 500 });
  }
}
