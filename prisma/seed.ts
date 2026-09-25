import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Бүтээгдэхүүнүүд (3 төрлийн хөрөнгөний талх)
  const products = [
    {
      name: "1-р гурилын талх",
      sku: "white",
      barcode: "8658000545216",
      price: 4500,
      cost: 2200,
      sortOrder: 1,
    },
    {
      name: "Бүхэл үрийн талх",
      sku: "whole",
      barcode: "8658000545230",
      price: 5000,
      cost: 2500,
      sortOrder: 2,
    },
    {
      name: "Багет (Baguette)",
      sku: "baguette",
      barcode: "8658000545247",
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

  // 2. Дэлгүүрүүд (Маршрутын дарааллаар 22 бодит цэг)
  const stores = [
    {
      routeOrder: 1,
      name: "Ханбүргэдэй MPM",
      phone: "75880909, 88826056",
      address: "13-р хороолол, Натурын зам дагуу MPM оффиссын барилгын 1 давхарт",
      currentBalance: 0,
    },
    {
      routeOrder: 2,
      name: "Ханбүргэдэй Глобал",
      phone: "75880909",
      address: "ХУД, Глобал молл 1 давхарт, Жаргалан хотхоны замын эсрэг талд",
      currentBalance: 0,
    },
    {
      routeOrder: 3,
      name: "Ханбүргэдэй Акояа",
      phone: "75880909, 96313341",
      address: "ХУД, AKOYA Mall салбар",
      currentBalance: 0,
    },
    {
      routeOrder: 4,
      name: "Ханбүргэдэй Парксайд",
      phone: "75880909, 99673539",
      address: "ХУД, Үндэсний цэцэрлэгт хүрээлэнгийн замын хойно Parkside салбар",
      currentBalance: 0,
    },
    {
      routeOrder: 5,
      name: "Ханбүргэдэй Ривергарден",
      phone: "75880909",
      address: "ХУД, Ривергарден хотхонд",
      currentBalance: 0,
    },
    {
      routeOrder: 6,
      name: "Ханбүргэдэй Голден Будда",
      phone: "75880909",
      address: "ХУД, Зайсан, Голден будда хотхонд",
      currentBalance: 0,
    },
    {
      routeOrder: 7,
      name: "Ханбүргэдэй Богд вилла",
      phone: "75880909",
      address: "ХУД, Яармаг, Богд Вилла хотхонд",
      currentBalance: 0,
    },
    {
      routeOrder: 8,
      name: "Ханбүргэдэй Максвелл",
      phone: "75880909",
      address: "ХУД, Яармаг, MAXWELL Residence хотхонд",
      currentBalance: 0,
    },
    {
      routeOrder: 9,
      name: "Ханбүргэдэй төв дэлгүүр",
      phone: "75880909",
      address: "БГД, Төмөр зам",
      currentBalance: 0,
    },
    {
      routeOrder: 10,
      name: "Jetro төв дэлгүүр",
      phone: "70114411, 98114797",
      address: "ХУД, 1-р хороо 120 мянгат, Тэмээтэй хөшөөний баруун талд",
      currentBalance: 0,
    },
    {
      routeOrder: 11,
      name: "Jetro Tara",
      phone: "86530033",
      address: "ХУД, TARA center 1 давхарт",
      currentBalance: 0,
    },
    {
      routeOrder: 12,
      name: "Hi store-2",
      phone: "95906446",
      address: "БЗД, 11-р хороо, Бага тэнгэрийн аманд, Бага тэнгэр сити хотхонд",
      currentBalance: 0,
    },
    {
      routeOrder: 13,
      name: "ЧКА",
      phone: "",
      address: "ЧД, 6-р хороо, 62/1-р байранд",
      currentBalance: 0,
    },
    {
      routeOrder: 14,
      name: "ЧКА-2",
      phone: "99532233",
      address: "ЧД, 6-р хороо, Тусгал сургуулийн зүүн талд",
      currentBalance: 0,
    },
    {
      routeOrder: 15,
      name: "Ariunda сүү цагаан идээний дэлгүүр",
      phone: "88119508, 99983165",
      address: "БГД, нарны зам, KOYO town хотхонд",
      currentBalance: 0,
    },
    {
      routeOrder: 16,
      name: "Төгөл",
      phone: "80152578",
      address: "БГД, Нарны хороололд",
      currentBalance: 0,
    },
    {
      routeOrder: 17,
      name: "Q mart",
      phone: "99247643",
      address: "ХУД, Яармаг, Богд Виста хотхонд",
      currentBalance: 0,
    },
    {
      routeOrder: 18,
      name: "Жансу",
      phone: "86555542",
      address: "ХУД, Яармаг, Cedar city residence хотхонд",
      currentBalance: 0,
    },
    {
      routeOrder: 19,
      name: "АНУ зуслан дэлгүүр",
      phone: "89800853",
      address: "СБД, Шарга морьт явах зам дагуу",
      currentBalance: 0,
    },
    {
      routeOrder: 20,
      name: "Бэлх зуслан дэлгүүр",
      phone: "99094962",
      address: "СБД, Бэлхийн зам",
      currentBalance: 0,
    },
    {
      routeOrder: 21,
      name: "Richmarket зах",
      phone: "88061645, 96054080",
      address: "ХУД, Яармаг, Арцат хотхоны урд Richmarket худалдааны төв",
      currentBalance: 0,
    },
    {
      routeOrder: 22,
      name: "Foodcity зах",
      phone: "99276299",
      address: "ХУД, Яармаг, Foodcity Худалдааны төв",
      currentBalance: 0,
    },
  ];

  for (const s of stores) {
    const existing = await prisma.store.findFirst({
      where: { name: s.name },
    });
    if (existing) {
      await prisma.store.update({
        where: { id: existing.id },
        data: s,
      });
    } else {
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
