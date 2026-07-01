"use client";

import { Link, useLocation } from "react-router-dom";
import type { NavItem } from "@/lib/class-settings/nav-items";

interface Props {
  items: NavItem[];
  className?: string;
  children: React.ReactNode;
}

export function SidebarNav({ items, className, children }: Props) {
  const { pathname } = useLocation();

  return (
    <div className={`flex min-h-screen ${className ?? ""}`}>
      <aside className="w-56 shrink-0 border-r border-border bg-surface px-4 py-6">
        <Link to="/teacher/dashboard" className="mb-8 flex items-center gap-2 px-2">
          <span className="text-2xl text-gold" aria-hidden>
            ⛨
          </span>
          <div>
            <p className="font-display text-lg font-bold leading-tight">ClassCrest</p>
            <p className="text-xs text-muted">Teacher</p>
          </div>
        </Link>
        <nav className="space-y-1">
          {items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`block rounded-xl px-3 py-2 text-sm font-semibold transition ${
                  active
                    ? "bg-accent/10 text-accent"
                    : "text-muted hover:bg-canvas hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}
