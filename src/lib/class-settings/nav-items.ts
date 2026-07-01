import type { ClassSettings } from "@prisma/client";

export interface NavItem {
  href: string;
  label: string;
}

/** Teacher sidebar — omit tabs when ClassSettings flags are disabled */
export function teacherNavItems(settings: ClassSettings): NavItem[] {
  const items: NavItem[] = [
    { href: "/teacher/dashboard", label: "Dashboard" },
  ];

  if (settings.enableStore) {
    items.push({ href: "/teacher/store", label: "Store" });
  }

  if (settings.enableJobs) {
    items.push({ href: "/teacher/jobs", label: "Jobs" });
  }

  return items;
}

export function defaultClassSettings(classId: string): ClassSettings {
  return {
    classId,
    enableStore: true,
    enableBehavior: true,
    enableJobs: true,
  };
}
