import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { ImagePlus, Type, Trash2, ZoomIn, ZoomOut, Plus } from 'lucide-react';

/**
 * CanvasToolbar v3 - Rediseño Premium "Floating Pill".
 * 
 * SOLID: Single Responsibility - Solo UI de herramientas.
 * Estética: Isla flotante con Glassmorphism y micro-interacciones.
 */
const CanvasToolbar = ({ onAddImage, onAddText, onDeleteSelected, zoom, onZoomChange, hasSelection }) => {
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) onAddImage(files);
    e.target.value = '';
  };

  return (
    <motion.div 
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="flex items-center gap-2 p-2 bg-white/80 backdrop-blur-2xl rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/50 ring-1 ring-black/5"
    >
      <input ref={fileInputRef} type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={handleFileSelect} />
      
      {/* Grupo de Acciones Principales */}
      <div className="flex items-center gap-1 bg-slate-100/50 p-1 rounded-2xl">
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all active:scale-90 hover:bg-white text-slate-700"
        >
          <div className="relative">
            <ImagePlus className="w-5 h-5" />
            <Plus className="w-3 h-3 absolute -top-1 -right-1 bg-pink-500 text-white rounded-full p-0.5" />
          </div>
          <span className="text-[9px] font-black mt-1 uppercase tracking-tighter">Fotos</span>
        </button>

        <button 
          onClick={onAddText}
          className="flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all active:scale-90 hover:bg-white text-slate-700"
        >
          <Type className="w-5 h-5" />
          <span className="text-[9px] font-black mt-1 uppercase tracking-tighter">Texto</span>
        </button>
      </div>

      {/* Separador Visual */}
      <div className="w-px h-8 bg-slate-200/50 mx-1" />

      {/* Controles de Zoom Premium */}
      <div className="flex items-center gap-1">
        <button 
          onClick={() => onZoomChange(Math.max(0.3, zoom - 0.1))}
          className="w-10 h-10 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 active:scale-90 transition-all"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        
        <div className="flex flex-col items-center justify-center min-w-[3rem]">
          <span className="text-[10px] font-black text-slate-900 leading-none">
            {Math.round(zoom * 100)}%
          </span>
          <span className="text-[7px] font-black text-slate-400 uppercase mt-0.5 tracking-tighter">Zoom</span>
        </div>

        <button 
          onClick={() => onZoomChange(Math.min(3, zoom + 0.1))}
          className="w-10 h-10 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 active:scale-90 transition-all"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
      </div>

      {/* Acción de Borrar (Flotante lateral si hay selección) */}
      {hasSelection && (
        <motion.button 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          onClick={onDeleteSelected}
          className="ml-2 w-14 h-14 flex flex-col items-center justify-center rounded-2xl bg-red-500 text-white shadow-lg shadow-red-200 active:scale-90 transition-all"
        >
          <Trash2 className="w-5 h-5" />
          <span className="text-[9px] font-black mt-1 uppercase tracking-tighter">Borrar</span>
        </motion.button>
      )}
    </motion.div>
  );
};

export default CanvasToolbar;
