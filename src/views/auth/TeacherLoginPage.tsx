"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { FormField } from "@/components/auth/FormField";
import { loginWithEmail } from "@/lib/auth-api";

export function TeacherLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { user } = await loginWithEmail(email, password);
      if (user.role !== "TEACHER") {
        setError("This account is not a teacher. Try the parent or student login.");
        return;
      }
      router.push("/teacher/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Teacher sign in"
      subtitle="Use the email and password you registered with."
      backTo="/login"
      backLabel="All sign-in options"
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        {error && <p className="error-banner">{error}</p>}
        <FormField
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@school.edu"
        />
        <FormField
          label="Password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-muted">
        New teacher?{" "}
        <Link href="/register?role=teacher" className="font-semibold text-accent">
          Create account
        </Link>
      </p>
      <p className="mt-4 text-center text-xs text-muted">
        Demo: teacher@classcrest.demo / classroom123
      </p>
    </AuthShell>
  );
}
