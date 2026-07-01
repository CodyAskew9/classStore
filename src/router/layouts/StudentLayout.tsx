import { Outlet } from "react-router-dom";
import { StudentNav } from "@/components/student/StudentNav";

export function StudentLayout() {
  return (
    <StudentNav>
      <Outlet />
    </StudentNav>
  );
}
