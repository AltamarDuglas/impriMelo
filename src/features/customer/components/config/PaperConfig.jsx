import React from 'react';
import { PAPER_SIZES } from '../../HomeConstants';

const PaperConfig = ({ paperConfig, onPaperChange, onBack }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-black text-slate-900 mb-1">Configuración de Impresión</h3>
        <p className="text-sm text-slate-500">Selecciona el formato físico de tu diseño.</p>
      </div>

      <div className="space-y-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tamaño del Papel</p>
        <div className="grid grid-cols-2 gap-3">
          {PAPER_SIZES.map((size) => (
            <button
              key={size.id}
              disabled={size.disabled}
              onClick={() => onPaperChange({ ...paperConfig, sizeId: size.id })}
              className={`relative p-4 rounded-2xl border-2 transition-all text-left ${
                paperConfig.sizeId === size.id
                  ? 'border-pink-500 bg-pink-50/50'
                  : 'border-slate-100 bg-white hover:border-slate-200'
              } ${size.disabled ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
            >
              <p className={`font-black text-sm ${paperConfig.sizeId === size.id ? 'text-pink-600' : 'text-slate-900'}`}>
                {size.label}
              </p>
              {size.widthMm && (
                <p className="text-[10px] text-slate-400 mt-1">{size.widthMm} x {size.heightMm} mm</p>
              )}
              {size.badge && (
                <span className="absolute top-2 right-2 px-1.5 py-0.5 bg-slate-200 text-[8px] font-black rounded uppercase">
                  {size.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Orientación</p>
        <div className="flex gap-3">
          <button
            onClick={() => onPaperChange({ ...paperConfig, orientation: 'portrait' })}
            className={`flex-1 p-3 rounded-xl border-2 font-bold text-xs transition-all ${
              paperConfig.orientation === 'portrait' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-400'
            }`}
          >
            Vertical
          </button>
          <button
            onClick={() => onPaperChange({ ...paperConfig, orientation: 'landscape' })}
            className={`flex-1 p-3 rounded-xl border-2 font-bold text-xs transition-all ${
              paperConfig.orientation === 'landscape' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-400'
            }`}
          >
            Horizontal
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaperConfig;
