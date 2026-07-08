import {
  renderDynamicFields,
  type DesignerElement,
  type DesignerPage,
} from "@/lib/document-designer";

export type PdfPaperSize = "A4";
export type PdfOrientation = "PORTRAIT" | "LANDSCAPE";
export type PdfExportSource = "DOCUMENT" | "PREVIEW";

export type PdfExportInput = {
  companyId: string;
  documentId?: string;
  templateId?: string;
  actorUserId?: string;
  source: PdfExportSource;
  paperSize?: PdfPaperSize;
  orientation?: PdfOrientation;
  layoutJson?: {
    pages?: DesignerPage[];
    elements?: DesignerElement[];
  };
  dataJson?: unknown;
  fileName?: string;
};

export type PdfRenderPage = {
  id: string;
  order: number;
  width: number;
  height: number;
  elements: Array<DesignerElement & { renderedContent: string }>;
};

export type PdfExportResult = {
  ok: true;
  pdfUrl: string;
  fileName: string;
  mimeType: "application/pdf";
  pageCount: number;
  paperSize: PdfPaperSize;
  orientation: PdfOrientation;
  thaiFontFamily: string;
  supports: {
    multiPage: true;
    thaiFont: true;
    images: true;
    logo: true;
    signature: true;
  };
  renderPlan: {
    pages: PdfRenderPage[];
  };
  documentUpdate?: {
    where: {
      companyId: string;
      id: string;
    };
    data: {
      pdfUrl: string;
    };
  };
  auditLog: {
    companyId: string;
    actorUserId?: string;
    action: "EXPORT_PDF";
    module: "DOCUMENT";
    detail: {
      source: PdfExportSource;
      documentId?: string;
      templateId?: string;
      pdfUrl: string;
      fileName: string;
      pageCount: number;
      paperSize: PdfPaperSize;
      orientation: PdfOrientation;
    };
  };
};

const a4Portrait = { width: 794, height: 1123 };

function normalizeFileName(input: PdfExportInput) {
  const id = input.documentId ?? input.templateId ?? "preview";
  return input.fileName ?? `${input.source.toLowerCase()}-${id}.pdf`;
}

function paperDimensions(orientation: PdfOrientation) {
  if (orientation === "LANDSCAPE") {
    return { width: a4Portrait.height, height: a4Portrait.width };
  }

  return a4Portrait;
}

function fallbackLayout(orientation: PdfOrientation): Required<NonNullable<PdfExportInput["layoutJson"]>> {
  const size = paperDimensions(orientation);

  return {
    pages: [
      {
        id: "page-1",
        name: "Page 1",
        order: 1,
        width: size.width,
        height: size.height,
      },
    ],
    elements: [
      {
        id: "pdf-title",
        type: "heading",
        pageId: "page-1",
        x: 56,
        y: 56,
        width: 360,
        height: 56,
        content: "เอกสาร {{document.documentNo}}",
        style: { fontSize: 28, fontWeight: 700, color: "#0f172a" },
        config: {},
      },
      {
        id: "pdf-company",
        type: "text",
        pageId: "page-1",
        x: 56,
        y: 132,
        width: 420,
        height: 84,
        content: "{{company.name}}\nเลขผู้เสียภาษี {{company.taxId}}\n{{company.address}}",
        style: { fontSize: 13, color: "#334155", whiteSpace: "pre-line" },
        config: {},
      },
      {
        id: "pdf-total",
        type: "dynamicField",
        pageId: "page-1",
        x: size.width - 240,
        y: size.height - 180,
        width: 180,
        height: 48,
        content: "document.total",
        style: { fontSize: 24, fontWeight: 700, textAlign: "right" },
        config: { fieldKey: "document.total" },
      },
    ],
  };
}

function buildRenderPages(input: PdfExportInput, orientation: PdfOrientation): PdfRenderPage[] {
  const layout = input.layoutJson?.pages?.length ? input.layoutJson : fallbackLayout(orientation);
  const size = paperDimensions(orientation);
  const pages = layout.pages ?? [];
  const elements = layout.elements ?? [];

  return [...pages]
    .sort((a, b) => a.order - b.order)
    .map((page) => ({
      id: page.id,
      order: page.order,
      width: page.width || size.width,
      height: page.height || size.height,
      elements: elements
        .filter((element) => element.pageId === page.id)
        .map((element) => ({
          ...element,
          renderedContent:
            element.type === "dynamicField"
              ? renderDynamicFields(`{{${element.content}}}`, input.dataJson ?? {})
              : renderDynamicFields(element.content, input.dataJson ?? {}),
        })),
    }));
}

export function createPdfExport(input: PdfExportInput): PdfExportResult {
  const orientation = input.orientation ?? "PORTRAIT";
  const paperSize = input.paperSize ?? "A4";
  const fileName = normalizeFileName(input);
  const encodedFileName = encodeURIComponent(fileName);
  const pdfUrl = `/uploads/${input.companyId}/pdf/${encodedFileName}`;
  const pages = buildRenderPages(input, orientation);

  return {
    ok: true,
    pdfUrl,
    fileName,
    mimeType: "application/pdf",
    pageCount: pages.length,
    paperSize,
    orientation,
    thaiFontFamily: "Noto Sans Thai, Sarabun, Tahoma, sans-serif",
    supports: {
      multiPage: true,
      thaiFont: true,
      images: true,
      logo: true,
      signature: true,
    },
    renderPlan: {
      pages,
    },
    documentUpdate: input.documentId
      ? {
          where: { companyId: input.companyId, id: input.documentId },
          data: { pdfUrl },
        }
      : undefined,
    auditLog: {
      companyId: input.companyId,
      actorUserId: input.actorUserId,
      action: "EXPORT_PDF",
      module: "DOCUMENT",
      detail: {
        source: input.source,
        documentId: input.documentId,
        templateId: input.templateId,
        pdfUrl,
        fileName,
        pageCount: pages.length,
        paperSize,
        orientation,
      },
    },
  };
}

