import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { normalizeJoinCode, isValidJoinCodeFormat } from "@/lib/auth/join-code";
import {
  createSessionToken,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  sessionCookieOptions,
} from "@/lib/auth/session";

export async function POST(request: Request) {
  const body = (await request.json()) as { joinCode?: string; studentId?: string };
  const joinCode = normalizeJoinCode(body.joinCode ?? "");
  const studentId = body.studentId;

  if (!joinCode || !studentId) {
    return NextResponse.json({ error: "Class code and student are required" }, { status: 400 });
  }

  if (!isValidJoinCodeFormat(joinCode)) {
    return NextResponse.json({ error: "Invalid class code format" }, { status: 400 });
  }

  const classroom = await prisma.class.findUnique({ where: { joinCode } });
  if (!classroom) {
    return NextResponse.json({ error: "Class not found — check the code with your teacher" }, { status: 404 });
  }

  const student = await prisma.user.findFirst({
    where: { id: studentId, role: Role.STUDENT, classId: classroom.id },
    select: { id: true, name: true, email: true, role: true },
  });

  if (!student) {
    return NextResponse.json({ error: "Student not found in this class" }, { status: 404 });
  }

  const token = await createSessionToken({ userId: student.id, role: student.role });
  const response = NextResponse.json({
    user: { id: student.id, name: student.name, email: student.email, role: student.role },
  });
  response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions(SESSION_MAX_AGE));
  return response;
}
