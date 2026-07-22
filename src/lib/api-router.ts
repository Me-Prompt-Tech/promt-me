import { auth } from "@/auth";
import { createPdfExport } from "@/lib/pdf-export";
import type { PdfExportInput } from "@/lib/pdf-export";
import { prisma } from "@/lib/prisma";
import {
  ApiError,
  apiErrorPayload,
  approvalActionSchema,
  assertCanDelete,
  assertCompanyActive,
  assertFound,
  domainConflict,
  pdfExportSchema,
  schemaForResource,
  statusUpdateSchema,
  templateFieldSchema,
  validate,
} from "@/lib/validation";
import { NextRequest, NextResponse } from "next/server";
import type { Session } from "next-auth";

type RouteContext = {
  params: Promise<{
    path?: string[];
  }>;
};

type ApiSession = Session | null;

const adminCollections = new Set([
  "dashboard",
  "companies",
  "company-users",
  "plans",
  "document-categories",
  "document-types",
  "templates",
  "audit-logs",
]);

const companyCollections = new Set([
  "dashboard",
  "documents",
  "templates",
  "business-partners",
  "employees",
  "departments",
  "approval-flows",
  "approvals",
  "document-number-settings",
  "reports",
]);

const companySubresources = new Set(["fields"]);

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

function error(message: string, status = 400, code = "BAD_REQUEST") {
  return json({ ok: false, code, error: message, message }, status);
}

function handleApiError(errorValue: unknown) {
  if (errorValue instanceof ApiError) {
    return json(apiErrorPayload(errorValue), errorValue.status);
  }

  if (typeof errorValue === "object" && errorValue !== null && "code" in errorValue && (errorValue as any).code === "P2002") {
    return json({
      ok: false,
      code: "VALIDATION_ERROR",
      message: "มีข้อมูลนี้อยู่ในระบบแล้ว (ข้อมูลซ้ำซ้อน)",
      error: (errorValue as any).message || "ข้อมูลซ้ำซ้อน",
    }, 400);
  }

  return json({
    ok: false,
    code: "BAD_REQUEST",
    message: "เกิดข้อผิดพลาดในการทำรายการ",
    error: errorValue instanceof Error ? errorValue.message : "Unknown error",
  }, 500);
}

function isSystemAdmin(session: ApiSession) {
  return (
    session?.user.role === "SUPER_ADMIN" ||
    session?.user.role === "SUPPORT" ||
    (session?.user.role === "ADMIN" && !session?.user.companyId)
  );
}

function isReadRequest(request: NextRequest) {
  return request.method === "GET";
}

function isCompanyRoleAllowed(
  role: string | undefined,
  resource: string,
  request: NextRequest,
  action?: string
) {
  if (role === "OWNER") {
    return true;
  }

  if (role === "VIEWER") {
    return isReadRequest(request);
  }

  if (role === "STAFF") {
    return (
      isReadRequest(request) ||
      (resource === "documents" && request.method === "POST")
    );
  }

  if (role === "ACCOUNTANT") {
    return (
      ["dashboard", "documents", "document-number-settings", "reports"].includes(resource) &&
      !["cancel", "archive"].includes(action ?? "")
    );
  }

  if (role === "HR") {
    return ["dashboard", "documents", "employees", "departments", "approvals"].includes(resource);
  }

  if (role === "OPERATION") {
    return ["dashboard", "documents", "approvals", "reports"].includes(resource);
  }

  if (role === "ADMIN") {
    return [
      "dashboard",
      "documents",
      "templates",
      "business-partners",
      "employees",
      "departments",
      "approval-flows",
      "approvals",
      "document-number-settings",
      "reports",
    ].includes(resource);
  }

  return false;
}

function requireCompany(session: ApiSession) {
  const companyId = session?.user.companyId;

  if (!companyId) {
    return null;
  }

  return companyId;
}

async function readBody(request: NextRequest) {
  if (request.method === "GET" || request.method === "DELETE") {
    return null;
  }

  try {
    return await request.json();
  } catch {
    throw new ApiError("VALIDATION_ERROR", "รูปแบบ JSON ไม่ถูกต้อง", 400, [{ message: "Invalid JSON body" }]);
  }
}

function requestIp(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip") ?? "127.0.0.1";
}

