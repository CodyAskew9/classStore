import { Suspense } from "react";
import { StudentJoinRosterPage } from "@/views/student/StudentJoinRosterPage";

export default function StudentJoinRosterRoute() {
  return (
    <Suspense fallback={<p className="loading text-center text-muted">Loading…</p>}>
      <StudentJoinRosterPage />
    </Suspense>
  );
}
