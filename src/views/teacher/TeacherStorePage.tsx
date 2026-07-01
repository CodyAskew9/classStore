"use client";

import { useEffect, useState } from "react";

function formatUsd(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    cents / 100,
  );
}

interface StoreData {
  storeItems: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    stock: number;
  }[];
  supplyCatalog: {
    id: string;
    title: string;
    description: string | null;
    priceCents: number;
  }[];
}

export function TeacherStorePage() {
  const [data, setData] = useState<StoreData | null>(null);

  useEffect(() => {
    fetch("/api/teacher/store")
      .then((res) => res.json())
      .then(setData);
  }, []);

  if (!data) {
    return <p className="p-8 text-muted">Loading store…</p>;
  }

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold">Store</h1>
        <p className="mt-1 text-muted">Class inventory manager &amp; wholesale supply catalog</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="panel">
          <h2 className="font-display text-xl font-semibold">Class store (tokens)</h2>
          <ul className="mt-4 space-y-3">
            {data.storeItems.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between rounded-xl border border-border px-4 py-3"
              >
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-muted">{item.description}</p>
                </div>
                <div className="text-right text-sm">
                  <p className="font-semibold text-accent">{item.price} tokens</p>
                  <p className="text-muted">Stock: {item.stock}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel">
          <h2 className="font-display text-xl font-semibold">Supply catalog (USD)</h2>
          <p className="mt-1 text-sm text-muted">Teachers purchase physical rewards — prices in cents</p>
          <ul className="mt-4 space-y-3">
            {data.supplyCatalog.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between rounded-xl border border-border px-4 py-3"
              >
                <div>
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-sm text-muted">{item.description}</p>
                </div>
                <p className="font-semibold">{formatUsd(item.priceCents)}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
