import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

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

  // Allow both authenticated and unauthenticated requests (pay-first registration flow)
  const response = await fetch(`${backendUrl}/api/stripe/sync-checkout-session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(session?.user?.backendToken
        ? { Authorization: `Bearer ${session.user.backendToken}` }
        : {}),
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
