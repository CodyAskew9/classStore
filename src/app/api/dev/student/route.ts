import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse(null, { status: 404 });
  }

  const student = await prisma.user.findFirst({
    where: { role: "STUDENT" },
    orderBy: { createdAt: "asc" },
  });

  if (!student) {
    return NextResponse.json(
      { error: "No student found. Run: npm run db:seed" },
      { status: 404 },
    );
  }

  return NextResponse.json({ id: student.id });
}
