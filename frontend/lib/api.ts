import { Subscription, User } from "@/types";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export const apiFetch = async <T>(
  path: string,
  token?: string,
  options?: RequestInit
): Promise<T> => {
  const res = await fetch(`${backendUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers ?? {}),
    },
    cache: "no-store",
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Request failed");
  return data;
};

export const userApi = {
  getProfile: (token: string) => apiFetch<{ user: User }>("/api/user/profile", token),
  updateProfile: (token: string, body: Partial<User>) =>
    apiFetch<{ user: User }>("/api/user/profile", token, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
};

export const stripeApi = {
  getSubscription: (token: string) =>
    apiFetch<{ subscription: Subscription }>("/api/stripe/subscription", token),
};
