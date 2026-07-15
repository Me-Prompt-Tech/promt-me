'use server';

import { generatePDFBuffer } from '../pdf-generator';
import { Page as DesignerPage, Element as DesignerElement } from '@/types/document-designer';

/**
 * Server Action: Generates a PDF buffer and returns it as a Base64 string for previewing.
 * This does not save anything to the database or file system.
 */
export async function previewPdfBase64(
  pages: DesignerPage[],
  elements: DesignerElement[],
  data: Record<string, any>,
  paperSize: string = 'A4',
  orientation: 'portrait' | 'landscape' = 'portrait'
): Promise<string> {
  try {
    const buffer = await generatePDFBuffer({
      pages,
      elements,
      data,
      paperSize,
      orientation,
    });
    
    // Return as base64 string so the client can display it as a data URI
    // e.g. <iframe src={`data:application/pdf;base64,${base64String}`} />
    return buffer.toString('base64');
  } catch (error) {
    console.error('Error generating PDF preview:', error);
    throw new Error('Failed to generate PDF preview');
  }
}

/**
 * Utility function to call the export API endpoint from the client.
 */
export async function exportDocumentPdf(documentId: string): Promise<string> {
  const response = await fetch(`/api/documents/${documentId}/export`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to export document');
  }

  return data.pdfUrl;
}
