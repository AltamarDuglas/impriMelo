import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Stage, Layer, Rect, Line } from 'react-konva';
import { motion, AnimatePresence } from 'framer-motion';
import { Printer, ChevronLeft, Info, MousePointer2 } from 'lucide-react';

import CanvasImage from './CanvasImage';
import CanvasText from './CanvasText';
import CanvasToolbar from './CanvasToolbar';
import PrintDrawer from '../config/PrintDrawer';
import { PAPER_SIZES } from '../../HomeConstants';
import { generatePDFBlob } from '../../utils/pdfExporter';
import { useCanvasSnap } from '../../hooks/useCanvasSnap';
import { useCanvasKeyboard } from '../../hooks/useCanvasKeyboard';

// Constante para persistencia local
const STORAGE_KEY = 'melo_canvas_design';

/**
 * CanvasEditor v6 - Rediseño Total "Mobile-First Premium".
 * 
 * SOLID: Orquestación Limpia.
 * Cambios: Layout absoluto, soporte para Safe Areas, estética de Isla Flotante.
 */
const CanvasEditor = ({ initialImages = [], initialElements = [], initialConfig = null, onBack, onFinishDesign }) => {
  const [paperConfig, setPaperConfig] = useState(initialConfig || { sizeId: 'carta', orientation: 'portrait' });

  const [elements, setElements] = useState(initialElements);

  const [selectedId, setSelectedId] = useState(null);
  const [zoom, setZoom] = useState(0.6);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [containerSize, setContainerSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(() => !localStorage.getItem('melo_help_seen'));
  const [showConfirmBack, setShowConfirmBack] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const stageRef = useRef(null);
  const canvasContainerRef = useRef(null);
  const [stageSize, setStageSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  // Bloqueo total del scroll y forzado de altura real del viewport
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    // Guardamos estilos originales para restaurarlos luego
    const originalHtmlStyle = { overflow: html.style.overflow, height: html.style.height };
    const originalBodyStyle = { overflow: body.style.overflow, height: body.style.height, position: body.style.position, width: body.style.width };

    // Aplicamos bloqueo "True Fullscreen"
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    body.style.position = 'fixed';
    body.style.width = '100%';

    const updateHeight = () => {
      const h = window.innerHeight;
      html.style.height = `${h}px`;
      body.style.height = `${h}px`;
      setContainerSize({ width: window.innerWidth, height: h });
    };

    window.addEventListener('resize', updateHeight);
    updateHeight(); // Llamada inicial

    const elementsToHide = document.querySelectorAll('nav, footer, .fixed.bottom-6, .fixed.bottom-0.h-40');
    elementsToHide.forEach(el => el.style.display = 'none');

    return () => {
      window.removeEventListener('resize', updateHeight);
      html.style.overflow = originalHtmlStyle.overflow;
      html.style.height = originalHtmlStyle.height;
      body.style.overflow = originalBodyStyle.overflow;
      body.style.height = originalBodyStyle.height;
      body.style.position = originalBodyStyle.position;
      body.style.width = originalBodyStyle.width;
      elementsToHide.forEach(el => el.style.display = '');
    };
  }, []);

  const selectedPaper = useMemo(() => PAPER_SIZES.find(p => p.id === paperConfig.sizeId), [paperConfig.sizeId]);

  const { paperWidthMm, paperHeightMm, paperAspect } = useMemo(() => {
    const w = selectedPaper ? (paperConfig.orientation === 'landscape' ? selectedPaper.heightMm : selectedPaper.widthMm) : 215.9;
    const h = selectedPaper ? (paperConfig.orientation === 'landscape' ? selectedPaper.widthMm : selectedPaper.heightMm) : 279.4;
    return { paperWidthMm: w, paperHeightMm: h, paperAspect: w / h };
  }, [selectedPaper, paperConfig.orientation]);

  // Cálculo del tamaño visual del lienzo (en px) - Optimizado con useMemo
  const { canvasWidth, canvasHeight } = useMemo(() => {
    const availableW = containerSize.width;
    const availableH = containerSize.height;
    let cw, ch;

    if (availableW / availableH > paperAspect) {
      ch = availableH * 0.7;
      cw = ch * paperAspect;
    } else {
      cw = availableW * 0.85;
      ch = cw / paperAspect;
    }
    return { canvasWidth: cw, canvasHeight: ch };
  }, [containerSize, paperAspect]);

  const { guideLines, handleDragMove, clearGuides } = useCanvasSnap(canvasWidth, canvasHeight, elements, selectedId);
  useCanvasKeyboard(elements, selectedId, setElements, () => { }, setSelectedId); // Unificado

  // ResizeObserver para el contenedor
  useEffect(() => {
    const el = canvasContainerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        // Usar requestAnimationFrame para asegurar suavidad a 60fps
        requestAnimationFrame(() => {
          setStageSize({ width: entry.contentRect.width, height: entry.contentRect.height });
        });
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Centrar el Stage inicialmente
  useEffect(() => {
    setStagePos({
      x: (containerSize.width - canvasWidth * zoom) / 2,
      y: (containerSize.height - canvasHeight * zoom) / 2 - 40 // Un poco arriba para la toolbar
    });
  }, [containerSize.width, containerSize.height, canvasWidth, canvasHeight, zoom]);

  // Helper para procesar imágenes manteniendo aspect ratio y maximizando tamaño
  const processImage = (src, index = 0) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const margin = 40; // Margen de seguridad total (20px por lado)
        const targetW = canvasWidth - margin;
        const targetH = canvasHeight - margin;

        let w = img.width;
        let h = img.height;
        const imgRatio = w / h;
        const targetRatio = targetW / targetH;

        if (imgRatio > targetRatio) {
          // La imagen es más ancha que el área objetivo proporcionalmente
          w = targetW;
          h = targetW / imgRatio;
        } else {
          // La imagen es más alta que el área objetivo proporcionalmente
          h = targetH;
          w = targetH * imgRatio;
        }

        resolve({
          id: `el-${Date.now()}-${index}`,
          type: 'image',
          src,
          x: (canvasWidth - w) / 2 + (index * 15),
          y: (canvasHeight - h) / 2 + (index * 15),
          width: w,
          height: h,
          rotation: 0,
        });
      };
      img.src = src;
    });
  };

  // Carga de imágenes iniciales
  useEffect(() => {
    if (initialImages.length > 0 && elements.length === 0) {
      Promise.all(initialImages.map((src, i) => processImage(src, i)))
        .then(newElements => setElements(newElements));
    }
  }, [initialImages, canvasWidth, canvasHeight]);

  const handleWheel = (e) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    const mp = { x: (pointer.x - stage.x()) / oldScale, y: (pointer.y - stage.y()) / oldScale };
    const ns = Math.min(3, Math.max(0.3, e.evt.deltaY > 0 ? oldScale / 1.05 : oldScale * 1.05));

    requestAnimationFrame(() => {
      setZoom(ns);
      setStagePos({ x: pointer.x - mp.x * ns, y: pointer.y - mp.y * ns });
    });
  };

  // --- MANEJO DE ZOOM POR PELLIZCO (Mobile Pinch Zoom) ---
  const lastDistRef = useRef(0);
  const lastCenterRef = useRef(null);

  const getDistance = (p1, p2) => Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  const getCenter = (p1, p2) => ({ x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 });

  const handleTouchStart = (e) => {
    if (e.evt.touches.length === 2) {
      const stage = stageRef.current;
      const containerRect = stage.container().getBoundingClientRect();
      const p1 = { x: e.evt.touches[0].clientX, y: e.evt.touches[0].clientY };
      const p2 = { x: e.evt.touches[1].clientX, y: e.evt.touches[1].clientY };
      lastDistRef.current = getDistance(p1, p2);

      const centerViewport = getCenter(p1, p2);
      lastCenterRef.current = {
        x: centerViewport.x - containerRect.left,
        y: centerViewport.y - containerRect.top
      };
    }
  };

  const handleTouchMove = (e) => {
    if (e.evt.touches.length === 2) {
      e.evt.preventDefault();
      const stage = stageRef.current;
      if (!stage) return;

      const p1 = { x: e.evt.touches[0].clientX, y: e.evt.touches[0].clientY };
      const p2 = { x: e.evt.touches[1].clientX, y: e.evt.touches[1].clientY };
      const dist = getDistance(p1, p2);

      const containerRect = stage.container().getBoundingClientRect();
      const centerViewport = getCenter(p1, p2);
      const newCenter = {
        x: centerViewport.x - containerRect.left,
        y: centerViewport.y - containerRect.top
      };

      // FIX: Si el touchStart falló, inicializamos aquí.
      if (!lastDistRef.current) lastDistRef.current = dist;
      if (!lastCenterRef.current) lastCenterRef.current = newCenter;

      // FIX: Evitar división por cero
      if (lastDistRef.current === 0) return;

      const oldScale = stage.scaleX();
      const newScale = Math.min(3, Math.max(0.3, oldScale * (dist / lastDistRef.current)));

      // Encontramos qué punto del lienzo estaba bajo los dedos antes de moverse
      const pointTo = {
        x: (lastCenterRef.current.x - stage.x()) / oldScale,
        y: (lastCenterRef.current.y - stage.y()) / oldScale,
      };

      // Queremos que ese mismo punto del lienzo quede bajo la NUEVA posición de los dedos
      const newPos = {
        x: newCenter.x - pointTo.x * newScale,
        y: newCenter.y - pointTo.y * newScale,
      };

      requestAnimationFrame(() => {
        setZoom(newScale);
        setStagePos(newPos);
      });

      lastDistRef.current = dist;
      lastCenterRef.current = newCenter;
    }
  };

  const handleTouchEnd = () => {
    lastDistRef.current = 0;
    lastCenterRef.current = null;
  };

  const handleSendToPrint = async () => {
    setIsSending(true);
    setSelectedId(null);
    await new Promise(r => setTimeout(r, 200));
    const blob = generatePDFBlob(stageRef, { widthMm: paperWidthMm, heightMm: paperHeightMm, orientation: paperConfig.orientation });
    if (!blob) { alert('Error generando el diseño.'); setIsSending(false); return; }
    if (onFinishDesign) onFinishDesign(blob, { sizeId: paperConfig.sizeId, orientation: paperConfig.orientation, paperWidthMm, paperHeightMm }, elements);
    setIsSending(false);
  };

  const handleStageClick = (e) => {
    if (e.target === e.target.getStage() || e.target.attrs.id === 'bg') setSelectedId(null);
  };

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[99999] bg-[#EFEFEF] flex flex-col overflow-hidden select-none"
      style={{ height: `${containerSize.height}px` }}
    >
      {/* Header Flotante Premium */}
      <div className="absolute top-0 inset-x-0 z-[100] p-4 pointer-events-none">
        <div className="max-w-2xl mx-auto flex justify-between items-center bg-white/70 backdrop-blur-xl border border-white/40 p-2 rounded-3xl shadow-xl pointer-events-auto">
          <button
            onClick={() => {
              if (elements.length > 0) setShowConfirmBack(true);
              else onBack();
            }}
            className="flex items-center gap-2 px-4 py-2 text-slate-800 font-black text-xs hover:bg-slate-100 rounded-2xl transition-all"
          >
            <ChevronLeft className="w-5 h-5" /> ATRÁS
          </button>

          <div className="flex flex-col items-center">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none">Diseño</span>
            <span className="text-[12px] font-black text-slate-900 uppercase">{selectedPaper?.label} {paperConfig.orientation === 'portrait' ? 'Vertical' : 'Horizontal'}</span>
          </div>

          <button onClick={() => setIsConfigOpen(true)}
            className="flex items-center gap-2 bg-gradient-melo px-5 py-2.5 rounded-2xl shadow-lg text-[11px] font-black text-white active:scale-95 transition-all">
            <Printer className="w-4 h-4" /> IMPRIMIR
          </button>
        </div>
      </div>

      {/* Contenedor del Canvas (Llenado total) */}
      <div ref={canvasContainerRef} className="flex-1 w-full h-full cursor-grab active:cursor-grabbing touch-none">
        <Stage
          ref={stageRef}
          width={stageSize.width}
          height={stageSize.height}
          x={stagePos.x} y={stagePos.y}
          draggable={true}
          onDragStart={(e) => {
            if (e.evt && e.evt.touches && e.evt.touches.length > 1) {
              e.target.stopDrag();
            }
          }}
          onDragEnd={(e) => { if (e.target === stageRef.current) setStagePos({ x: e.target.x(), y: e.target.y() }); }}
          scaleX={zoom} scaleY={zoom}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={handleStageClick}
          onTap={handleStageClick}
        >
          {useMemo(() => (
            <Layer>
              <Rect
                x={-5} y={-5} width={canvasWidth + 10} height={canvasHeight + 10}
                fill="#000" opacity={0.05} cornerRadius={4} shadowBlur={20} shadowOpacity={0.2}
                listening={false}
              />
              <Rect id="bg" x={0} y={0} width={canvasWidth} height={canvasHeight} fill="white" listening={false} />

              {elements.map(el => (
                el.type === 'text' ? (
                  <CanvasText
                    key={el.id} textData={el} isSelected={el.id === selectedId}
                    onSelect={() => setSelectedId(el.id)}
                    onDragMove={handleDragMove}
                    onDragEnd={clearGuides}
                    onTransformEnd={clearGuides}
                    onChange={(updated) => setElements(prev => prev.map(e => e.id === updated.id ? updated : e))}
                  />
                ) : (
                  <CanvasImage
                    key={el.id} imageData={el} isSelected={el.id === selectedId}
                    onSelect={() => setSelectedId(el.id)}
                    onDragMove={handleDragMove}
                    onDragEnd={clearGuides}
                    onTransformEnd={clearGuides}
                    onChange={(updated) => setElements(prev => prev.map(e => e.id === updated.id ? updated : e))}
                  />
                )
              ))}

              {guideLines.map((l, i) => (
                <Line key={i} points={[l.x1, l.y1, l.x2, l.y2]} stroke="#ec4899" strokeWidth={1.5 / zoom} dash={[4 / zoom, 4 / zoom]} listening={false} />
              ))}
            </Layer>
          ), [canvasWidth, canvasHeight, elements, selectedId, guideLines, zoom])}
        </Stage>
      </div>

      {/* Toolbar Flotante Inferior (Ajuste dinámico para Gestos y Botones) */}
      <div className="absolute bottom-[calc(env(safe-area-inset-bottom,0px)+1.5rem)] inset-x-0 z-[100] flex justify-center px-4 pointer-events-none">
        <div className="pointer-events-auto">
          <CanvasToolbar
            onAddImage={async (files) => {
              const newElements = await Promise.all(files.map((f, i) => processImage(URL.createObjectURL(f), i)));
              setElements(prev => [...prev, ...newElements]);
            }}
            onAddText={() => {
              const t = {
                id: `el-${Date.now()}`,
                type: 'text',
                text: 'Doble clic para editar',
                x: 50, y: 50,
                fontSize: 24,
                fontFamily: 'Inter',
                fontStyle: 'bold',
                fill: '#1e293b',
                width: 200,
                rotation: 0
              };
              setElements(prev => [...prev, t]);
              setSelectedId(t.id);
            }}
            onDeleteSelected={() => { setElements(prev => prev.filter(e => e.id !== selectedId)); setSelectedId(null); }}
            zoom={zoom} onZoomChange={setZoom} hasSelection={!!selectedId}
          />
        </div>
      </div>

      {/* PrintDrawer (Modal Inferior) */}
      <PrintDrawer
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        paperConfig={paperConfig}
        onPaperChange={setPaperConfig}
        onSendToPrint={handleSendToPrint}
        isSending={isSending}
      />

      {/* Overlay de Ayuda / Tutorial rápido */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-[1000] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[3rem] p-8 max-w-xs text-center space-y-6 shadow-2xl border border-white"
            >
              <div className="w-16 h-16 bg-gradient-melo text-white rounded-3xl flex items-center justify-center mx-auto shadow-lg floating">
                <MousePointer2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900">¡Todo MELO!</h3>
                <p className="text-sm text-slate-500 mt-2">
                  Arrastra el fondo para mover la hoja.<br />
                  Pincha para hacer zoom.<br />
                  Toca una foto para editarla.
                </p>
              </div>
              <button
                onClick={() => {
                  setShowHelp(false);
                  localStorage.setItem('melo_help_seen', 'true');
                }}
                className="btn-melo w-full py-4 rounded-2xl text-sm"
              >
                ¡A DISEÑAR!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Modal de Confirmación de Salida */}
      <AnimatePresence>
        {showConfirmBack && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-[2000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] p-8 max-w-xs w-full text-center space-y-6 shadow-2xl"
            >
              <div className="w-16 h-16 bg-red-100 text-red-500 rounded-3xl flex items-center justify-center mx-auto">
                <Info className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">¿Estás seguro?</h3>
                <p className="text-sm text-slate-500 mt-2">
                  Se perderán todos los cambios que hayas hecho en tu diseño.
                </p>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    localStorage.removeItem(STORAGE_KEY);
                    localStorage.removeItem(`${STORAGE_KEY}_config`);
                    onBack();
                  }}
                  className="w-full py-4 rounded-2xl bg-red-500 text-white font-black text-sm active:scale-95 transition-all"
                >
                  SÍ, SALIR Y LIMPIAR
                </button>
                <button
                  onClick={() => setShowConfirmBack(false)}
                  className="w-full py-4 rounded-2xl bg-slate-100 text-slate-600 font-black text-sm active:scale-95 transition-all"
                >
                  CONTINUAR DISEÑANDO
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CanvasEditor;
