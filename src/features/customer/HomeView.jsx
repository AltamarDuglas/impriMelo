import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

import { PRICES } from './HomeConstants';
import UploadStep from './components/steps/UploadStep';
import ConfigStep from './components/steps/ConfigStep';
import CheckoutStep from './components/steps/CheckoutStep';
import SuccessStep from './components/steps/SuccessStep';
import CanvasEditor from './components/canvas/CanvasEditor';
import PromoBanner from '../../components/shared/PromoBanner';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const HomeView = () => {
  const [step, setStep] = useState(1);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [config, setConfig] = useState({
    paperType: 'normal',
    printMode: 'individual',
    orientation: 'portrait',
    copies: 1,
    pdfRange: 'all',
    pdfCustomRange: '',
    mosaic: { columns: 4, sizeCm: 5 }
  });
  const [isUploading, setIsUploading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [pdfPagePreviews, setPdfPagePreviews] = useState([]);
  const [isRenderingPages, setIsRenderingPages] = useState(false);
  const [restoredDesign, setRestoredDesign] = useState(null);

  const { token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // --- RESTAURACIÓN POST-LOGIN ---
  useEffect(() => {
    const saved = localStorage.getItem('pending_melo_design');
    if (saved) {
      try {
        const { elements, config: dConfig, previews: dPreviews } = JSON.parse(saved);
        setRestoredDesign({ elements, config: dConfig });
        setPreviews(dPreviews);
        setStep(2);
        // Limpiamos inmediatamente para que un F5 posterior limpie el lienzo
        localStorage.removeItem('pending_melo_design');
      } catch (err) {
        console.error("Error restaurando diseño", err);
      }
    }
  }, []);

  const getCustomPageCount = (rangeStr, maxPages) => {
    if (!rangeStr.trim()) return 0;
    const parts = rangeStr.split(',');
    let count = 0;
    for (const part of parts) {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(n => parseInt(n.trim(), 10));
        if (!isNaN(start) && !isNaN(end) && start <= end && start >= 1 && end <= maxPages) count += (end - start + 1);
      } else {
        const num = parseInt(part.trim(), 10);
        if (!isNaN(num) && num >= 1 && num <= maxPages) count += 1;
      }
    }
    return count;
  };

  useEffect(() => {
    let basePages = 0;
    if (config.printMode === 'pdf' && previews.length > 0 && previews[0].pages) {
      const maxP = previews[0].pages;
      basePages = config.pdfRange === 'all' ? maxP : getCustomPageCount(config.pdfCustomRange, maxP);
    } else if (config.printMode === 'tarjeta' || config.printMode === 'mosaico') {
      basePages = previews.length > 0 ? 1 : 0;
    } else {
      basePages = previews.reduce((acc, curr) => acc + (curr.pages || 1), 0);
    }
    setTotalPages(basePages * config.copies);
  }, [previews, config.printMode, config.pdfRange, config.pdfCustomRange, config.copies]);

  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 0) {
      setIsUploading(true);
      try {
        const newPreviews = await Promise.all(selectedFiles.map(async f => {
          let pages = 1;
          let thumbnail = null;
          const isPdf = f.type === 'application/pdf';
          if (isPdf) {
            try {
              const arrayBuffer = await f.arrayBuffer();
              const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
              pages = pdf.numPages;
              const page = await pdf.getPage(1);
              const viewport = page.getViewport({ scale: 0.8 });
              const canvas = document.createElement('canvas');
              canvas.width = viewport.width; canvas.height = viewport.height;
              await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
              thumbnail = canvas.toDataURL('image/jpeg', 0.8);
            } catch (err) { console.error("Error leyendo PDF", err); }
          }
          return { url: isPdf ? thumbnail : (f.type.startsWith('image/') ? URL.createObjectURL(f) : null), isImage: f.type.startsWith('image/'), name: f.name, pages: pages };
        }));

        if (newPreviews.some(p => !p.isImage)) {
          setFiles([selectedFiles[0]]); setPreviews([newPreviews[0]]);
          setConfig(prev => ({ ...prev, printMode: 'pdf', pdfRange: 'all', pdfCustomRange: '', copies: 1 }));
        } else {
          setFiles(prev => [...prev, ...selectedFiles]); setPreviews(prev => [...prev, ...newPreviews]);
        }
        if (step === 1) setStep(2);
      } catch (err) { alert("Error procesando los archivos."); } finally { setIsUploading(false); }
    }
  };

  const handleConfirmCheckout = async (checkoutData) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      files.forEach(f => formData.append('image_files', f));
      formData.append('paper_type', config.paperType);
      formData.append('print_mode', config.printMode);
      formData.append('orientation', config.orientation);
      formData.append('copies', config.copies.toString());
      formData.append('num_pages', totalPages.toString());
      formData.append('total_price', currentPrice.toString());
      formData.append('customer_name', checkoutData.name);
      formData.append('customer_address', checkoutData.address);
      formData.append('customer_phone', checkoutData.phone);
      if (checkoutData.screenshot) formData.append('payment_screenshot', checkoutData.screenshot);
      const fileName = files[0]?.name || `diseño-impriMELO-${Date.now()}.pdf`;
      formData.append('image_path', fileName);
      if (config.printMode === 'pdf' || config.printMode === 'canvas') {
        formData.append('pdf_page_range', config.pdfRange === 'all' ? 'all' : config.pdfCustomRange);
      } else if (config.printMode === 'mosaico') {
        formData.append('mosaic_columns', config.mosaic.columns.toString());
        formData.append('mosaic_size_cm', config.mosaic.sizeCm.toString());
      }
      const response = await fetch('http://127.0.0.1:8000/api/v1/checkout/', { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formData });
      if (!response.ok) throw new Error('Error al procesar el checkout');
      setStep(4);
    } catch (err) { alert(err.message); } finally { setIsUploading(false); }
  };

  const handleFinishDesign = (pdfBlob, designConfig, elements) => {
    const finalFile = new File([pdfBlob], `diseño-melo-${Date.now()}.pdf`, { type: 'application/pdf' });
    setFiles([finalFile]); 
    setPreviews([{ url: URL.createObjectURL(pdfBlob), isImage: false, name: finalFile.name, pages: 1 }]);
    
    const newConfig = {
      ...config, 
      printMode: 'canvas',
      paperType: designConfig.sizeId === 'carta' ? 'normal' : (designConfig.sizeId === 'a5' ? 'fotografico' : 'stickers'),
      orientation: designConfig.orientation, 
      copies: 1
    };
    setConfig(newConfig);

    if (!isAuthenticated) {
      // Guardamos el estado para restaurarlo tras el login
      localStorage.setItem('pending_melo_design', JSON.stringify({
        elements,
        config: designConfig,
        previews: previews // Guardamos las previews originales para que CanvasEditor las procese si es necesario
      }));
      alert("Debes iniciar sesión para finalizar tu pedido."); 
      navigate('/login'); 
      return; 
    }
    setStep(3);
  };

  const currentPrice = totalPages * (PRICES[config.paperType] || 1000);

  return (
    <div className="h-screen w-full flex flex-col px-0 py-4 md:p-6 overflow-hidden relative">
      <AnimatePresence mode="wait">
        {step === 1 && <UploadStep onFileChange={handleFileChange} isUploading={isUploading} />}
        {step === 2 && config.printMode === 'pdf' && (
          <ConfigStep config={config} setConfig={setConfig} previews={previews} files={files} onBack={() => { setFiles([]); setPreviews([]); setStep(1); }} onConfirm={() => { if (!isAuthenticated) { navigate('/login'); return; } setStep(3); }} isUploading={isUploading} totalPages={totalPages} currentPrice={currentPrice} pdfPagePreviews={pdfPagePreviews} isRenderingPages={isRenderingPages} />
        )}
        {step === 2 && config.printMode !== 'pdf' && (
          <CanvasEditor 
            initialImages={restoredDesign ? [] : previews.filter(p => p.isImage).map(p => p.url)} 
            initialElements={restoredDesign?.elements || []}
            initialConfig={restoredDesign?.config}
            onBack={() => { setFiles([]); setPreviews([]); setStep(1); setRestoredDesign(null); }} 
            onFinishDesign={handleFinishDesign} 
          />
        )}
        {step === 3 && <CheckoutStep config={config} totalPages={totalPages} currentPrice={currentPrice} onBack={() => setStep(2)} onConfirm={handleConfirmCheckout} isUploading={isUploading} />}
        {step === 4 && <SuccessStep files={files} config={config} currentPrice={currentPrice} onReset={() => setStep(1)} />}
      </AnimatePresence>
      <PromoBanner />
    </div>
  );
};

export default HomeView;
