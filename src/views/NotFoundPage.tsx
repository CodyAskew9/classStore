import Link from "next/link";

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <h1 className="font-display text-4xl font-bold">Page not found</h1>
      <p className="mt-2 text-muted">That route doesn&apos;t exist in ClassCrest.</p>
      <Link href="/" className="btn-primary mt-6">
        Back home
      </Link>
    </div>
  );
}
