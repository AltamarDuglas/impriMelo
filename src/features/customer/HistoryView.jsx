import React, { useState, useEffect } from 'react';
import OrderHistory from './components/history/OrderHistory';
import { useAuth } from '../../context/AuthContext';

const HistoryView = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const { token, isAuthenticated } = useAuth();

  const fetchUserOrders = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/orders/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (err) {
      console.error("Error cargando pedidos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserOrders();
  }, [isAuthenticated]);

  return (
    <div className="max-w-5xl mx-auto pb-24">
      <OrderHistory 
        orders={orders} 
        loading={loading} 
        onRefresh={fetchUserOrders} 
      />
    </div>
  );
};

export default HistoryView;
