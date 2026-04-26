import React from 'react';
import { motion } from 'framer-motion';
import { ScrollText, Sparkles, StickyNote, Image as ImageIcon, ChevronRight, Info } from 'lucide-react';

const PAPER_OPTIONS = [
  { 
    id: 'carta', 
    label: 'Papel Carta (Normal)', 
    desc: 'Ideal para documentos e ilustraciones mate de calidad estándar.', 
    details: '215.9 x 279.4 mm',
    icon: ScrollText,
    color: 'blue'
  },
  { 
    id: 'a4_foto', 
    label: 'A4 Fotográfico / Adhesivo', 
    desc: 'Fotos grandes con brillo profesional o stickers de alta calidad.', 
    details: '210 x 297 mm',
    icon: Sparkles,
    color: 'pink'
  },
  { 
    id: 'a5_foto', 
    label: 'A5 Fotográfico', 
    desc: 'El tamaño perfecto para fotos normales de álbum.', 
    details: '148 x 210 mm',
    icon: ImageIcon,
    color: 'purple'
  }
];

const PaperSelectStep = ({ onSelect, onBack }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-start p-4 pt-10 pb-32 max-w-4xl mx-auto w-full">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-3">
          ¿Qué papel vamos a usar?
        </h2>
        <p className="text-slate-500 font-medium">Selecciona el formato para tu impresión</p>
      </motion.div>

      <div className="flex flex-col gap-4 w-full max-w-2xl mb-12">
        {PAPER_OPTIONS.map((opt, i) => (
          <motion.button
            key={opt.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => onSelect(opt.id)}
            className="group relative bg-white p-5 rounded-3xl shadow-lg border-2 border-transparent hover:border-pink-500 transition-all text-left flex items-center gap-6"
          >
            <div className={`w-16 h-16 rounded-2xl bg-${opt.color}-50 text-${opt.color}-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
               <opt.icon className="w-8 h-8" />
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-black text-slate-900 mb-1">{opt.label}</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                {opt.desc}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{opt.details}</span>
              </div>
            </div>

            <ChevronRight className="w-6 h-6 text-slate-200 group-hover:text-pink-500 transform group-hover:translate-x-1 transition-all" />
          </motion.button>
        ))}
      </div>

      <div className="flex flex-col items-center gap-4">
        <a 
          href="/referencia-papel" 
          target="_blank"
          className="flex items-center gap-2 text-pink-500 font-black text-xs uppercase tracking-widest hover:underline decoration-2 underline-offset-4"
        >
          <Info className="w-4 h-4" /> Ver guía visual de papeles
        </a>
        
        <button 
          onClick={onBack}
          className="text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-slate-600 transition-colors"
        >
          Atrás
        </button>
      </div>
    </div>
  );
};

export default PaperSelectStep;
