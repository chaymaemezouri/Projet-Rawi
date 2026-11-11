export const TOKEN_KEY = "rawi_token";

export class ApiError extends Error {
  status: number;
  detail: unknown;

  constructor(status: number, detail: unknown) {
    super(typeof detail === "string" ? detail : "Request failed");
    this.status = status;
    this.detail = detail;
  }
}

export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError && typeof error.detail === "string") {
    return error.detail;
  }
  return fallback;
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body) {
    headers.set("Content-Type", "application/json");
  }
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(path, { ...options, headers });
  if (response.status === 401 && !path.startsWith("/api/auth/login") && !path.startsWith("/api/auth/register")) {
    localStorage.removeItem(TOKEN_KEY);
    window.dispatchEvent(new Event("rawi:unauthorized"));
  }
  if (!response.ok) {
    const text = await response.text();
    let detail: unknown = text || response.statusText;
    try {
      const parsed = JSON.parse(text) as { detail?: unknown };
      detail = parsed.detail ?? parsed;
    } catch {
      detail = text || response.statusText;
    }
    throw new ApiError(response.status, detail);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}
