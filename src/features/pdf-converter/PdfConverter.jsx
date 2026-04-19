import React, { useState, useEffect } from 'react';
import { Upload, FileText, Settings2, Download, AlertCircle, Loader2, Image as ImageIcon, Trash2, Plus, Copy } from 'lucide-react';
import apiClient from '../../api/apiClient';

const PAGE_SIZES = [
  { id: 'original', label: 'Tamaño Original' },
  { id: 'a4', label: 'A4 (210 x 297 mm)' },
  { id: 'letter', label: 'Carta (216 x 279 mm)' },
  { id: 'foto_10x15', label: 'Foto (10 x 15 cm)' },
];

const DPI_OPTIONS = [150, 300, 600];

export default function PdfConverter({ initialFile = null, initialPreview = null, initialOrder = null, initialPreviews = null }) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [files, setFiles] = useState(initialFile ? [initialFile] : []);
  const [previews, setPreviews] = useState(initialPreviews || (initialPreview ? [initialPreview] : []));
  const [config, setConfig] = useState({
    page_size: 'a4',
    dpi: 300,
    margin_mm: 3.0, // Reducido a 3mm por defecto
    orientation: initialOrder?.orientation || 'auto',
    print_mode: initialOrder?.print_mode || 'individual',
    paper_type: initialOrder?.paper_type || 'normal', // Capturar tipo de papel
    mosaic_columns: initialOrder?.mosaic_columns || 4,
    mosaic_size_cm: initialOrder?.mosaic_size_cm || 5.0
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (initialOrder) {
      setConfig(prev => ({
        ...prev,
        orientation: initialOrder.orientation,
        print_mode: initialOrder.print_mode,
        paper_type: initialOrder.paper_type,
        mosaic_columns: initialOrder.mosaic_columns,
        mosaic_size_cm: initialOrder.mosaic_size_cm
      }));
    }
  }, [initialOrder]);

  useEffect(() => {
    const loadInitialFile = async () => {
      // Si recibimos initialPreviews (array), las precargamos todas
      const urlsToLoad = initialPreviews || (initialPreview ? [initialPreview] : []);
      
      if (urlsToLoad.length > 0 && !initialFile && files.length === 0) {
        setLoading(true);
        try {
          const loadedFiles = await Promise.all(urlsToLoad.map(async (url) => {
            const response = await fetch(url);
            const blob = await response.blob();
            const filename = url.split('/').pop() || 'image.jpg';
            return new File([blob], filename, { type: blob.type });
          }));
          setFiles(loadedFiles);
          setPreviews(urlsToLoad);
        } catch (err) {
          console.error("Error cargando archivos iniciales:", err);
          setError("No se pudieron precargar las imágenes del servidor.");
        } finally {
          setLoading(false);
        }
      } else if (initialFile) {
        setFiles([initialFile]);
        setPreviews([initialPreview]);
      }
    };

    loadInitialFile();
  }, [initialFile, initialPreview, initialPreviews]);

  useEffect(() => {
    // Advertencia de peso estimado
    const isHeavy = config.dpi === 600 || (config.dpi === 300 && config.page_size !== 'original');
    setShowWarning(isHeavy);
  }, [config.dpi, config.page_size]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 0) {
      // Permitimos añadir fotos en modo mosaico e individual (multi-imagen)
      if (config.print_mode === 'mosaico' || config.print_mode === 'individual') {
        setFiles(prev => [...prev, ...selectedFiles]);
        const newPreviews = selectedFiles.map(f => URL.createObjectURL(f));
        setPreviews(prev => [...prev, ...newPreviews]);
      } else {
        setFiles([selectedFiles[0]]);
        setPreviews([URL.createObjectURL(selectedFiles[0])]);
      }
      setError(null);
    }
  };

  const handleRemoveFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => {
      const filtered = prev.filter((_, i) => i !== index);
      // Opcional: Liberar memoria del objeto URL
      URL.revokeObjectURL(prev[index]);
      return filtered;
    });
  };

  const handleMultiplyFile = (index) => {
    const fileToCopy = files[index];
    const previewToCopy = previews[index];
    if (fileToCopy) {
      setFiles(prev => [...prev, fileToCopy]);
      setPreviews(prev => [...prev, previewToCopy]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    files.forEach(f => {
      formData.append('image_files', f);
    });
    formData.append('page_size', config.page_size);
    formData.append('dpi', config.dpi);
    formData.append('margin_mm', config.margin_mm);
    formData.append('orientation', config.orientation);
    
    // Enviar configuración de modo de impresión y tipo de papel
    formData.append('print_mode', config.print_mode);
    formData.append('paper_type', config.paper_type);
    if (config.print_mode === 'mosaico') {
      formData.append('mosaic_columns', config.mosaic_columns);
      formData.append('mosaic_size_cm', config.mosaic_size_cm);
    }

    try {
      console.log("Enviando generación de PDF:", {
        numFiles: files.length,
        print_mode: config.print_mode,
        paper_type: config.paper_type
      });
      const response = await apiClient.post('/pdf/generate-pdf', formData, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Extraer nombre del header o usar default
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'resultado_cmyk.pdf';
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match) filename = match[1];
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      let message = 'Error al procesar la imagen.';
      if (err.response && err.response.data instanceof Blob) {
        // Leer el error JSON del blob
        const text = await err.response.data.text();
        const data = JSON.parse(text);
        message = data.detail || message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Lado Izquierdo: Configuración */}
        <section className="premium-card p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-4 text-slate-800">
            <Settings2 className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-xl">Configuración</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {initialOrder ? (
              <div className="space-y-6">
                <div className="p-6 bg-blue-50 border border-blue-100 rounded-2xl space-y-4">
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Resumen del Pedido</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="font-bold text-blue-900 capitalize">{config.print_mode}</div>
                    <div className="font-bold text-blue-900 uppercase text-right">{config.orientation}</div>
                    {config.print_mode === 'mosaico' && (
                      <div className="col-span-2 text-xs text-blue-600 bg-white/50 p-2 rounded-lg">
                        Cuadrícula de {config.mosaic_columns} columnas con márgenes fijos (L/R: 1mm, T/B: 3mm).
                      </div>
                    )}
                  </div>
                </div>
                {!showAdvanced && (
                  <button 
                    type="button"
                    onClick={() => setShowAdvanced(true)}
                    className="text-[10px] uppercase tracking-widest font-black text-slate-400 hover:text-blue-600 transition-all mx-auto block"
                  >
                    + Ajustes Avanzados (DPI/Márgenes)
                  </button>
                )}
              </div>
            ) : null}

            {(!initialOrder || showAdvanced) && (
              <div className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Tamaño de Página</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    value={config.page_size}
                    onChange={(e) => setConfig({...config, page_size: e.target.value})}
                  >
                    {PAGE_SIZES.map(size => <option key={size.id} value={size.id}>{size.label}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Modo de Impresión</label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3"
                      value={config.print_mode}
                      onChange={(e) => setConfig({...config, print_mode: e.target.value})}
                    >
                      <option value="individual">Individual</option>
                      <option value="tarjeta">Tarjeta (9x5cm)</option>
                      <option value="mosaico">Mosaico (Stickers)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Resolución (DPI)</label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3"
                      value={config.dpi}
                      onChange={(e) => setConfig({...config, dpi: parseInt(e.target.value)})}
                    >
                      {DPI_OPTIONS.map(opt => <option key={opt} value={opt}>{opt} DPI</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Márgenes (Fijos)</label>
                    <div className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-slate-500 text-sm font-medium">
                      L/R: 1.0mm, T/B: 3.0mm
                    </div>
                  </div>
                  {config.print_mode === 'mosaico' && (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Columnas (Mosaico)</label>
                      <input 
                        type="number" min="1" max="10"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3"
                        value={config.mosaic_columns}
                        onChange={(e) => setConfig({...config, mosaic_columns: parseInt(e.target.value)})}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Orientación</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['auto', 'portrait', 'landscape'].map(opt => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setConfig({...config, orientation: opt})}
                        className={`py-2 px-3 rounded-xl border text-sm font-medium transition-all ${config.orientation === opt ? 'bg-blue-600 text-white' : 'bg-white'}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={files.length === 0 || loading}
              className={`w-full py-5 rounded-3xl font-black uppercase tracking-widest text-white flex items-center justify-center gap-3 transition-all shadow-xl ${
                files.length === 0 || loading 
                ? 'bg-slate-300 shadow-none' 
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Download className="w-6 h-6" />}
              {loading ? 'Procesando...' : initialOrder ? 'Imprimir Pedido Melo' : 'Generar PDF CMYK'}
            </button>
          </form>
        </section>

        {/* Lado Derecho: Subida y Preview */}
        <section className="premium-card p-6 sm:p-8 flex flex-col">
          <div className="flex items-center gap-2 mb-6 text-slate-800">
            <Upload className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-xl">Archivo</h2>
          </div>

          <div className="flex-1 flex flex-col">
            {/* Galería de Previsualización */}
            {previews.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6 max-h-64 overflow-y-auto p-2 scrollbar-thin">
                {previews.map((url, idx) => (
                  <div key={idx} className="relative group aspect-square bg-slate-100 rounded-2xl overflow-hidden shadow-sm border border-slate-200">
                    <img src={url} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                      <button 
                        type="button"
                        onClick={() => handleMultiplyFile(idx)}
                        className="p-2 bg-white rounded-full text-blue-600 hover:scale-110 transition-transform"
                        title="Duplicar imagen"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button 
                        type="button"
                        onClick={() => handleRemoveFile(idx)}
                        className="p-2 bg-white rounded-full text-red-600 hover:scale-110 transition-transform"
                        title="Eliminar imagen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {config.print_mode === 'mosaico' && (
                  <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-slate-300 rounded-2xl hover:border-primary hover:bg-primary/5 cursor-pointer transition-all">
                    <input type="file" multiple className="hidden" onChange={handleFileChange} />
                    <Plus className="w-6 h-6 text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase mt-1">Añadir</span>
                  </label>
                )}
              </div>
            )}

            {previews.length === 0 && (
              <label className="flex-1 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center p-6 transition-all cursor-pointer border-slate-200 hover:border-slate-300">
                <input type="file" multiple={config.print_mode === 'mosaico'} className="hidden" onChange={handleFileChange} />
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 italic">Haz clic o arrastra tu imagen</p>
                    <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold">PNG, JPG o WEBP (Máx 25MB)</p>
                  </div>
                </div>
              </label>
            )}

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-2xl flex gap-3 text-red-700 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}
            
            {files.length > 0 && !error && (
              <div className="mt-4 flex flex-col gap-2">
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl text-sm text-slate-600">
                  <FileText className="w-5 h-5 text-primary" />
                  <span className="font-medium truncate">
                    {files.length === 1 ? files[0].name : `${files.length} imágenes seleccionadas`}
                  </span>
                  <span className="ml-auto text-xs font-bold text-slate-400">
                    {(files.reduce((acc, f) => acc + f.size, 0) / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
