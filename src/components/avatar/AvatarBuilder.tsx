"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchDemoStudentId,
  fetchStudent,
  type AvatarConfig,
  type StudentProfile,
} from "@/lib/student-api";
import { AvatarPicker } from "./AvatarPicker";

export function AvatarBuilder() {
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStudent = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const id = await fetchDemoStudentId();
      const profile = await fetchStudent(id);
      setStudent(profile);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStudent();
  }, [loadStudent]);

  function handleAvatarChange(avatarConfig: AvatarConfig, avatarRenderPaths: string[]) {
    setStudent((prev) => (prev ? { ...prev, avatarConfig, avatarRenderPaths } : prev));
  }

  if (loading) {
    return <p className="loading text-center text-muted">Loading your avatar…</p>;
  }

  if (error || !student) {
    return (
      <div className="error-panel">
        <h2 className="font-display text-xl font-semibold">Could not load avatar</h2>
        <p className="mt-2 text-muted">{error ?? "Student profile unavailable."}</p>
        <p className="mt-2 text-sm text-muted">
          Run <code className="rounded bg-canvas px-1">npm run db:seed</code> if you have not
          yet.
        </p>
        <button type="button" className="btn-primary mt-4" onClick={loadStudent}>
          Try again
        </button>
      </div>
    );
  }

  return <AvatarPicker student={student} onAvatarChange={handleAvatarChange} />;
}
