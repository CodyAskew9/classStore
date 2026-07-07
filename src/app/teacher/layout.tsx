"use client";

import { useEffect, useState } from "react";
import { SidebarNav } from "@/components/teacher/SidebarNav";
import type { NavItem } from "@/lib/class-settings/nav-items";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const [navItems, setNavItems] = useState<NavItem[] | null>(null);

  useEffect(() => {
    fetch("/api/teacher/nav")
      .then((res) => res.json())
      .then((data: { navItems: NavItem[] }) => setNavItems(data.navItems));
  }, []);

  if (!navItems) {
    return <p className="p-8 text-muted">Loading…</p>;
  }

  return <SidebarNav items={navItems}>{children}</SidebarNav>;
}
