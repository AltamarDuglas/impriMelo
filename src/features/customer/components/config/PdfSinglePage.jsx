import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { Loader2, ScrollText } from 'lucide-react';

/**
 * PdfSinglePage: Renderiza una única página de un PDF de forma eficiente.
 */
const PdfSinglePage = ({ file, pageNum, orientation }) => {
  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    const renderPage = async () => {
      if (!file) return;
      setLoading(true);
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const page = await pdf.getPage(pageNum);
        
        // Ajustar escala para buena calidad en el preview
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport }).promise;
        
        if (isMounted) {
          setUrl(canvas.toDataURL('image/webp', 0.8));
          setLoading(false);
        }
      } catch (err) {
        console.error("Error renderizando página PDF:", err);
        if (isMounted) setLoading(false);
      }
    };

    renderPage();
    return () => { isMounted = false; };
  }, [file, pageNum]);

  return (
    <div className="w-full h-full flex items-center justify-center bg-white relative">
      {loading ? (
        <div className="flex flex-col items-center gap-4">
           <div className="relative">
              <Loader2 className="w-10 h-10 animate-spin text-pink-400" />
              <div className="absolute inset-0 blur-xl bg-pink-400/20 animate-pulse" />
           </div>
           <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Renderizando...</p>
        </div>
      ) : url ? (
        <img 
          src={url} 
          alt={`Página ${pageNum}`} 
          className="w-full h-full object-contain animate-in fade-in zoom-in-95 duration-500" 
        />
      ) : (
        <ScrollText className="w-12 h-12 text-slate-200" />
      )}
    </div>
  );
};

export default PdfSinglePage;
