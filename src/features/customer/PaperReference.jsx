import React from 'react';
import { motion } from 'framer-motion';
import { ScrollText, Sparkles, ImageIcon, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PaperReference = () => {
  const navigate = useNavigate();

  const mockups = [
    {
      id: 'carta',
      title: 'Papel Carta (Bond)',
      desc: 'El estándar para documentos, tareas y fotos de diario en acabado mate.',
      use: 'Documentos, Guías, Ilustraciones simples.',
      img: '/mockups/papel-carta.jpg', // El usuario debe poner esta imagen
      icon: ScrollText
    },
    {
      id: 'a4',
      title: 'A4 Fotográfico / Adhesivo',
      desc: 'Papel de alta densidad con acabado brillante. Perfecto para posters o stickers.',
      use: 'Fotos A4, Planchas de Stickers, Diplomas premium.',
      img: '/mockups/papel-a4.jpg', // El usuario debe poner esta imagen
      icon: Sparkles
    },
    {
      id: 'a5',
      title: 'A5 Fotográfico',
      desc: 'Mitad de un A4. Es el tamaño clásico de las fotografías de portarretratos.',
      use: 'Fotos de Álbum (15x20cm), Invitaciones.',
      img: '/mockups/papel-a5.jpg', // El usuario debe poner esta imagen
      icon: ImageIcon
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 font-black text-xs uppercase tracking-widest mb-10 hover:text-pink-500 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" /> Volver a mi pedido
        </button>

        <header className="mb-16">
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter mb-4">
            Guía Visual de <span className="text-pink-500">Papeles</span>
          </h1>
          <p className="text-lg text-slate-500 font-medium max-w-2xl">
            Compara los tamaños y acabados para elegir el que mejor se adapte a lo que necesitas imprimir.
          </p>
        </header>

        <div className="space-y-24">
          {mockups.map((item, i) => (
            <motion.section 
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`flex flex-col ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-12 items-center`}
            >
              <div className="flex-1 w-full">
                <div className="aspect-[4/3] bg-white rounded-[3rem] shadow-2xl overflow-hidden border-8 border-white group">
                  <img 
                    src={item.img} 
                    alt={item.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                       e.target.src = 'https://via.placeholder.com/800x600?text=Mockup+Próximamente';
                    }}
                  />
                </div>
              </div>
              
              <div className="flex-1 space-y-6">
                <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-xl text-pink-500">
                  <item.icon className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-black text-slate-900">{item.title}</h2>
                <p className="text-slate-500 text-lg font-medium leading-relaxed">
                  {item.desc}
                </p>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-widest text-pink-500 mb-2">Usos Recomendados</p>
                  <p className="text-slate-800 font-bold">{item.use}</p>
                </div>
              </div>
            </motion.section>
          ))}
        </div>

        <footer className="mt-24 pt-12 border-t border-slate-200 text-center">
          <p className="text-slate-400 font-medium text-sm">
            © {new Date().getFullYear()} ImpriMELO • Calidad que se toca.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default PaperReference;
