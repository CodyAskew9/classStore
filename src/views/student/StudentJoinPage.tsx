"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { FormField } from "@/components/auth/FormField";
import { extractJoinCodeFromScan, QrScanner } from "@/components/auth/QrScanner";
import { fetchClassByCode } from "@/lib/auth-api";

export function StudentJoinPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    const fromUrl = searchParams?.get("code");
    if (fromUrl) setCode(fromUrl.toUpperCase());
  }, [searchParams]);

  async function submitCode(joinCode: string) {
    const normalized = joinCode.trim().toUpperCase();
    if (!normalized) {
      setError("Enter your class code");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await fetchClassByCode(normalized);
      router.push(`/student/join/roster?code=${encodeURIComponent(normalized)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not find class");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    submitCode(code);
  }

  function handleScan(raw: string) {
    setScanning(false);
    const extracted = extractJoinCodeFromScan(raw);
    if (extracted) {
      setCode(extracted);
      submitCode(extracted);
    } else {
      setError("That QR code did not contain a valid class code.");
    }
  }

  return (
    <>
      <AuthShell
        title="Join your class"
        subtitle="Students never use email — scan the QR code from your teacher or type the class code."
        backTo="/login"
        backLabel="All sign-in options"
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && <p className="error-banner">{error}</p>}
          <FormField
            label="Class code"
            type="text"
            required
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="QUEST12"
            autoComplete="off"
            spellCheck={false}
            maxLength={12}
            hint="Usually 6 letters and numbers, like QUEST12"
          />
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? "Looking up class…" : "Continue"}
          </button>
        </form>

        <div className="mt-4 border-t border-border pt-4">
          <button
            type="button"
            className="btn-ghost w-full"
            onClick={() => setScanning(true)}
            disabled={loading}
          >
            Scan QR code
          </button>
        </div>

        <p className="mt-4 text-center text-xs text-muted">
          Ask your teacher for the code or scan the poster in your classroom.
        </p>
      </AuthShell>

      {scanning && <QrScanner onScan={handleScan} onClose={() => setScanning(false)} />}
    </>
  );
}
