import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Line } from 'react-konva';
import { motion, AnimatePresence } from 'framer-motion';
import { Printer, ChevronLeft, Info, MousePointer2 } from 'lucide-react';

import CanvasImage from './CanvasImage';
import CanvasToolbar from './CanvasToolbar';
import PrintDrawer from './PrintDrawer';
import { PAPER_SIZES } from '../HomeConstants';
import { generatePDFBlob } from '../utils/pdfExporter';
import { useCanvasSnap } from '../hooks/useCanvasSnap';
import { useCanvasKeyboard } from '../hooks/useCanvasKeyboard';

/**
 * CanvasEditor v6 - Rediseño Total "Mobile-First Premium".
 * 
 * SOLID: Orquestación Limpia.
 * Cambios: Layout absoluto, soporte para Safe Areas, estética de Isla Flotante.
 */
const CanvasEditor = ({ initialImages = [], onBack, onFinishDesign }) => {
  const [paperConfig, setPaperConfig] = useState({ sizeId: 'carta', orientation: 'portrait' });
  const [elements, setElements] = useState([]);
  const [textElements, setTextElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [zoom, setZoom] = useState(0.6); // Zoom inicial un poco más alejado para móviles
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [containerSize, setContainerSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const stageRef = useRef(null);
  const canvasContainerRef = useRef(null);
  const [stageSize, setStageSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  // Bloqueo total del scroll del body y ocultación de UI del sistema
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100dvh'; // Dynamic Viewport Height
    
    const elementsToHide = document.querySelectorAll('nav, footer, .fixed.bottom-6, .fixed.bottom-0.h-40');
    elementsToHide.forEach(el => el.style.display = 'none');
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
      elementsToHide.forEach(el => el.style.display = '');
    };
  }, []);

  const selectedPaper = PAPER_SIZES.find(p => p.id === paperConfig.sizeId);
  const paperWidthMm = selectedPaper ? (paperConfig.orientation === 'landscape' ? selectedPaper.heightMm : selectedPaper.widthMm) : 215.9;
  const paperHeightMm = selectedPaper ? (paperConfig.orientation === 'landscape' ? selectedPaper.widthMm : selectedPaper.heightMm) : 279.4;
  const paperAspect = paperWidthMm / paperHeightMm;

  // Cálculo del tamaño visual del lienzo (en px)
  const availableW = containerSize.width;
  const availableH = containerSize.height;
  let canvasWidth, canvasHeight;
  
  if (availableW / availableH > paperAspect) {
    canvasHeight = availableH * 0.7; // Deja espacio para UI
    canvasWidth = canvasHeight * paperAspect;
  } else {
    canvasWidth = availableW * 0.85; // Margen lateral
    canvasHeight = canvasWidth / paperAspect;
  }

  const { guideLines, handleDragMove } = useCanvasSnap(canvasWidth, canvasHeight, elements, selectedId);
  useCanvasKeyboard(elements, selectedId, setElements, setTextElements, setSelectedId);

  // ResizeObserver para el contenedor
  useEffect(() => {
    const el = canvasContainerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        setStageSize({ width: entry.contentRect.width, height: entry.contentRect.height });
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

  // Carga de imágenes iniciales
  useEffect(() => {
    if (initialImages.length > 0 && elements.length === 0) {
      setElements(initialImages.map((src, i) => ({
        id: `img-${Date.now()}-${i}`,
        src, 
        x: (canvasWidth - 150) / 2 + (i * 20), 
        y: (canvasHeight - 150) / 2 + (i * 20), 
        width: 150, 
        height: 150, 
        rotation: 0,
      })));
    }
  }, [initialImages, canvasWidth, canvasHeight]);

  const handleWheel = (e) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    const mp = { x: (pointer.x - stage.x()) / oldScale, y: (pointer.y - stage.y()) / oldScale };
    const ns = Math.min(3, Math.max(0.3, e.evt.deltaY > 0 ? oldScale / 1.05 : oldScale * 1.05));
    setZoom(ns);
    setStagePos({ x: pointer.x - mp.x * ns, y: pointer.y - mp.y * ns });
  };

  const handleSendToPrint = async () => {
    setIsSending(true);
    setSelectedId(null);
    await new Promise(r => setTimeout(r, 200));
    const blob = generatePDFBlob(stageRef, { widthMm: paperWidthMm, heightMm: paperHeightMm, orientation: paperConfig.orientation });
    if (!blob) { alert('Error generando el diseño.'); setIsSending(false); return; }
    if (onFinishDesign) onFinishDesign(blob, { sizeId: paperConfig.sizeId, orientation: paperConfig.orientation, paperWidthMm, paperHeightMm });
    setIsSending(false);
  };

  const handleStageClick = (e) => {
    if (e.target === e.target.getStage() || e.target.attrs.id === 'bg') setSelectedId(null);
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-[#EFEFEF] flex flex-col overflow-hidden select-none">
      {/* Header Flotante Premium */}
      <div className="absolute top-0 inset-x-0 z-[100] p-4 pointer-events-none">
        <div className="max-w-2xl mx-auto flex justify-between items-center bg-white/70 backdrop-blur-xl border border-white/40 p-2 rounded-3xl shadow-xl pointer-events-auto">
          <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 text-slate-800 font-black text-xs hover:bg-slate-100 rounded-2xl transition-all">
            <ChevronLeft className="w-5 h-5" /> ATRÁS
          </button>
          
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none">Diseño</span>
            <span className="text-[12px] font-black text-slate-900 uppercase">{selectedPaper?.label} {paperConfig.orientation === 'portrait' ? 'V' : 'H'}</span>
          </div>

          <button onClick={() => setIsConfigOpen(true)}
            className="flex items-center gap-2 bg-gradient-melo px-5 py-2.5 rounded-2xl shadow-lg text-[11px] font-black text-white active:scale-95 transition-all">
            <Printer className="w-4 h-4" /> IMPRIMIR
          </button>
        </div>
      </div>

      {/* Contenedor del Canvas (Llenado total) */}
      <div ref={canvasContainerRef} className="flex-1 w-full h-full cursor-grab active:cursor-grabbing">
        <Stage
          ref={stageRef} 
          width={stageSize.width} 
          height={stageSize.height}
          x={stagePos.x} y={stagePos.y} 
          draggable={true}
          onDragEnd={(e) => { if (e.target === stageRef.current) setStagePos({ x: e.target.x(), y: e.target.y() }); }}
          scaleX={zoom} scaleY={zoom} 
          onWheel={handleWheel} 
          onClick={handleStageClick} 
          onTap={handleStageClick}
        >
          <Layer>
            {/* Sombras de la hoja para realismo */}
            <Rect 
              x={-5} y={-5} width={canvasWidth + 10} height={canvasHeight + 10} 
              fill="#000" opacity={0.05} cornerRadius={4} shadowBlur={20} shadowOpacity={0.2}
            />
            {/* Hoja Blanca */}
            <Rect id="bg" x={0} y={0} width={canvasWidth} height={canvasHeight} fill="white" />
            
            {elements.map(el => (
              <CanvasImage 
                key={el.id} imageData={el} isSelected={el.id === selectedId} 
                onSelect={() => setSelectedId(el.id)} 
                onDragMove={handleDragMove} 
                onChange={(updated) => setElements(prev => prev.map(e => e.id === updated.id ? updated : e))} 
              />
            ))}
            
            {guideLines.map((l, i) => (
              <Line key={i} points={[l.x1, l.y1, l.x2, l.y2]} stroke="#ec4899" strokeWidth={1.5 / zoom} dash={[4 / zoom, 4 / zoom]} />
            ))}
          </Layer>
        </Stage>
      </div>

      {/* Toolbar Flotante Inferior */}
      <div className="absolute bottom-12 pb-[env(safe-area-inset-bottom)] inset-x-0 z-[100] flex justify-center px-4 pointer-events-none">
        <div className="pointer-events-auto">
          <CanvasToolbar
            onAddImage={(files) => { 
              setElements(prev => [...prev, ...files.map((f, i) => ({ 
                id: `img-${Date.now()}-${i}`, 
                src: URL.createObjectURL(f), 
                x: 50 + (i*10), y: 50 + (i*10), 
                width: 120, height: 120, rotation: 0 
              }))]); 
            }}
            onAddText={() => { 
              const t = { id: `txt-${Date.now()}`, text: 'Texto', x: 50, y: 50, fontSize: 30, fill: '#000' }; 
              setTextElements(prev => [...prev, t]); 
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
                  Arrastra el fondo para mover la hoja.<br/>
                  Pincha para hacer zoom.<br/>
                  Toca una foto para editarla.
                </p>
              </div>
              <button 
                onClick={() => setShowHelp(false)} 
                className="btn-melo w-full py-4 rounded-2xl text-sm"
              >
                ¡A DISEÑAR!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CanvasEditor;
