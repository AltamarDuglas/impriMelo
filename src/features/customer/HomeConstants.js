import { ScrollText, Sparkles, StickyNote, ImageIcon, UserSquare2, LayoutGrid } from 'lucide-react';

/**
 * Constantes de configuración para la vista de cliente.
 * SOLID: Segregación de Constantes para facilitar el mantenimiento.
 */

export const PAPERS = [
  { id: 'normal', label: 'Papel Normal (Carta)', desc: 'Ideal para documentos e ilustraciones mate.', Icon: ScrollText, image: '/imgs/docs.png' },
  { id: 'fotografico', label: 'Papel Fotográfico (A5)', desc: 'Brillo profesional para tus mejores recuerdos.', Icon: Sparkles, image: '/imgs/fotografias-glossy.jpg' },
  { id: 'stickers', label: 'Stickers Adhesivos (A4)', desc: '¡Ideales para pegar donde quieras! Resistentes.', Icon: StickyNote, image: '/imgs/stickers.png' },
];

export const MODES = [
  { id: 'individual', label: 'Individual', desc: 'Fotos sueltas (1 por hoja, o 2 en fotográfico).', Icon: ImageIcon },
  { id: 'tarjeta', label: 'Tarjeta', desc: 'Formato pequeño (9x5cm).', Icon: UserSquare2 },
  { id: 'mosaico', label: 'Mosaico (Stickers)', desc: 'Repite tu foto en cuadrícula.', Icon: LayoutGrid },
];

export const PRICES = {
  normal: 1000,
  fotografico: 9000,
  stickers: 6000
};
