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

  if (!backendUrl) {
    return NextResponse.json({ error: "Missing NEXT_PUBLIC_BACKEND_URL" }, { status: 500 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Add userId and email for authenticated users
  if (session?.user?.backendToken) {
    // Add email from session
    const sessionEmail = (session.user as any)?.email;
    if (sessionEmail) {
      body.email = sessionEmail;
    }

    try {
      const userResponse = await fetch(`${backendUrl}/api/user/profile`, {
        headers: {
          Authorization: `Bearer ${session.user.backendToken}`,
        },
      });
      const userData = await userResponse.json();
      if (userData?._id) {
        body.userId = userData._id;
      }
      // Also get email from profile if not already set
      if (!body.email && userData?.email) {
        body.email = userData.email;
      }
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
    }
  }

  // Send request to backend with optional authentication header
  const response = await fetch(`${backendUrl}/api/stripe/create-checkout-session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(session?.user?.backendToken
        ? { Authorization: `Bearer ${session.user.backendToken}` }
        : {}),
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
