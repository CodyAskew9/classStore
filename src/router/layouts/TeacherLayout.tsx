"use client";

import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { SidebarNav } from "@/components/teacher/SidebarNav";
import type { NavItem } from "@/lib/class-settings/nav-items";

export function TeacherLayout() {
  const [navItems, setNavItems] = useState<NavItem[] | null>(null);

  useEffect(() => {
    fetch("/api/teacher/nav")
      .then((res) => res.json())
      .then((data: { navItems: NavItem[] }) => setNavItems(data.navItems));
  }, []);

  if (!navItems) {
    return <p className="p-8 text-muted">Loading…</p>;
  }

  return (
    <SidebarNav items={navItems}>
      <Outlet />
    </SidebarNav>
  );
}
