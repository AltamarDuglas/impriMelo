import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Vista de Registro de Usuario (RegisterView).
 * Permite a los nuevos clientes crear una cuenta en impriMELO.
 */
const RegisterView = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: ''
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Error al registrar usuario');
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="premium-card p-10 space-y-8"
      >
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-purple-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-purple-100 mb-4">
            <UserPlus className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-black text-slate-900">Crea tu cuenta</h2>
          <p className="text-slate-400 font-medium text-sm uppercase tracking-widest">Únete a la familia impriMELO</p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border-2 border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold animate-shake">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 border-2 border-green-100 rounded-2xl flex items-center gap-3 text-green-600 text-sm font-bold">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <p>¡Registro exitoso! Redirigiendo al login...</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nombre Completo</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                name="full_name"
                type="text" 
                required
                value={formData.full_name}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-100 focus:border-purple-500 focus:bg-white bg-slate-50 transition-all outline-none font-medium"
                placeholder="Juan Melo"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                name="email"
                type="email" 
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-100 focus:border-purple-500 focus:bg-white bg-slate-50 transition-all outline-none font-medium"
                placeholder="tu@email.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                name="password"
                type="password" 
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-100 focus:border-purple-500 focus:bg-white bg-slate-50 transition-all outline-none font-medium"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="btn-primary-purple w-full py-5 text-lg shadow-xl shadow-purple-100 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl transition-all font-black flex items-center justify-center gap-2"
          >
            {loading ? 'Creando cuenta...' : 'Registrarme ahora'}
            {!loading && <UserPlus className="w-5 h-5" />}
          </button>
        </form>

        <div className="text-center">
          <p className="text-sm text-slate-500 font-medium">
            ¿Ya tienes cuenta? <Link to="/login" className="text-purple-600 font-bold hover:underline">Inicia sesión</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterView;
