import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/services/db';
import { getTodayDateString } from '@/utils/dateUtils';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date') || getTodayDateString();

    let dailyRun = await prisma.dailyRun.findFirst({
      where: { date },
      include: {
        deliveries: {
          include: {
            store: {
              select: { name: true },
            },
          },
          orderBy: { date: 'desc' },
        },
      },
    });

    // Хэрэв тухайн өдрийн бичилт байхгүй бол шинээр үүсгэнэ
    if (!dailyRun) {
      dailyRun = await prisma.dailyRun.create({
        data: {
          date,
          status: 'IN_PROGRESS',
          loadedWhite: 0,
          loadedWhole: 0,
          loadedBaguette: 0,
        },
        include: {
          deliveries: {
            include: {
              store: {
                select: { name: true },
              },
            },
            orderBy: { date: 'desc' },
          },
        },
      });
    }

    // Машинд үлдсэн талхны тоог бодох: Ачсан - Хүргэсэн
    const totalDelivered = dailyRun.deliveries.reduce(
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

    return NextResponse.json({
      dailyRun: {
        ...dailyRun,
        deliveries: dailyRun.deliveries.map((d) => ({
          ...d,
          storeName: d.store.name,
          date: d.date.toISOString(),
        })),
      },
      remainingInCar,
    });
  } catch (error) {
    console.error('Error fetching daily run:', error);
    return NextResponse.json({ error: 'Failed to fetch daily run' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const date = body.date || getTodayDateString();
    const loadedWhite = Math.max(0, Number(body.loadedWhite) || 0);
    const loadedWhole = Math.max(0, Number(body.loadedWhole) || 0);
    const loadedBaguette = Math.max(0, Number(body.loadedBaguette) || 0);

    const dailyRun = await prisma.dailyRun.upsert({
      where: { date },
      update: {
        loadedWhite,
        loadedWhole,
        loadedBaguette,
      },
      create: {
        date,
        status: 'IN_PROGRESS',
        loadedWhite,
        loadedWhole,
        loadedBaguette,
      },
    });

    return NextResponse.json(dailyRun);
  } catch (error) {
    console.error('Error updating loaded inventory:', error);
    return NextResponse.json({ error: 'Failed to update loaded inventory' }, { status: 500 });
  }
}
