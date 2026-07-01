"use client";

import { useEffect, useState } from "react";

interface RosterStudent {
  id: string;
  name: string;
  schoolBalance: number;
}

interface DashboardData {
  className: string | null;
  enableBehavior: boolean;
  roster: RosterStudent[];
}

export function TeacherDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch("/api/teacher/dashboard")
      .then((res) => res.json())
      .then(setData);
  }, []);

  if (!data) {
    return <p className="p-8 text-muted">Loading dashboard…</p>;
  }

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold">Dashboard</h1>
        <p className="mt-1 text-muted">
          {data.className ?? "No class"} — roster &amp; point injectors
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="panel lg:col-span-2">
          <h2 className="font-display text-xl font-semibold">Class roster</h2>
          <p className="mt-1 text-sm text-muted">School wallet balances only</p>
          <ul className="mt-4 divide-y divide-border">
            {data.roster.length === 0 && (
              <li className="py-4 text-sm text-muted">No students yet.</li>
            )}
            {data.roster.map((student) => (
              <li key={student.id} className="flex items-center justify-between py-3">
                <span className="font-medium">{student.name}</span>
                <span className="rounded-full bg-accent/10 px-3 py-1 text-sm font-semibold text-accent">
                  {student.schoolBalance} tokens
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel">
          <h2 className="font-display text-xl font-semibold">Quick inject</h2>
          <p className="mt-1 text-sm text-muted">
            {data.enableBehavior
              ? "Award behavior bonuses to students"
              : "Behavior module disabled in class settings"}
          </p>
          {data.enableBehavior ? (
            <button type="button" className="btn-primary mt-4 w-full">
              + Behavior bonus
            </button>
          ) : (
            <p className="mt-4 text-sm text-muted">Enable behavior in settings to use injectors.</p>
          )}
        </section>
      </div>
    </div>
  );
}
