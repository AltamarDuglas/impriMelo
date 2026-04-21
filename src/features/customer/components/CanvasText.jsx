import React, { useRef, useEffect } from 'react';
import { Text, Transformer } from 'react-konva';

/**
 * CanvasText - Componente para manejar elementos de texto en el canvas.
 * 
 * SOLID: Responsabilidad Única - Solo se encarga de renderizar el texto
 * y manejar sus transformaciones.
 */
const CanvasText = ({ textData, isSelected, onSelect, onChange, onDragMove, onDragEnd, onTransformEnd }) => {
  const shapeRef = useRef();
  const trRef = useRef();

  useEffect(() => {
    if (isSelected && trRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <React.Fragment>
      <Text
        ref={shapeRef}
        {...textData}
        draggable
        onDragStart={(e) => {
          if (e.evt && e.evt.touches && e.evt.touches.length > 1) {
            e.target.stopDrag();
            return;
          }
          onSelect();
        }}
        onClick={onSelect}
        onTap={onSelect}
        onDragMove={(e) => {
          const node = e.target;
          const rect = node.getClientRect({ relativeTo: node.getLayer() });
          
          const { x: nx, y: ny } = onDragMove(
            rect.x,
            rect.y,
            rect.width,
            rect.height
          );
          
          const dx = nx - rect.x;
          const dy = ny - rect.y;
          
          node.x(node.x() + dx);
          node.y(node.y() + dy);
        }}
        onDragEnd={(e) => {
          onDragEnd();
          onChange({
            ...textData,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={() => {
          onTransformEnd();
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            ...textData,
            x: node.x(),
            y: node.y(),
            width: Math.max(5, node.width() * scaleX),
            rotation: node.rotation(),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          rotationSnaps={[0, 90, 180, 270]}
          enabledAnchors={['middle-left', 'middle-right']}
          boundBoxFunc={(oldBox, newBox) => {
            newBox.width = Math.max(30, newBox.width);
            return newBox;
          }}
        />
      )}
    </React.Fragment>
  );
};

export default CanvasText;
