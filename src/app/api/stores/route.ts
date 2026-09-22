import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/services/db';

export async function GET() {
  try {
    const stores = await prisma.store.findMany({
      orderBy: { routeOrder: 'asc' },
      include: {
        deliveries: {
          orderBy: { date: 'desc' },
          take: 1,
          select: { date: true },
        },
      },
    });

    const formattedStores = stores.map((s) => ({
      id: s.id,
      name: s.name,
      ownerName: s.ownerName,
      phone: s.phone,
      address: s.address,
      currentBalance: s.currentBalance,
      routeOrder: s.routeOrder,
      lastDeliveryDate: s.deliveries[0]?.date ? s.deliveries[0].date.toISOString() : null,
    }));

    return NextResponse.json(formattedStores);
  } catch (error) {
    console.error('Error fetching stores:', error);
    return NextResponse.json({ error: 'Failed to fetch stores' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, ownerName, phone, address, currentBalance, routeOrder } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Дэлгүүрийн нэр оруулна уу' }, { status: 400 });
    }

    // Автоматаар хамгийн сүүлийн routeOrder-оос 1-ээр их оноох
    let assignedOrder = routeOrder;
    if (assignedOrder === undefined || assignedOrder === null) {
      const highest = await prisma.store.findFirst({
        orderBy: { routeOrder: 'desc' },
        select: { routeOrder: true },
      });
      assignedOrder = (highest?.routeOrder ?? 0) + 1;
    }

    const store = await prisma.store.create({
      data: {
        name: name.trim(),
        ownerName: ownerName?.trim() || null,
        phone: phone?.trim() || null,
        address: address?.trim() || null,
        currentBalance: Number(currentBalance) || 0,
        routeOrder: Number(assignedOrder),
      },
    });

    return NextResponse.json(store, { status: 201 });
  } catch (error) {
    console.error('Error creating store:', error);
    return NextResponse.json({ error: 'Failed to create store' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Store ID required' }, { status: 400 });
    }

    const body = await req.json();
    const updateData: Record<string, unknown> = {};

    if (body.name !== undefined) updateData.name = String(body.name).trim();
    if (body.ownerName !== undefined) updateData.ownerName = body.ownerName ? String(body.ownerName).trim() : null;
    if (body.phone !== undefined) updateData.phone = body.phone ? String(body.phone).trim() : null;
    if (body.address !== undefined) updateData.address = body.address ? String(body.address).trim() : null;
    if (body.currentBalance !== undefined) updateData.currentBalance = Number(body.currentBalance) || 0;
    if (body.routeOrder !== undefined) updateData.routeOrder = Number(body.routeOrder) || 0;

    const store = await prisma.store.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(store);
  } catch (error) {
    console.error('Error updating store:', error);
    return NextResponse.json({ error: 'Failed to update store' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Store ID required' }, { status: 400 });
    }

    // Дэлгүүрт хамаарах хүргэлтийн бичилтүүдийг түрүүлж устгах
    await prisma.deliveryRecord.deleteMany({
      where: { storeId: id },
    });

    await prisma.store.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting store:', error);
    return NextResponse.json({ error: 'Failed to delete store' }, { status: 500 });
  }
}
