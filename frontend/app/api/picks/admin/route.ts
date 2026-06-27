import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function GET(req: Request) {
  const session = await auth();

  if (!backendUrl) {
    return NextResponse.json({ error: "Missing NEXT_PUBLIC_BACKEND_URL" }, { status: 500 });
  }

  const url = new URL(req.url);

  // For authenticated requests, pass through to backend with auth
  if (session?.user?.backendToken) {
    const backendUrl_ = new URL(`${backendUrl}/api/picks/paid/admin`);

    // Copy search params
    for (const [key, value] of url.searchParams) {
      backendUrl_.searchParams.append(key, value);
    }

    const response = await fetch(backendUrl_.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.user.backendToken}`,
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  }

  // For unauthenticated requests, use public API
  const publicUrl = new URL(`${backendUrl}/api/picks`);

  // Copy search params
  for (const [key, value] of url.searchParams) {
    publicUrl.searchParams.append(key, value);
  }

  const response = await fetch(publicUrl.toString(), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
