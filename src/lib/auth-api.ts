export type AuthRole = "TEACHER" | "PARENT" | "STUDENT";

export interface AuthUser {
  id: string;
  name: string;
  email: string | null;
  role: AuthRole;
}

export interface ClassRosterStudent {
  id: string;
  name: string;
}

export interface ClassByCodeResponse {
  classId: string;
  className: string;
  joinCode: string;
  students: ClassRosterStudent[];
}

async function parseError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { error?: string };
    return data.error ?? "Something went wrong";
  } catch {
    return "Something went wrong";
  }
}

export async function loginWithEmail(
  email: string,
  password: string,
): Promise<{ user: AuthUser }> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role: "TEACHER" | "PARENT";
  className?: string;
}

export async function registerAccount(input: RegisterInput): Promise<{ user: AuthUser }> {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function logout(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST" });
}

export async function fetchCurrentUser(): Promise<AuthUser | null> {
  const res = await fetch("/api/auth/me");
  if (res.status === 401) return null;
  if (!res.ok) throw new Error(await parseError(res));
  const data = (await res.json()) as { user: AuthUser };
  return data.user;
}

export async function fetchClassByCode(joinCode: string): Promise<ClassByCodeResponse> {
  const res = await fetch(`/api/classes/by-code/${encodeURIComponent(joinCode)}`);
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function loginAsStudent(
  joinCode: string,
  studentId: string,
): Promise<{ user: AuthUser }> {
  const res = await fetch("/api/auth/student/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ joinCode, studentId }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}
