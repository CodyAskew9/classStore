import Link from "next/link";

const ROLES = [
  {
    to: "/login/teacher",
    title: "Teacher",
    description: "Sign in with your school email and password.",
    emoji: "📚",
  },
  {
    to: "/login/parent",
    title: "Parent",
    description: "Sign in with email to view your child's wallet.",
    emoji: "🏠",
  },
  {
    to: "/student/join",
    title: "Student",
    description: "Scan your class QR code or type the class code — no email needed.",
    emoji: "⚔️",
  },
] as const;

export function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-10">
      <div className="w-full max-w-lg">
        <div className="text-center">
          <Link href="/" className="font-display text-2xl font-bold text-ink">
            ClassCrest
          </Link>
          <h1 className="mt-6 font-display text-3xl font-bold">Welcome back</h1>
          <p className="mt-2 text-muted">Choose how you sign in</p>
        </div>

        <div className="mt-8 space-y-3">
          {ROLES.map((role) => (
            <Link
              key={role.to}
              href={role.to}
              className="auth-role-card panel flex items-start gap-4 transition hover:-translate-y-0.5 hover:border-accent"
            >
              <span className="text-3xl" aria-hidden>
                {role.emoji}
              </span>
              <span>
                <span className="font-display text-lg font-semibold">{role.title}</span>
                <span className="mt-1 block text-sm text-muted">{role.description}</span>
              </span>
            </Link>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-muted">
          New teacher or parent?{" "}
          <Link href="/register" className="font-semibold text-accent">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
