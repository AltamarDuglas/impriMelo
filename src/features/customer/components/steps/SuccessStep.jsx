import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

/**
 * Componente para el Paso 3: Confirmación de Pedido.
 * SOLID: Responsabilidad Única - Solo maneja la UI de éxito post-pedido.
 */
const SuccessStep = ({ files, config, currentPrice, onReset }) => {
  return (
    <motion.section
      key="step3"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="max-w-md mx-auto glass-card-thick p-10 text-center space-y-6 shadow-2xl flex flex-col justify-center border-white/60"
    >
      <div className="w-24 h-24 bg-gradient-melo text-white rounded-[2.5rem] flex items-center justify-center mx-auto rotate-12 shadow-xl border border-white/20">
        <CheckCircle2 className="w-12 h-12" />
      </div>
      <div className="space-y-2">
        <h2 className="text-3xl font-black text-slate-950 leading-tight">¡Eso quedó <span className="text-gradient-melo">Melo</span>!</h2>
        <p className="text-sm text-slate-600 font-bold">Hemos recibido tu pedido correctamente.</p>
      </div>

      <div className="glass-card p-5 space-y-1">
        <p className="text-xs text-slate-800 font-black tracking-widest">Resumen del Pedido</p>
        <p className="font-bold text-slate-950 text-sm truncate">
          {files.length === 1 ? files[0]?.name : `${files.length} archivos`}
        </p>
        <p className="text-xs text-pink-600 font-black">
          {config.paperType.replace('_', ' ')} • {config.printMode}
        </p>
        <div className="pt-2 mt-2 border-t border-white/40">
          <p className="text-sm font-black text-slate-950">
            Total Pagado: <span className="text-green-600 font-black">${currentPrice.toLocaleString('es-CO')}</span>
          </p>
        </div>
      </div>

      <button onClick={onReset} className="btn-melo w-full py-4 text-sm shadow-xl font-bold">Hacer otro pedido</button>
    </motion.section>
  );
};

export default SuccessStep;
