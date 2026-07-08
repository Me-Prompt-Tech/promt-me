import { authMockResponse } from "@/lib/api-router";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  return authMockResponse("register-company", {
    companyId: "company_new",
    ownerUserId: "company_user_owner",
    ...body,
  });
}
