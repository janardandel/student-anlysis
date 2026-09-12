// Talks to the Worker at api.classes.institute instead of connecting to the
// analytics Supabase project directly. That project's RLS now denies all
// direct authenticated/anon access — the Worker (using a service_role key)
// is the only path in, and every request is checked against the caller's
// own institute membership.
const API_BASE = 'https://api.classes.institute';
const STORAGE_KEY = 'moodle_reporting_session';

export interface InstituteInfo {
  id: string;
  name: string;
  code?: string;
  city?: string;
  logo_url?: string;
  moodle_url?: string;
}

export interface Membership {
  institute_id: string;
  role: 'owner' | 'teacher' | 'student';
  institutes?: InstituteInfo;
}

export interface Session {
  access_token: string;
  refresh_token: string;
  user: { id: string; email: string };
  memberships: Membership[];
}

export function getSession(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

function saveSession(session: Session) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEY);
}

export async function login(email: string, password: string): Promise<Session> {
  const res = await fetch(`${API_BASE}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed.');
  saveSession(data as Session);
  return data as Session;
}

// Unique list of institutes the current session has any membership in,
// derived from the login/verify response rather than queried directly.
export function institutesFromSession(session: Session): InstituteInfo[] {
  const byId = new Map<string, InstituteInfo>();
  for (const m of session.memberships) {
    if (m.institutes && !byId.has(m.institute_id)) {
      byId.set(m.institute_id, m.institutes);
    }
  }
  return Array.from(byId.values());
}

export function roleFor(session: Session, instituteId: string): Array<'owner' | 'teacher' | 'student'> {
  return session.memberships.filter((m) => m.institute_id === instituteId).map((m) => m.role);
}

async function authedFetch<T>(path: string, session: Session, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error((data && data.error) || `Request failed: ${path}`);
  return data as T;
}

export function fetchCourses<T = unknown[]>(session: Session, instituteId: string) {
  return authedFetch<T>(`/api/analytics/courses?institute_id=${encodeURIComponent(instituteId)}`, session);
}
export function fetchStudents<T = unknown[]>(session: Session, instituteId: string) {
  return authedFetch<T>(`/api/analytics/students?institute_id=${encodeURIComponent(instituteId)}`, session);
}
export function fetchQuizzes<T = unknown[]>(session: Session, instituteId: string) {
  return authedFetch<T>(`/api/analytics/quizzes?institute_id=${encodeURIComponent(instituteId)}`, session);
}
export function fetchQuizAttempts<T = unknown[]>(session: Session, instituteId: string) {
  return authedFetch<T>(`/api/analytics/quiz-attempts?institute_id=${encodeURIComponent(instituteId)}`, session);
}
export function fetchStudentPlans<T = unknown[]>(session: Session, instituteId: string) {
  return authedFetch<T>(`/api/analytics/student-plans?institute_id=${encodeURIComponent(instituteId)}`, session);
}
export function saveStudentPlan<T = unknown>(session: Session, plan: Record<string, unknown>) {
  return authedFetch<T>(`/api/analytics/student-plans`, session, {
    method: 'POST',
    body: JSON.stringify(plan),
  });
}
