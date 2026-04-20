import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, MapPin, Phone, User, Upload, CheckCircle2, ChevronLeft } from 'lucide-react';

/**
 * CheckoutStep: Maneja el proceso de pago y recolección de datos del cliente.
 */
const CheckoutStep = ({ config, totalPages, currentPrice, onBack, onConfirm, isUploading }) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
  });
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);

  const handleScreenshotChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setScreenshot(file);
      setScreenshotPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.address || !formData.phone) {
      alert("Por favor completa todos los datos de envío.");
      return;
    }
    onConfirm({ ...formData, screenshot });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-4xl mx-auto h-full flex items-center overflow-hidden py-10"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {/* Lado Izquierdo: Datos de Pago */}
        <div className="space-y-4">
          <div className="glass-card-thick p-6 rounded-[2.5rem] shadow-2xl relative overflow-hidden border border-white/60">
             <div className="absolute top-0 right-0 p-2 opacity-5">
                <CreditCard className="w-24 h-24 rotate-12 text-slate-900" />
             </div>
             
             <h3 className="text-xl font-black mb-4 flex items-center gap-2 text-slate-950">
                <CreditCard className="text-pink-500 w-5 h-5" /> Pago Nequi
             </h3>
             
             <div className="space-y-3 relative z-10">
                <div className="bg-white/50 p-3 rounded-2xl backdrop-blur-md border border-white/60 shadow-sm">
                   <p className="text-xs font-black tracking-widest text-pink-500 mb-0.5">Cuenta</p>
                   <p className="text-2xl font-mono font-black tracking-tighter text-slate-950">323 518 9860</p>
                </div>
                
                <div className="bg-white/50 p-3 rounded-2xl backdrop-blur-md border border-white/60 shadow-sm">
                   <p className="text-xs font-black tracking-widest text-pink-500 mb-0.5">Nombre</p>
                   <p className="text-lg font-bold text-slate-950">Duglas Altamar Gómez</p>
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                   <p className="text-sm font-black text-slate-600">Total a transferir:</p>
                   <p className="text-slate-950 font-black text-2xl">${currentPrice.toLocaleString()} <span className="text-[10px] opacity-60">COP</span></p>
                </div>
             </div>
          </div>

          <div className="glass-card-thick p-5 shadow-lg">
             <p className="text-[10px] font-black text-slate-600 mb-3 flex items-center gap-2  tracking-widest">
                <Upload className="w-3 h-3 text-pink-500" /> Adjuntar Comprobante
             </p>
             <label className="relative group cursor-pointer block">
                <div className={`aspect-[2/1] rounded-[2rem] border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2 ${
                  screenshotPreview ? 'border-green-400 bg-green-50/30' : 'border-white/60 bg-white/40 backdrop-blur-sm group-hover:bg-white/60'
                }`}>
                   {screenshotPreview ? (
                      <img src={screenshotPreview} className="w-full h-full object-contain p-2" alt="Comprobante" />
                   ) : (
                      <>
                        <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
                           <Upload className="w-5 h-5 text-slate-600" />
                        </div>
                        <p className="text-[10px] font-black  text-slate-600">Seleccionar Captura</p>
                      </>
                   )}
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleScreenshotChange} />
             </label>
          </div>
        </div>

        {/* Lado Derecho: Formulario de Envío */}
        <div className="glass-card-thick p-8 shadow-xl flex flex-col justify-between">
          <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
             <MapPin className="text-blue-500 w-5 h-5" /> Datos de Envío
          </h3>
          
          <form className="space-y-4">
             <div className="space-y-1">
                <label className="text-xs font-black text-slate-800 ml-2">Nombre Completo</label>
                <div className="relative">
                   <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                   <input 
                      type="text" 
                      placeholder="Ej: Juan Pérez"
                      className="w-full pl-11 pr-4 py-3.5 bg-white/50 border border-white rounded-2xl text-sm focus:ring-2 focus:ring-pink-500 outline-none transition-all shadow-sm font-medium text-slate-950 placeholder:text-slate-400"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                   />
                </div>
             </div>

             <div className="space-y-1">
                <label className="text-xs font-black text-slate-800 ml-2">Dirección de Entrega</label>
                <div className="relative">
                   <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                   <input 
                      type="text" 
                      placeholder="Ciudad, Barrio, Dirección"
                      className="w-full pl-11 pr-4 py-3.5 bg-white/50 border border-white rounded-2xl text-sm focus:ring-2 focus:ring-pink-500 outline-none transition-all shadow-sm font-medium text-slate-950 placeholder:text-slate-400"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                   />
                </div>
             </div>

             <div className="space-y-1">
                <label className="text-xs font-black text-slate-800 ml-2">WhatsApp de Contacto</label>
                <div className="relative">
                   <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                   <input 
                      type="tel" 
                      placeholder="Ej: 321 000 0000"
                      className="w-full pl-11 pr-4 py-3.5 bg-white/50 border border-white rounded-2xl text-sm focus:ring-2 focus:ring-pink-500 outline-none transition-all shadow-sm font-medium text-slate-950 placeholder:text-slate-400"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                   />
                </div>
             </div>
          </form>

          <div className="mt-8 space-y-3">
             <button
                onClick={handleSubmit}
                disabled={isUploading}
                className="btn-melo w-full shadow-2xl py-4 text-sm"
             >
                {isUploading ? "Enviando..." : (
                  <>
                    <CheckCircle2 className="w-5 h-5" /> Finalizar Pedido
                  </>
                )}
             </button>
             <button
                onClick={onBack}
                className="w-full py-1 text-slate-600 font-bold text-[11px] hover:text-slate-800 transition-colors flex items-center justify-center gap-1  tracking-widest"
             >
                <ChevronLeft className="w-3 h-3" /> Regresar a ajustes
             </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CheckoutStep;
