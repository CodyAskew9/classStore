import { PrismaClient, Role, TransactionType } from "@prisma/client";

const prisma = new PrismaClient();

const BOY_AVATAR = {
  colorMode: true,
  bodyType: "male" as const,
  body: "body_01.png",
  pupils: "pupils_01.png",
  eyebrows: "eyebrows_01.png",
  eyelashes: "eyelashes_01.png",
  mouth: null,
  beard: null,
  hairBack: null,
  hair: "hair_01.png",
  bangs: null,
  hairBonus: null,
  top: "top_01.png",
  bottom: "bottom_01.png",
  dress: null,
  gloves: null,
  shoes: "shoes_01.png",
  fantasyOutfitId: null,
};

async function main() {
  const existing = await prisma.user.findFirst({ where: { role: Role.STUDENT } });
  if (existing) {
    console.log("Seed skipped — student already exists:", existing.id);
    return;
  }

  const teacher = await prisma.user.create({
    data: {
      name: "Ms. Rivera",
      email: "teacher@classcrest.demo",
      role: Role.TEACHER,
    },
  });

  const classroom = await prisma.class.create({
    data: {
      name: "Room 12B — Fantasy Quest",
      joinCode: "QUEST12",
      settings: {
        create: {
          enableStore: true,
          enableBehavior: true,
          enableJobs: true,
        },
      },
      jobs: {
        create: [
          {
            title: "Library Monitor",
            description: "Keep the reading corner tidy",
            weeklySalary: 25,
            maxOpenings: 2,
          },
          {
            title: "Plant Caretaker",
            description: "Water classroom plants on schedule",
            weeklySalary: 15,
            maxOpenings: 1,
          },
        ],
      },
      items: {
        create: [
          { name: "Extra Recess Pass", description: "15 min bonus recess", price: 40, stock: 10 },
          { name: "Sticker Pack", description: "Fantasy sticker sheet", price: 15, stock: 30 },
          { name: "Homework Pass", description: "Skip one assignment", price: 60, stock: 5 },
        ],
      },
    },
  });

  const student = await prisma.user.create({
    data: {
      name: "Alex Johnson",
      email: "alex@classcrest.demo",
      role: Role.STUDENT,
      classId: classroom.id,
      avatarConfig: BOY_AVATAR,
      transactions: {
        create: [
          { amount: 50, type: TransactionType.JOB_PAYOUT, description: "Library Monitor — week 1" },
          { amount: 10, type: TransactionType.BEHAVIOR_BONUS, description: "Helped a classmate" },
          { amount: -15, type: TransactionType.STORE_PURCHASE, description: "Sticker Pack" },
        ],
      },
      checklists: {
        create: {
          weekId: "2026-W26",
          items: {
            create: [
              { title: "Library Monitor shift", basePay: 25, penalty: 5, isCompleted: true },
              { title: "Return all borrowed books", basePay: 5, penalty: 2, isCompleted: false },
            ],
          },
        },
      },
    },
  });

  const parent = await prisma.user.create({
    data: {
      name: "Jordan Johnson",
      email: "parent@classcrest.demo",
      role: Role.PARENT,
      children: {
        create: { studentId: student.id },
      },
    },
  });

  await prisma.supplyItem.createMany({
    data: [
      {
        title: "Class Treasure Chest (bulk)",
        description: "Physical reward box for classroom store",
        priceCents: 2499,
        imageUrl: null,
        affiliateUrl: "https://example.com/treasure-chest",
      },
      {
        title: "Fantasy Token Coins (100 pack)",
        description: "Plastic gold coins for token economy",
        priceCents: 1299,
      },
    ],
  });

  console.log("ClassCrest seed complete");
  console.log("  Teacher:", teacher.id);
  console.log("  Student:", student.id);
  console.log("  Parent:", parent.id);
  console.log("  Class join code:", classroom.joinCode);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