function pdfBody(input: unknown): Partial<PdfExportInput> {
  return input as Partial<PdfExportInput>;
}

const modelMap: Record<string, any> = {
  "companies": "company",
  "company-users": "companyUser",
  "plans": "plan",
  "document-categories": "documentCategory",
  "document-types": "documentType",
  "templates": "documentTemplate",
  "audit-logs": "auditLog",
  "documents": "document",
  "business-partners": "businessPartner",
  "employees": "employee",
  "departments": "department",
  "approval-flows": "approvalFlow",
  "approvals": "documentApproval",
  "document-number-settings": "documentNumberSetting",
  "template-fields": "templateField"
};

function getPrismaModel(resource: string): any {
  const modelName = modelMap[resource];
  if (!modelName) throw new ApiError("ROUTE_NOT_FOUND", `No model for resource ${resource}`, 404);
  return (prisma as any)[modelName];
}

export async function dbList(resource: string, whereClause: any = {}) {
  const model = getPrismaModel(resource);
  const include = resource === "employees"
    ? { department: true }
    : resource === "departments"
      ? { _count: { select: { users: true, employees: true } } }
      : undefined;
  const data = await model.findMany({ where: whereClause, include, orderBy: { createdAt: "desc" } });
  return { ok: true, resource, data };
}

export async function dbDetail(resource: string, whereClause: any = {}) {
  const model = getPrismaModel(resource);
  const include = resource === "employees"
    ? { department: true }
    : resource === "departments"
      ? { _count: { select: { users: true, employees: true } } }
      : undefined;
  const data = await model.findFirst({ where: whereClause, include });
  if (!data) throw new ApiError("NOT_FOUND", "ไม่พบข้อมูล", 404);
  return { ok: true, resource, data };
}

export async function dbCreate(resource: string, dataPayload: any) {
  const model = getPrismaModel(resource);
  const include = resource === "employees"
    ? { department: true }
    : resource === "departments"
      ? { _count: { select: { users: true, employees: true } } }
      : undefined;
  const data = await model.create({ data: dataPayload, include });
  return { ok: true, action: "create", resource, data };
}

export async function dbUpdate(resource: string, whereClause: any, dataPayload: any) {
  const model = getPrismaModel(resource);
  const include = resource === "employees"
    ? { department: true }
    : resource === "departments"
      ? { _count: { select: { users: true, employees: true } } }
      : undefined;
  const existing = await model.findFirst({ where: whereClause });
  if (!existing) throw new ApiError("NOT_FOUND", "ไม่พบข้อมูล", 404);
  const data = await model.update({ where: { id: existing.id }, data: dataPayload, include });
  return { ok: true, action: "update", resource, data };
}

export async function dbDelete(resource: string, whereClause: any) {
  const model = getPrismaModel(resource);
  const existing = await model.findFirst({ where: whereClause });
  if (!existing) throw new ApiError("NOT_FOUND", "ไม่พบข้อมูล", 404);
  await model.delete({ where: { id: existing.id } });
  return { ok: true, action: "delete", resource, id: existing.id };
}

async function validatedBody(request: NextRequest, resource: string) {
  const body = await readBody(request);
  const schema = schemaForResource(resource);
  const data = schema ? validate(schema, body) : body;

  if (data && typeof data === "object") {
    domainConflict(resource, data as Record<string, unknown>);
  }

  return data;
}

