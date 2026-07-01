import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const jobs = await prisma.classJob.findMany({
    orderBy: { title: "asc" },
  });

  return NextResponse.json({
    jobs: jobs.map((job) => ({
      id: job.id,
      title: job.title,
      description: job.description,
      weeklySalary: job.weeklySalary,
      maxOpenings: job.maxOpenings,
    })),
  });
}
