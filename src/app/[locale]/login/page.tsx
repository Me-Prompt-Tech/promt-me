import { auth } from "@/auth"
import { redirect } from "next/navigation"
import LoginForm from "./login-form"

import { getTranslations } from "next-intl/server"

export default async function LoginPage() {
  const session = await auth()
  
  if (session) {
    if (session.user.role === "SUPER_ADMIN" || session.user.role === "ADMIN") {
      redirect("/admin/dashboard")
    } else {
      redirect("/dashboard")
    }
  }

  const t = await getTranslations("Auth")

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Promt-Me SaaS</h1>
        <LoginForm 
          labels={{
            email: t("email"),
            password: t("password"),
            login: t("login"),
            invalid_credentials: t("invalid_credentials")
          }} 
        />
      </div>
    </div>
  )
}
