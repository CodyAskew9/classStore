import { NextRequest, NextResponse } from "next/server";
import { getAvatarCatalog } from "@/lib/avatar/avatar";

export async function GET(req: NextRequest) {
  const bodyType = req.nextUrl.searchParams.get("bodyType") === "female" ? "female" : "male";
  return NextResponse.json(getAvatarCatalog(bodyType));
}
