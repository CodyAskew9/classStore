"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logout } from "@/lib/auth-api";

const LINKS = [
  { href: "/student/dashboard", label: "Dashboard" },
  { href: "/student/avatar", label: "Avatar" },
];

export function StudentNav({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push("/student/join");
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/student/dashboard" className="flex items-center gap-2">
            <span className="text-2xl text-gold" aria-hidden>
              ⛨
            </span>
            <p className="font-display text-lg font-bold">ClassCrest</p>
          </Link>
          <div className="flex items-center gap-2">
            <nav className="flex gap-2">
              {LINKS.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      active
                        ? "bg-accent/10 text-accent"
                        : "text-muted hover:text-ink"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
            <button type="button" className="btn-ghost px-3 py-1.5 text-xs" onClick={handleLogout}>
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
