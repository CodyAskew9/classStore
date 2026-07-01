import { Link } from "react-router-dom";

export function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="panel w-full max-w-md">
        <h1 className="font-display text-2xl font-bold">Log in</h1>
        <p className="mt-2 text-sm text-muted">Auth flow placeholder — wire NextAuth or Clerk here.</p>
        <form className="mt-6 space-y-4">
          <label className="block text-sm font-medium">
            Email
            <input
              type="email"
              className="mt-1 w-full rounded-xl border border-border px-3 py-2"
              placeholder="you@school.edu"
            />
          </label>
          <label className="block text-sm font-medium">
            Password
            <input
              type="password"
              className="mt-1 w-full rounded-xl border border-border px-3 py-2"
            />
          </label>
          <button type="submit" className="btn-primary w-full">
            Sign in
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-muted">
          No account?{" "}
          <Link to="/register" className="font-semibold text-accent">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
