import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import {
  createSessionToken,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  sessionCookieOptions,
} from "@/lib/auth/session";

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string; password?: string };
  const email = body.email?.trim().toLowerCase();
  const password = body.password;

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user?.passwordHash) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  if (user.role === "STUDENT") {
    return NextResponse.json(
      { error: "Students join with a class code — no email login" },
      { status: 403 },
    );
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const token = await createSessionToken({ userId: user.id, role: user.role });
  const response = NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
  response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions(SESSION_MAX_AGE));
  return response;
}
