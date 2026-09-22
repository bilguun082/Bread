import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Бүтээгдэхүүнүүд (3 төрлийн хөрөнгөний талх)
  const products = [
    {
      name: "1-р гурилын талх",
      sku: "white",
      price: 4500,
      cost: 2200,
      sortOrder: 1,
    },
    {
      name: "Бүхэл үрийн талх",
      sku: "whole",
      price: 5000,
      cost: 2500,
      sortOrder: 2,
    },
    {
      name: "Багет (Baguette)",
      sku: "baguette",
      price: 4000,
      cost: 1800,
      sortOrder: 3,
    },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { sku: p.sku },
      update: p,
      create: p,
    });
  }

  // 2. Дэлгүүрүүд (Маршрутын дарааллаар)
  const stores = [
    {
      name: "Номин 8 нэрийн",
      ownerName: "Дулмаа эгч",
      phone: "99112233",
      address: "13-р хороолол, 24-р байр",
      currentBalance: 45000,
      routeOrder: 1,
    },
    {
      name: "Амар хүнс",
      ownerName: "Батболд ах",
      phone: "88001122",
      address: "Сансар, үйлчилгээний төвийн хажууд",
      currentBalance: 0,
      routeOrder: 2,
    },
    {
      name: "Баянзүрх мини маркет",
      ownerName: "Оюунцэцэг",
      phone: "91919191",
      address: "Бөхийн өргөөний зүүн хойно",
      currentBalance: 60000,
      routeOrder: 3,
    },
    {
      name: "Солонго 8 нэрийн",
      ownerName: "Гансүх",
      phone: "89898989",
      address: "100 айл, замын урд",
      currentBalance: 15000,
      routeOrder: 4,
    },
    {
      name: "Энхжин супермаркет",
      ownerName: "Цэцэгмаа",
      phone: "95959595",
      address: "Баянмонгол хороолол, 101-р байр",
      currentBalance: 0,
      routeOrder: 5,
    },
  ];

  for (const s of stores) {
    const existing = await prisma.store.findFirst({
      where: { name: s.name },
    });
    if (!existing) {
      await prisma.store.create({ data: s });
    }
  }

  // 3. Жишээ зардлууд (Энэ сарын P&L-д зориулсан)
  const today = new Date().toISOString().split("T")[0];
  const sampleExpenses = [
    { date: today, category: "Гурил", amount: 180000, note: "Улаанбаатар дээд гурил 2 шуудай" },
    { date: today, category: "Түлш", amount: 35000, note: "Машины шатахуун хүргэлт" },
    { date: today, category: "Уут сав", amount: 20000, note: "Крафт цаасан уут 200ш" },
  ];

  for (const e of sampleExpenses) {
    await prisma.expense.create({ data: e });
  }

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
