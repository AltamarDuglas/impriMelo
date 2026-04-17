import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Printer, LayoutDashboard, Home as HomeIcon, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

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
    <div className="min-h-screen flex flex-col">
      {/* Navegación Glassmorphism */}
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-white/40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <img
                  src="/logo.png"
                  alt="impriMELO Logo"
                  className="h-16 w-auto object-contain transition-transform group-hover:scale-105"
                  onError={(e) => {
                    // Fallback en caso de que la imagen no cargue todavía
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <span className="hidden text-2xl font-black tracking-tighter text-slate-900">
                  impri<span className="text-blue-600">MELO</span>
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-6">
              {/* Navegación de Roles */}
              <div className="flex gap-2">
                <Link
                  to={isAdmin ? "/" : "/admin"}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all text-slate-600 hover:bg-slate-100 placeholder-glow"
                >
                  {isAdmin ? (
                    <>
                      <HomeIcon className="w-4 h-4" />
                      <span className="hidden sm:inline">Ver como Cliente</span>
                    </>
                  ) : (
                    <>
                      <LayoutDashboard className="w-4 h-4" />
                      <span className="hidden sm:inline">Panel Administrador</span>
                    </>
                  )}
                </Link>
              </div>

              {/* Autenticación */}
              <div className="h-8 w-px bg-slate-100 hidden sm:block" />
              
              {isAuthenticated ? (
                <div className="flex items-center gap-4">
                  <div className="hidden lg:block text-right">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Conectado como</p>
                    <p className="text-xs font-bold text-slate-900">{user?.email}</p>
                  </div>
                  <button 
                    onClick={logout}
                    className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
                    title="Cerrar Sesión"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <Link 
                  to="/login"
                  className="btn-primary py-2 px-6 text-sm flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Ingresar
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Contenido Principal con animación de entrada */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12 fade-in">
        {children}
      </main>

      {/* Footer Minimalista */}
      <footer className="py-10 border-t border-slate-100 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm font-medium text-slate-400">
            &copy; {new Date().getFullYear()} PrintEase - Tu imprenta de confianza a domicilio.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
