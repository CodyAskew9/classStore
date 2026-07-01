import { Link } from "react-router-dom";

export function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="panel w-full max-w-md">
        <h1 className="font-display text-2xl font-bold">Create account</h1>
        <p className="mt-2 text-sm text-muted">Teachers, students, and parents register here.</p>
        <form className="mt-6 space-y-4">
          <label className="block text-sm font-medium">
            Name
            <input type="text" className="mt-1 w-full rounded-xl border border-border px-3 py-2" />
          </label>
          <label className="block text-sm font-medium">
            Email
            <input type="email" className="mt-1 w-full rounded-xl border border-border px-3 py-2" />
          </label>
          <label className="block text-sm font-medium">
            Role
            <select className="mt-1 w-full rounded-xl border border-border px-3 py-2">
              <option value="TEACHER">Teacher</option>
              <option value="STUDENT">Student</option>
              <option value="PARENT">Parent</option>
            </select>
          </label>
          <button type="submit" className="btn-primary w-full">
            Register
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-accent">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
