import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function getAdminSession() {
  return auth();
}

export async function requireAdminSession() {
  const session = await auth();

  if (!session?.user) {
    throw new Response("Unauthorized", { status: 401 });
  }

  return session;
}

export function apiError(error: unknown) {
  if (error instanceof Response) {
    return new NextResponse(error.statusText || "Unauthorized", { status: error.status });
  }

  console.error("API error:", error);

  const message = error instanceof Error ? error.message : String(error);
  const body: Record<string, string> = { error: message };

  if (process.env.NODE_ENV !== "production") {
    body.details = error instanceof Error ? error.stack ?? message : message;
  }

  return NextResponse.json(body, { status: 500 });
}
