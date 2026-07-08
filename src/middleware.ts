import { auth } from "@/auth";
import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);
const systemAdminRoles = new Set(["SUPER_ADMIN", "ADMIN", "SUPPORT"]);
const companyRoles = new Set([
  "OWNER",
  "ADMIN",
  "ACCOUNTANT",
  "FINANCE",
  "HR",
  "OPERATION",
  "STAFF",
  "VIEWER",
]);

const publicPaths = new Set(["", "/", "/login"]);

type UserLike = {
  role?: string;
  companyId?: string | null;
};

function stripLocale(pathname: string) {
  const [, maybeLocale, ...rest] = pathname.split("/");

  if (routing.locales.includes(maybeLocale as (typeof routing.locales)[number])) {
    return `/${rest.join("/")}`;
  }

  return pathname;
}

function localizedUrl(request: Request, path: string) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const [, maybeLocale] = pathname.split("/");
  const locale = routing.locales.includes(maybeLocale as (typeof routing.locales)[number])
    ? maybeLocale
    : routing.defaultLocale;

  url.pathname = `/${locale}${path}`;
  return url;
}

function isSystemAdminUser(user?: UserLike) {
  if (!user?.role || !systemAdminRoles.has(user.role)) {
    return false;
  }

  return !user.companyId;
}

function canAccessCompanyPath(user: UserLike | undefined, path: string) {
  const role = user?.role;

  if (!role || !companyRoles.has(role) || !user?.companyId) {
    return false;
  }

  if (role === "OWNER") {
    return true;
  }

  if (role === "VIEWER") {
    return ![
      "/documents/create",
      "/templates/create",
      "/templates/template-1/designer",
      "/templates/template-1/fields",
      "/approval-flows",
      "/document-number-settings",
      "/settings/users",
    ].some((blockedPath) => path.startsWith(blockedPath));
  }

  if (role === "STAFF") {
    return [
      "/dashboard",
      "/documents",
      "/documents/create",
      "/templates",
      "/business-partners",
    ].some((allowedPath) => path.startsWith(allowedPath));
  }

  if (role === "ACCOUNTANT" || role === "FINANCE") {
    return [
      "/dashboard",
      "/documents",
      "/documents/create",
      "/approvals",
      "/document-number-settings",
      "/reports",
    ].some((allowedPath) => path.startsWith(allowedPath));
  }

  if (role === "HR") {
    return [
      "/dashboard",
      "/documents",
      "/documents/create",
      "/employees",
      "/departments",
      "/approvals",
    ].some((allowedPath) => path.startsWith(allowedPath));
  }

  if (role === "OPERATION") {
    return [
      "/dashboard",
      "/documents",
      "/documents/create",
      "/approvals",
      "/reports",
    ].some((allowedPath) => path.startsWith(allowedPath));
  }

  if (role === "ADMIN") {
    return !path.startsWith("/settings/users");
  }

  return false;
}

export default auth((request) => {
  const path = stripLocale(request.nextUrl.pathname);
  const user = request.auth?.user as UserLike | undefined;

  if (publicPaths.has(path)) {
    return intlMiddleware(request);
  }

  if (!user) {
    return NextResponse.redirect(localizedUrl(request, "/login"));
  }

  if (isSystemAdminUser(user)) {
    if (!path.startsWith("/admin")) {
      return NextResponse.redirect(localizedUrl(request, "/admin/dashboard"));
    }

    return intlMiddleware(request);
  }

  if (path.startsWith("/admin")) {
    return NextResponse.redirect(localizedUrl(request, "/dashboard"));
  }

  if (!canAccessCompanyPath(user, path)) {
    return NextResponse.redirect(localizedUrl(request, "/dashboard"));
  }

  return intlMiddleware(request);
});

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
