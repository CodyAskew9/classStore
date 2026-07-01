"use client";

import { useEffect, useState } from "react";

interface Job {
  id: string;
  title: string;
  description: string | null;
  weeklySalary: number;
  maxOpenings: number;
}

export function TeacherJobsPage() {
  const [jobs, setJobs] = useState<Job[] | null>(null);

  useEffect(() => {
    fetch("/api/teacher/jobs")
      .then((res) => res.json())
      .then((data: { jobs: Job[] }) => setJobs(data.jobs));
  }, []);

  if (!jobs) {
    return <p className="p-8 text-muted">Loading jobs…</p>;
  }

  return (
    <div className="p-8">
      <header className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Jobs</h1>
          <p className="mt-1 text-muted">Weekly classroom jobs &amp; salary builder</p>
        </div>
        <button type="button" className="btn-primary">
          + New job
        </button>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {jobs.map((job) => (
          <article key={job.id} className="panel">
            <h2 className="font-display text-lg font-semibold">{job.title}</h2>
            <p className="mt-1 text-sm text-muted">{job.description ?? "No description"}</p>
            <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <div>
                <dt className="text-muted">Weekly salary</dt>
                <dd className="font-semibold text-accent">{job.weeklySalary} tokens</dd>
              </div>
              <div>
                <dt className="text-muted">Openings</dt>
                <dd className="font-semibold">{job.maxOpenings}</dd>
              </div>
            </dl>
          </article>
        ))}
        {jobs.length === 0 && (
          <p className="text-muted">No jobs configured. Create one to start weekly payroll.</p>
        )}
      </div>
    </div>
  );
}
