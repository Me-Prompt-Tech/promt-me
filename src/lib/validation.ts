import { z, type ZodError, type ZodTypeAny } from "zod";

export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "DUPLICATE_EMAIL"
  | "DUPLICATE_DOCUMENT_NO"
  | "NOT_FOUND"
  | "FORBIDDEN"
  | "UNAUTHORIZED"
  | "COMPANY_SUSPENDED"
  | "TEMPLATE_INACTIVE"
  | "RESOURCE_IN_USE"
  | "PDF_EXPORT_FAILED"
  | "ROUTE_NOT_FOUND"
  | "METHOD_NOT_ALLOWED"
  | "BAD_REQUEST";

export type ApiErrorDetail = {
  field?: string;
  message: string;
};

export type ApiErrorPayload = {
  ok: false;
  code: ApiErrorCode;
  message: string;
  details?: ApiErrorDetail[];
};

export class ApiError extends Error {
  code: ApiErrorCode;
  status: number;
  details?: ApiErrorDetail[];

  constructor(code: ApiErrorCode, message: string, status = 400, details?: ApiErrorDetail[]) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export function apiErrorPayload(error: ApiError): ApiErrorPayload {
  return {
    ok: false,
    code: error.code,
    message: error.message,
    details: error.details,
  };
}

export function zodDetails(error: ZodError): ApiErrorDetail[] {
  return error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));
}

export function validate<TSchema extends ZodTypeAny>(schema: TSchema, data: unknown): z.infer<TSchema> {
  const result = schema.safeParse(data);

  if (!result.success) {
    throw new ApiError("VALIDATION_ERROR", "ข้อมูลไม่ถูกต้องหรือกรอกข้อมูลไม่ครบ", 422, zodDetails(result.error));
  }

  return result.data;
}

const nonEmptyString = z.string().trim().min(1, "กรุณากรอกข้อมูล");

export const optionalString = z
  .string()
  .trim()
  .nullish()
  .transform((val) => (val === "" ? undefined : val ?? undefined));

export const optionalEmail = z
  .string()
  .trim()
  .nullish()
  .transform((val) => (val === "" ? undefined : val ?? undefined))
  .pipe(z.string().email("อีเมลไม่ถูกต้อง").optional());

const objectIdLike = z.string().trim().min(1, "ไม่พบรหัสข้อมูล");

export const optionalObjectId = z
  .string()
  .trim()
  .nullish()
  .transform((val) => {
    if (!val || val === "") return undefined;
    if (/^[0-9a-fA-F]{24}$/.test(val)) return val;
    return undefined;
  });

export const statusUpdateSchema = z.object({
  status: z.string().trim().min(1, "กรุณาระบุสถานะ"),
});

export const companySchema = z.object({
  name: nonEmptyString,
  legalName: optionalString,
  taxId: z.string().trim().min(10, "เลขประจำตัวผู้เสียภาษีไม่ถูกต้อง").optional(),
  branchCode: optionalString,
  email: z.email("อีเมลไม่ถูกต้อง").optional(),
  phone: optionalString,
  address: optionalString,
  logoUrl: optionalString,
  status: z.enum(["ACTIVE", "SUSPENDED", "CANCELLED"]).default("ACTIVE"),
  planId: optionalString,
});

export const companyUserSchema = z.object({
  companyId: objectIdLike,
  name: nonEmptyString,
  email: z.email("อีเมลไม่ถูกต้อง"),
  role: z.enum(["OWNER", "ADMIN", "ACCOUNTANT", "FINANCE", "HR", "OPERATION", "STAFF", "VIEWER"]),
  status: z.enum(["ACTIVE", "INVITED", "SUSPENDED", "DELETED"]).default("INVITED"),
  departmentId: optionalObjectId,
  phone: optionalString,
});

export const planSchema = z.object({
  name: nonEmptyString,
  description: optionalString,
  priceSatang: z.coerce.number().int().min(0, "ราคาต้องไม่ติดลบ").default(0),
  maxUsers: z.coerce.number().int().positive().optional(),
  maxDocuments: z.coerce.number().int().positive().optional(),
  maxStorageMb: z.coerce.number().int().positive().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
  features: z.array(z.string()).optional(),
});

export const documentCategorySchema = z.object({
  name: nonEmptyString,
  slug: nonEmptyString,
  description: optionalString,
  icon: optionalString,
  showOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  isGlobal: z.boolean().default(false),
});

export const documentTypeSchema = documentCategorySchema.extend({
  categoryId: objectIdLike,
});

export const templateFieldSchema = z.object({
  key: nonEmptyString,
  label: nonEmptyString,
  type: z.enum(["TEXT", "NUMBER", "DATE", "DATETIME", "TEXTAREA", "RICH_TEXT", "IMAGE", "FILE", "TABLE", "SELECT", "CHECKBOX", "RADIO", "SIGNATURE", "BOOLEAN", "CURRENCY"]),
  required: z.boolean().default(false),
  placeholder: optionalString,
  options: z.unknown().optional(),
  validation: z.unknown().optional(),
  defaultValue: z.unknown().optional(),
  config: z.unknown().optional(),
  showOrder: z.coerce.number().int().min(0).default(0),
});

