import React from 'react';
import { motion } from 'framer-motion';
import { ScrollText, ChevronLeft, ChevronRight } from 'lucide-react';
import PdfSinglePage from './PdfSinglePage';

/**
 * Componente WYSIWYG de Alta Precisión.
 * SOLID: Responsabilidad Única - Renderiza la previsualización basada en la configuración.
 */
const PagePreview = ({ config, previews, pdfPagePreviews, isRenderingPages, setConfig }) => {
  const [currentPage, setCurrentPage] = React.useState(0);
  const scrollRef = React.useRef(null);
  const isLetter = config.paperType === 'normal';
  const isA4 = config.paperType === 'fotografico' || config.paperType === 'fotografico_adhesivo';

  const baseW = isLetter ? 215.9 : 210;
  const baseH = isLetter ? 279.4 : 297;

  const MARGIN_X_MM = 6.0; // Sincronizado con backend
  const MARGIN_Y_MM = 10.0; // Sincronizado con backend
  const GAP_MM = 2.0;

  const PAGE_W_MM = config.orientation === 'portrait' ? baseW : baseH;
  const PAGE_H_MM = config.orientation === 'portrait' ? baseH : baseW;

  const isLandscape = config.orientation === 'landscape';
  const { columns: mosaicCols } = config.mosaic;
  const { printMode, paperType } = config;

  // Resetear a la primera página si cambia el modo o la cantidad de archivos
  React.useEffect(() => {
    setCurrentPage(0);
  }, [printMode, previews.length, paperType]);

  const drawableWmm = PAGE_W_MM - (MARGIN_X_MM * 2);
  const drawableHmm = PAGE_H_MM - (MARGIN_Y_MM * 2);

  // Lógica de generación de HOJAS / SLOTS
  const isPhoto = paperType === 'fotografico';
  const itemsPerPage = (isPhoto && printMode === 'individual') ? 1 : (isPhoto ? 2 : 1);
  
  // Cálculo de páginas totales unificado
  const numPages = printMode === 'individual' 
    ? Math.ceil(previews.length / itemsPerPage) 
    : (printMode === 'pdf' && previews.length > 0 ? previews[0].pages : 1);
  
  const pageArray = Array.from({ length: numPages }).map((_, i) => i);

  // Lógica de mejor ajuste para TARJETAS (Forzamos 90x50 Horizontal)
  const cardDim1 = 90;
  const cardDim2 = 50;
  let bestCardLayout = { cols: 0, rows: 0, cw: cardDim1, ch: cardDim2, count: 0 };

  const c = Math.floor((drawableWmm + GAP_MM) / (cardDim1 + GAP_MM));
  const r = Math.floor((drawableHmm + GAP_MM) / (cardDim2 + GAP_MM));
  bestCardLayout = { cols: c, rows: r, cw: cardDim1, ch: cardDim2, count: c * r };

  // Lógica para MOSAICO
  const tileWmm = (drawableWmm - (mosaicCols - 1) * GAP_MM) / mosaicCols;
  const mosaicRows = Math.floor((drawableHmm + GAP_MM) / (tileWmm + GAP_MM));

  const handleScroll = (e) => {
    const scrollLeft = e.target.scrollLeft;
    const width = e.target.offsetWidth;
    const newPage = Math.round(scrollLeft / width);
    if (newPage !== currentPage) setCurrentPage(newPage);
  };

  const scrollToPage = (idx) => {
    if (scrollRef.current) {
      const width = scrollRef.current.offsetWidth;
      scrollRef.current.scrollTo({
        left: idx * width,
        behavior: 'smooth'
      });
    }
  };


  return (
    <div className="flex flex-col items-center w-full h-full pt-0">
      {/* Contenedor con Scroll HORIZONTAL - Galería Nativa */}
      <div className="w-full relative group/preview px-0">
        {/* Botones de Navegación Lateral (Premium Glass) */}
        {pageArray.length > 1 && (
          <>
            <motion.button 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: currentPage > 0 ? 1 : 0 }}
              onClick={() => scrollToPage(currentPage - 1)}
              className="absolute left-6 md:left-12 lg:left-20 top-1/2 -translate-y-1/2 z-40 w-11 h-11 flex items-center justify-center bg-white/90 backdrop-blur-md rounded-full shadow-xl border border-white/50 text-slate-800 transition-all active:scale-90 hover:bg-white pointer-events-auto"
            >
              <ChevronLeft className="w-6 h-6" />
            </motion.button>
            <motion.button 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: currentPage < pageArray.length - 1 ? 1 : 0 }}
              onClick={() => scrollToPage(currentPage + 1)}
              className="absolute right-6 md:right-12 lg:right-20 top-1/2 -translate-y-1/2 z-40 w-11 h-11 flex items-center justify-center bg-white/90 backdrop-blur-md rounded-full shadow-xl border border-white/50 text-slate-800 transition-all active:scale-90 hover:bg-white pointer-events-auto"
            >
              <ChevronRight className="w-6 h-6" />
            </motion.button>
          </>
        )}

        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className={`w-full overflow-x-auto overflow-y-hidden flex flex-nowrap gap-4 scroll-smooth snap-x snap-mandatory scrollbar-none items-center pt-4 pb-12 ${pageArray.length === 1 ? 'justify-center' : ''}`}
        >
        {pageArray.map((pageIdx) => {
          const startIdx = pageIdx * itemsPerPage;
          const currentPreviewItems = previews.slice(startIdx, startIdx + itemsPerPage);

          return (
            <motion.div
              key={pageIdx}
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ margin: "-50px" }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 20,
                mass: 1
              }}
              className="relative flex-shrink-0 snap-center w-full flex justify-center px-4"
              style={{ transform: 'translateZ(0)' }}
            >
              <div
                className={`bg-white shadow-[0_10px_30px_rgba(0,0,0,0.15)] transition-all duration-500 overflow-hidden relative mx-auto rounded-sm ${
                  isLandscape ? 'aspect-[1.414/1] w-full' : 'aspect-[1/1.414] w-[80%] md:w-[65%]'
                }`}
                style={{ padding: `${(MARGIN_Y_MM / PAGE_H_MM) * 100}% ${(MARGIN_X_MM / PAGE_W_MM) * 100}%` }}
              >
                <div
                  className="absolute border border-dashed border-blue-200 pointer-events-none"
                  style={{
                    top: `${(MARGIN_Y_MM / PAGE_H_MM) * 100}%`,
                    bottom: `${(MARGIN_Y_MM / PAGE_H_MM) * 100}%`,
                    left: `${(MARGIN_X_MM / PAGE_W_MM) * 100}%`,
                    right: `${(MARGIN_X_MM / PAGE_W_MM) * 100}%`,
                    opacity: 0.6,
                    zIndex: 20
                  }}
                />

                {/* MODO PDF: Integrado en la galería horizontal */}
                {printMode === 'pdf' && previews.length > 0 && (
                  <PdfSinglePage 
                    file={previews[0].file} 
                    pageNum={pageIdx + 1} 
                    orientation={config.orientation} 
                  />
                )}

                {/* MODO INDIVIDUAL / IMÁGENES */}
                {printMode === 'individual' && previews.length > 0 && (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-1 overflow-hidden relative">
                    {isPhoto ? (
                      <div className="w-full h-full relative">
                        {currentPreviewItems.map((prev, i) => (
                          <div key={i} className="relative w-full h-full bg-white flex items-center justify-center overflow-hidden">
                            <img src={prev.url} alt="" className="w-full h-full object-contain" />
                            {/* Distintivo de agrupación inteligente */}
                            <div className="absolute top-2 right-2 bg-pink-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full shadow-lg z-30 uppercase tracking-tighter">
                              2 por hoja A4
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center p-2">
                          <img src={currentPreviewItems[0].url} alt="" className="max-w-full max-h-full object-contain shadow-sm" />
                        </div>
                    )}
                  </div>
                )}

                {/* Tarjetas y Mosaico */}
                {pageIdx === 0 && printMode === 'tarjeta' && previews.length > 0 && (
                  <>
                    <div
                      className="w-full h-full grid"
                      style={{
                        gridTemplateColumns: `repeat(${bestCardLayout.cols}, 1fr)`,
                        gridTemplateRows: `repeat(${bestCardLayout.rows}, 1fr)`,
                        gap: `${(GAP_MM / PAGE_W_MM) * 100}%`
                      }}
                    >
                      {Array.from({ length: bestCardLayout.count }).map((_, i) => {
                        const prev = previews[i % previews.length];
                        return (
                          <div
                            key={i}
                            className="bg-slate-50 overflow-hidden border border-slate-100 flex items-center justify-center"
                            style={{ aspectRatio: `${bestCardLayout.cw} / ${bestCardLayout.ch}` }}
                          >
                            {prev.isImage ? (
                              <img src={prev.url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="flex flex-col items-center justify-center text-slate-400 p-2">
                                <ScrollText className="w-6 h-6 mb-1 text-pink-400 opacity-80" />
                                <span className="text-[8px] font-bold truncate w-full text-center">{prev.name}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {pageIdx === 0 && printMode === 'mosaico' && previews.length > 0 && (
                  <>
                    <div
                      className="w-full h-full grid"
                      style={{
                        gridTemplateColumns: `repeat(${mosaicCols}, 1fr)`,
                        gap: `${(GAP_MM / PAGE_W_MM) * 100}%`
                      }}
                    >
                      {Array.from({ length: mosaicCols * mosaicRows }).map((_, i) => {
                        const prev = previews[i % previews.length];
                        return (
                          <div key={i} className="aspect-square bg-slate-100 overflow-hidden border border-slate-50 flex items-center justify-center">
                            {prev.isImage ? (
                              <img src={prev.url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="flex flex-col items-center justify-center text-slate-400 p-1">
                                <ScrollText className="w-5 h-5 mb-1 text-pink-400 opacity-80" />
                                <span className="text-[6px] font-bold truncate w-full text-center">{prev.name}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

              </div>

              {/* Indicador de Hoja flotante */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] font-black px-4 py-1.5 rounded-full shadow-xl">
                HOJA {pageIdx + 1}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Indicadores de Paginación (Dots) */}
      {pageArray.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-2 mb-6">
          {pageArray.map((idx) => (
            <motion.div 
              key={idx}
              animate={{ 
                width: currentPage === idx ? 24 : 6,
                backgroundColor: currentPage === idx ? '#ec4899' : '#cbd5e1'
              }}
              className="h-1.5 rounded-full transition-all"
            />
          ))}
        </div>
      )}
    </div>

      {/* Leyenda Final - Simplificada y sin div contenedor rígido */}
      <div className="flex flex-col gap-1 items-center pb-8">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          {numPages} {numPages === 1 ? 'Hoja' : 'Hojas'} • {isLetter ? 'Carta' : 'A4'}
        </p>
        {isPhoto && (
          <span className="text-[9px] font-black text-pink-500 uppercase tracking-tighter">
            Ajuste Fotográfico Automático
          </span>
        )}
      </div>
    </div>
  );
};

export default PagePreview;
