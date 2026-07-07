import type { ReactNode } from "react";
import Link from "next/link";

interface Props {
  title: string;
  subtitle?: string;
  backTo?: string;
  backLabel?: string;
  children: ReactNode;
}

export function AuthShell({ title, subtitle, backTo = "/login", backLabel = "Back", children }: Props) {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-10">
      <div className="panel w-full max-w-md">
        <Link href={backTo} className="text-sm font-semibold text-accent hover:underline">
          ← {backLabel}
        </Link>
        <h1 className="mt-4 font-display text-2xl font-bold">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-muted">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