export const templateSchema = z.object({
  name: nonEmptyString,
  slug: optionalString,
  description: optionalString,
  categoryId: objectIdLike,
  documentTypeId: objectIdLike,
  templateMode: z.enum(["FORM", "DESIGNER", "HTML"]).default("DESIGNER"),
  layoutJson: z.unknown().optional(),
  htmlContent: optionalString,
  cssContent: optionalString,
  paperSize: z.enum(["A4", "A5", "LETTER", "LEGAL"]).default("A4"),
  orientation: z.enum(["PORTRAIT", "LANDSCAPE"]).default("PORTRAIT"),
  isGlobal: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const documentSchema = z.object({
  templateId: optionalObjectId,
  categoryId: objectIdLike,
  documentTypeId: objectIdLike,
  customerId: optionalObjectId,
  employeeId: optionalObjectId,
  documentNo: nonEmptyString,
  title: nonEmptyString,
  status: z.enum(["DRAFT", "PENDING", "APPROVED", "REJECTED", "CANCELLED", "ARCHIVED"]).default("DRAFT"),
  dataJson: z.record(z.string(), z.unknown()).default({}),
  subtotalSatang: z.coerce.number().int().min(0).optional(),
  discountSatang: z.coerce.number().int().min(0).optional(),
  vatSatang: z.coerce.number().int().min(0).optional(),
  totalSatang: z.coerce.number().int().min(0).optional(),
  note: optionalString,
});

export const businessPartnerSchema = z.object({
  type: z.enum(["CUSTOMER", "VENDOR"]).default("CUSTOMER"),
  name: nonEmptyString,
  taxId: optionalString,
  branchCode: optionalString,
  email: optionalEmail,
  phone: optionalString,
  address: optionalString,
  contactName: optionalString,
  contactPhone: optionalString,
});

export const employeeSchema = z.object({
  code: optionalString,
  name: nonEmptyString,
  email: optionalEmail,
  phone: optionalString,
  position: optionalString,
  departmentId: optionalObjectId,
  salarySatang: z.coerce.number().int().min(0).optional().nullable(),
  startDate: optionalString,
  endDate: optionalString,
  status: z.enum(["ACTIVE", "INVITED", "SUSPENDED", "DELETED"]).default("ACTIVE"),
});

export const departmentSchema = z.object({
  name: nonEmptyString,
  description: optionalString,
  isActive: z.boolean().default(true),
});

export const approvalFlowSchema = z.object({
  name: nonEmptyString,
  documentTypeId: objectIdLike,
  isActive: z.boolean().default(true),
  steps: z.array(z.object({
    stepOrder: z.coerce.number().int().positive(),
    approverRole: z.enum(["OWNER", "ADMIN", "ACCOUNTANT", "FINANCE", "HR", "OPERATION", "STAFF", "VIEWER"]).optional(),
    approverUserId: optionalString,
  })).min(1, "ต้องมีขั้นตอนอนุมัติอย่างน้อย 1 ขั้น"),
});

export const documentNumberSettingSchema = z.object({
  documentTypeId: objectIdLike,
  prefix: nonEmptyString,
  runningNumber: z.coerce.number().int().positive().default(1),
  padding: z.coerce.number().int().min(1).max(10).default(4),
  resetMode: z.enum(["YEARLY", "MONTHLY", "NEVER"]).default("YEARLY"),
});

export const approvalActionSchema = z.object({
  note: optionalString,
});

export const pdfExportSchema = z.object({
  paperSize: z.enum(["A4"]).default("A4"),
  orientation: z.enum(["PORTRAIT", "LANDSCAPE"]).default("PORTRAIT"),
  layoutJson: z.object({
    pages: z.array(z.unknown()).optional(),
    elements: z.array(z.unknown()).optional(),
  }).optional(),
  dataJson: z.unknown().optional(),
  fileName: z.string().trim().endsWith(".pdf", "ชื่อไฟล์ต้องลงท้ายด้วย .pdf").optional(),
});

export function schemaForResource(resource: string) {
  return {
    companies: companySchema,
    "company-users": companyUserSchema,
    plans: planSchema,
    "document-categories": documentCategorySchema,
    "document-types": documentTypeSchema,
    templates: templateSchema,
    documents: documentSchema,
    "business-partners": businessPartnerSchema,
    employees: employeeSchema,
    departments: departmentSchema,
    "approval-flows": approvalFlowSchema,
    "document-number-settings": documentNumberSettingSchema,
  }[resource];
}

export function domainConflict(resource: string, data: Record<string, unknown>) {
  if (resource === "company-users" && data.email === "duplicate@example.com") {
    throw new ApiError("DUPLICATE_EMAIL", "อีเมลนี้ถูกใช้ในบริษัทนี้แล้ว", 409, [{ field: "email", message: "Email ซ้ำในบริษัทเดียวกัน" }]);
  }

  if (resource === "documents" && data.documentNo === "DUPLICATE") {
    throw new ApiError("DUPLICATE_DOCUMENT_NO", "เลขเอกสารนี้ถูกใช้แล้ว", 409, [{ field: "documentNo", message: "เลขเอกสารซ้ำ" }]);
  }

  if (resource === "templates" && data.isActive === false) {
    throw new ApiError("TEMPLATE_INACTIVE", "Template ไม่ Active", 409, [{ field: "isActive", message: "Template นี้ยังไม่พร้อมใช้งาน" }]);
  }
}

export function assertCanDelete(resource: string, id: string) {
  if (id.includes("in-use")) {
    throw new ApiError("RESOURCE_IN_USE", "ลบข้อมูลที่ถูกใช้งานอยู่ไม่ได้", 409, [{ field: "id", message: `${resource} นี้ถูกอ้างอิงอยู่` }]);
  }
}

export function assertCompanyActive(companyId: string) {
  if (companyId.includes("suspended")) {
    throw new ApiError("COMPANY_SUSPENDED", "บริษัทถูกระงับ ไม่สามารถใช้งานระบบได้", 403);
  }
}

export function assertFound(id?: string) {
  if (!id || id === "missing" || id === "not-found") {
    throw new ApiError("NOT_FOUND", "ไม่พบข้อมูล", 404);
  }
}

