"use client";

import { useCallback, useEffect, useState } from "react";
import { AvatarComposer } from "@/components/avatar/AvatarComposer";

interface StudentCard {
  id: string;
  name: string;
  schoolBalance: number;
  avatarRenderPaths: string[];
}

interface DisplayData {
  className: string | null;
  enableBehavior: boolean;
  bonusAmount: number;
  deductAmount: number;
  students: StudentCard[];
}

export function TeacherClassDisplayPage() {
  const [data, setData] = useState<DisplayData | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState<{ id: string; delta: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/teacher/class-display");
    if (!res.ok) throw new Error("Could not load class roster");
    return res.json() as Promise<DisplayData>;
  }, []);

  useEffect(() => {
    load()
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"));
  }, [load]);

  const selected = data?.students.find((s) => s.id === selectedId) ?? null;

  async function applyBehavior(action: "bonus" | "deduct") {
    if (!data || !selected || saving || !data.enableBehavior) return;

    setSaving(true);
    setError(null);

    const amount = action === "bonus" ? data.bonusAmount : data.deductAmount;

    try {
      const res = await fetch(`/api/teacher/students/${selected.id}/behavior`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, amount }),
      });

      if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        throw new Error(err.error ?? "Could not update balance");
      }

      const result = (await res.json()) as { id: string; schoolBalance: number; delta: number };

      setData((prev) =>
        prev
          ? {
              ...prev,
              students: prev.students.map((s) =>
                s.id === result.id ? { ...s, schoolBalance: result.schoolBalance } : s,
              ),
            }
          : prev,
      );

      setFlash({ id: result.id, delta: result.delta });
      setTimeout(() => setFlash(null), 900);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  if (error && !data) {
    return (
      <div className="class-display-shell">
        <p className="text-center text-red-700">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="class-display-shell">
        <p className="loading text-center text-muted">Loading class…</p>
      </div>
    );
  }

  return (
    <div className="class-display-shell">
      <header className="class-display-header">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-gold">Class display</p>
          <h1 className="font-display text-3xl font-bold">{data.className ?? "Your class"}</h1>
        </div>
        <p className="text-sm text-muted">
          Tap a student, then award or deduct tokens
        </p>
      </header>

      {error && <p className="class-display-error">{error}</p>}

      <div className="class-display-grid">
        {data.students.length === 0 && (
          <p className="col-span-full text-center text-muted">No students in this class yet.</p>
        )}
        {data.students.map((student) => {
          const isSelected = student.id === selectedId;
          const isFlashing = flash?.id === student.id;
          return (
            <button
              key={student.id}
              type="button"
              className={`class-display-card${isSelected ? " selected" : ""}${isFlashing ? " flash" : ""}`}
              onClick={() => setSelectedId(student.id)}
            >
              <AvatarComposer renderPaths={student.avatarRenderPaths} size="md" />
              <p className="class-display-name">{student.name}</p>
              <p className="class-display-balance">{student.schoolBalance}</p>
              {isFlashing && (
                <span className={`class-display-delta${flash.delta >= 0 ? " positive" : " negative"}`}>
                  {flash.delta >= 0 ? "+" : ""}
                  {flash.delta}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {selected && (
        <footer className="class-display-actions">
          <p className="class-display-actions-label">
            <strong>{selected.name}</strong>
            <span className="text-muted"> — {selected.schoolBalance} tokens</span>
          </p>
          {data.enableBehavior ? (
            <div className="class-display-action-buttons">
              <button
                type="button"
                className="class-display-btn class-display-btn--bonus"
                disabled={saving}
                onClick={() => applyBehavior("bonus")}
              >
                +{data.bonusAmount} Bonus
              </button>
              <button
                type="button"
                className="class-display-btn class-display-btn--deduct"
                disabled={saving}
                onClick={() => applyBehavior("deduct")}
              >
                −{data.deductAmount} Deduct
              </button>
            </div>
          ) : (
            <p className="text-sm text-muted">Enable behavior in class settings to award or deduct tokens.</p>
          )}
        </footer>
      )}
    </div>
  );
}
