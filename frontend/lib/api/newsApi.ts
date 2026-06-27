import { getCookie } from "cookies-next";
import { AUTH_COOKIE } from "@/lib/authCookies";
import { isAuthTokenExpired } from "@/lib/authSession";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

function readAdminToken(): string {
  const token = getCookie(AUTH_COOKIE.TOKEN);
  if (typeof token !== "string" || token.length === 0 || isAuthTokenExpired(token)) {
    throw new AdminApiError("Not authenticated. Please sign in as an admin.");
  }
  return token;
}

export interface AdminNews {
  _id: string;
  title: string;
  description?: string;
  cta?: string;
  isActive: boolean;
  createdBy: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ListNewsResponse {
  news: AdminNews[];
}

export interface CreateNewsPayload {
  title: string;
  description?: string;
  cta?: string;
}

export interface UpdateNewsPayload {
  title?: string;
  description?: string;
  cta?: string;
}

export class AdminApiError extends Error {
  constructor(public message: string) {
    super(message);
  }
}

export async function listAdminNews(): Promise<ListNewsResponse> {
  if (!backendUrl) {
    throw new AdminApiError("Missing NEXT_PUBLIC_BACKEND_URL");
  }

  const res = await fetch(`${backendUrl}/api/news`, {
    method: "GET",
    headers: { accept: "application/json" },
    cache: "no-store",
  });

  const data = (await res.json().catch(() => ({}))) as ListNewsResponse & {
    error?: string;
  };

  if (!res.ok) {
    throw new AdminApiError(data.error ?? `Failed to load news (HTTP ${res.status})`);
  }

  return data;
}

export async function getAdminNews(id: string): Promise<{ news: AdminNews }> {
  if (!backendUrl) {
    throw new AdminApiError("Missing NEXT_PUBLIC_BACKEND_URL");
  }

  const res = await fetch(`${backendUrl}/api/news/${id}`, {
    method: "GET",
    headers: { accept: "application/json" },
    cache: "no-store",
  });

  const data = (await res.json().catch(() => ({}))) as { news: AdminNews } & {
    error?: string;
  };

  if (!res.ok) {
    throw new AdminApiError(data.error ?? `Failed to load news (HTTP ${res.status})`);
  }

  return data;
}

export async function createAdminNews(payload: CreateNewsPayload): Promise<{ news: AdminNews }> {
  if (!backendUrl) {
    throw new AdminApiError("Missing NEXT_PUBLIC_BACKEND_URL");
  }

  const token = readAdminToken();
  const res = await fetch(`${backendUrl}/api/news`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${token}`,
      sep_token: token,
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const data = (await res.json().catch(() => ({}))) as { news: AdminNews } & {
    error?: string;
  };

  if (!res.ok) {
    throw new AdminApiError(data.error ?? `Failed to create news (HTTP ${res.status})`);
  }

  return data;
}

export async function updateAdminNews(
  id: string,
  payload: UpdateNewsPayload
): Promise<{ news: AdminNews }> {
  if (!backendUrl) {
    throw new AdminApiError("Missing NEXT_PUBLIC_BACKEND_URL");
  }

  const token = readAdminToken();
  const res = await fetch(`${backendUrl}/api/news/${id}`, {
    method: "PATCH",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${token}`,
      sep_token: token,
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const data = (await res.json().catch(() => ({}))) as { news: AdminNews } & {
    error?: string;
  };

  if (!res.ok) {
    throw new AdminApiError(data.error ?? `Failed to update news (HTTP ${res.status})`);
  }

  return data;
}

export async function deleteAdminNews(id: string): Promise<{ message: string }> {
  if (!backendUrl) {
    throw new AdminApiError("Missing NEXT_PUBLIC_BACKEND_URL");
  }

  const token = readAdminToken();
  const res = await fetch(`${backendUrl}/api/news/${id}`, {
    method: "DELETE",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${token}`,
      sep_token: token,
    },
    cache: "no-store",
  });

  const data = (await res.json().catch(() => ({}))) as { message: string } & {
    error?: string;
  };

  if (!res.ok) {
    throw new AdminApiError(data.error ?? `Failed to delete news (HTTP ${res.status})`);
  }

  return data;
}

export async function activateAdminNews(id: string): Promise<{ news: AdminNews; message: string }> {
  if (!backendUrl) {
    throw new AdminApiError("Missing NEXT_PUBLIC_BACKEND_URL");
  }

  const token = readAdminToken();
  const res = await fetch(`${backendUrl}/api/news/${id}/activate`, {
    method: "POST",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${token}`,
      sep_token: token,
    },
    cache: "no-store",
  });

  const data = (await res.json().catch(() => ({}))) as { news: AdminNews; message: string } & {
    error?: string;
  };

  if (!res.ok) {
    throw new AdminApiError(data.error ?? `Failed to activate news (HTTP ${res.status})`);
  }

  return data;
}
