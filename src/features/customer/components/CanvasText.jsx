import React, { useRef, useEffect } from 'react';
import { Text, Transformer } from 'react-konva';

/**
 * CanvasText - Componente para manejar elementos de texto en el canvas.
 * 
 * SOLID: Responsabilidad Única - Solo se encarga de renderizar el texto
 * y manejar sus transformaciones.
 */
const CanvasText = ({ textData, isSelected, onSelect, onChange, onDragMove }) => {
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
        onClick={onSelect}
        onTap={onSelect}
        onDragMove={(e) => {
          const { x, y } = onDragMove(
            e.target.x(),
            e.target.y(),
            e.target.width() * e.target.scaleX(),
            e.target.height() * e.target.scaleY()
          );
          e.target.x(x);
          e.target.y(y);
        }}
        onDragEnd={(e) => {
          onChange({
            ...textData,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={() => {
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
