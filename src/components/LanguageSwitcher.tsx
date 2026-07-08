"use client";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { ChangeEvent } from "react";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLocaleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const nextLocale = e.target.value as "th" | "en";
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <select 
      value={locale} 
      onChange={handleLocaleChange}
      className="bg-white border rounded px-2 py-1 text-sm text-black"
    >
      <option value="th">ไทย</option>
      <option value="en">EN</option>
    </select>
  );
}
