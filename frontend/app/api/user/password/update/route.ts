import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.backendToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const response = await fetch(`${backendUrl}/api/user/password/update`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.user.backendToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}

