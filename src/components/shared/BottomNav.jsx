import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, History, User, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/**
 * BottomNav: Navegación móvil optimizada (Mobile-First).
 * Sigue el principio de Responsabilidad Única al manejar la navegación secundaria.
 */
const BottomNav = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <>
      {/* Máscara de degradado para suavizar el corte del scroll inferior */}
      <div className="fixed bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#faf9f6] via-[#faf9f6]/90 to-transparent pointer-events-none z-40 md:hidden" />

      <div className="fixed bottom-6 left-6 right-6 z-50 md:hidden">
        <div className="glass-card-thick px-8 py-4 flex justify-around items-center border-white/40 shadow-[0_20px_40px_rgba(0,0,0,0.1)]">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1.5 transition-all duration-300 ${isActive ? 'text-pink-500 scale-110' : 'text-slate-400'}`
            }
          >
            <Home className="w-6 h-6" />
            <span className="text-[10px] font-black uppercase tracking-widest">Inicio</span>
          </NavLink>

          <NavLink
            to="/history"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1.5 transition-all duration-300 ${isActive ? 'text-pink-500 scale-110' : 'text-slate-400'}`
            }
          >
            <History className="w-6 h-6" />
            <span className="text-[10px] font-black uppercase tracking-widest">Pedidos</span>
          </NavLink>

          <NavLink
            to={isAuthenticated ? "/profile" : "/login"}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1.5 transition-all duration-300 ${isActive ? 'text-pink-500 scale-110' : 'text-slate-400'}`
            }
          >
            <User className="w-6 h-6" />
            <span className="text-[10px] font-black uppercase tracking-widest">Perfil</span>
          </NavLink>

          {user?.is_admin && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex flex-col items-center gap-1.5 transition-all duration-300 ${isActive ? 'text-blue-500 scale-110' : 'text-slate-400'}`
              }
            >
              <LayoutDashboard className="w-6 h-6" />
              <span className="text-[10px] font-black uppercase tracking-widest">Admin</span>
            </NavLink>
          )}
        </div>
      </div>
    </>
  );
};

      export default BottomNav;
