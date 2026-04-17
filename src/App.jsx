import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/shared/Layout';
import HomeView from './features/customer/HomeView';
import AdminDashboard from './features/admin/AdminDashboard';

import { AuthProvider } from './context/AuthContext';
import LoginView from './features/auth/LoginView';
import RegisterView from './features/auth/RegisterView';

/**
 * Componente Principal de la Aplicación.
 * Maneja el enrutamiento global y provee el contexto de navegación.
 * Separamos claramente la vista de cliente de la de administrador para mejorar la mantenibilidad.
 */
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            {/* Rutas de Autenticación */}
            <Route path="/login" element={<LoginView />} />
            <Route path="/register" element={<RegisterView />} />

            {/* Ruta para clientes: Subida simplificada y Hero */}
            <Route path="/" element={<HomeView />} />
            
            {/* Ruta para administrador: Gestión de pedidos y conversión PDF */}
            <Route path="/admin" element={<AdminDashboard />} />
            
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
