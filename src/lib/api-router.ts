import { auth } from "@/auth";
import { createPdfExport } from "@/lib/pdf-export";
import type { PdfExportInput } from "@/lib/pdf-export";
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

  return json({
    ok: false,
    code: "BAD_REQUEST",
    message: "เกิดข้อผิดพลาดในการทำรายการ",
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

function mockList(resource: string, companyId?: string) {
  return {
    ok: true,
    resource,
    tenant: companyId ? { companyId, where: { companyId } } : null,
    data: [
      {
        id: `${resource}_1`,
        name: `${resource} sample 1`,
        status: "ACTIVE",
        companyId,
      },
      {
        id: `${resource}_2`,
        name: `${resource} sample 2`,
        status: "DRAFT",
        companyId,
      },
    ],
  };
}

function mockDetail(resource: string, id: string, companyId?: string) {
  return {
    ok: true,
    resource,
    tenant: companyId ? { companyId, where: { companyId, id } } : null,
    data: {
      id,
      name: `${resource} detail`,
      status: "ACTIVE",
      companyId,
    },
  };
}

function mutationResponse(
  action: string,
  resource: string,
  body: unknown,
  id?: string,
  companyId?: string
) {
  return {
    ok: true,
    action,
    resource,
    tenant: companyId ? { companyId, where: id ? { companyId, id } : { companyId } } : null,
    data: {
      id: id ?? `${resource}_new`,
      ...((body && typeof body === "object") ? body : {}),
      companyId,
    },
  };
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

    const path = (await context.params).path ?? [];
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
      return json(mockList(resource));
    }

    if (id && action === "status" && request.method === "PATCH") {
      assertFound(id);
      return json(mutationResponse("status", resource, validate(statusUpdateSchema, await readBody(request)), id));
    }

    if (!id && request.method === "GET") {
      return json(mockList(resource));
    }

    if (!id && request.method === "POST") {
      return json(mutationResponse("create", resource, await validatedBody(request, resource)), 201);
    }

    if (id && !action && request.method === "GET") {
      assertFound(id);
      return json(mockDetail(resource, id));
    }

    if (id && !action && request.method === "PUT") {
      assertFound(id);
      return json(mutationResponse("update", resource, await validatedBody(request, resource), id));
    }

    if (id && !action && request.method === "DELETE") {
      assertFound(id);
      assertCanDelete(resource, id);
      return json({ ok: true, action: "delete", resource, id });
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

  const companyId = requireCompany(session);

  if (!companyId) {
    return error("Forbidden: company user with companyId required", 403, "FORBIDDEN");
  }

  assertCompanyActive(companyId);

  const path = (await context.params).path ?? [];
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
        data: mockList(`reports/${reportName}`, companyId).data,
      });
    }
    return error("Report route not found", 404, "ROUTE_NOT_FOUND");
  }

  if (resource === "approvals" && id && ["approve", "reject"].includes(action ?? "") && request.method === "POST") {
    assertFound(id);
    return json(mutationResponse(action!, resource, validate(approvalActionSchema, await readBody(request)), id, companyId));
  }

  if (resource === "templates" && id && action === "designer" && request.method === "PUT") {
    assertFound(id);
    return json(mutationResponse("save-designer", resource, await readBody(request), id, companyId));
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
      return json(mockList("template-fields", companyId));
    }
    if (request.method === "POST") {
      return json(mutationResponse("create-field", "template-fields", validate(templateFieldSchema, await readBody(request)), undefined, companyId), 201);
    }
    if (nestedId && request.method === "PUT") {
      assertFound(nestedId);
      return json(mutationResponse("update-field", "template-fields", validate(templateFieldSchema, await readBody(request)), nestedId, companyId));
    }
    if (nestedId && request.method === "DELETE") {
      assertFound(nestedId);
      assertCanDelete("template-fields", nestedId);
      return json({ ok: true, action: "delete-field", resource: "template-fields", id: nestedId, tenant: { companyId } });
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

      assertFound(id);
      return json(mutationResponse(action, resource, await readBody(request), id, companyId));
    }
  }

  if (id && action && !companySubresources.has(action)) {
    return error("Action route not found", 404, "ROUTE_NOT_FOUND");
  }

  if (!id && request.method === "GET") {
    return json(mockList(resource, companyId));
  }

  if (!id && request.method === "POST") {
    return json(mutationResponse("create", resource, await validatedBody(request, resource), undefined, companyId), 201);
  }

  if (id && !action && request.method === "GET") {
    assertFound(id);
    return json(mockDetail(resource, id, companyId));
  }

  if (id && !action && request.method === "PUT") {
    assertFound(id);
    return json(mutationResponse("update", resource, await validatedBody(request, resource), id, companyId));
  }

  if (id && !action && request.method === "DELETE") {
    assertFound(id);
    assertCanDelete(resource, id);
    return json({ ok: true, action: "delete", resource, id, tenant: { companyId, where: { companyId, id } } });
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
