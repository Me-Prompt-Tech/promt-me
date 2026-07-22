"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/routing";
import {
  User,
  Mail,
  Lock,
  Phone,
  Briefcase,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Building2,
  PhoneCall,
  Activity,
  ChevronRight,
  AlertCircle
} from "lucide-react";
import { signIn } from "next-auth/react";

function GoogleLogo({ className = "size-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

type RegisterLabels = {
  email: string;
  password: string;
  register: string;
  name: string;
  phone: string;
  role: string;
  businessName: string;
  businessPhone: string;
  businessType: string;
  owner: string;
  accountant: string;
  staff: string;
  accountingFirm: string;
  register_success: string;
};

type GoogleMockAccount = {
  name: string;
  email: string;
  role: string;
};

export default function RegisterForm({ labels }: { labels: RegisterLabels }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("OWNER"); // maps to CompanyUserRole enum
  
  // Business states
  const [businessName, setBusinessName] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [businessType, setBusinessType] = useState("บริษัทจำกัด");
  const [customBusinessType, setCustomBusinessType] = useState("");

  // Google sign up mock state
  const [isGoogleLinked, setIsGoogleLinked] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  const mockGoogleAccounts: GoogleMockAccount[] = [
    { name: "สมชาย รักดี (Somchai Rakdee)", email: "somchai.google@gmail.com", role: "OWNER" },
    { name: "พัชรา บัญชีดี (Patchara Bancheedee)", email: "patchara.google@gmail.com", role: "ACCOUNTANT" },
    { name: "นารี ออดิท (Naree Audit Firm)", email: "nareeaudit.google@gmail.com", role: "ACCOUNTANT" }
  ];

  const handleGoogleSelect = (account: GoogleMockAccount) => {
    setName(account.name);
    setEmail(account.email);
    setRole(account.role);
    setIsGoogleLinked(true);
    setShowGoogleModal(false);
    // Auto advance to step 2 with feedback
    setStep(2);
  };

  const validateStep1 = () => {
    if (!name.trim()) return "กรุณากรอกชื่อ-สกุล";
    if (!email.trim() || !email.includes("@")) return "กรุณากรอกอีเมลที่ถูกต้อง";
    if (!isGoogleLinked && password.length < 6) return "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร";
    if (!phone.trim()) return "กรุณากรอกเบอร์โทรศัพท์";
    return "";
  };

  const validateStep2 = () => {
    if (!businessName.trim()) return "กรุณากรอกชื่อธุรกิจ";
    if (!businessPhone.trim()) return "กรุณากรอกเบอร์โทรศัพท์ธุรกิจ";
    if (businessType === "อื่นๆ" && !customBusinessType.trim()) return "กรุณาระบุลักษณะธุรกิจของคุณ";
    return "";
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const err = validateStep1();
    if (err) {
      setError(err);
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const err = validateStep2();
    if (err) {
      setError(err);
      return;
    }

    setIsSubmitting(true);

    try {
      const finalBusinessType = businessType === "อื่นๆ" ? customBusinessType : businessType;
      
      const response = await fetch("/api/auth/register-company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password: isGoogleLinked ? "google-linked-random-password-123" : password,
          phone,
          role,
          businessName,
          businessPhone,
          businessType: finalBusinessType,
          isGoogleLinked
        })
      });

      const resData = await response.json();

      if (!response.ok || !resData.ok) {
        throw new Error(resData.message || "การลงทะเบียนล้มเหลว");
      }

      setSuccess(labels.register_success);
      
      // Auto login
      const loginRes = await signIn("credentials", {
        email,
        password: isGoogleLinked ? "google-linked-random-password-123" : password,
        redirect: false
      });

      if (loginRes?.error) {
        // Fallback redirection if auto login fails
        setTimeout(() => {
          router.push("/th/login");
        }, 1500);
      } else {
        setTimeout(() => {
          router.push("/th/dashboard");
          router.refresh();
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative">
      {/* Progress Indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400 dark:text-slate-500 mb-2">
          <span className={step === 1 ? "text-blue-600 dark:text-blue-400" : ""}>1. ข้อมูลผู้ใช้งาน</span>
          <span className={step === 2 ? "text-blue-600 dark:text-blue-400" : ""}>2. ข้อมูลธุรกิจ</span>
        </div>
        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-600 to-teal-500 transition-all duration-500 ease-out"
            style={{ width: `${step === 1 ? 50 : 100}%` }}
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-sm text-rose-600 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30 animate-shake">
          <AlertCircle className="size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {step === 1 ? (
        <form onSubmit={handleNext} className="space-y-4">
          {/* Google signup button */}
          {!isGoogleLinked ? (
            <button
              type="button"
              onClick={() => setShowGoogleModal(true)}
              className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-slate-200 bg-white p-2.5 text-sm font-semibold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 transition-all duration-200 cursor-pointer"
            >
              <GoogleLogo className="size-4" />
              <span>สมัครใช้งานด้วย Google</span>
            </button>
          ) : (
            <div className="flex items-center justify-between rounded-lg bg-blue-50/50 p-3 text-sm text-blue-700 dark:bg-blue-950/30 dark:text-blue-300 border border-blue-100 dark:border-blue-900/20">
              <div className="flex items-center gap-2">
                <GoogleLogo className="size-4 animate-pulse" />
                <span>เชื่อมโยงบัญชี Google สำเร็จ</span>
              </div>
              <button 
                type="button" 
                onClick={() => {
                  setIsGoogleLinked(false);
                  setName("");
                  setEmail("");
                  setPassword("");
                }}
                className="text-xs text-blue-600 hover:text-blue-500 underline cursor-pointer"
              >
                ยกเลิก
              </button>
            </div>
          )}

          <div className="relative flex items-center justify-center my-4">
            <span className="absolute inset-x-0 h-px bg-slate-100 dark:bg-slate-800" />
            <span className="relative bg-white px-3 text-xs text-slate-400 dark:bg-slate-950">หรือกรอกอีเมล</span>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-slate-700 dark:text-slate-300">{labels.name} <span className="text-red-500">*</span></label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ชื่อ และ นามสกุล ของคุณ"
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none ring-blue-500/20 focus:border-blue-500 focus:ring-4 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-600 transition"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-slate-700 dark:text-slate-300">{labels.email} <span className="text-red-500">*</span></label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isGoogleLinked}
                placeholder="example@domain.com"
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none ring-blue-500/20 focus:border-blue-500 focus:ring-4 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-600 disabled:bg-slate-50 dark:disabled:bg-slate-900/50 disabled:text-slate-400 transition"
              />
            </div>
          </div>

          {/* Password (only if not Google) */}
          {!isGoogleLinked && (
            <div>
              <label className="block text-sm font-semibold mb-1 text-slate-700 dark:text-slate-300">{labels.password} <span className="text-red-500">*</span></label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="อย่างน้อย 6 ตัวอักษร"
                  className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none ring-blue-500/20 focus:border-blue-500 focus:ring-4 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-600 transition"
                />
              </div>
            </div>
          )}

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-slate-700 dark:text-slate-300">{labels.phone} <span className="text-red-500">*</span></label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="เบอร์โทรศัพท์ที่ติดต่อได้"
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none ring-blue-500/20 focus:border-blue-500 focus:ring-4 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-600 transition"
              />
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-slate-700 dark:text-slate-300">{labels.role} <span className="text-red-500">*</span></label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-10 text-sm text-slate-900 outline-none ring-blue-500/20 focus:border-blue-500 focus:ring-4 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 transition"
              >
                <option value="OWNER">{labels.owner}</option>
                <option value="ACCOUNTANT">{labels.accountant}</option>
                <option value="STAFF">{labels.staff}</option>
                <option value="ACCOUNTING_FIRM">{labels.accountingFirm}</option>
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-500" />
            </div>
          </div>

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-teal-500 p-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:from-blue-700 hover:to-teal-600 focus:outline-none transition-all duration-300 active:translate-y-px mt-6 cursor-pointer"
          >
            <span>ถัดไป</span>
            <ArrowRight className="size-4" />
          </button>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-2 mb-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
            <Sparkles className="size-4 text-amber-500 shrink-0 animate-bounce" />
            <span className="text-xs text-slate-500 dark:text-slate-400">กรอกข้อมูลธุรกิจเพื่อสร้างพื้นที่ทำงานและเทมเพลตเริ่มต้นของคุณ</span>
          </div>

          {/* Business Name */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-slate-700 dark:text-slate-300">{labels.businessName} <span className="text-red-500">*</span></label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="ชื่อบริษัท / ร้านค้า / ชื่อกิจการ"
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none ring-blue-500/20 focus:border-blue-500 focus:ring-4 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-600 transition"
              />
            </div>
          </div>

          {/* Business Phone */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-slate-700 dark:text-slate-300">{labels.businessPhone} <span className="text-red-500">*</span></label>
            <div className="relative">
              <PhoneCall className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                value={businessPhone}
                onChange={(e) => setBusinessPhone(e.target.value)}
                placeholder="เบอร์โทรติดต่อธุรกิจ"
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none ring-blue-500/20 focus:border-blue-500 focus:ring-4 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-600 transition"
              />
            </div>
          </div>

          {/* Business Type / Characteristic */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-slate-700 dark:text-slate-300">{labels.businessType} <span className="text-red-500">*</span></label>
            <div className="relative">
              <Activity className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <select
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-10 text-sm text-slate-900 outline-none ring-blue-500/20 focus:border-blue-500 focus:ring-4 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 transition"
              >
                <option value="บริษัทจำกัด">บริษัทจำกัด (Co., Ltd.)</option>
                <option value="ห้างหุ้นส่วนจำกัด">ห้างหุ้นส่วนจำกัด (Partnership)</option>
                <option value="ร้านค้า/บุคคลธรรมดา">ร้านค้า / บุคคลธรรมดา</option>
                <option value="สำนักงานบัญชี">สำนักงานบัญชี / ผู้ทำบัญชีอิสระ</option>
                <option value="อื่นๆ">อื่นๆ (ระบุเอง)</option>
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-500" />
            </div>
          </div>

          {/* Custom Business Type if 'อื่นๆ' */}
          {businessType === "อื่นๆ" && (
            <div className="animate-fade-in">
              <label className="block text-sm font-semibold mb-1 text-slate-700 dark:text-slate-300">โปรดระบุลักษณะธุรกิจ <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={customBusinessType}
                onChange={(e) => setCustomBusinessType(e.target.value)}
                placeholder="เช่น ผลิตและขายส่งสินค้า, บริการให้คำปรึกษา"
                className="w-full rounded-lg border border-slate-200 bg-white py-2 px-4 text-sm text-slate-900 placeholder-slate-400 outline-none ring-blue-500/20 focus:border-blue-500 focus:ring-4 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-600 transition"
              />
            </div>
          )}

          <div className="flex gap-3 pt-6">
            <button
              type="button"
              onClick={() => {
                setError("");
                setStep(1);
              }}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white p-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 transition-all duration-200 active:translate-y-px cursor-pointer"
            >
              <ArrowLeft className="size-4" />
              <span>ย้อนกลับ</span>
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex flex-2 items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-teal-500 p-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:from-blue-700 hover:to-teal-600 disabled:opacity-50 disabled:pointer-events-none transition-all duration-300 active:translate-y-px cursor-pointer"
            >
              {isSubmitting ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>ยืนยันการสมัคร</span>
                  <CheckCircle2 className="size-4" />
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Google Mock Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-100 dark:border-slate-800 animate-zoom-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-50 dark:bg-red-950/30 rounded-lg">
                <GoogleLogo className="size-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-950 dark:text-white">เชื่อมต่อกับ Google</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">เลือกบัญชีจำลอง (Google Demo Account)</p>
              </div>
            </div>

            <div className="space-y-2 mt-4">
              {mockGoogleAccounts.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => handleGoogleSelect(account)}
                  className="flex w-full items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-blue-500 hover:bg-blue-50/20 dark:border-slate-800 dark:hover:border-blue-900/30 dark:hover:bg-blue-950/20 text-left transition-all duration-200 cursor-pointer"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{account.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{account.email}</p>
                  </div>
                  <ChevronRight className="size-4 text-slate-400" />
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowGoogleModal(false)}
              className="mt-6 w-full text-center text-xs text-slate-500 hover:text-slate-400 underline py-2 cursor-pointer"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