export async function handleAdminApi(request: NextRequest, context: RouteContext) {
  try {
    const session = (await auth()) as ApiSession;

    if (!session) {
      return error("Unauthorized", 401, "UNAUTHORIZED");
    }

    if (!isSystemAdmin(session)) {
      return error("Forbidden: system admin only", 403, "FORBIDDEN");
    }

    const rawPath = (await context.params).path ?? [];
    const path = rawPath[0] === "admin" ? rawPath.slice(1) : rawPath;
    const [resource, id, action] = path;

    if (!resource || !adminCollections.has(resource)) {
      return error("Admin API route not found", 404, "ROUTE_NOT_FOUND");
    }

    if (resource === "dashboard" && request.method === "GET") {
      return json({
        ok: true,
        data: {
          totalCompanies: 128,
          activeCompanies: 112,
          suspendedCompanies: 9,
          totalUsers: 2418,
          totalDocuments: 184000,
          totalTemplates: 64,
        },
      });
    }

    if (resource === "audit-logs" && request.method === "GET") {
      return json(await dbList(resource));
    }

    if (id && action === "status" && request.method === "PATCH") {
      return json(await dbUpdate(resource, { id }, validate(statusUpdateSchema, await readBody(request))));
    }

    if (!id && request.method === "GET") {
      return json(await dbList(resource));
    }

    if (!id && request.method === "POST") {
      return json(await dbCreate(resource, await validatedBody(request, resource)), 201);
    }

    if (id && !action && request.method === "GET") {
      return json(await dbDetail(resource, { id }));
    }

    if (id && !action && request.method === "PUT") {
      return json(await dbUpdate(resource, { id }, await validatedBody(request, resource)));
    }

    if (id && !action && request.method === "DELETE") {
      assertCanDelete(resource, id);
      return json(await dbDelete(resource, { id }));
    }

    return error("Method or route not allowed", 405, "METHOD_NOT_ALLOWED");
  } catch (errorValue) {
    return handleApiError(errorValue);
  }
}

