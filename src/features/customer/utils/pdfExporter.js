import { jsPDF } from 'jspdf';

/**
 * pdfExporter.js - Módulo de exportación de Canvas Konva a PDF.
 */
export function exportCanvasToPDF(stageRef, paperConfig, filename = 'imprimelo-design.pdf') {
  if (!stageRef?.current) return null;
  const isLandscape = paperConfig.orientation === 'landscape';
  const pdfWidth = isLandscape ? paperConfig.heightMm : paperConfig.widthMm;
  const pdfHeight = isLandscape ? paperConfig.widthMm : paperConfig.heightMm;

  const dataUrl = stageRef.current.toDataURL({ pixelRatio: 3, mimeType: 'image/png', quality: 1.0 });
  const doc = new jsPDF({ orientation: isLandscape ? 'l' : 'p', unit: 'mm', format: [pdfWidth, pdfHeight] });
  doc.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
  doc.save(filename);
  return doc.output('blob');
}

export function generatePDFBlob(stageRef, paperConfig) {
  if (!stageRef?.current) return null;
  const isLandscape = paperConfig.orientation === 'landscape';
  const pdfWidth = isLandscape ? paperConfig.heightMm : paperConfig.widthMm;
  const pdfHeight = isLandscape ? paperConfig.widthMm : paperConfig.heightMm;

  const dataUrl = stageRef.current.toDataURL({ pixelRatio: 3, mimeType: 'image/png', quality: 1.0 });
  const doc = new jsPDF({ orientation: isLandscape ? 'l' : 'p', unit: 'mm', format: [pdfWidth, pdfHeight] });
  doc.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
  return doc.output('blob');
}
