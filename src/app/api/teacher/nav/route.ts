import { NextResponse } from "next/server";
import { teacherNavItems } from "@/lib/class-settings/nav-items";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const classroom = await prisma.class.findFirst({
    include: { settings: true },
  });

  const settings = classroom?.settings ?? {
    classId: classroom?.id ?? "demo",
    enableStore: true,
    enableBehavior: true,
    enableJobs: true,
  };

  return NextResponse.json({ navItems: teacherNavItems(settings) });
}
