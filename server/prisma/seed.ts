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
  accessories: [],
};

async function main() {
  const existing = await prisma.user.findFirst({ where: { role: Role.STUDENT } });
  if (existing) {
    console.log("Seed skipped — student already exists:", existing.id);
    return;
  }

  const classroom = await prisma.class.create({
    data: {
      name: "Ms. Rivera's Class",
      joinCode: "CREST1",
    },
  });

  const student = await prisma.user.create({
    data: {
      name: "Alex Johnson",
      role: Role.STUDENT,
      classId: classroom.id,
      avatarConfig: BOY_AVATAR,
    },
  });

  await prisma.transaction.createMany({
    data: [
      {
        studentId: student.id,
        amount: 50,
        type: TransactionType.JOB_PAYOUT,
        description: "Line leader — week 1",
      },
      {
        studentId: student.id,
        amount: 25,
        type: TransactionType.BEHAVIOR_BONUS,
        description: "Helped a classmate",
      },
      {
        studentId: student.id,
        amount: -15,
        type: TransactionType.STORE_PURCHASE,
        description: "Pencil eraser pack",
      },
      {
        studentId: student.id,
        amount: 50,
        type: TransactionType.JOB_PAYOUT,
        description: "Librarian — week 2",
      },
    ],
  });

  console.log("Seeded demo student:", student.id);
  console.log("Class join code:", classroom.joinCode);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
