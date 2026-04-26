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

export function generatePDFBlob(stageRef, paperConfig, canvasWidth, canvasHeight) {
  if (!stageRef?.current) return null;
  
  const stage = stageRef.current;
  const isLandscape = paperConfig.orientation === 'landscape';
  
  // Las dimensiones ya vienen ajustadas por la orientación desde el CanvasEditor
  const pdfWidth = paperConfig.widthMm;
  const pdfHeight = paperConfig.heightMm;

  // --- TRUCO DE FIDELIDAD 100% ---
  // Guardamos el estado actual (zoom y posición)
  const oldScale = stage.scale();
  const oldPos = stage.position();

  // Reseteamos el stage para la captura (Escala 1:1, Posición 0,0)
  stage.scale({ x: 1, y: 1 });
  stage.position({ x: 0, y: 0 });

  // Capturamos el área exacta del lienzo
  const dataUrl = stage.toDataURL({ 
    x: 0, 
    y: 0, 
    width: canvasWidth, 
    height: canvasHeight,
    pixelRatio: 3, // Resolución de impresión (~300 DPI)
    mimeType: 'image/png'
  });

  // Restauramos el stage para que el usuario no note el salto
  stage.scale(oldScale);
  stage.position(oldPos);
  stage.batchDraw();

  // Generamos el PDF con las dimensiones físicas reales
  const doc = new jsPDF({ 
    orientation: isLandscape ? 'l' : 'p', 
    unit: 'mm', 
    format: [pdfWidth, pdfHeight] 
  });

  // Agregamos la imagen estirándola exactamente al tamaño del papel
  doc.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
  
  return doc.output('blob');
}