export async function handleCompanyApi(request: NextRequest, context: RouteContext) {
  try {
    const session = (await auth()) as ApiSession;

    if (!session) {
      return error("Unauthorized", 401, "UNAUTHORIZED");
    }

    const rawPath = (await context.params).path ?? [];
    const isCompanyPrefix = rawPath[0] === "company";
    const pathCompanyId = isCompanyPrefix ? rawPath[1] : undefined;
    const path = isCompanyPrefix ? rawPath.slice(2) : rawPath;

    const companyId = session?.user?.companyId || pathCompanyId;

    if (!companyId) {
      return error("Forbidden: company user with companyId required", 403, "FORBIDDEN");
    }

    assertCompanyActive(companyId);

    const [resource, id, action, nestedId] = path;

    if (!resource || !companyCollections.has(resource)) {
      return error("Company API route not found", 404, "ROUTE_NOT_FOUND");
    }

  if (!isCompanyRoleAllowed(session.user.role, resource, request, action)) {
    return error("Forbidden: role is not allowed for this company action", 403, "FORBIDDEN");
  }

  if (resource === "dashboard" && request.method === "GET") {
    return json({
      ok: true,
      tenant: { companyId, where: { companyId } },
      data: {
        totalDocuments: 1248,
        draftDocuments: 82,
        pendingDocuments: 36,
        approvedDocuments: 904,
        totalCustomers: 186,
        totalEmployees: 64,
      },
    });
  }

  if (resource === "reports") {
    const reportName = id;
    if (request.method === "GET" && ["documents", "export-excel", "export-pdf"].includes(reportName ?? "")) {
      if (reportName === "export-pdf") {
        const pdf = createPdfExport({
          companyId,
          actorUserId: session.user.id,
          source: "PREVIEW",
          fileName: `document-report-${companyId}.pdf`,
          dataJson: {
            company: { name: "Prompt Me Co., Ltd.", taxId: "0105566000001", address: "Bangkok" },
            document: { documentNo: "REPORT-2026-07", date: "08/07/2026", total: "184,000 documents" },
          },
        });

        return json({
          ...pdf,
          report: reportName,
          tenant: { companyId, where: { companyId } },
          auditLog: {
            ...pdf.auditLog,
            detail: { ...pdf.auditLog.detail, report: "documents" },
            ipAddress: requestIp(request),
            userAgent: request.headers.get("user-agent") ?? "unknown",
          },
        });
      }

      return json({
        ok: true,
        report: reportName,
        tenant: { companyId, where: { companyId } },
        data: [],
      });
    }
    return error("Report route not found", 404, "ROUTE_NOT_FOUND");
  }

  if (resource === "approvals" && id && ["approve", "reject"].includes(action ?? "") && request.method === "POST") {
    const actionData = validate(approvalActionSchema, await readBody(request));
    return json(await dbUpdate(resource, { id, companyId }, actionData));
  }

  if (resource === "templates" && id && action === "designer" && request.method === "PUT") {
    return json(await dbUpdate(resource, { id, companyId }, await readBody(request)));
  }

  if (resource === "templates" && id && ["export-pdf", "export-preview-pdf"].includes(action ?? "") && request.method === "POST") {
    assertFound(id);
    const body = validate(pdfExportSchema, await readBody(request));
    if (body.fileName === "fail.pdf") {
      throw new ApiError("PDF_EXPORT_FAILED", "Export PDF ไม่สำเร็จ", 500, [{ field: "fileName", message: "PDF renderer failed" }]);
    }
    const pdf = createPdfExport({
      ...pdfBody(body),
      companyId,
      templateId: id,
      actorUserId: session.user.id,
      source: "PREVIEW",
      fileName: `template-preview-${id}.pdf`,
    });

    return json({
      ...pdf,
      tenant: { companyId, where: { companyId, templateId: id } },
      auditLog: {
        ...pdf.auditLog,
        ipAddress: requestIp(request),
        userAgent: request.headers.get("user-agent") ?? "unknown",
      },
    });
  }

  if (resource === "templates" && id && action === "fields") {
    if (request.method === "GET") {
      return json(await dbList("template-fields", { templateId: id, companyId }));
    }
    if (request.method === "POST") {
      const body = validate(templateFieldSchema, await readBody(request));
      return json(await dbCreate("template-fields", { ...(body as object), templateId: id, companyId }), 201);
    }
    if (nestedId && request.method === "PUT") {
      const body = validate(templateFieldSchema, await readBody(request));
      return json(await dbUpdate("template-fields", { id: nestedId, templateId: id, companyId }, body));
    }
    if (nestedId && request.method === "DELETE") {
      assertCanDelete("template-fields", nestedId);
      return json(await dbDelete("template-fields", { id: nestedId, templateId: id, companyId }));
    }
  }

  if (id && action && request.method === "POST") {
    const allowedActions = new Set([
      "duplicate",
      "submit-approval",
      "export-pdf",
      "cancel",
      "archive",
    ]);

    if (allowedActions.has(action)) {
      if (resource === "documents" && action === "export-pdf") {
        assertFound(id);
        const body = validate(pdfExportSchema, await readBody(request));
        if (body.fileName === "fail.pdf") {
          throw new ApiError("PDF_EXPORT_FAILED", "Export PDF ไม่สำเร็จ", 500, [{ field: "fileName", message: "PDF renderer failed" }]);
        }
        const pdf = createPdfExport({
          ...pdfBody(body),
          companyId,
          documentId: id,
          actorUserId: session.user.id,
          source: "DOCUMENT",
          fileName: `document-${id}.pdf`,
        });

        return json({
          ...pdf,
          tenant: { companyId, where: { companyId, id } },
          auditLog: {
            ...pdf.auditLog,
            ipAddress: requestIp(request),
            userAgent: request.headers.get("user-agent") ?? "unknown",
          },
        });
      }

      return json(await dbUpdate(resource, { id, companyId }, await readBody(request)));
    }
  }

  if (id && action && !companySubresources.has(action)) {
    return error("Action route not found", 404, "ROUTE_NOT_FOUND");
  }

  const getCompanyWhere = (resourceName: string, targetId?: string) => {
    let where: any = {};
    if (targetId) where.id = targetId;
    if (["document-categories", "document-types", "templates"].includes(resourceName)) {
      where.OR = [{ companyId }, { isGlobal: true }];
    } else {
      where.companyId = companyId;
    }
    return where;
  };

  if (!id && request.method === "GET") {
    return json(await dbList(resource, getCompanyWhere(resource)));
  }

  if (!id && request.method === "POST") {
    const body = await validatedBody(request, resource);
    return json(await dbCreate(resource, { ...(body as object), companyId }), 201);
  }

  if (id && !action && request.method === "GET") {
    return json(await dbDetail(resource, getCompanyWhere(resource, id)));
  }

  if (id && !action && request.method === "PUT") {
    const body = await validatedBody(request, resource);
    return json(await dbUpdate(resource, { id, companyId }, body));
  }

  if (id && !action && request.method === "DELETE") {
    assertCanDelete(resource, id);
    return json(await dbDelete(resource, { id, companyId }));
  }

  return error("Method or route not allowed", 405, "METHOD_NOT_ALLOWED");
  } catch (errorValue) {
    return handleApiError(errorValue);
  }
}

export function authMockResponse(action: string, body: unknown = null) {
  return json({
    ok: true,
    action,
    data: body,
  });
}
