import type { NextAuthConfig } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const password = credentials?.password;

        if (credentials?.email === "admin@example.com" && credentials?.password === "password") {
          return {
            id: "system-admin-1",
            name: "System Admin",
            email: "admin@example.com",
            role: "SUPER_ADMIN"
          };
        }

        if (credentials?.email === "support@example.com" && credentials?.password === "password") {
          return {
            id: "system-admin-support-1",
            name: "Support Admin",
            email: "support@example.com",
            role: "SUPPORT"
          };
        }

        const companyUsers = {
          "owner@example.com": { id: "company-user-owner", name: "Company Owner", role: "OWNER" },
          "company-admin@example.com": { id: "company-user-admin", name: "Company Admin", role: "ADMIN" },
          "accountant@example.com": { id: "company-user-accountant", name: "Accountant", role: "ACCOUNTANT" },
          "finance@example.com": { id: "company-user-finance", name: "Finance", role: "FINANCE" },
          "hr@example.com": { id: "company-user-hr", name: "HR", role: "HR" },
          "operation@example.com": { id: "company-user-operation", name: "Operation", role: "OPERATION" },
          "staff@example.com": { id: "company-user-staff", name: "Staff", role: "STAFF" },
          "viewer@example.com": { id: "company-user-viewer", name: "Viewer", role: "VIEWER" },
        } as const;

        const email = credentials?.email as keyof typeof companyUsers | undefined;
        if (email && password === "password" && companyUsers[email]) {
          return {
            ...companyUsers[email],
            email,
            companyId: "company-demo-1",
          };
        }

        return null;
      }
    })
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.companyId = user.companyId;
        token.id = user.id as string;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.companyId = token.companyId as string | undefined;
        session.user.id = token.id as string;
      }
      return session;
    }
  },
} satisfies NextAuthConfig;
