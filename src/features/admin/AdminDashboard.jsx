import React, { useState, useEffect } from 'react';
import { ShoppingBag, Clock, CheckCircle, Printer as PrinterIcon, ChevronRight, Download, FileText, Loader2, Trash2, XCircle, Package, DollarSign, Box, Plus, Minus } from 'lucide-react';
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
  const [downloading, setDownloading] = useState(false); // Estado para descarga directa de PDFs
  const [viewMode, setViewMode] = useState('pending'); // 'pending', 'printed', 'delivered', 'cancelled', 'inventory'
  const [inventory, setInventory] = useState([]);
  const [loadingInventory, setLoadingInventory] = useState(false);
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

  const fetchInventory = async () => {
    setLoadingInventory(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/checkout/inventory', {
         headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setInventory(data);
      }
    } catch (err) {
      console.error("Error cargando inventario:", err);
    } finally {
      setLoadingInventory(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchOrders();
      fetchInventory();
    }
  }, [token]);

  const handleUpdateStock = async (name, amount, reason) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/checkout/inventory/update', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, quantity: amount, unit: 'unidades', reason })
      });
      if (response.ok) fetchInventory();
    } catch (err) {
      alert("Error al actualizar stock");
    }
  };

  const totalEarnings = orders.reduce((acc, o) => acc + (o.total_price || 0), 0);

  const handleStatusChange = async (id, newStatus) => {
    if (!window.confirm(`¿Cambiar estado a ${newStatus}?`)) return;
    try {
      const formData = new FormData();
      formData.append('status', newStatus);

      const response = await fetch(`http://127.0.0.1:8000/api/v1/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
        if (selectedOrder?.id === id) setSelectedOrder(null);
      }
    } catch (err) {
      console.error("Error al actualizar estado:", err);
    }
  };

  const handleDeleteOrder = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este pedido permanentemente? Esta acción borrará los archivos físicos.')) return;
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/v1/orders/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setOrders(orders.filter(o => o.id !== id));
        if (selectedOrder?.id === id) setSelectedOrder(null);
      }
    } catch (err) {
      console.error("Error al eliminar pedido:", err);
    }
  };

  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
    window.scrollTo({ top: document.querySelector('#converter-section').offsetTop - 100, behavior: 'smooth' });
  };

  /**
   * Descarga directa de un archivo de pedido desde el backend.
   * Usamos fetch con token JWT en lugar de un <a href> porque el endpoint
   * /serve-order está protegido con autenticación de administrador.
   * Para PDFs ya procesados: los descarga tal cual.
   * Para imágenes: el backend aplica pipeline sRGB y devuelve un PDF.
   */
  const downloadOrderFile = async (order) => {
    setDownloading(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/v1/pdf/serve-order/${order.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        alert(data.detail || 'Error al descargar el archivo.');
        return;
      }

      // Convertimos la respuesta a blob y forzamos la descarga en el navegador
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Intentamos leer el nombre del archivo desde el header Content-Disposition
      const disposition = response.headers.get('content-disposition');
      let filename = `pedido_${order.id}.pdf`;
      if (disposition) {
        const match = disposition.match(/filename="(.+?)"/);
        if (match) filename = match[1];
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url); // Liberamos memoria
    } catch (err) {
      console.error('Error descargando archivo:', err);
      alert('No se pudo conectar con el servidor.');
    } finally {
      setDownloading(false);
    }
  };

  const filteredOrders = orders.filter(o => o.status === viewMode);

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Panel de Control</h1>
          <p className="text-slate-500 font-medium">Gestiona tu flujo de trabajo en tiempo real.</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm overflow-x-auto max-w-full">
          <button 
            onClick={() => setViewMode('pending')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${viewMode === 'pending' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Activos ({orders.filter(o => o.status === 'pending').length})
          </button>
          <button 
            onClick={() => setViewMode('printed')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${viewMode === 'printed' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Impresos ({orders.filter(o => o.status === 'printed').length})
          </button>
          <button 
            onClick={() => setViewMode('delivered')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${viewMode === 'delivered' ? 'bg-green-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Entregados ({orders.filter(o => o.status === 'delivered').length})
          </button>
          <button 
            onClick={() => setViewMode('cancelled')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${viewMode === 'cancelled' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Cancelados ({orders.filter(o => o.status === 'cancelled').length})
          </button>
          <div className="w-px h-6 bg-slate-100 mx-2 self-center" />
          <button 
            onClick={() => setViewMode('inventory')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${viewMode === 'inventory' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Caja e Inventario
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {viewMode === 'inventory' ? (
          <div className="lg:col-span-3 space-y-10 animate-in fade-in slide-in-from-bottom-4">
             {/* Resumen Financiero */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-green-600 to-green-700 p-8 rounded-[2.5rem] text-white shadow-xl">
                   <div className="flex justify-between items-start mb-6">
                      <div className="p-3 bg-white/20 rounded-2xl">
                         <DollarSign className="w-8 h-8" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Recaudación Total</span>
                   </div>
                   <p className="text-4xl font-black tracking-tighter mb-1">${totalEarnings.toLocaleString()}</p>
                   <p className="text-xs font-bold opacity-70">Total acumulado de {orders.length} pedidos.</p>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col justify-center">
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Pedidos Entregados</h4>
                   <p className="text-3xl font-black text-slate-900">{orders.filter(o => o.status === 'delivered').length}</p>
                   <div className="w-full h-1.5 bg-slate-100 rounded-full mt-4 overflow-hidden">
                      <div 
                        className="h-full bg-green-500" 
                        style={{ width: `${(orders.filter(o => o.status === 'delivered').length / (orders.length || 1)) * 100}%` }}
                      />
                   </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col justify-center">
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Pedidos Pendientes</h4>
                   <p className="text-3xl font-black text-slate-900">{orders.filter(o => o.status === 'pending').length}</p>
                   <div className="w-full h-1.5 bg-slate-100 rounded-full mt-4 overflow-hidden">
                      <div 
                        className="h-full bg-blue-500" 
                        style={{ width: `${(orders.filter(o => o.status === 'pending').length / (orders.length || 1)) * 100}%` }}
                      />
                   </div>
                </div>
             </div>

             {/* Gestión de Inventario */}
             <div className="space-y-6">
                <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                   <Box className="w-7 h-7 text-slate-900" /> Suministros Melo
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                   {['Papel Normal', 'Papel Foto', 'Tinta Cyan', 'Tinta Magenta', 'Tinta Yellow', 'Tinta Black'].map(item => {
                     const current = inventory.find(i => i.name === item);
                     return (
                       <div key={item} className="bg-white p-6 rounded-3xl shadow-md border border-slate-100 group hover:border-pink-200 transition-all">
                          <div className="flex items-center justify-between mb-4">
                             <div className="p-2 bg-slate-50 rounded-xl text-slate-400 group-hover:bg-pink-50 group-hover:text-pink-500 transition-colors">
                                <Box className="w-5 h-5" />
                             </div>
                             <span className="text-[10px] font-black text-slate-300 uppercase">Stock</span>
                          </div>
                          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1">{item}</h4>
                          <p className="text-3xl font-black text-slate-900 mb-6">
                            {current?.quantity || 0} <span className="text-xs font-bold text-slate-300">{current?.unit || 'unid'}</span>
                          </p>
                          
                          <div className="flex gap-2">
                             <button 
                                onClick={() => handleUpdateStock(item, 50, 'Compra manual')}
                                className="flex-1 py-2.5 bg-slate-50 hover:bg-green-50 hover:text-green-600 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-1"
                             >
                                <Plus className="w-3 h-3" /> Añadir
                             </button>
                             <button 
                                onClick={() => handleUpdateStock(item, -10, 'Gasto manual')}
                                className="flex-1 py-2.5 bg-slate-50 hover:bg-red-50 hover:text-red-600 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-1"
                             >
                                <Minus className="w-3 h-3" /> Gastar
                             </button>
                          </div>
                       </div>
                     )
                   })}
                </div>
             </div>
          </div>
        ) : (
          <>
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
                    <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center shadow-sm overflow-hidden shrink-0">
                      {(order.print_mode === 'pdf' || order.print_mode === 'canvas') ? (
                        <FileText className="w-8 h-8 text-blue-500" />
                      ) : (
                        <img src={`http://127.0.0.1:8000/uploads/${order.image_path.split(',')[0]}`} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
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
                        <div className="flex gap-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                            order.status === 'pending' ? 'bg-blue-50 text-blue-600' : 
                            order.status === 'printed' ? 'bg-indigo-50 text-indigo-600' :
                            order.status === 'delivered' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                          }`}>
                            {order.status === 'pending' ? 'Activo' : 
                             order.status === 'printed' ? 'Impreso' :
                             order.status === 'delivered' ? 'Entregado' : 'Cancelado'}
                          </span>
                        </div>
                        
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          {order.status === 'pending' && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleStatusChange(order.id, 'printed'); }}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                              title="Marcar como impreso"
                            >
                              <PrinterIcon className="w-4 h-4" />
                            </button>
                          )}
                          {order.status === 'printed' && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleStatusChange(order.id, 'delivered'); }}
                              className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg"
                              title="Marcar como entregado"
                            >
                              <Package className="w-4 h-4" />
                            </button>
                          )}
                          {order.status !== 'cancelled' && order.status !== 'delivered' && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleStatusChange(order.id, 'cancelled'); }}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                              title="Cancelar pedido"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDeleteOrder(order.id); }}
                            className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-100 rounded-lg"
                            title="Eliminar permanentemente"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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
              
              {/* 
                BIFURCACIÓN SEGÚN TIPO DE PEDIDO:
                - PDF: Mostramos botón de descarga directa (el PDF ya fue procesado al subirse)
                - Imagen: Usamos PdfConverter para aplicar pipeline sRGB con configuración del pedido
              */}
              { (selectedOrder.print_mode === 'pdf' || selectedOrder.print_mode === 'canvas') ? (
                // --- Flujo para pedidos de tipo PDF ---
                <div className="premium-card p-10 flex flex-col items-center justify-center gap-6 text-center">
                  <div className="w-20 h-20 bg-blue-50 rounded-[2rem] flex items-center justify-center">
                    <FileText className="w-10 h-10 text-blue-600" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-slate-900">PDF Listo para Imprimir</h3>
                    <p className="text-sm text-slate-400 font-medium max-w-xs">
                      {selectedOrder.print_mode === 'canvas' 
                        ? 'Este pedido fue diseñado en el lienzo interactivo. El PDF ya contiene todas las imágenes acomodadas por el cliente.' 
                        : `Este pedido fue enviado como PDF. El archivo ya está procesado con las páginas seleccionadas (${selectedOrder.pdf_page_range === 'all' ? 'todas' : selectedOrder.pdf_page_range}).`}
                    </p>
                    <p className="text-xs font-bold text-blue-500 uppercase tracking-widest">
                      {selectedOrder.copies} {selectedOrder.copies === 1 ? 'copia' : 'copias'} • {selectedOrder.paper_type.replace('_', ' ')}
                    </p>
                  </div>
                  <button
                    onClick={() => downloadOrderFile(selectedOrder)}
                    disabled={downloading}
                    className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black rounded-[2rem] shadow-xl shadow-blue-200 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 disabled:scale-100"
                  >
                    {downloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                    {downloading ? 'Descargando...' : 'Descargar PDF del Pedido'}
                  </button>
                </div>
              ) : (
                // --- Flujo para pedidos de imágenes: pipeline sRGB via PdfConverter ---
                <PdfConverter 
                  initialPreviews={selectedOrder.image_path.split(',').map(path => `http://127.0.0.1:8000/uploads/${path.trim()}`)} 
                  initialFile={null} 
                  initialOrder={selectedOrder}
                />
              )}
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
        </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
