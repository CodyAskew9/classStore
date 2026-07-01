"use client";

import dynamic from "next/dynamic";

const AppRouter = dynamic(() => import("@/router/AppRouter").then((m) => m.AppRouter), {
  ssr: false,
});

export default function SpaPage() {
  return <AppRouter />;
}
