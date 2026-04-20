import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Line } from 'react-konva';
import { motion, AnimatePresence } from 'framer-motion';
import { Printer, ChevronLeft, Info } from 'lucide-react';

import CanvasImage from './CanvasImage';
import CanvasToolbar from './CanvasToolbar';
import PrintDrawer from './PrintDrawer';
import { PAPER_SIZES } from '../HomeConstants';
import { generatePDFBlob } from '../utils/pdfExporter';
import { useCanvasSnap } from '../hooks/useCanvasSnap';
import { useCanvasKeyboard } from '../hooks/useCanvasKeyboard';

/**
 * CanvasEditor v5 - Orquestador SOLID.
 */
const CanvasEditor = ({ initialImages = [], onBack, onFinishDesign }) => {
  const [paperConfig, setPaperConfig] = useState({ sizeId: 'carta', orientation: 'portrait' });
  const [elements, setElements] = useState([]);
  const [textElements, setTextElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [zoom, setZoom] = useState(0.7);
  const [stagePos, setStagePos] = useState({ x: 0, y: 20 });
  const [containerSize, setContainerSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const stageRef = useRef(null);
  const canvasContainerRef = useRef(null);
  const [stageSize, setStageSize] = useState({ width: window.innerWidth, height: 400 });

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    const elementsToHide = document.querySelectorAll('nav, footer, .fixed.bottom-6, .fixed.bottom-0.h-40');
    elementsToHide.forEach(el => el.style.display = 'none');
    return () => {
      document.body.style.overflow = ''; document.body.style.position = ''; document.body.style.width = '';
      elementsToHide.forEach(el => el.style.display = '');
    };
  }, []);

  const selectedPaper = PAPER_SIZES.find(p => p.id === paperConfig.sizeId);
  const paperWidthMm = selectedPaper ? (paperConfig.orientation === 'landscape' ? selectedPaper.heightMm : selectedPaper.widthMm) : 215.9;
  const paperHeightMm = selectedPaper ? (paperConfig.orientation === 'landscape' ? selectedPaper.widthMm : selectedPaper.heightMm) : 279.4;
  const paperAspect = paperWidthMm / paperHeightMm;

  const availableW = containerSize.width - 40;
  const availableH = containerSize.height - 180;
  let canvasWidth, canvasHeight;
  if (availableW / availableH > paperAspect) {
    canvasHeight = availableH; canvasWidth = canvasHeight * paperAspect;
  } else {
    canvasWidth = availableW; canvasHeight = canvasWidth / paperAspect;
  }

  const { guideLines, handleDragMove } = useCanvasSnap(canvasWidth, canvasHeight, elements, selectedId);
  useCanvasKeyboard(elements, selectedId, setElements, setTextElements, setSelectedId);

  useEffect(() => {
    const updateSize = () => setContainerSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

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

  useEffect(() => {
    setStagePos({ x: (containerSize.width - canvasWidth * zoom) / 2, y: 20 });
  }, [containerSize.width, canvasWidth, zoom]);

  useEffect(() => {
    if (initialImages.length > 0 && elements.length === 0) {
      setElements(initialImages.map((src, i) => ({
        id: `img-${Date.now()}-${i}`,
        src, x: 20, y: 20, width: canvasWidth * 0.5, height: canvasWidth * 0.5 * 0.75, rotation: 0,
      })));
    }
  }, [initialImages, canvasWidth]);

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
    setIsSending(true); setSelectedId(null);
    await new Promise(r => setTimeout(r, 200));
    const blob = generatePDFBlob(stageRef, { widthMm: paperWidthMm, heightMm: paperHeightMm, orientation: paperConfig.orientation });
    if (!blob) { alert('Error generando el diseño.'); setIsSending(false); return; }
    if (onFinishDesign) {
      onFinishDesign(blob, { sizeId: paperConfig.sizeId, orientation: paperConfig.orientation, paperWidthMm, paperHeightMm });
    }
    setIsSending(false); setIsConfigOpen(false);
  };

  const handleStageClick = (e) => {
    if (e.target === e.target.getStage() || e.target.attrs.id === 'bg') setSelectedId(null);
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-[#F1F0EC] flex flex-col overflow-hidden select-none">
      <div className="shrink-0 p-3 flex justify-between items-center bg-white/50 backdrop-blur-md border-b border-white/20">
        <button onClick={onBack} className="flex items-center gap-1 text-slate-900 font-black text-xs">
          <ChevronLeft className="w-5 h-5" /> ATRÁS
        </button>
        <button onClick={() => setIsConfigOpen(true)}
          className="flex items-center gap-2 bg-gradient-melo px-5 py-2.5 rounded-xl shadow-lg text-[11px] font-black text-white">
          <Printer className="w-4 h-4" /> IMPRIMIR
        </button>
      </div>

      <div ref={canvasContainerRef} className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0">
          <Stage
            ref={stageRef} width={stageSize.width} height={stageSize.height}
            x={stagePos.x} y={stagePos.y} draggable={true}
            onDragEnd={(e) => { if (e.target === stageRef.current) setStagePos({ x: e.target.x(), y: e.target.y() }); }}
            scaleX={zoom} scaleY={zoom} onWheel={handleWheel} onClick={handleStageClick} onTap={handleStageClick}
          >
            <Layer>
              <Rect id="bg" x={0} y={0} width={canvasWidth} height={canvasHeight} fill="white" shadowColor="black" shadowBlur={20} shadowOpacity={0.1} />
              {elements.map(el => (
                <CanvasImage key={el.id} imageData={el} isSelected={el.id === selectedId} onSelect={() => setSelectedId(el.id)} onDragMove={handleDragMove} onChange={(updated) => setElements(prev => prev.map(e => e.id === updated.id ? updated : e))} />
              ))}
              {guideLines.map((l, i) => (
                <Line key={i} points={[l.x1, l.y1, l.x2, l.y2]} stroke="#ec4899" strokeWidth={1.5 / zoom} dash={[4 / zoom, 4 / zoom]} />
              ))}
            </Layer>
          </Stage>
        </div>
      </div>

      <div className="shrink-0 flex justify-center py-2 bg-white border-t border-slate-200">
        <CanvasToolbar
          onAddImage={(files) => { setElements(prev => [...prev, ...files.map((f, i) => ({ id: `img-${Date.now()}-${i}`, src: URL.createObjectURL(f), x: 20, y: 20, width: 120, height: 120, rotation: 0 }))]); }}
          onAddText={() => { const t = { id: `txt-${Date.now()}`, text: 'Texto', x: 20, y: 20, fontSize: 30, fill: '#000' }; setTextElements(prev => [...prev, t]); setSelectedId(t.id); }}
          onDeleteSelected={() => { setElements(prev => prev.filter(e => e.id !== selectedId)); setSelectedId(null); }}
          zoom={zoom} onZoomChange={setZoom} hasSelection={!!selectedId}
        />
      </div>

      <PrintDrawer isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)} paperConfig={paperConfig} onPaperChange={setPaperConfig} onSendToPrint={handleSendToPrint} isSending={isSending} />

      <AnimatePresence>
        {showHelp && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-[300] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="bg-white rounded-[2.5rem] p-8 max-w-xs text-center space-y-4">
              <div className="w-12 h-12 bg-pink-100 text-pink-500 rounded-full flex items-center justify-center mx-auto"><Info className="w-6 h-6" /></div>
              <h3 className="text-xl font-black">¡A Diseñar!</h3>
              <p className="text-sm text-slate-500">Arrastra el fondo para mover la hoja. Toca una foto para editarla.</p>
              <button onClick={() => setShowHelp(false)} className="btn-melo w-full py-3 rounded-xl">¡MELO!</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CanvasEditor;
