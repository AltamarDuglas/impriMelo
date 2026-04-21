import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Printer, LayoutDashboard, Home as HomeIcon, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import BottomNav from './BottomNav';

/**
 * Componente Layout compartido.
 * Sigue el principio de Responsabilidad Única (SOLID) al encargarse solo de la estructura común.
 * Proporciona un marco con navegación y pie de página premium.
 */
const Layout = ({ children }) => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const { isAuthenticated, logout, user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      {/* Navegación Glassmorphism Ultra Premium */}
      <nav className="sticky top-4 z-50 mx-4 md:mx-auto max-w-7xl w-[calc(100%-2rem)] md:w-full">
        <div className="glass-card-thick px-6 md:px-10 py-3 flex justify-between items-center border-white/50 shadow-xl">
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative"
            >
              <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-slate-900">
                impri<span className="text-gradient-melo">MELO</span>
              </h1>
            </motion.div>
          </Link>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right">
                  <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Hola!</p>
                  <p className="text-xs font-bold text-slate-900">{user?.email?.split('@')[0]}</p>
                </div>
                <button
                  onClick={logout}
                  className="w-10 h-10 rounded-2xl bg-white/50 text-slate-400 hover:text-red-500 transition-all border border-white flex items-center justify-center"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="btn-melo py-2.5 px-6 text-sm"
              >
                Ingresar
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Contenido Principal */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-2 pb-8 fade-in overflow-hidden">
        {children}
      </main>

      <BottomNav />

      {/* Footer Minimalista */}
      <footer className="py-12 pb-32 md:pb-12 text-center">
        <p className="text-xs font-bold text-slate-400 tracking-widest uppercase">
          &copy; {new Date().getFullYear()} impri<span className="text-gradient-melo">MELO</span> • Hecho para ti
        </p>
      </footer>
    </div>
  );
};

export default Layout;
