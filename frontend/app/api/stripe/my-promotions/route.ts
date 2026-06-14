import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function GET() {
  const session = await auth();
  if (!session?.user?.backendToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const response = await fetch(`${backendUrl}/api/stripe/my-promotions`, {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${session.user.backendToken}`,
    },
    cache: "no-store",
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
