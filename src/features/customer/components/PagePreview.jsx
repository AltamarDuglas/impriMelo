import React from 'react';
import { motion } from 'framer-motion';
import { ScrollText, ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Componente WYSIWYG de Alta Precisión.
 * SOLID: Responsabilidad Única - Renderiza la previsualización basada en la configuración.
 */
const PagePreview = ({ config, previews, pdfPagePreviews, isRenderingPages, setConfig }) => {
  const [currentPage, setCurrentPage] = React.useState(0);
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

  // Lógica de generación de HOJAS
  const isPhoto = paperType === 'fotografico';
  const itemsPerPage = isPhoto ? 2 : 1;
  const numPages = printMode === 'individual' ? Math.ceil(previews.length / itemsPerPage) : 1;
  const pageArray = Array.from({ length: numPages }).map((_, i) => i);

  // Lógica de mejor ajuste para TARJETAS
  const cardDim1 = 90;
  const cardDim2 = 50;
  let bestCardLayout = { cols: 0, rows: 0, cw: 0, ch: 0, count: 0 };
  
  for (const [cw, ch] of [[cardDim1, cardDim2], [cardDim2, cardDim1]]) {
    const c = Math.floor((drawableWmm + GAP_MM) / (cw + GAP_MM));
    const r = Math.floor((drawableHmm + GAP_MM) / (ch + GAP_MM));
    if (c * r > bestCardLayout.count) {
      bestCardLayout = { cols: c, rows: r, cw, ch, count: c * r };
    }
  }

  // Lógica para MOSAICO
  const tileWmm = (drawableWmm - (mosaicCols - 1) * GAP_MM) / mosaicCols;
  const mosaicRows = Math.floor((drawableHmm + GAP_MM) / (tileWmm + GAP_MM));

  const DimensionLabel = ({ value, className = "" }) => (
    <div className={`absolute flex items-center justify-center text-[10px] font-black text-slate-600 bg-white px-1.5 z-20 border border-slate-200 rounded-sm shadow-sm ${className}`}>
      {Math.round(value)}mm
    </div>
  );

  return (
    <div className="flex flex-col items-center w-full h-full overflow-hidden">
      {/* Contenedor con Scroll HORIZONTAL - Galería Nativa */}
      <div className="w-full flex-1 overflow-x-auto flex flex-nowrap gap-4 scroll-smooth snap-x snap-mandatory scrollbar-none items-center px-2">
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
              className="relative flex-shrink-0 snap-center will-change-transform flex justify-center"
              style={{ 
                width: '95%',
                transform: 'translateZ(0)',
                backfaceVisibility: 'hidden'
              }}
            >
              <div
                className={`bg-white shadow-[0_40px_100px_rgba(0,0,0,0.12)] border border-slate-100 transition-all duration-500 overflow-hidden relative mx-auto rounded-sm ${
                  isLandscape ? 'aspect-[1.414/1] w-full' : 'aspect-[1/1.414] w-full'
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
                    opacity: 0.6
                  }}
                />

                {printMode === 'individual' && previews.length > 0 && (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-1 overflow-hidden relative">
                    {isPhoto ? (
                      <div className={`grid w-full h-full gap-2 relative ${config.orientation === 'portrait' ? 'grid-rows-2' : 'grid-cols-2'}`}>
                        {currentPreviewItems.map((prev, i) => (
                          <div key={i} className="relative w-full h-full bg-slate-50 flex items-center justify-center overflow-hidden border border-slate-100">
                            <img src={prev.url} alt="" className="w-full h-full object-cover shadow-sm" />
                          </div>
                        ))}
                        
                        {/* Cota Interna del Slot */}
                        {config.orientation === 'portrait' ? (
                          <div className="absolute -left-3 top-0 h-[48%] border-y border-l border-blue-600 w-1 flex items-center justify-center">
                             <DimensionLabel value={(drawableHmm - GAP_MM) / 2} className="-left-10 text-blue-700 border-blue-200 bg-blue-50 rotate-90" />
                          </div>
                        ) : (
                          <div className="absolute -top-3 left-0 w-[48%] border-x border-t border-blue-600 h-1 flex items-center justify-center">
                             <DimensionLabel value={(drawableWmm - GAP_MM) / 2} className="-top-4 text-blue-700 border-blue-200 bg-blue-50" />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center p-2">
                        <img src={currentPreviewItems[0].url} alt="" className="max-w-full max-h-full object-contain shadow-sm" />
                      </div>
                    )}
                  </div>
                )}

                {/* Tarjetas, Mosaico y PDF siguen igual */}
                {pageIdx === 0 && printMode === 'tarjeta' && previews.length > 0 && (
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
                )}

                {pageIdx === 0 && printMode === 'mosaico' && previews.length > 0 && (
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
                )}

                {pageIdx === 0 && printMode === 'pdf' && previews.length > 0 && (
                  <div className="w-full h-full flex items-center justify-center bg-white">
                    {isRenderingPages && (
                      <div className="animate-spin w-8 h-8 border-4 border-pink-400 border-t-transparent rounded-full" />
                    )}

                    {!isRenderingPages && pdfPagePreviews.length === 1 && (
                      <img
                        src={pdfPagePreviews[0].url}
                        alt="Página 1"
                        className="w-full h-full object-contain"
                      />
                    )}

                    {!isRenderingPages && pdfPagePreviews.length > 1 && (
                      <div
                        className="w-full h-full grid gap-[3%] p-[3%]"
                        style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}
                      >
                        {pdfPagePreviews.map(({ pageNum, url }) => (
                          <div key={pageNum} className="relative w-full h-full">
                            <img
                              src={url}
                              alt={`Página ${pageNum}`}
                              className="w-full h-full object-contain shadow-sm"
                            />
                            <span className="absolute bottom-0.5 right-0.5 bg-black/40 text-white text-[7px] font-bold px-1 py-0.5 rounded leading-none">
                              {pageNum}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
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

      {/* Leyenda Final */}
      <div className="space-y-2 text-center pb-8">
        <div className="flex flex-col gap-1 items-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            {numPages} {numPages === 1 ? 'Hoja' : 'Hojas'} en total • Formato {isLetter ? 'Carta' : 'A4'}
          </p>
          {isPhoto && (
            <div className="inline-flex items-center justify-center gap-2 px-3 py-1 bg-pink-600 text-white rounded-full text-[9px] font-black uppercase shadow-lg shadow-pink-100">
              Ajuste Fotográfico Automático
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PagePreview;
