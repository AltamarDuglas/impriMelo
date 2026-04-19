import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ScrollText, Copy, Trash2, Plus } from 'lucide-react';
import { PAPERS, MODES } from '../HomeConstants';
import PagePreview from './PagePreview';

/**
 * Componente para el Paso 2: Configuración de Impresión.
 * SOLID: Responsabilidad Única - Maneja la lógica de configuración y resumen.
 */
const ConfigStep = ({ 
  config, 
  setConfig, 
  previews, 
  files,
  onRemoveFile, 
  onMultiplyFile, 
  onFileChange,
  onBack, 
  onConfirm, 
  isUploading, 
  totalPages, 
  currentPrice,
  pdfPagePreviews,
  isRenderingPages
}) => {
  return (
    <motion.section
      key="step2"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="flex flex-col lg:grid lg:grid-cols-2 gap-4 w-full h-full overflow-hidden"
    >
      {/* Vista Previa (Solo Escritorio) */}
      <div className="hidden lg:flex lg:order-2 h-full glass-card-thick p-4 flex-col items-center justify-center relative overflow-hidden">
        <p className="absolute top-3 left-1/2 -translate-x-1/2 text-[9px] font-black text-slate-400  tracking-widest z-20 bg-white/60 px-3 py-1 rounded-full backdrop-blur-md">
          Vista Previa Real
        </p>
        <div className="w-full h-full flex items-center justify-center mt-2">
          <PagePreview 
            config={config} 
            previews={previews} 
            pdfPagePreviews={pdfPagePreviews}
            isRenderingPages={isRenderingPages}
            setConfig={setConfig}
          />
        </div>
      </div>

      {/* 2. Panel de Opciones (Abajo en móvil, Izquierda en escritorio) */}
      <div className="order-2 lg:order-1 flex-1 lg:h-full overflow-y-auto space-y-6 pr-1 custom-scrollbar pb-32 lg:pb-10">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-800 hover:text-pink-500 font-bold transition-all text-[10px]  tracking-widest"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Regresar
          </button>
          <div className="bg-white/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/60 shadow-sm">
            <p className="text-[10px] font-black text-slate-950">${currentPrice.toLocaleString('es-CO')} <span className="opacity-40">({totalPages}p)</span></p>
          </div>
        </div>

        <h2 className="text-3xl md:text-5xl font-black text-slate-950 leading-none tracking-tighter">
          Configura tu <br />
          <span className="text-gradient-melo">Impresión</span>
        </h2>

        {/* 1. Selección de Papel */}
        <div className="glass-card p-4 md:p-5 space-y-4 shadow-sm border-white/40">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-xs font-black shadow-sm">1</span>
            <p className="text-sm font-bold text-slate-800 tracking-widest">Elige tu Papel</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {PAPERS.map((p) => (
              <button
                key={p.id}
                onClick={() => setConfig({ ...config, paperType: p.id })}
                style={{
                  backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.5) 100%), url(${p.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
                className={`relative p-3 rounded-3xl border-2 text-left transition-all overflow-hidden min-h-[130px] flex flex-col justify-end ${
                  config.paperType === p.id
                    ? 'border-pink-500 shadow-lg scale-[1.02]'
                    : 'border-white/50 hover:border-pink-300'
                }`}
              >
                <div className="relative z-10">
                  <p.Icon className={`w-6 h-6 mb-1 transition-colors ${config.paperType === p.id ? 'text-pink-400' : 'text-white/80'}`} />
                  <p className="font-bold text-white text-base drop-shadow-md">{p.label}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Formato de Impresión */}
        {config.printMode !== 'pdf' && (
          <div className="glass-card p-4 md:p-5 space-y-4 shadow-sm border-white/40">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-black shadow-sm">2</span>
              <p className="text-sm font-bold text-slate-800 tracking-widest">Elige el Formato</p>
            </div>
            <div className="relative p-1 bg-white/50 backdrop-blur-xl rounded-[2rem] border border-white/60 flex items-center h-20 shadow-inner overflow-hidden">
              {/* Cápsula Deslizante */}
              <div className="absolute inset-0 w-full h-full p-1 pointer-events-none">
                <div className="grid grid-cols-3 h-full w-full">
                  {MODES.map((m) => (
                    <div key={m.id} className="relative w-full h-full">
                      {config.printMode === m.id && (
                        <motion.div
                          layoutId="active-pill"
                          transition={{ type: "spring", stiffness: 350, damping: 30 }}
                          className="w-full h-full bg-white rounded-[1.8rem] shadow-sm border border-slate-100 flex items-center justify-center relative overflow-hidden"
                        >
                           <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-melo" />
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {MODES.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setConfig({ ...config, printMode: m.id })}
                  className="relative z-10 flex-1 h-full flex flex-col items-center justify-center gap-1 transition-all"
                >
                  <m.Icon className={`w-6 h-6 transition-all duration-500 ${
                    config.printMode === m.id ? 'text-pink-500 scale-110' : 'text-slate-400'
                  }`} />
                  <p className={`text-[10px] font-bold tracking-widest transition-colors ${
                    config.printMode === m.id ? 'text-slate-950' : 'text-slate-500'
                  }`}>
                    {m.label}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Configuración PDF */}
        {config.printMode === 'pdf' && (
          <div className="glass-card p-4 md:p-5 space-y-4 shadow-sm border-white/40">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-black shadow-sm">2</span>
              <p className="text-sm font-bold text-slate-800 tracking-widest">Páginas a Imprimir</p>
            </div>
            <div className="bg-white/50 rounded-2xl p-5 space-y-4 border border-white/60 shadow-sm">
              <div className="flex gap-6">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="radio" name="pdfRange" value="all" checked={config.pdfRange === 'all'} onChange={() => setConfig({ ...config, pdfRange: 'all' })} className="w-5 h-5 accent-pink-500" />
                  <span className="font-bold text-sm text-slate-800 group-hover:text-pink-600">Todas ({previews[0]?.pages})</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="radio" name="pdfRange" value="custom" checked={config.pdfRange === 'custom'} onChange={() => setConfig({ ...config, pdfRange: 'custom' })} className="w-5 h-5 accent-pink-500" />
                  <span className="font-bold text-sm text-slate-800 group-hover:text-pink-600">Personalizado</span>
                </label>
              </div>
              {config.pdfRange === 'custom' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-3 border-t border-white/60">
                  <input 
                    type="text" 
                    placeholder="Ej: 1-5, 8" 
                    value={config.pdfCustomRange} 
                    onChange={(e) => setConfig({ ...config, pdfCustomRange: e.target.value })} 
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-pink-500 outline-none transition-all text-sm font-bold text-slate-950 placeholder:text-slate-400" 
                  />
                </motion.div>
              )}
            </div>
          </div>
        )}

        {/* 3. Vista Previa Real */}
        <div className="glass-card p-3 rounded-[2.5rem] shadow-sm border border-white/40">
           <div className="flex items-center gap-3 p-4">
              <span className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-black shadow-sm">3</span>
              <p className="text-sm font-bold text-slate-800 tracking-widest">Vista Previa Real</p>
           </div>
           <div className="h-[520px] lg:hidden relative overflow-hidden rounded-[2rem] bg-white border border-slate-100">
              <PagePreview 
                config={config} 
                previews={previews} 
                pdfPagePreviews={pdfPagePreviews}
                isRenderingPages={isRenderingPages}
                setConfig={setConfig}
              />
           </div>
        </div>

        {/* 4 y 5. Copias y Orientación */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-card p-4 md:p-5 space-y-4 shadow-sm border-white/40">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-black shadow-sm">4</span>
              <p className="text-sm font-bold text-slate-800 tracking-widest">Copias</p>
            </div>
            <div className="flex items-center justify-between bg-white/50 p-3 rounded-2xl border border-white/60 shadow-sm">
              <button onClick={() => setConfig({ ...config, copies: Math.max(1, config.copies - 1) })} className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm text-slate-800 font-black hover:bg-slate-50">-</button>
              <span className="font-black text-lg text-slate-950">{config.copies}</span>
              <button onClick={() => setConfig({ ...config, copies: config.copies + 1 })} className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm text-slate-800 font-black hover:bg-slate-50">+</button>
            </div>
          </div>

          <div className="glass-card p-4 md:p-5 space-y-4 shadow-sm border-white/40">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center text-xs font-black shadow-sm">5</span>
              <p className="text-sm font-bold text-slate-800 tracking-widest">Orientación</p>
            </div>
            <div className="flex gap-2">
               <button
                onClick={() => setConfig({ ...config, orientation: 'portrait' })}
                className={`flex-1 p-3 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                  config.orientation === 'portrait' ? 'border-pink-500 bg-pink-50 text-pink-600' : 'border-white/60 bg-white/50 text-slate-400'
                }`}
              >
                <div className="w-5 h-7 border-2 border-current rounded-[2px] opacity-80" />
                <p className="text-[10px] font-bold tracking-widest">Vertical</p>
              </button>
              <button
                onClick={() => setConfig({ ...config, orientation: 'landscape' })}
                className={`flex-1 p-3 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                  config.orientation === 'landscape' ? 'border-pink-500 bg-pink-50 text-pink-600' : 'border-white/60 bg-white/50 text-slate-400'
                }`}
              >
                <div className="w-7 h-5 border-2 border-current rounded-[2px] opacity-80" />
                <p className="text-[10px] font-bold tracking-widest">Horizontal</p>
              </button>
            </div>
          </div>
        </div>

        {/* Gestión de Mosaico / Múltiples Imágenes */}
        {(config.printMode === 'mosaico' || config.printMode === 'individual') && (
          <div className="space-y-4">
            {config.printMode === 'mosaico' && (
              <div className="p-4 md:p-5 glass-card shadow-sm border border-white/40 space-y-5">
                <div className="flex justify-between items-center px-1">
                  <p className="text-xs font-bold text-slate-600 tracking-widest">Columnas del Mosaico</p>
                  <p className="text-2xl font-black text-pink-500">{config.mosaic.columns}</p>
                </div>
                <div className="relative group px-2">
                  <input
                    type="range" min="1" max="10" step="1"
                    value={config.mosaic.columns}
                    onChange={(e) => {
                      const cols = parseInt(e.target.value);
                      const size = parseFloat((20 / cols).toFixed(1));
                      setConfig({
                        ...config,
                        mosaic: { columns: cols, sizeCm: size }
                      });
                    }}
                    className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-pink-500 hover:accent-pink-400 transition-all"
                  />
                  {/* Marcas visuales del slider */}
                  <div className="flex justify-between mt-2 px-1 text-[10px] font-bold text-slate-400">
                    <span>1</span>
                    <span>5</span>
                    <span>10</span>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto p-2 bg-white/30 backdrop-blur-sm rounded-3xl border border-white/40">
              {previews.map((prev, idx) => (
                <div key={idx} className="relative group aspect-square bg-white/40 rounded-2xl overflow-hidden shadow-sm border border-white/60 flex items-center justify-center">
                  {prev.isImage ? (
                    <img src={prev.url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400 p-1 text-center w-full h-full bg-slate-50">
                      <ScrollText className="w-5 h-5 text-pink-400 opacity-80" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-1">
                    <button
                      type="button" onClick={() => onMultiplyFile(idx)}
                      className="p-1 bg-white rounded-full text-blue-600"
                    ><Plus className="w-3 h-3" /></button>
                    <button
                      type="button" onClick={() => onRemoveFile(idx)}
                      className="p-1 bg-white rounded-full text-red-600"
                    ><Trash2 className="w-3 h-3" /></button>
                  </div>
                </div>
              ))}
              <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-slate-300 rounded-xl hover:border-blue-400 hover:bg-blue-50/20 cursor-pointer transition-all bg-white">
                <input type="file" multiple className="hidden" onChange={onFileChange} accept="image/*,.pdf" disabled={isUploading} />
                <Plus className="w-5 h-5 text-slate-400" />
              </label>
            </div>
          </div>
        )}

        {/* Resumen de Precio */}
        <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-100 flex justify-between items-center shadow-inner">
          <p className="text-xl font-black text-slate-950">${currentPrice.toLocaleString('es-CO')}</p>
          <p className="text-[10px] font-bold text-slate-500 ">{totalPages} págs</p>
        </div>

        <button
          onClick={onConfirm}
          disabled={isUploading}
          className="btn-melo w-full py-4 text-sm flex justify-center items-center shadow-2xl"
        >
          {isUploading ? "Procesando..." : "Confirmar Pedido"}
          {!isUploading && <ChevronRight className="w-5 h-5 ml-2" />}
        </button>
      </div>
    </motion.section>
  );
};

export default ConfigStep;
