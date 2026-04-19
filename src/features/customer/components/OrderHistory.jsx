import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, RefreshCw, Box, Plus, Minus, DollarSign, MapPin, Phone, User, ExternalLink, Package } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

/**
 * OrderHistory: Evolucionado para incluir gestión de inventario manual.
 * Sigue el principio de Responsabilidad Única pero ahora actúa como centro de control.
 */
const OrderHistory = ({ orders, loading, onRefresh }) => {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' o 'inventory'
  const [inventory, setInventory] = useState([]);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const { token, user } = useAuth();

  // Cargar Inventario
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
    if (activeTab === 'inventory') fetchInventory();
  }, [activeTab]);

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

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="pt-20 border-t border-slate-100"
    >
      {/* Selector de Tabs - Solo para Administradores */}
      <div className="flex items-center justify-between mb-8 px-4 flex-wrap gap-4">
        {user?.is_admin ? (
          <div className="flex bg-slate-100 p-1 rounded-2xl">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'orders' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Pedidos
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'inventory' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Inventario
            </button>
          </div>
        ) : (
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Mis Pedidos</h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Tu historial en impriMelo</p>
          </div>
        )}

        <button
          onClick={activeTab === 'orders' ? onRefresh : fetchInventory}
          className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-400 flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading || loadingInventory ? 'animate-spin' : ''}`} />
          <span className="text-[10px] font-black uppercase">Actualizar</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'orders' ? (
          <motion.div
            key="orders"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {orders.length === 0 ? (
              <div className="col-span-full py-20 text-center opacity-60">
                <ShoppingBag className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No hay pedidos registrados</p>
              </div>
            ) : (
              orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).map(order => (
                <div key={order.id} className="premium-card p-6 border-2 border-transparent hover:border-pink-100 transition-all group relative overflow-hidden">
                  {/* Badge de Monto */}
                  <div className="absolute top-4 right-4 bg-green-50 text-green-600 px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1 shadow-sm">
                    <DollarSign className="w-3 h-3" />
                    {order.total_price?.toLocaleString()}
                  </div>

                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl overflow-hidden shadow-sm flex-shrink-0 relative group">
                      <img
                        src={`http://127.0.0.1:8000/uploads/${order.image_path.split(',')[0]}`}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      {order.payment_screenshot && (
                        <a
                          href={`http://127.0.0.1:8000/uploads/${order.payment_screenshot}`}
                          target="_blank"
                          rel="noreferrer"
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                        >
                          <ExternalLink className="w-6 h-6 text-white" />
                        </a>
                      )}
                    </div>
                    <div className="min-w-0 pr-12">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pedido #{order.id}</p>
                      <p className="text-xs font-bold text-slate-600">{new Date(order.created_at).toLocaleDateString()}</p>
                      <p className="text-[10px] font-black text-pink-500 uppercase mt-1 truncate">{order.customer_name || 'Sin nombre'}</p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-slate-50">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3 h-3 text-slate-400 mt-0.5" />
                      <p className="text-[10px] font-medium text-slate-500 leading-tight">{order.customer_address || 'Sin dirección'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <p className="text-[10px] font-bold text-slate-600">{order.customer_phone || 'Sin teléfono'}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-dashed border-slate-100 flex justify-between items-center">
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">
                      {order.paper_type} • {order.print_mode}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${order.status === 'pending' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
                      }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        ) : (
          <motion.div
            key="inventory"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-6"
          >
            {/* Cabecera de Inventario */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {['Papel Normal', 'Papel Foto', 'Tinta Cyan', 'Tinta Magenta'].map(item => {
                const current = inventory.find(i => i.name === item);
                return (
                  <div key={item} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 bg-slate-50 rounded-xl text-slate-400">
                        <Box className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-black text-slate-300 uppercase">Stock Actual</span>
                    </div>
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1">{item}</h4>
                    <p className="text-3xl font-black text-slate-900 mb-6">
                      {current?.quantity || 0} <span className="text-xs font-bold text-slate-300">{current?.unit || 'unid'}</span>
                    </p>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateStock(item, 10, 'Compra manual')}
                        className="flex-1 py-2 bg-slate-50 hover:bg-green-50 hover:text-green-600 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Añadir
                      </button>
                      <button
                        onClick={() => handleUpdateStock(item, -10, 'Gasto manual')}
                        className="flex-1 py-2 bg-slate-50 hover:bg-red-50 hover:text-red-600 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-1"
                      >
                        <Minus className="w-3 h-3" /> Gastar
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Formulario para nuevo material */}
            <div className="premium-card p-8 bg-slate-50/50 border-dashed border-2">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-pink-500">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 uppercase tracking-wider text-sm">Registrar Nuevo Material</h3>
                  <p className="text-[10px] font-bold text-slate-400">Agrega suministros que no estén en la lista superior.</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <input type="text" id="new_item_name" placeholder="Nombre (Ej: Papel Adhesivo)" className="flex-1 min-w-[200px] px-4 py-3 bg-white rounded-2xl border border-slate-100 text-xs font-bold focus:ring-2 focus:ring-pink-500 outline-none" />
                <input type="number" id="new_item_qty" placeholder="Cant." className="w-24 px-4 py-3 bg-white rounded-2xl border border-slate-100 text-xs font-bold focus:ring-2 focus:ring-pink-500 outline-none" />
                <button
                  onClick={() => {
                    const name = document.getElementById('new_item_name').value;
                    const qty = parseFloat(document.getElementById('new_item_qty').value);
                    if (name && qty) handleUpdateStock(name, qty, 'Registro inicial');
                  }}
                  className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-pink-600 transition-all shadow-lg"
                >
                  Guardar Material
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
};

export default OrderHistory;
