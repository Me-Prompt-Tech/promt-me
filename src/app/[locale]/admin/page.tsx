import { redirect } from "@/i18n/routing";

export default function AdminPage({
  params: { locale }
}: {
  params: { locale: string };
}) {
  redirect({ href: "/admin/dashboard", locale });
}
