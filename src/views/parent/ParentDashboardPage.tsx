"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface ChildData {
  id: string;
  name: string;
  className: string | null;
  homeBalance: number;
  homeActivity: { id: string; amount: number; description: string | null }[];
}

export function ParentDashboardPage() {
  const [children, setChildren] = useState<ChildData[] | null>(null);

  useEffect(() => {
    fetch("/api/parent/dashboard")
      .then((res) => res.json())
      .then((data: { children: ChildData[] }) => setChildren(data.children));
  }, []);

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl text-gold" aria-hidden>
              ⛨
            </span>
            <div>
              <p className="font-display text-lg font-bold">ClassCrest</p>
              <p className="text-xs text-muted">Parent portal</p>
            </div>
          </div>
          <Link href="/login" className="text-sm font-semibold text-muted">
            Account
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="font-display text-3xl font-bold">Home wallet</h1>
        <p className="mt-1 text-muted">Chore tracking &amp; allowance — isolated from school ledger</p>

        <div className="mt-8 space-y-6">
          {!children && <p className="text-muted">Loading…</p>}
          {children?.length === 0 && <p className="text-muted">Link a child to get started.</p>}
          {children?.map((child) => (
            <section key={child.id} className="panel">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-xl font-semibold">{child.name}</h2>
                  <p className="text-sm text-muted">{child.className ?? "School class"}</p>
                </div>
                <div className="rounded-2xl bg-gold/15 px-4 py-2 text-center">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">Home balance</p>
                  <p className="font-display text-3xl font-bold">{child.homeBalance}</p>
                </div>
              </div>
              <ul className="mt-4 divide-y divide-border">
                {child.homeActivity.length === 0 && (
                  <li className="py-3 text-sm text-muted">No home wallet activity yet.</li>
                )}
                {child.homeActivity.map((tx) => (
                  <li key={tx.id} className="flex justify-between py-3 text-sm">
                    <span>{tx.description}</span>
                    <span className="font-semibold">+{tx.amount}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
