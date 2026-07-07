import { Suspense } from "react";
import { RegisterPage } from "@/views/RegisterPage";

export default function RegisterRoute() {
  return (
    <Suspense fallback={<p className="loading text-center text-muted">Loading…</p>}>
      <RegisterPage />
    </Suspense>
  );
}
