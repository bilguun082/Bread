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

    // Тухайн сарын бүх хүргэлтүүдийг татах
    // SQLite дээр date нь ISO string хадгалагддаг
    const deliveries = await prisma.deliveryRecord.findMany({
      where: {
        date: {
          gte: new Date(`${month}-01T00:00:00.000Z`),
          lt: new Date(`${month}-31T23:59:59.999Z`),
        },
      },
    });

    let totalRevenue = 0;
    let totalCostOfGoods = 0;
    let totalBreadDelivered = 0;

    for (const d of deliveries) {
      totalRevenue += d.todayDue; // Буцаалт хасагдсан цэвэр борлуулалт
      const whiteCost = d.deliveredWhite * (costMap['white'] || 2200);
      const wholeCost = d.deliveredWhole * (costMap['whole'] || 2500);
      const bagCost = d.deliveredBaguette * (costMap['baguette'] || 1800);
      totalCostOfGoods += whiteCost + wholeCost + bagCost;
      totalBreadDelivered += d.deliveredWhite + d.deliveredWhole + d.deliveredBaguette;
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

    return NextResponse.json({
      month,
      totalRevenue,
      totalCostOfGoods,
      grossProfit,
      totalExpenses,
      netProfit,
      totalBreadDelivered,
      expenses,
    });
  } catch (error) {
    console.error('Error fetching monthly P&L:', error);
    return NextResponse.json({ error: 'Failed to fetch monthly P&L' }, { status: 500 });
  }
}
