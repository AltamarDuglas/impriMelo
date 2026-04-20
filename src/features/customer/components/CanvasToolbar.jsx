import React, { useRef } from 'react';
import { ImagePlus, Type, Trash2, ZoomIn, ZoomOut } from 'lucide-react';

const CanvasToolbar = ({ onAddImage, onAddText, onDeleteSelected, zoom, onZoomChange, hasSelection }) => {
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) onAddImage(files);
    e.target.value = '';
  };

  return (
    <>
      <input ref={fileInputRef} type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={handleFileSelect} />
      <div className="flex items-center gap-1 px-2 py-2 bg-white/90 backdrop-blur-2xl rounded-2xl shadow-lg border border-white/80">
        <button onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center justify-center w-12 h-12 rounded-xl text-slate-600 active:bg-pink-50 active:text-pink-500">
          <ImagePlus className="w-5 h-5" />
          <span className="text-[8px] font-bold mt-0.5">Imagen</span>
        </button>
        <button onClick={onAddText}
          className="flex flex-col items-center justify-center w-12 h-12 rounded-xl text-slate-600 active:bg-pink-50 active:text-pink-500">
          <Type className="w-5 h-5" />
          <span className="text-[8px] font-bold mt-0.5">Texto</span>
        </button>
        {hasSelection && (
          <button onClick={onDeleteSelected}
            className="flex flex-col items-center justify-center w-12 h-12 rounded-xl text-red-500 active:bg-red-50">
            <Trash2 className="w-5 h-5" />
            <span className="text-[8px] font-bold mt-0.5">Borrar</span>
          </button>
        )}
        <div className="w-px h-8 bg-slate-200 mx-1" />
        <button onClick={() => onZoomChange(Math.max(0.3, zoom - 0.1))}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 active:bg-slate-100">
          <ZoomOut className="w-4 h-4" />
        </button>
        <span className="text-[10px] font-black text-slate-600 w-10 text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button onClick={() => onZoomChange(Math.min(3, zoom + 0.1))}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 active:bg-slate-100">
          <ZoomIn className="w-4 h-4" />
        </button>
      </div>
    </>
  );
};

export default CanvasToolbar;
