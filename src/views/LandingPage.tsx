import { Link } from "react-router-dom";

export function LandingPage() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl text-gold" aria-hidden>
            ⛨
          </span>
          <div>
            <p className="font-display text-2xl font-bold">ClassCrest</p>
            <p className="text-sm text-muted">Classroom economy &amp; behavior platform</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link to="/login" className="btn-ghost">
            Log in
          </Link>
          <Link to="/register" className="btn-primary">
            Get started
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-20 pt-10">
        <section className="panel max-w-3xl">
          <h1 className="font-display text-4xl font-bold leading-tight">
            Token economies, stores, and jobs — built for classrooms
          </h1>
          <p className="mt-4 text-lg text-muted">
            Teachers run the school wallet. Parents unlock the home wallet with premium chores
            and allowance. Physical supply orders use USD cents — never floating-point money.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/teacher/dashboard" className="btn-primary">
              Teacher portal
            </Link>
            <Link to="/student/dashboard" className="btn-ghost">
              Student portal
            </Link>
            <Link to="/parent/dashboard" className="btn-ghost">
              Parent portal
            </Link>
          </div>
        </section>

        <section className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Dual wallets",
              body: "School and home ledgers stay isolated — domestic balances never touch district records.",
            },
            {
              title: "Modular toggles",
              body: "Run store-only, behavior-only, or the full economy per class.",
            },
            {
              title: "Weekly payroll",
              body: "Incomplete chores reduce this week's paycheck, never historical balance.",
            },
          ].map((card) => (
            <article key={card.title} className="panel">
              <h2 className="font-display text-xl font-semibold">{card.title}</h2>
              <p className="mt-2 text-sm text-muted">{card.body}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
