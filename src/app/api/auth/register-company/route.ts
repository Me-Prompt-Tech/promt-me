import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { CompanyUserRole, UserStatus } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    if (!body) {
      return NextResponse.json({ ok: false, message: "กรุณากรอกข้อมูลให้ครบถ้วน" }, { status: 400 });
    }

    const {
      name,
      email,
      password,
      phone,
      role,
      businessName,
      businessPhone,
      businessType,
      isGoogleLinked
    } = body;

    // Validate fields
    if (!name || !email || !password || !phone || !role || !businessName || !businessPhone) {
      return NextResponse.json({ ok: false, message: "กรุณากรอกข้อมูลในช่องที่จำเป็น (*) ให้ครบถ้วน" }, { status: 400 });
    }

    // Check if email already exists
    const existingUser = await prisma.companyUser.findFirst({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ ok: false, message: "อีเมลนี้เคยลงทะเบียนในระบบแล้ว" }, { status: 400 });
    }

    // Get default Free plan if it exists
    const freePlan = await prisma.plan.findFirst({
      where: { name: "Free" }
    });

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Map role
    let userRole: CompanyUserRole = CompanyUserRole.OWNER;
    if (role === "ACCOUNTANT") {
      userRole = CompanyUserRole.ACCOUNTANT;
    } else if (role === "STAFF") {
      userRole = CompanyUserRole.STAFF;
    } else if (role === "ACCOUNTING_FIRM") {
      userRole = CompanyUserRole.ACCOUNTANT; // Map Accounting Firm to Accountant role in DB
    }

    // Create Company and User in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Company
      const company = await tx.company.create({
        data: {
          name: businessName,
          phone: businessPhone,
          planId: freePlan?.id || undefined,
          status: "ACTIVE",
          settings: {
            businessType: businessType,
            registeredRole: role,
            isGoogleLinked: !!isGoogleLinked
          }
        }
      });

      // 2. Create CompanyUser
      const user = await tx.companyUser.create({
        data: {
          companyId: company.id,
          name: name,
          email: email.toLowerCase(),
          passwordHash: passwordHash,
          phone: phone,
          role: userRole,
          status: UserStatus.ACTIVE
        }
      });

      return { company, user };
    });

    return NextResponse.json({
      ok: true,
      data: {
        companyId: result.company.id,
        userId: result.user.id,
        name: result.user.name,
        email: result.user.email
      }
    });

  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json({
      ok: false,
      message: error.message || "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์ในการลงทะเบียน"
    }, { status: 500 });
  }
}
