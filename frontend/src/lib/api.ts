/**
 * Centralized API client for CareAxis frontend.
 *
 * In development, VITE_API_URL is not set, so requests use the Vite proxy
 * (/api → http://localhost:4000) defined in vite.config.ts.
 *
 * In production (Railway), set VITE_API_URL to the backend service URL,
 * e.g. https://careaxis-api.up.railway.app
 */
const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? '';

/** Read the JWT token from the Zustand persisted store in localStorage. */
function getToken(): string | null {
  try {
    const raw = localStorage.getItem('careaxis-auth');
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: { token?: string | null } };
    return parsed?.state?.token ?? null;
  } catch {
    return null;
  }
}

async function request(method: string, path: string, body?: unknown): Promise<Response> {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // Guard against HTML responses (e.g. the static server returning index.html
  // for unknown routes), which would cause a misleading JSON-parse error.
  const contentType = res.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json') && !res.ok) {
    throw new Error(`Server returned ${res.status} (${res.statusText}). Check that VITE_API_URL points to the backend.`);
  }

  return res;
}

export const api = {
  get: (path: string) => request('GET', path),
  post: (path: string, body: unknown) => request('POST', path, body),
  patch: (path: string, body: unknown) => request('PATCH', path, body),
  del: (path: string) => request('DELETE', path),
};
