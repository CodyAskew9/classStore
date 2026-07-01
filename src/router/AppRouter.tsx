"use client";

import { useEffect, useState } from "react";
import { RouterProvider } from "react-router-dom";
import { createAppRouter } from "@/router/router";

type AppRouterInstance = ReturnType<typeof createAppRouter>;

export function AppRouter() {
  const [router, setRouter] = useState<AppRouterInstance | null>(null);

  useEffect(() => {
    setRouter(createAppRouter());
  }, []);

  if (!router) {
    return <p className="loading text-center text-muted">Loading…</p>;
  }

  return <RouterProvider router={router} />;
}
