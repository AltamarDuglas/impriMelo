import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send } from 'lucide-react';
import PaperConfig from './PaperConfig';

/**
 * PrintDrawer - Modal inferior para configurar la impresión.
 * 
 * SOLID: Responsabilidad Única - Maneja la UI de configuración y envío.
 * Decisión: Se usa React.memo para evitar que el modal se re-renderice
 * cada vez que el lienzo (padre) cambia sus elementos internos.
 */
const PrintDrawer = memo(({ isOpen, onClose, paperConfig, onPaperChange, onSendToPrint, isSending }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop para cerrar al hacer click fuera - Fix del Bug de Guardado */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[190] bg-slate-900/60"
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute inset-x-0 bottom-0 z-[200] bg-white rounded-t-[2.5rem] p-6 pb-[calc(env(safe-area-inset-bottom,0px)+2rem)] shadow-2xl border-t border-slate-100 max-h-[80vh] overflow-y-auto"
          >
            {/* Tirador del drawer */}
            <div 
              className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-6 cursor-pointer hover:bg-slate-300 transition-colors" 
              onClick={onClose} 
            />

            <PaperConfig paperConfig={paperConfig} onPaperChange={onPaperChange} onBack={onClose} />
            
            <button
              onClick={onSendToPrint}
              disabled={isSending}
              className="w-full mt-8 flex items-center justify-center gap-3 bg-gradient-melo text-white font-black py-4 rounded-2xl shadow-[0_10px_30px_rgba(236,72,153,0.3)] text-sm disabled:opacity-50 active:scale-95 transition-all"
            >
              <Send className="w-5 h-5" />
              {isSending ? 'Enviando...' : 'MANDAR A IMPRIMIR'}
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});

PrintDrawer.displayName = 'PrintDrawer';

export default PrintDrawer;
