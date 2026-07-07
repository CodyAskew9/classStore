import { Suspense } from "react";
import { StudentJoinPage } from "@/views/student/StudentJoinPage";

export default function StudentJoinRoute() {
  return (
    <Suspense fallback={<p className="loading text-center text-muted">Loading…</p>}>
      <StudentJoinPage />
    </Suspense>
  );
}
