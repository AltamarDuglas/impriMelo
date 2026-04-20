import { useState, useCallback } from 'react';

/**
 * useCanvasSnap - Hook de responsabilidad única para la lógica de imán/snap.
 * 
 * SOLID: Single Responsibility - Solo maneja la lógica de alineación magnética.
 */
export function useCanvasSnap(canvasWidth, canvasHeight, elements, selectedId) {
  const [guideLines, setGuideLines] = useState([]);
  const SNAP = 8;
  const MARGIN = 8;

  const handleDragMove = useCallback((x, y, w, h) => {
    let nx = x, ny = y;
    const lines = [];
    const cx = canvasWidth / 2, cy = canvasHeight / 2;

    if (Math.abs(x - MARGIN) < SNAP) {
      nx = MARGIN;
      lines.push({ x1: MARGIN, y1: 0, x2: MARGIN, y2: canvasHeight });
    } else if (Math.abs(x + w - (canvasWidth - MARGIN)) < SNAP) {
      nx = canvasWidth - w - MARGIN;
      lines.push({ x1: canvasWidth - MARGIN, y1: 0, x2: canvasWidth - MARGIN, y2: canvasHeight });
    } else if (Math.abs(x + w / 2 - cx) < SNAP) {
      nx = cx - w / 2;
      lines.push({ x1: cx, y1: 0, x2: cx, y2: canvasHeight });
    }

    if (Math.abs(y - MARGIN) < SNAP) {
      ny = MARGIN;
      lines.push({ x1: 0, y1: MARGIN, x2: canvasWidth, y2: MARGIN });
    } else if (Math.abs(y + h - (canvasHeight - MARGIN)) < SNAP) {
      ny = canvasHeight - h - MARGIN;
      lines.push({ x1: 0, y1: canvasHeight - MARGIN, x2: canvasWidth, y2: canvasHeight - MARGIN });
    } else if (Math.abs(y + h / 2 - cy) < SNAP) {
      ny = cy - h / 2;
      lines.push({ x1: 0, y1: cy, x2: canvasWidth, y2: cy });
    }

    elements.forEach(o => {
      if (o.id === selectedId) return;
      const or = o.x + o.width, ob = o.y + o.height;
      const ocx = o.x + o.width / 2, ocy = o.y + o.height / 2;

      if (Math.abs(nx - o.x) < SNAP) { nx = o.x; lines.push({ x1: o.x, y1: 0, x2: o.x, y2: canvasHeight }); }
      else if (Math.abs(nx + w - or) < SNAP) { nx = or - w; lines.push({ x1: or, y1: 0, x2: or, y2: canvasHeight }); }
      else if (Math.abs(nx + w / 2 - ocx) < SNAP) { nx = ocx - w / 2; lines.push({ x1: ocx, y1: 0, x2: ocx, y2: canvasHeight }); }

      if (Math.abs(ny - o.y) < SNAP) { ny = o.y; lines.push({ x1: 0, y1: o.y, x2: canvasWidth, y2: o.y }); }
      else if (Math.abs(ny + h - ob) < SNAP) { ny = ob - h; lines.push({ x1: 0, y1: ob, x2: canvasWidth, y2: ob }); }
      else if (Math.abs(ny + h / 2 - ocy) < SNAP) { ny = ocy - h / 2; lines.push({ x1: 0, y1: ocy, x2: canvasWidth, y2: ocy }); }
    });

    if (nx < 0) nx = 0;
    if (nx + w > canvasWidth) nx = canvasWidth - w;
    if (ny < 0) ny = 0;
    if (ny + h > canvasHeight) ny = canvasHeight - h;

    setGuideLines(lines);
    return { x: nx, y: ny };
  }, [canvasWidth, canvasHeight, elements, selectedId]);

  const clearGuides = useCallback(() => setGuideLines([]), []);
  return { guideLines, handleDragMove, clearGuides };
}
