import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, X, Sparkles } from 'lucide-react';

/**
 * PromoBanner - Una pequeña ventana emergente para avisos rápidos.
 * Diseño: "Melo Style" (Vibrante, con gradientes y bordes suaves).
 */
const PromoBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[10000] flex items-start justify-center p-4 pt-[15vh] overflow-hidden pointer-events-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm pointer-events-auto"
          />

          {/* Ventana Compacta */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="relative w-full max-w-[280px] bg-white rounded-[2.5rem] shadow-[0_25px_70px_rgba(0,0,0,0.5)] border border-white overflow-hidden pointer-events-auto"
          >
            <div className="h-28 bg-gradient-melo flex items-center justify-center">
               <motion.div 
                 animate={{ rotate: [0, 10, -10, 0] }}
                 transition={{ repeat: Infinity, duration: 3 }}
                 className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30"
               >
                  <Truck className="w-8 h-8 text-white drop-shadow-lg" />
               </motion.div>
            </div>

            <div className="p-6 text-center space-y-4">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-pink-100 text-pink-600 rounded-full">
                <Sparkles className="w-2.5 h-2.5 fill-pink-600" />
                <span className="text-[8px] font-black uppercase tracking-widest">Exclusivo</span>
              </div>
              
              <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-950 leading-tight">
                  ¡Imprime Hoy, <br />
                  <span className="text-gradient-melo">Recibe Mañana!</span>
                </h3>
                <p className="text-[10px] font-bold text-slate-500">
                  Envío <span className="text-green-600 font-black">GRATIS</span> hoy.
                </p>
              </div>

              <button
                onClick={handleClose}
                className="w-full py-4 bg-slate-950 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-800 active:scale-95 transition-all shadow-lg"
              >
                ¡APROVECHAR!
              </button>
              
              <button 
                onClick={handleClose}
                className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600"
              >
                Omitir
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PromoBanner;
