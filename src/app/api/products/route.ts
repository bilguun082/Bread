import { NextResponse } from 'next/server';
import { prisma } from '@/services/db';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
