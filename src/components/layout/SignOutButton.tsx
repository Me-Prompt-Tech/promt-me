"use client";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  return (
    <button onClick={() => signOut({ callbackUrl: "/login" })} className="text-gray-500 hover:text-gray-700">
      <LogOut size={20} />
    </button>
  );
}
