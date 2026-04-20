import { ScrollText, Sparkles, StickyNote, ImageIcon, UserSquare2, LayoutGrid, Brush } from 'lucide-react';

export const PAPERS = [
  { id: 'normal', label: 'Papel Normal (Carta)', desc: 'Ideal para documentos e ilustraciones mate.', Icon: ScrollText, image: '/imgs/docs.png' },
  { id: 'fotografico', label: 'Papel Fotográfico (A5)', desc: 'Brillo profesional para tus mejores recuerdos.', Icon: Sparkles, image: '/imgs/fotografias-glossy.jpg' },
  { id: 'stickers', label: 'Stickers Adhesivos (A4)', desc: '¡Ideales para pegar donde quieras! Resistentes.', Icon: StickyNote, image: '/imgs/stickers.png' },
];

export const MODES = [
  { id: 'individual', label: 'Individual', desc: 'Fotos sueltas (1 por hoja, o 2 en fotográfico).', Icon: ImageIcon },
  { id: 'tarjeta', label: 'Tarjeta', desc: 'Formato pequeño (9x5cm).', Icon: UserSquare2 },
  { id: 'mosaico', label: 'Mosaico (Stickers)', desc: 'Repite tu foto en cuadrícula.', Icon: LayoutGrid },
  { id: 'canvas', label: 'Diseño Libre', desc: 'Posiciona tus imágenes libremente en el lienzo.', Icon: Brush },
];

export const PAPER_SIZES = [
  { id: 'carta', label: 'Carta', widthMm: 215.9, heightMm: 279.4 },
  { id: 'a4', label: 'A4', widthMm: 210, heightMm: 297 },
  { id: 'a5', label: 'A5', widthMm: 148, heightMm: 210 },
  { id: 'custom', label: 'Personalizado', widthMm: null, heightMm: null, disabled: true, badge: 'Próximamente' },
];

export const PRICES = {
  normal: 1000,
  fotografico: 9000,
  stickers: 6000
};
