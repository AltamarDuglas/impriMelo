import { useEffect, useRef } from 'react';

/**
 * useCanvasKeyboard - Hook para atajos de teclado (Ctrl+C, Ctrl+V, Delete).
 */
export function useCanvasKeyboard(elements, selectedId, setElements, setTextElements, setSelectedId) {
  const clipboardRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        const el = elements.find(el => el.id === selectedId);
        if (el) clipboardRef.current = { ...el };
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'v' && clipboardRef.current) {
        const copy = {
          ...clipboardRef.current,
          id: `img-${Date.now()}`,
          x: clipboardRef.current.x + 20,
          y: clipboardRef.current.y + 20,
        };
        setElements(prev => [...prev, copy]);
        setSelectedId(copy.id);
      }

      if ((e.key === 'Delete' || e.key === 'Backspace') && e.target.tagName !== 'INPUT' && selectedId) {
        setElements(prev => prev.filter(el => el.id !== selectedId));
        setTextElements(prev => prev.filter(el => el.id !== selectedId));
        setSelectedId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, elements, setElements, setTextElements, setSelectedId]);
}
