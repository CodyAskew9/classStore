"use client";

import { Link, useLocation } from "react-router-dom";

const LINKS = [
  { href: "/student/dashboard", label: "Dashboard" },
  { href: "/student/avatar", label: "Avatar" },
];

export function StudentNav({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link to="/student/dashboard" className="flex items-center gap-2">
            <span className="text-2xl text-gold" aria-hidden>
              ⛨
            </span>
            <p className="font-display text-lg font-bold">ClassCrest</p>
          </Link>
          <nav className="flex gap-2">
            {LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  to={link.href}
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
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
