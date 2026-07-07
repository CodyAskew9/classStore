"use client";

import { AvatarAtlasProvider } from "@/components/avatar/AvatarAtlasProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return <AvatarAtlasProvider>{children}</AvatarAtlasProvider>;
}
