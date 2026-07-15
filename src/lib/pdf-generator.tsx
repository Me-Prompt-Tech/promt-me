import React from 'react';
import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
  Font,
  renderToBuffer,
  renderToStream
} from '@react-pdf/renderer';
import { replaceDynamicFields } from './dynamic-fields';
import { Element as DesignerElement, Page as DesignerPage } from '../types/document-designer';

// Register Thai Font (Using Noto Sans Thai from Google Fonts as a reliable option)
Font.register({
  family: 'Sarabun',
  src: 'https://fonts.gstatic.com/s/sarabun/v14/DtVmJx26TKEr37c9aAFJn2QN.ttf',
});

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Sarabun',
    position: 'relative',
    backgroundColor: '#ffffff',
  },
  element: {
    position: 'absolute',
  }
});

interface GeneratePDFOptions {
  pages: DesignerPage[];
  elements: DesignerElement[];
  data: Record<string, any>;
  paperSize?: string;
  orientation?: 'portrait' | 'landscape';
}

const PDFDocument = ({ pages, elements, data, paperSize = 'A4', orientation = 'portrait' }: GeneratePDFOptions) => {
  return (
    <Document>
      {pages.map((page) => {
        const pageElements = elements.filter(e => e.pageId === page.id);
        
        return (
          <Page 
            key={page.id} 
            size={paperSize as any} 
            orientation={orientation} 
            style={styles.page}
          >
            {pageElements.map((el) => {
              // Extract common coordinates
              const elementStyle: any = {
                ...styles.element,
                left: el.x,
                top: el.y,
                width: el.width,
                height: el.height,
                ...(el.style || {})
              };

              // Map types to PDF components
              if (el.type === 'text') {
                const content = replaceDynamicFields(el.content || '', data);
                return (
                  <Text key={el.id} style={elementStyle}>
                    {content}
                  </Text>
                );
              } else if (el.type === 'image') {
                // For images, we assume content is a URL
                return (
                  <Image key={el.id} src={el.content} style={elementStyle} />
                );
              } else if (el.type === 'rect') {
                return (
                  <View key={el.id} style={{ ...elementStyle, backgroundColor: el.style?.backgroundColor || '#ccc' }} />
                );
              }

              // Default fallback view for unsupported elements
              return (
                <View key={el.id} style={elementStyle} />
              );
            })}
          </Page>
        );
      })}
    </Document>
  );
};

/**
 * Generate a PDF Buffer from Document Designer data
 */
export async function generatePDFBuffer(options: GeneratePDFOptions): Promise<Buffer> {
  const buffer = await renderToBuffer(<PDFDocument {...options} />);
  return buffer;
}

/**
 * Generate a PDF Stream from Document Designer data
 */
export async function generatePDFStream(options: GeneratePDFOptions): Promise<NodeJS.ReadableStream> {
  const stream = await renderToStream(<PDFDocument {...options} />);
  return stream as unknown as NodeJS.ReadableStream;
}
