"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { fetchClassByCode, loginAsStudent, type ClassByCodeResponse } from "@/lib/auth-api";

export function StudentJoinRosterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams?.get("code")?.toUpperCase() ?? "";

  const [roster, setRoster] = useState<ClassByCodeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState<string | null>(null);

  useEffect(() => {
    if (!code) {
      router.replace("/student/join");
      return;
    }
    fetchClassByCode(code)
      .then(setRoster)
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load class"))
      .finally(() => setLoading(false));
  }, [code, router]);

  async function pickStudent(studentId: string) {
    setSigningIn(studentId);
    setError(null);
    try {
      await loginAsStudent(code, studentId);
      router.push("/student/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in");
      setSigningIn(null);
    }
  }

  return (
    <AuthShell
      title="Who are you?"
      subtitle={
        roster
          ? `Tap your name in ${roster.className}`
          : "Pick your name from the class list"
      }
      backTo={`/student/join?code=${encodeURIComponent(code)}`}
      backLabel="Change class code"
    >
      {loading && <p className="text-sm text-muted">Loading class roster…</p>}
      {error && <p className="error-banner">{error}</p>}

      {roster && roster.students.length === 0 && (
        <p className="text-sm text-muted">
          No students in this class yet. Ask your teacher to add you to the roster.
        </p>
      )}

      {roster && roster.students.length > 0 && (
        <ul className="auth-roster" role="listbox" aria-label="Class roster">
          {roster.students.map((student) => (
            <li key={student.id}>
              <button
                type="button"
                role="option"
                className="auth-roster-btn"
                disabled={!!signingIn}
                onClick={() => pickStudent(student.id)}
              >
                <span className="auth-roster-avatar" aria-hidden>
                  {student.name.charAt(0).toUpperCase()}
                </span>
                <span className="font-semibold">{student.name}</span>
                {signingIn === student.id && (
                  <span className="text-xs text-muted">Signing in…</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-4 text-center text-xs text-muted">
        Not on the list?{" "}
        <Link href="/student/join" className="font-semibold text-accent">
          Try a different code
        </Link>
      </p>
    </AuthShell>
  );
}
