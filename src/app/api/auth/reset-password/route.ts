import { authMockResponse } from "@/lib/api-router";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  return authMockResponse("reset-password", {
    token: body?.token,
    reset: true,
  });
}
