import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

function formatBackendError(data: unknown): string {
  if (!data || typeof data !== "object" || !("error" in data)) {
    return "Unable to start checkout";
  }
  const raw = (data as { error?: unknown }).error;
  if (typeof raw !== "string") return "Unable to start checkout";
  try {
    const parsed = JSON.parse(raw) as Array<{ path?: string[]; message?: string }>;
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed
        .map((issue) => {
          const path = issue.path?.length ? `${issue.path.join(".")}: ` : "";
          return `${path}${issue.message ?? "Invalid request"}`;
        })
        .join("; ");
    }
  } catch {
    /* plain string error from backend */
  }
  return raw;
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.backendToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!backendUrl) {
    return NextResponse.json({ error: "Missing NEXT_PUBLIC_BACKEND_URL" }, { status: 500 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const response = await fetch(`${backendUrl}/api/stripe/create-checkout-session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.user.backendToken}`,
    },
    body: JSON.stringify(body),
  });

  const data = (await response.json().catch(() => ({}))) as { error?: string; url?: string };
  if (!response.ok) {
    return NextResponse.json(
      { error: formatBackendError(data) },
      { status: response.status }
    );
  }
  return NextResponse.json(data, { status: response.status });
}
