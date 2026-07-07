import { PrismaClient, Role, TransactionType } from "@prisma/client";
import { hashPassword } from "../src/lib/auth/password";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "classroom123";

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
  const passwordHash = await hashPassword(DEMO_PASSWORD);

  const existing = await prisma.user.findFirst({ where: { role: Role.STUDENT } });
  if (existing) {
    await prisma.user.updateMany({
      where: { email: "teacher@classcrest.demo" },
      data: { passwordHash },
    });
    await prisma.user.updateMany({
      where: { email: "parent@classcrest.demo" },
      data: { passwordHash },
    });
    const teacher = await prisma.user.findFirst({ where: { email: "teacher@classcrest.demo" } });
    const classroom = await prisma.class.findFirst({ where: { joinCode: "QUEST12" } });
    if (teacher && classroom && !teacher.classId) {
      await prisma.user.update({
        where: { id: teacher.id },
        data: { classId: classroom.id },
      });
    }
    console.log("Seed skipped — demo users already exist.");
    console.log("  Demo password (teacher/parent):", DEMO_PASSWORD);
    console.log("  Class join code: QUEST12");
    return;
  }

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

  const teacher = await prisma.user.create({
    data: {
      name: "Ms. Rivera",
      email: "teacher@classcrest.demo",
      passwordHash,
      role: Role.TEACHER,
      classId: classroom.id,
    },
  });

  const student = await prisma.user.create({
    data: {
      name: "Alex Johnson",
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

  await prisma.user.create({
    data: {
      name: "Sam Rivera",
      role: Role.STUDENT,
      classId: classroom.id,
      avatarConfig: { ...BOY_AVATAR, hair: "hair_02.png", bodyType: "female", body: "body_02.png" },
    },
  });

  const parent = await prisma.user.create({
    data: {
      name: "Jordan Johnson",
      email: "parent@classcrest.demo",
      passwordHash,
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
  console.log("  Teacher:", teacher.email, "| password:", DEMO_PASSWORD);
  console.log("  Parent:", parent.email, "| password:", DEMO_PASSWORD);
  console.log("  Students: Alex Johnson, Sam Rivera (join code QUEST12, no email login)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
