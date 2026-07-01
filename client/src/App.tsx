import { useCallback, useEffect, useState } from "react";
import {
  fetchDemoStudentId,
  fetchStudent,
  type AvatarConfig,
  type StudentProfile,
} from "./api";
import { AvatarComposer } from "./components/AvatarComposer";
import { AvatarPicker } from "./components/AvatarPicker";
import { IncomePanel } from "./components/IncomePanel";

export default function App() {
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStudent = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const id = await fetchDemoStudentId();
      const profile = await fetchStudent(id);
      setStudent(profile);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStudent();
  }, [loadStudent]);

  function handleAvatarChange(avatarConfig: AvatarConfig, avatarRenderPaths: string[]) {
    setStudent((prev) => (prev ? { ...prev, avatarConfig, avatarRenderPaths } : prev));
  }

  if (loading) {
    return (
      <div className="app-shell">
        <p className="loading">Loading your classroom…</p>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="app-shell">
        <div className="error-panel">
          <h1>ClassCrest</h1>
          <p>{error ?? "Could not load student profile."}</p>
          <p className="muted">
            Make sure the API is running (<code>cd server && npm run dev</code>) and
            seeded (<code>npm run db:seed</code>).
          </p>
          <button type="button" onClick={loadStudent}>
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="brand">
          <span className="brand-mark" aria-hidden>⛨</span>
          <div>
            <h1>ClassCrest</h1>
            <p className="muted">Student dashboard</p>
          </div>
        </div>
        <div className="student-chip">
          <AvatarComposer renderPaths={student.avatarRenderPaths} size="sm" className="chip-avatar-stack" />
          <span>{student.name}</span>
        </div>
      </header>

      <main className="dashboard-grid">
        <IncomePanel student={student} />
        <AvatarPicker student={student} onAvatarChange={handleAvatarChange} />
      </main>
    </div>
  );
}
