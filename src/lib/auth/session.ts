import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { Role } from "@prisma/client";

export const SESSION_COOKIE = "classcrest_session";
const SESSION_DAYS = 14;

export interface SessionPayload {
  userId: string;
  role: Role;
}

function secretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET ?? "classcrest-dev-secret-change-in-production";
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ userId: payload.userId, role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secretKey());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    const userId = payload.userId;
    const role = payload.role;
    if (typeof userId !== "string" || typeof role !== "string") return null;
    if (role !== "TEACHER" && role !== "STUDENT" && role !== "PARENT") return null;
    return { userId, role: role as Role };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export function sessionCookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

export const SESSION_MAX_AGE = SESSION_DAYS * 24 * 60 * 60;
