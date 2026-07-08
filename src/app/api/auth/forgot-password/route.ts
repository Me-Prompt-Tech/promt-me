import { authMockResponse } from "@/lib/api-router";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  return authMockResponse("forgot-password", {
    email: body?.email,
    sent: true,
  });
}
