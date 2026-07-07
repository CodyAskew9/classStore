import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { generateJoinCode } from "@/lib/auth/join-code";
import {
  createSessionToken,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  sessionCookieOptions,
} from "@/lib/auth/session";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    name?: string;
    email?: string;
    password?: string;
    role?: string;
    className?: string;
  };

  const name = body.name?.trim();
  const email = body.email?.trim().toLowerCase();
  const password = body.password;
  const role = body.role;

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
  }

  if (role !== "TEACHER" && role !== "PARENT") {
    return NextResponse.json(
      { error: "Students join with a class code — teachers and parents register here" },
      { status: 400 },
    );
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);

  if (role === "TEACHER") {
    const className = body.className?.trim() || `${name}'s Class`;
    let joinCode = generateJoinCode();
    for (let attempt = 0; attempt < 5; attempt++) {
      const taken = await prisma.class.findUnique({ where: { joinCode } });
      if (!taken) break;
      joinCode = generateJoinCode();
    }

    const classroom = await prisma.class.create({
      data: {
        name: className,
        joinCode,
        settings: {
          create: { enableStore: true, enableBehavior: true, enableJobs: true },
        },
      },
    });

    const teacher = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: Role.TEACHER,
        classId: classroom.id,
      },
    });

    const token = await createSessionToken({ userId: teacher.id, role: teacher.role });
    const response = NextResponse.json({
      user: { id: teacher.id, name: teacher.name, email: teacher.email, role: teacher.role },
      class: { id: classroom.id, name: classroom.name, joinCode: classroom.joinCode },
    });
    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions(SESSION_MAX_AGE));
    return response;
  }

  const parent = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: Role.PARENT,
    },
  });

  const token = await createSessionToken({ userId: parent.id, role: parent.role });
  const response = NextResponse.json({
    user: { id: parent.id, name: parent.name, email: parent.email, role: parent.role },
  });
  response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions(SESSION_MAX_AGE));
  return response;
}
