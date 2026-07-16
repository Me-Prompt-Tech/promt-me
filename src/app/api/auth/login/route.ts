import { authMockResponse } from "@/lib/api-router";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  return authMockResponse("login", {
    token: "mock-session-token",
    user: {
      email: body?.email ?? "admin@example.com",
      role: body?.email === "admin@example.com" ? "SUPER_ADMIN" : "OWNER",
      companyId: body?.email === "admin@example.com" ? null : "668f191e810c19729de860ea",
    },
  });
}
