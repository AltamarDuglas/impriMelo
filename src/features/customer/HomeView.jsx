import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Constantes y Componentes Refactorizados (SOLID)
import { PRICES } from './HomeConstants';
import UploadStep from './components/UploadStep';
import ConfigStep from './components/ConfigStep';
import CheckoutStep from './components/CheckoutStep';
import SuccessStep from './components/SuccessStep';

// Configuración del worker de PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

/**
 * Vista de Inicio para Clientes (HomeView) - Evolución impriMELO.
 * 
 * Sigue principios de SOLID al delegar la UI en sub-componentes especializados.
 * Actúa como orquestador del estado y la lógica de negocio.
 */
const HomeView = () => {
  const [step, setStep] = useState(1); // 1: Upload, 2: Config, 3: Checkout, 4: Success
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [config, setConfig] = useState({
    paperType: 'normal',
    printMode: 'individual', // individual, tarjeta, mosaico, pdf
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
  const [userOrders, setUserOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const { token, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Helper para contar páginas según el rango "1, 3, 5-8"
  const getCustomPageCount = (rangeStr, maxPages) => {
    if (!rangeStr.trim()) return 0;
    const parts = rangeStr.split(',');
    let count = 0;
    for (const part of parts) {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(n => parseInt(n.trim(), 10));
        if (!isNaN(start) && !isNaN(end) && start <= end && start >= 1 && end <= maxPages) {
          count += (end - start + 1);
        }
      } else {
        const num = parseInt(part.trim(), 10);
        if (!isNaN(num) && num >= 1 && num <= maxPages) {
          count += 1;
        }
      }
    }
    return count;
  };

  // Actualizar el total de páginas con lógica corregida (SOLID: Lógica de negocio centralizada)
  useEffect(() => {
    let basePages = 0;

    if (config.printMode === 'pdf' && previews.length > 0 && previews[0].pages) {
      const maxP = previews[0].pages;
      basePages = config.pdfRange === 'all' ? maxP : getCustomPageCount(config.pdfCustomRange, maxP);
    }
    else if (config.printMode === 'tarjeta' || config.printMode === 'mosaico') {
      // En estos modos, todas las imágenes se distribuyen en UNA sola hoja física (o paquete)
      basePages = previews.length > 0 ? 1 : 0;
    }
    else {
      // Modo Individual: cada imagen cuenta como una página (o más si el archivo es multi-página)
      basePages = previews.reduce((acc, curr) => acc + (curr.pages || 1), 0);
    }

    setTotalPages(basePages * config.copies);
  }, [previews, config.printMode, config.pdfRange, config.pdfCustomRange, config.copies]);

  // Parsear rango a páginas individuales
  const parseRangeToPages = (rangeStr, maxPages) => {
    if (!rangeStr || !rangeStr.trim()) return [];
    const pagesSet = new Set();
    for (const part of rangeStr.split(',')) {
      const trimmed = part.trim();
      if (trimmed.includes('-')) {
        const [startStr, endStr] = trimmed.split('-');
        const start = parseInt(startStr.trim(), 10);
        const end = parseInt(endStr.trim(), 10);
        if (!isNaN(start) && !isNaN(end) && start >= 1 && end <= maxPages && start <= end) {
          for (let i = start; i <= end; i++) pagesSet.add(i);
        }
      } else {
        const num = parseInt(trimmed, 10);
        if (!isNaN(num) && num >= 1 && num <= maxPages) pagesSet.add(num);
      }
    }
    return [...pagesSet].sort((a, b) => a - b);
  };

  // Renderizar miniaturas PDF
  useEffect(() => {
    if (config.printMode !== 'pdf' || files.length === 0 || !previews[0]?.pages) {
      setPdfPagePreviews([]);
      return;
    }

    const debounceTimer = setTimeout(async () => {
      const maxPages = previews[0].pages;
      let pagesToRender = [];

      if (config.pdfRange === 'all') {
        pagesToRender = [1];
      } else {
        pagesToRender = parseRangeToPages(config.pdfCustomRange, maxPages).slice(0, 8);
        if (pagesToRender.length === 0) {
          setPdfPagePreviews([]);
          return;
        }
      }

      setIsRenderingPages(true);
      try {
        const arrayBuffer = await files[0].arrayBuffer();
        const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        const thumbnails = await Promise.all(
          pagesToRender.map(async (pageNum) => {
            const page = await pdfDoc.getPage(pageNum);
            const viewport = page.getViewport({ scale: 0.8 });
            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
            return { pageNum, url: canvas.toDataURL('image/jpeg', 0.75) };
          })
        );
        setPdfPagePreviews(thumbnails);
      } catch (err) {
        console.error('Error renderizando páginas del PDF:', err);
        setPdfPagePreviews([]);
      } finally {
        setIsRenderingPages(false);
      }
    }, 600);

    return () => clearTimeout(debounceTimer);
  }, [config.printMode, config.pdfRange, config.pdfCustomRange, files, previews]);

  // Cargar historial
  const fetchUserOrders = async () => {
    if (!isAuthenticated) return;
    setLoadingOrders(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/orders/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUserOrders(data);
      }
    } catch (err) {
      console.error("Error cargando pedidos:", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    // fetchUserOrders(); // Eliminado para favorecer HistoryView
  }, [isAuthenticated, step]);

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
              const ctx = canvas.getContext('2d');
              canvas.width = viewport.width;
              canvas.height = viewport.height;
              await page.render({ canvasContext: ctx, viewport }).promise;
              thumbnail = canvas.toDataURL('image/jpeg', 0.8);
            } catch (err) {
              console.error("Error leyendo PDF", err);
            }
          }

          return {
            url: isPdf ? thumbnail : (f.type.startsWith('image/') ? URL.createObjectURL(f) : null),
            isImage: f.type.startsWith('image/'),
            name: f.name,
            pages: pages
          };
        }));

        const hasPdf = newPreviews.some(p => !p.isImage);

        if (hasPdf) {
          if (selectedFiles.length > 1 || files.length > 0) {
            alert("Los archivos PDF deben subirse de forma individual.");
            setIsUploading(false);
            return;
          }
          setFiles([selectedFiles[0]]);
          setPreviews([newPreviews[0]]);
          setConfig(prev => ({ ...prev, printMode: 'pdf', pdfRange: 'all', pdfCustomRange: '', copies: 1 }));
        } else {
          // Si ya estamos en paso 2 o añadimos más, concatenamos para Mosaico e Individual
          if (config.printMode === 'mosaico' || config.printMode === 'individual') {
            setFiles(prev => [...prev, ...selectedFiles]);
            setPreviews(prev => [...prev, ...newPreviews]);
          } else {
            setFiles(selectedFiles);
            setPreviews(newPreviews);
          }
        }
        if (step === 1) setStep(2);
      } catch (err) {
        alert("Error procesando los archivos.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleRemoveFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
    if (files.length === 1) setStep(1);
  };

  const handleMultiplyFile = (index) => {
    setFiles(prev => [...prev, files[index]]);
    setPreviews(prev => [...prev, previews[index]]);
  };

  const handleConfirmCheckout = async (checkoutData) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      // Archivos y Configuración
      files.forEach(f => formData.append('image_files', f));
      formData.append('paper_type', config.paperType);
      formData.append('print_mode', config.printMode);
      formData.append('orientation', config.orientation);
      formData.append('copies', config.copies.toString());
      formData.append('num_pages', totalPages.toString());
      formData.append('total_price', currentPrice.toString());

      // Datos del Cliente
      formData.append('customer_name', checkoutData.name);
      formData.append('customer_address', checkoutData.address);
      formData.append('customer_phone', checkoutData.phone);

      // Comprobante
      if (checkoutData.screenshot) {
        formData.append('payment_screenshot', checkoutData.screenshot);
      }

      // Reutilizamos el path de la primera imagen como referencia principal (o el backend lo manejará)
      formData.append('image_path', files[0].name);

      if (config.printMode === 'pdf') {
        formData.append('pdf_page_range', config.pdfRange === 'all' ? 'all' : config.pdfCustomRange);
      } else if (config.printMode === 'mosaico') {
        formData.append('mosaic_columns', config.mosaic.columns.toString());
        formData.append('mosaic_size_cm', config.mosaic.sizeCm.toString());
      }

      const response = await fetch('http://127.0.0.1:8000/api/v1/checkout/', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) throw new Error('Error al procesar el checkout');
      setStep(4);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const currentPrice = totalPages * PRICES[config.paperType];

  return (
    <div className="h-screen w-full flex flex-col px-0 py-4 md:p-6 overflow-hidden relative">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <UploadStep
            onFileChange={handleFileChange}
            isUploading={isUploading}
          />
        )}

        {step === 2 && (
          <ConfigStep
            config={config}
            setConfig={setConfig}
            previews={previews}
            files={files}
            onRemoveFile={handleRemoveFile}
            onMultiplyFile={handleMultiplyFile}
            onFileChange={handleFileChange}
            onBack={() => { setFiles([]); setPreviews([]); setStep(1); }}
            onConfirm={() => {
              if (!isAuthenticated) {
                alert("Debes iniciar sesión para proceder al pago.");
                navigate('/login');
                return;
              }
              setStep(3);
            }}
            isUploading={isUploading}
            totalPages={totalPages}
            currentPrice={currentPrice}
            pdfPagePreviews={pdfPagePreviews}
            isRenderingPages={isRenderingPages}
          />
        )}

        {step === 3 && (
          <CheckoutStep
            config={config}
            totalPages={totalPages}
            currentPrice={currentPrice}
            onBack={() => setStep(2)}
            onConfirm={handleConfirmCheckout}
            isUploading={isUploading}
          />
        )}

        {step === 4 && (
          <SuccessStep
            files={files}
            config={config}
            currentPrice={currentPrice}
            onReset={() => setStep(1)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomeView;
