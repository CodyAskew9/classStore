"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { AvatarAtlasManifest } from "@/lib/avatar/atlas";

interface AtlasContextValue {
  manifest: AvatarAtlasManifest | null;
  ready: boolean;
}

const AtlasContext = createContext<AtlasContextValue>({ manifest: null, ready: false });

export function AvatarAtlasProvider({ children }: { children: ReactNode }) {
  const [manifest, setManifest] = useState<AvatarAtlasManifest | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch("/assets/avatar-atlas/manifest.json")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: AvatarAtlasManifest | null) => {
        if (!cancelled) {
          setManifest(data);
          setReady(true);
        }
      })
      .catch(() => {
        if (!cancelled) setReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AtlasContext.Provider value={{ manifest, ready }}>{children}</AtlasContext.Provider>
  );
}

export function useAvatarAtlas() {
  return useContext(AtlasContext);
}
