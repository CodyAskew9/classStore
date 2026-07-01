import { readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

const MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".json": "application/json",
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params;
  const filePath = path.join(process.cwd(), "assets", ...segments);

  if (!filePath.startsWith(path.join(process.cwd(), "assets"))) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  if (!existsSync(filePath)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const ext = path.extname(filePath).toLowerCase();
  const buffer = await readFile(filePath);

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": MIME[ext] ?? "application/octet-stream",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
