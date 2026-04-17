import React, { useState, useEffect } from 'react';
import { ShoppingBag, Clock, CheckCircle, Printer as PrinterIcon, Trash2, ChevronRight } from 'lucide-react';
import PdfConverter from '../pdf-converter/PdfConverter';
import { useAuth } from '../../context/AuthContext';

/**
 * Panel de Administrador (AdminDashboard).
 * Permite gestionar los pedidos realizados por los clientes.
 * Sigue el principio de Responsabilidad Única al separar la gestión de datos de la lógica de conversión.
 */
const AdminDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('pending'); // 'pending' o 'completed'
  const { token } = useAuth();

  // Cargar pedidos desde el backend
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/orders/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (err) {
      console.error("Error al cargar pedidos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchOrders();
  }, [token]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const formData = new FormData();
      formData.append('status', newStatus);

      const response = await fetch(`http://127.0.0.1:8000/api/v1/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        // Actualizar lista local
        setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
        if (selectedOrder?.id === id) setSelectedOrder(null);
      }
    } catch (err) {
      console.error("Error al actualizar estado:", err);
    }
  };

  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
    window.scrollTo({ top: document.querySelector('#converter-section').offsetTop - 100, behavior: 'smooth' });
  };

  const filteredOrders = orders.filter(o => o.status === viewMode);

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Panel de Control</h1>
          <p className="text-slate-500 font-medium">Gestiona tu flujo de trabajo en tiempo real.</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
          <button 
            onClick={() => setViewMode('pending')}
            className={`px-6 py-3 rounded-xl text-sm font-black transition-all ${viewMode === 'pending' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Pendientes ({orders.filter(o => o.status === 'pending').length})
          </button>
          <button 
            onClick={() => setViewMode('completed')}
            className={`px-6 py-3 rounded-xl text-sm font-black transition-all ${viewMode === 'completed' ? 'bg-green-600 text-white shadow-lg shadow-green-100' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Historial ({orders.filter(o => o.status === 'completed').length})
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lista de Pedidos */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            {viewMode === 'pending' ? <Clock className="w-5 h-5 text-blue-600" /> : <CheckCircle className="w-5 h-5 text-green-600" />}
            {viewMode === 'pending' ? 'Bandeja de Entrada' : 'Archivo de Éxito'}
          </h2>
          
          <div className="space-y-3 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
            {loading ? (
              <div className="p-20 text-center text-slate-400 font-medium animate-pulse">Cargando...</div>
            ) : filteredOrders.length === 0 ? (
              <div className="premium-card p-10 text-center space-y-3 grayscale opacity-60">
                <ShoppingBag className="w-12 h-12 mx-auto text-slate-200" />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Sin movimientos aquí</p>
              </div>
            ) : (
              filteredOrders.map(order => (
                <div 
                  key={order.id}
                  onClick={() => handleSelectOrder(order)}
                  className={`premium-card p-4 cursor-pointer border-2 transition-all group ${
                    selectedOrder?.id === order.id ? 'border-blue-500 bg-blue-50/30 shadow-none' : 'border-transparent hover:border-slate-200'
                  }`}
                >
                  <div className="flex gap-4">
                    <img src={`http://127.0.0.1:8000/uploads/${order.image_path.split(',')[0]}`} alt="" className="w-16 h-16 rounded-lg object-cover shadow-sm bg-slate-100" />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-bold text-slate-900 truncate pr-2">
                          {order.image_path.split(',').length > 1 ? `${order.image_path.split(',').length} imágenes` : order.image_path}
                        </p>
                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border ${order.orientation === 'portrait' ? 'border-blue-200 text-blue-400' : 'border-purple-200 text-purple-400'}`}>
                          {order.orientation === 'portrait' ? 'VERT' : 'HORIZ'}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold text-slate-500 uppercase">
                          {order.paper_type.replace('_', ' ')}
                        </span>
                        <span className="px-1.5 py-0.5 rounded-md bg-blue-100 text-[10px] font-bold text-blue-600 uppercase">
                          {order.print_mode}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          order.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'
                        }`}>
                          {order.status === 'pending' ? 'Pendiente' : 'Completado'}
                        </span>
                        
                        {order.status === 'pending' && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleStatusChange(order.id, 'completed'); }}
                            className="p-2 text-slate-300 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                            title="Marcar como completado"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {order.status === 'completed' && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleStatusChange(order.id, 'pending'); }}
                            className="p-2 text-slate-300 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                            title="Mover a pendientes"
                          >
                            <Clock className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Área de Procesamiento */}
        <div className="lg:col-span-2 space-y-4" id="converter-section">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <PrinterIcon className="w-5 h-5 text-blue-600" />
            Ventanilla de Impresión
          </h2>

          {selectedOrder ? (
            <div className="space-y-6">
              <div className="premium-card p-5 bg-slate-900 text-white flex items-center justify-between shadow-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/50">
                    <PrinterIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Previsualizando Pedido</p>
                    <p className="font-bold text-lg truncate max-w-[200px] md:max-w-md">
                      {selectedOrder.image_path.split(',').length > 1 
                        ? `${selectedOrder.image_path.split(',').length} imágenes` 
                        : selectedOrder.image_path}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-black transition-all border border-white/10"
                >
                  Cerrar
                </button>
              </div>
              
              <PdfConverter 
                initialPreviews={selectedOrder.image_path.split(',').map(path => `http://127.0.0.1:8000/uploads/${path.trim()}`)} 
                initialFile={null} 
                initialOrder={selectedOrder}
              />
            </div>
          ) : (
            <div className="premium-card p-32 text-center space-y-6 border-dashed border-2 bg-slate-50/50">
              <div className="w-24 h-24 bg-white text-slate-200 rounded-[2.5rem] flex items-center justify-center mx-auto rotate-6 shadow-sm">
                <ChevronRight className="w-12 h-12" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Selecciona para empezar</h3>
                <p className="text-slate-400 font-medium max-w-xs mx-auto text-sm">
                  Haz clic en un pedido de la izquierda para ver su configuración y generar el PDF CMYK.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
