import React, { useState, useEffect } from 'react';
import { 
  Upload, ImageIcon, CheckCircle2, Sparkles, Truck, 
  Image as ImageIconLucide, ScrollText, StickyNote, 
  UserSquare2, LayoutGrid, ChevronRight, ChevronLeft,
  Info, AlertCircle, Plus, Copy, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Vista de Inicio para Clientes (HomeView) - Evolución impriMELO.
 * 
 * Implementa un flujo de 3 pasos para una personalización completa:
 * 1. Selección de Imagen.
 * 2. Configuración de Impresión (Papel, Formato, Mosaico).
 * 3. Confirmación y Envío.
 * 
 * Sigue principios de SOLID al separar la lógica de configuración del renderizado.
 */

const PAPERS = [
  { id: 'normal', label: 'Papel Normal', desc: 'Ideal para documentos y fotos mate.', Icon: ScrollText },
  { id: 'fotografico_adhesivo', label: 'Papel Fotográfico Adhesivo', desc: '¡Convierte tus fotos en stickers! Brillo pro.', Icon: StickyNote },
];

const MODES = [
  { id: 'individual', label: 'Individual', desc: 'Una foto por hoja (A4/Carta).', Icon: ImageIconLucide },
  { id: 'tarjeta', label: 'Tarjeta', desc: 'Formato pequeño (9x5cm).', Icon: UserSquare2 },
  { id: 'mosaico', label: 'Mosaico (Stickers)', desc: 'Repite tu foto en cuadrícula.', Icon: LayoutGrid },
];

const HomeView = () => {
  const [step, setStep] = useState(1); // 1: Upload, 2: Config, 3: Success
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [config, setConfig] = useState({
    paperType: 'normal',
    printMode: 'individual',
    orientation: 'portrait', // Nuevo: portrait o landscape
    mosaic: {
      columns: 4,
      sizeCm: 5
    }
  });
  const [isUploading, setIsUploading] = useState(false);

  const { token, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 0) {
      if (config.printMode === 'mosaico') {
        setFiles(prev => [...prev, ...selectedFiles]);
        setPreviews(prev => [...prev, ...selectedFiles.map(f => URL.createObjectURL(f))]);
      } else {
        setFiles([selectedFiles[0]]);
        setPreviews([URL.createObjectURL(selectedFiles[0])]);
      }
      if (step === 1) setStep(2);
    }
  };

  const handleRemoveFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
    if (files.length === 1) setStep(1); // Si elimina el último, vuelve al inicio
  };

  const handleMultiplyFile = (index) => {
    setFiles(prev => [...prev, files[index]]);
    setPreviews(prev => [...prev, previews[index]]);
  };

  const handleUpload = async () => {
    if (!isAuthenticated) {
      alert("Debes iniciar sesión para realizar un pedido.");
      navigate('/login');
      return;
    }

    setIsUploading(true);
    
    try {
      const formData = new FormData();
      files.forEach(f => formData.append('image_files', f));
      formData.append('paper_type', config.paperType);
      formData.append('print_mode', config.printMode);
      formData.append('orientation', config.orientation);
      if (config.printMode === 'mosaico') {
        formData.append('mosaic_columns', config.mosaic.columns.toString());
        formData.append('mosaic_size_cm', config.mosaic.sizeCm.toString());
      }

      const response = await fetch('http://127.0.0.1:8000/api/v1/orders/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error al enviar el pedido');
      }

      setStep(3);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Componente WYSIWYG de Alta Precisión.
   * Modificado para reflejar exactamente la lógica del backend (3mm margen, 2mm gap).
   */
  const PagePreview = () => {
    const MARGIN_X_MM = 1.0;
    const MARGIN_Y_MM = 3.0;
    const GAP_MM = 2.0;
    const PAGE_W_MM = config.orientation === 'portrait' ? 210 : 297;
    const PAGE_H_MM = config.orientation === 'portrait' ? 297 : 210;
    
    const isLandscape = config.orientation === 'landscape';
    const { columns } = config.mosaic;
    const { printMode } = config;

    // Cálculo matemático de tamaño real para feedback al usuario
    const drawableWmm = PAGE_W_MM - (MARGIN_X_MM * 2);
    const tileWmm = (drawableWmm - (columns - 1) * GAP_MM) / columns;
    const tileRows = Math.floor((PAGE_H_MM - (MARGIN_Y_MM * 2) + GAP_MM) / (tileWmm + GAP_MM));

    return (
      <div className="flex flex-col items-center gap-6">
        {/* Selector de Orientación Visual */}
        <div className="flex bg-slate-200/50 p-2 rounded-2xl gap-2">
          <button 
            onClick={() => setConfig({...config, orientation: 'portrait'})}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${config.orientation === 'portrait' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
          >
            Vertical
          </button>
          <button 
            onClick={() => setConfig({...config, orientation: 'landscape'})}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${config.orientation === 'landscape' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
          >
            Horizontal
          </button>
        </div>

        {/* Hoja A4 Virtual */}
        <motion.div 
          layout
          className={`bg-white shadow-2xl border border-slate-200 transition-all duration-500 overflow-hidden relative ${
            isLandscape ? 'aspect-[1.414/1] w-full' : 'aspect-[1/1.414] w-[80%] mx-auto'
          }`}
          style={{ padding: `${(MARGIN_Y_MM / PAGE_H_MM) * 100}% ${(MARGIN_X_MM / PAGE_W_MM) * 100}%` }}
        >
          {/* Guía de margen de seguridad (Punteada) */}
          <div 
            className="absolute border border-dashed border-blue-200 pointer-events-none"
            style={{
              top: `${(MARGIN_Y_MM / PAGE_H_MM) * 100}%`,
              bottom: `${(MARGIN_Y_MM / PAGE_H_MM) * 100}%`,
              left: `${(MARGIN_X_MM / PAGE_W_MM) * 100}%`,
              right: `${(MARGIN_X_MM / PAGE_W_MM) * 100}%`,
              opacity: 0.6
            }}
          />

          {printMode === 'individual' && previews.length > 0 && (
            <div className="w-full h-full flex items-center justify-center">
              <img src={previews[0]} alt="" className="max-w-full max-h-full object-contain shadow-sm" />
            </div>
          )}

          {printMode === 'tarjeta' && previews.length > 0 && (
            <div 
              className="w-full h-full grid gap-1"
              style={{ 
                gridTemplateColumns: 'repeat(auto-fit, minmax(30%, 1fr))',
                gap: `${(GAP_MM / PAGE_W_MM) * 100}%`
              }}
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-[9/5] bg-slate-50 overflow-hidden border border-slate-100">
                  <img src={previews[0]} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}

          {printMode === 'mosaico' && previews.length > 0 && (
            <div 
              className="w-full h-full grid"
              style={{ 
                gridTemplateColumns: `repeat(${columns}, 1fr)`,
                gap: `${(GAP_MM / PAGE_W_MM) * 100}%`
              }}
            >
              {Array.from({ length: columns * tileRows }).map((_, i) => (
                <div key={i} className="aspect-square bg-slate-100 overflow-hidden border border-slate-50">
                  <img src={previews[i % previews.length]} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </motion.div>
        
        {/* Info Técnica de Precisión */}
        <div className="space-y-3 text-center max-w-xs mx-auto">
            <div className="flex flex-col gap-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Hoja A4 • {PAGE_W_MM}x{PAGE_H_MM}mm • Margen L/R: {MARGIN_X_MM}mm, T/B: {MARGIN_Y_MM}mm
              </p>
              {printMode === 'mosaico' && (
                  <div className="inline-flex items-center justify-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-full text-[9px] font-black uppercase shadow-lg shadow-blue-100 mx-auto">
                      <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      Tamaño Real Sticker: {(tileWmm / 10).toFixed(1)} cm
                  </div>
              )}
            </div>

            {/* Aviso de Calibración Crítico */}
            <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl space-y-2">
              <div className="flex items-center justify-center gap-1.5 text-amber-600">
                <AlertCircle className="w-3.5 h-3.5" />
                <span className="text-[10px] font-black uppercase tracking-tighter">Aviso de Impresión</span>
              </div>
              <p className="text-[9px] text-amber-700 leading-tight font-medium">
                Para medidas exactas, selecciona <b>"Tamaño Real"</b> o <b>"Escala 100%"</b> en los ajustes de tu impresora. No uses "Ajustar al papel".
              </p>
              <p className="text-[8px] text-amber-500 italic opacity-80">
                * Incluiremos una regla de 1cm en el PDF para que valides la precisión en papel.
              </p>
            </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-12 pb-20 max-w-5xl mx-auto">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.section 
            key="step1"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="text-center space-y-10"
          >
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-tight">
                Imprime lo que quieras, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500">
                  ¡melo te lo lleva!
                </span>
              </h1>
              <p className="text-xl text-slate-500 font-medium">Sube tu foto y personaliza tu impresión en segundos.</p>
            </div>

            <div className="max-w-xl mx-auto">
              <label className="premium-card p-12 text-center block cursor-pointer border-dashed border-2 border-slate-200 hover:border-blue-400 hover:bg-blue-50/20 transition-all group">
                <input type="file" multiple className="hidden" onChange={handleFileChange} accept="image/*" />
                <div className="space-y-4 py-10">
                  <div className="w-24 h-24 bg-blue-600 text-white rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-blue-100 group-hover:rotate-12 transition-transform">
                    <Upload className="w-12 h-12" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 leading-tight">Empieza Aquí</h3>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">PNG, JPG o WEBP</p>
                  </div>
                </div>
              </label>
            </div>
          </motion.section>
        )}

        {step === 2 && (
          <motion.section 
            key="step2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start"
          >
            <div className="space-y-8">
              <button 
                onClick={() => setStep(1)}
                className="flex items-center gap-2 text-slate-400 hover:text-slate-800 font-bold transition-all"
              >
                <ChevronLeft className="w-5 h-5" /> Regresar
              </button>
              
              <h2 className="text-4xl font-black text-slate-900">Configura tu <span className="text-blue-600">Impresión</span></h2>

              <div className="space-y-4">
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">1. Elige tu Papel</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {PAPERS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setConfig({...config, paperType: p.id})}
                      className={`p-5 rounded-3xl border-2 text-left transition-all ${
                        config.paperType === p.id 
                        ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-100' 
                        : 'border-slate-100 bg-white hover:border-slate-200'
                      }`}
                    >
                      <p.Icon className={`w-8 h-8 mb-3 ${config.paperType === p.id ? 'text-blue-600' : 'text-slate-400'}`} />
                      <p className="font-bold text-slate-900">{p.label}</p>
                      <p className="text-xs text-slate-400 font-medium leading-tight mt-1">{p.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">2. Elige el Formato</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {MODES.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setConfig({...config, printMode: m.id})}
                      className={`p-4 rounded-2xl border-2 text-center transition-all ${
                        config.printMode === m.id 
                        ? 'border-purple-500 bg-purple-50 shadow-lg shadow-purple-100' 
                        : 'border-slate-100 bg-white hover:border-slate-200'
                      }`}
                    >
                      <m.Icon className={`w-6 h-6 mx-auto mb-2 ${config.printMode === m.id ? 'text-purple-600' : 'text-slate-400'}`} />
                      <p className="text-sm font-bold text-slate-900 leading-tight">{m.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {config.printMode === 'mosaico' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="p-6 bg-slate-900 rounded-[2.5rem] text-white space-y-6 shadow-2xl">
                    <div className="flex justify-between items-center px-1">
                      <p className="text-sm font-bold opacity-70">Número de Columnas</p>
                      <p className="text-xl font-black text-blue-400">{config.mosaic.columns}</p>
                    </div>
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
                      className="w-full h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer accent-blue-500"
                    />
                    <p className="text-[10px] font-black uppercase tracking-widest text-pink-400">
                      Tamaño automático: {config.mosaic.sizeCm} cm por sticker
                    </p>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-64 overflow-y-auto p-2 scrollbar-thin">
                    {previews.map((url, idx) => (
                      <div key={idx} className="relative group aspect-square bg-slate-100 rounded-2xl overflow-hidden shadow-sm border border-slate-200">
                        <img src={url} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-1">
                          <button 
                            type="button" onClick={() => handleMultiplyFile(idx)}
                            className="p-1.5 bg-white rounded-full text-blue-600 hover:scale-110 transition-transform" title="Duplicar"
                          ><Copy className="w-4 h-4" /></button>
                          <button 
                            type="button" onClick={() => handleRemoveFile(idx)}
                            className="p-1.5 bg-white rounded-full text-red-600 hover:scale-110 transition-transform" title="Eliminar"
                          ><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                    <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-slate-300 rounded-2xl hover:border-blue-400 hover:bg-blue-50/20 cursor-pointer transition-all">
                      <input type="file" multiple className="hidden" onChange={handleFileChange} accept="image/*" />
                      <Plus className="w-6 h-6 text-slate-400" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase mt-1">Añadir</span>
                    </label>
                  </div>
                </motion.div>
              )}

              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="btn-primary w-full shadow-2xl py-5 text-lg"
              >
                {isUploading ? "Enviando pedido..." : "Confirmar y Pedir Melo"}
                <ChevronRight className="w-6 h-6 ml-2" />
              </button>
            </div>

            <div className="lg:sticky lg:top-32 space-y-6 text-center">
              <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Vista Previa Real</p>
              <PagePreview />
              <div className="flex items-center justify-center gap-8 text-slate-400 font-bold text-sm">
                <div className="flex items-center gap-2"><Truck className="w-4 h-4" /> Entrega hoy</div>
                <div className="flex items-center gap-2"><Sparkles className="w-4 h-4" /> Calidad Pro</div>
              </div>
            </div>
          </motion.section>
        )}

        {step === 3 && (
          <motion.section 
            key="step3"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-xl mx-auto premium-card p-16 text-center space-y-8 shadow-blue-100"
          >
            <div className="w-32 h-32 bg-green-100 text-green-600 rounded-[3rem] flex items-center justify-center mx-auto rotate-12">
              <CheckCircle2 className="w-16 h-16" />
            </div>
            <div className="space-y-4">
              <h2 className="text-5xl font-black text-slate-900">¡Eso quedó Melo!</h2>
              <p className="text-xl text-slate-500 font-medium">Hemos recibido tu pedido. Estamos preparando la impresora.</p>
            </div>
            
            <div className="bg-slate-50 p-8 rounded-[2rem] border-2 border-slate-100 space-y-2">
              <p className="text-xs text-slate-400 font-black uppercase tracking-widest">Resumen de tu pedido</p>
              <p className="font-bold text-slate-800">
                {files.length === 1 ? files[0]?.name : `${files.length} imágenes`}
              </p>
              <p className="text-sm text-blue-600 font-black tracking-tighter uppercase">
                {config.paperType.replace('_', ' ')} • {config.printMode} • {config.orientation}
              </p>
            </div>

            <button onClick={() => setStep(1)} className="btn-secondary w-full">Hacer otro pedido</button>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomeView;
