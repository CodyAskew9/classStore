"use client";

import { StudentNav } from "@/components/student/StudentNav";

export default function StudentPortalLayout({ children }: { children: React.ReactNode }) {
  return <StudentNav>{children}</StudentNav>;
}
