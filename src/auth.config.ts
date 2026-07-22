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
            id: "668f191e810c19729de860e1",
            name: "System Admin",
            email: "admin@example.com",
            role: "SUPER_ADMIN"
          };
        }

        if (credentials?.email === "support@example.com" && credentials?.password === "password") {
          return {
            id: "668f191e810c19729de860e2",
            name: "Support Admin",
            email: "support@example.com",
            role: "SUPPORT"
          };
        }

        const companyUsers = {
          "owner@example.com": { id: "668f191e810c19729de860e3", name: "Company Owner", role: "OWNER" },
          "company-admin@example.com": { id: "668f191e810c19729de860e4", name: "Company Admin", role: "ADMIN" },
          "accountant@example.com": { id: "668f191e810c19729de860e5", name: "Accountant", role: "ACCOUNTANT" },
          "finance@example.com": { id: "668f191e810c19729de860e6", name: "Finance", role: "FINANCE" },
          "hr@example.com": { id: "668f191e810c19729de860e7", name: "HR", role: "HR" },
          "operation@example.com": { id: "668f191e810c19729de860e8", name: "Operation", role: "OPERATION" },
          "staff@example.com": { id: "668f191e810c19729de860e9", name: "Staff", role: "STAFF" },
          "viewer@example.com": { id: "668f191e810c19729de860eb", name: "Viewer", role: "VIEWER" },
        } as const;

        const email = credentials?.email as keyof typeof companyUsers | undefined;
        if (email && password === "password" && companyUsers[email]) {
          return {
            ...companyUsers[email],
            email,
            companyId: "668f191e810c19729de860ea",
          };
        }

        // Check if database user matches
        if (credentials?.email && credentials?.password) {
          const { prisma } = await import("@/lib/prisma");
          const bcrypt = await import("bcryptjs");
          const dbUser = await prisma.companyUser.findFirst({
            where: { 
              email: (credentials.email as string).toLowerCase(),
              status: "ACTIVE"
            }
          });

          if (dbUser && dbUser.passwordHash) {
            const passwordMatch = await bcrypt.compare(
              credentials.password as string,
              dbUser.passwordHash
            );
            if (passwordMatch) {
              return {
                id: dbUser.id,
                name: dbUser.name,
                email: dbUser.email,
                role: dbUser.role,
                companyId: dbUser.companyId
              };
            }
          }
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
