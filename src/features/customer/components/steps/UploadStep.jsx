import React from 'react';
import { motion } from 'framer-motion';
import { Upload, Image as ImageIcon, Mail, Send } from 'lucide-react';

/**
 * UploadStep: El Hero y la zona de carga inicial.
 * Basado en la nueva línea gráfica: Glassmorphism, Colores Crema y Elementos Flotantes.
 */
const UploadStep = ({ onFileChange, isUploading }) => {
  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ type: "spring", stiffness: 200, damping: 25 }}
      className="relative flex flex-col items-center justify-start text-center py-4 px-4 min-h-[80vh] overflow-hidden"
    >
      {/* Elementos Flotantes Decorativos (Inspirados en la imagen) */}
      <motion.div className="absolute top-10 left-10 text-pink-300 floating opacity-40">
        <ImageIcon className="w-16 h-16 rotate-12" />
      </motion.div>
      <motion.div className="absolute top-20 right-10 text-orange-300 floating-delayed opacity-40">
        <Mail className="w-12 h-12 -rotate-12" />
      </motion.div>
      <motion.div className="absolute bottom-20 left-20 text-blue-300 floating-delayed opacity-30">
        <Mail className="w-10 h-10 rotate-45" />
      </motion.div>
      <motion.div className="absolute bottom-10 right-20 text-pink-400 floating opacity-30">
        <Send className="w-14 h-14 -rotate-45" />
      </motion.div>

      {/* Hero Text */}
      <div className="space-y-2 mb-4 relative z-10 pt-2">
        <h1 className="text-3xl md:text-6xl font-black text-slate-950 tracking-tighter leading-[1.1]">
          Imprime lo que quieras, <br />
          <span className="text-gradient-melo">
            ¡Te lo llevamos a casa!
          </span>
        </h1>
        <p className="text-sm md:text-xl text-slate-800 font-semibold max-w-md mx-auto">
          Sube tu foto y personaliza tu impresión en segundos.
        </p>
      </div>

      {/* Tarjeta de Carga Central (Rectangular y Compacta) */}
      <div className="relative z-10 w-full max-w-md aspect-[3/2] md:aspect-auto md:h-80">
        <div className="glass-card h-full p-6 flex flex-col items-center justify-center relative overflow-hidden group">
          {/* Fondo decorativo interno */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
          
          <label className="relative cursor-pointer flex flex-col items-center gap-4 group">
            {/* Botón de Carga Estilo Icono Grande */}
            <div className="w-20 h-20 md:w-28 md:h-28 rounded-[2rem] bg-gradient-melo p-0.5 shadow-2xl group-hover:scale-105 transition-all duration-500">
               <div className="w-full h-full bg-white/20 backdrop-blur-md rounded-[1.9rem] flex items-center justify-center border border-white/30">
                  {isUploading ? (
                    <div className="animate-spin w-10 h-10 border-4 border-white border-t-transparent rounded-full" />
                  ) : (
                    <Upload className="w-10 h-10 md:w-14 md:h-14 text-white drop-shadow-lg" />
                  )}
               </div>
            </div>

            <div className="space-y-0.5 mt-2">
              <h3 className="text-xl md:text-3xl font-black text-slate-950 tracking-tight">Empieza Aquí</h3>
              <p className="text-xs font-black text-slate-800 tracking-[0.2em]">Sube</p>
              <p className="text-xs font-black text-slate-800 tracking-[0.2em]">Imágenes o PDF</p>
            </div>

            <input
              type="file"
              multiple
              className="hidden"
              onChange={onFileChange}
              accept="image/*,.pdf"
              disabled={isUploading}
            />
          </label>
        </div>
      </div>
    </motion.section>
  );
};

export default UploadStep;
