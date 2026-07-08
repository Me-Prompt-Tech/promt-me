import { authMockResponse } from "@/lib/api-router";

export async function POST() {
  return authMockResponse("logout");
}
