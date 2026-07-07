"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { FormField } from "@/components/auth/FormField";
import { registerAccount } from "@/lib/auth-api";

type RegisterRole = "TEACHER" | "PARENT";

export function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams?.get("role") === "parent" ? "PARENT" : "TEACHER";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [className, setClassName] = useState("");
  const [role, setRole] = useState<RegisterRole>(initialRole);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { user } = await registerAccount({
        name,
        email,
        password,
        role,
        className: role === "TEACHER" ? className : undefined,
      });
      if (user.role === "TEACHER") router.push("/teacher/dashboard");
      else router.push("/parent/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not register");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Create account"
      subtitle="Teachers and parents only. Students join with a class code — no email signup."
      backTo="/login"
      backLabel="Sign in instead"
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        {error && <p className="error-banner">{error}</p>}

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">I am a…</legend>
          <div className="flex gap-2">
            {(["TEACHER", "PARENT"] as const).map((r) => (
              <button
                key={r}
                type="button"
                className={`auth-role-pill${role === r ? " active" : ""}`}
                onClick={() => setRole(r)}
              >
                {r === "TEACHER" ? "Teacher" : "Parent"}
              </button>
            ))}
          </div>
        </fieldset>

        <FormField
          label="Your name"
          type="text"
          required
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <FormField
          label="Email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <FormField
          label="Password"
          type="password"
          required
          autoComplete="new-password"
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          hint="At least 8 characters"
        />

        {role === "TEACHER" && (
          <FormField
            label="Class name"
            type="text"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            placeholder="Room 12B — Fantasy Quest"
            hint="We'll generate a class code for students to join"
          />
        )}

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-4 rounded-xl bg-[var(--accent-soft)] px-3 py-2 text-center text-xs text-muted">
        Students: go to{" "}
        <Link href="/student/join" className="font-semibold text-accent">
          Join with class code
        </Link>{" "}
        — no account needed.
      </p>
    </AuthShell>
  );
}
