import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send } from 'lucide-react';
import PaperConfig from './PaperConfig';

const PrintDrawer = ({ isOpen, onClose, paperConfig, onPaperChange, onSendToPrint, isSending }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          className="absolute inset-x-0 bottom-0 z-[200] bg-white rounded-t-[2.5rem] p-6 shadow-2xl border-t border-slate-100 max-h-[70vh] overflow-y-auto"
        >
          <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-4 cursor-pointer" onClick={onClose} />
          <PaperConfig paperConfig={paperConfig} onPaperChange={onPaperChange} onBack={onClose} />
          <button
            onClick={onSendToPrint}
            disabled={isSending}
            className="w-full mt-6 flex items-center justify-center gap-3 bg-gradient-melo text-white font-black py-4 rounded-2xl shadow-[0_10px_30px_rgba(236,72,153,0.3)] text-sm disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
            {isSending ? 'Enviando...' : 'MANDAR A IMPRIMIR'}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PrintDrawer;
