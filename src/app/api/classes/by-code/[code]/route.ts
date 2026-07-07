import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { normalizeJoinCode, isValidJoinCodeFormat } from "@/lib/auth/join-code";

export async function GET(
  _request: Request,
  context: { params: Promise<{ code: string }> },
) {
  const { code: raw } = await context.params;
  const joinCode = normalizeJoinCode(decodeURIComponent(raw));

  if (!isValidJoinCodeFormat(joinCode)) {
    return NextResponse.json({ error: "Invalid class code format" }, { status: 400 });
  }

  const classroom = await prisma.class.findUnique({
    where: { joinCode },
    include: {
      users: {
        where: { role: Role.STUDENT },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      },
    },
  });

  if (!classroom) {
    return NextResponse.json({ error: "Class not found — check the code with your teacher" }, { status: 404 });
  }

  return NextResponse.json({
    classId: classroom.id,
    className: classroom.name,
    joinCode: classroom.joinCode,
    students: classroom.users,
  });
}
