"use client";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AvatarComposer } from "@/components/avatar/AvatarComposer";

interface DashboardData {
  name: string;
  className: string | null;
  avatarRenderPaths: string[];
  schoolBalance: number;
  homeBalance: number;
  checklist: { done: number; total: number } | null;
  recentSchool: { id: string; amount: number; description: string | null }[];
}

export function StudentDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/student/dashboard")
      .then(async (res) => {
        if (!res.ok) throw new Error("No student found. Run npm run db:seed.");
        return res.json() as Promise<DashboardData>;
      })
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"));
  }, []);

  if (error) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-10">
        <p className="text-muted">{error}</p>
      </div>
    );
  }

  if (!data) {
    return <p className="loading text-center text-muted">Loading dashboard…</p>;
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <section className="student-hero panel mb-8">
        <div className="student-hero-inner">
          <AvatarComposer renderPaths={data.avatarRenderPaths} size="xl" shape="portrait" />
          <div className="student-hero-copy">
            <p className="text-sm font-semibold uppercase tracking-wide text-gold">Your hero</p>
            <h1 className="font-display text-3xl font-bold sm:text-4xl">Hi, {data.name}</h1>
            <p className="mt-1 text-muted">{data.className ?? "Your class"}</p>
            <Link to="/student/avatar" className="btn-primary mt-5 inline-flex">
              Dress up
            </Link>
          </div>
        </div>
      </section>

      <div className="bento-grid">
        <article className="bento-card">
          <div>
            <p className="text-sm font-semibold text-muted">School wallet</p>
            <p className="mt-2 font-display text-4xl font-bold text-accent">{data.schoolBalance}</p>
            <p className="text-sm text-muted">classroom tokens</p>
          </div>
        </article>

        <article className="bento-card">
          <div>
            <p className="text-sm font-semibold text-muted">Home wallet</p>
            <p className="mt-2 font-display text-4xl font-bold">{data.homeBalance}</p>
            <p className="text-sm text-muted">premium parent ledger</p>
          </div>
        </article>

        <article className="bento-card sm:col-span-2">
          <div>
            <p className="text-sm font-semibold text-muted">This week&apos;s checklist</p>
            <p className="mt-2 font-display text-3xl font-bold">
              {data.checklist ? `${data.checklist.done}/${data.checklist.total}` : "—"}
            </p>
            <p className="text-sm text-muted">tasks complete</p>
          </div>
        </article>
      </div>

      <section className="panel mt-8">
        <h2 className="font-display text-xl font-semibold">Recent school activity</h2>
        <ul className="mt-4 divide-y divide-border">
          {data.recentSchool.map((tx) => (
            <li key={tx.id} className="flex justify-between py-3 text-sm">
              <span>{tx.description}</span>
              <span className={tx.amount >= 0 ? "font-semibold text-green-700" : "text-red-700"}>
                {tx.amount >= 0 ? "+" : ""}
                {tx.amount}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
