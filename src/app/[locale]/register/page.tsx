import { auth } from "@/auth"
import { redirect } from "next/navigation"
import RegisterForm from "./register-form"
import { Link } from "@/i18n/routing"
import { getTranslations } from "next-intl/server"

export default async function RegisterPage() {
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
    <div className="flex min-h-screen w-full items-center justify-center bg-radial from-slate-50 to-slate-200 p-4 dark:from-slate-900 dark:to-slate-950">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white/70 shadow-2xl backdrop-blur-md ring-1 ring-black/5 dark:bg-slate-900/70 dark:ring-white/10 transition-all duration-300">
        <div className="p-8">
          <div className="flex flex-col items-center mb-6">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-blue-600 to-teal-500 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-blue-500/20 mb-3 animate-pulse">
              P
            </div>
            <h1 className="text-3xl font-extrabold text-center bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
              {t("register")}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              สร้างบัญชีของคุณและเริ่มต้นใช้งานระบบบริหารจัดการเอกสาร
            </p>
          </div>
          
          <RegisterForm 
            labels={{
              email: t("email"),
              password: t("password"),
              register: t("register"),
              name: t("name"),
              phone: t("phone"),
              role: t("role"),
              businessName: t("businessName"),
              businessPhone: t("businessPhone"),
              businessType: t("businessType"),
              owner: t("owner"),
              accountant: t("accountant"),
              staff: t("staff"),
              accountingFirm: t("accountingFirm"),
              register_success: t("register_success")
            }} 
          />

          <div className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-4 text-center text-sm text-slate-600 dark:text-slate-400">
            <span>{t("have_account")}{" "}</span>
            <Link 
              href="/login" 
              className="font-semibold text-blue-600 hover:text-blue-500 transition-colors underline underline-offset-4"
            >
              {t("login")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
