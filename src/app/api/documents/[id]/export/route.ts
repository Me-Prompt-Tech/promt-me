import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { generatePDFBuffer } from '@/lib/pdf-generator';
import fs from 'fs/promises';
import path from 'path';
import { DesignerState } from '@/types/document-designer';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const documentId = params.id;
    
    // Fetch document with template
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        template: true,
      },
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    if (!document.template) {
      return NextResponse.json({ error: 'Document does not have an associated template' }, { status: 400 });
    }

    const layoutJson = document.template.layoutJson as unknown as DesignerState;
    const dataJson = document.dataJson as Record<string, any>;

    if (!layoutJson || !layoutJson.pages || !layoutJson.elements) {
      return NextResponse.json({ error: 'Invalid template layout' }, { status: 400 });
    }

    // Generate PDF Buffer
    const pdfBuffer = await generatePDFBuffer({
      pages: layoutJson.pages,
      elements: layoutJson.elements,
      data: dataJson || {},
      paperSize: document.template.paperSize,
      orientation: document.template.orientation.toLowerCase() as 'portrait' | 'landscape',
    });

    // Setup local storage path (public/uploads/pdfs)
    const publicDir = path.join(process.cwd(), 'public');
    const uploadsDir = path.join(publicDir, 'uploads', 'pdfs');
    
    // Ensure directory exists
    await fs.mkdir(uploadsDir, { recursive: true });

    // Save the PDF file
    const fileName = `doc-${documentId}-${Date.now()}.pdf`;
    const filePath = path.join(uploadsDir, fileName);
    await fs.writeFile(filePath, pdfBuffer);

    const pdfUrl = `/uploads/pdfs/${fileName}`;

    // Update document with new pdfUrl
    await prisma.document.update({
      where: { id: documentId },
      data: { pdfUrl },
    });

    // Add Audit Log
    await prisma.auditLog.create({
      data: {
        companyId: document.companyId,
        actorUserId: document.createdById, // Simplified: should ideally be the logged-in user
        action: 'EXPORT_PDF',
        module: 'DOCUMENT',
        detail: {
          documentId,
          pdfUrl,
          documentNo: document.documentNo,
        },
      }
    });

    return NextResponse.json({ success: true, pdfUrl });
  } catch (error: any) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
