import React, { useRef, useEffect, memo } from 'react';
import { Image, Transformer } from 'react-konva';
import useImage from 'use-image';

/**
 * CanvasImage - Componente para manejar imágenes individuales en el canvas.
 * 
 * SOLID: Responsabilidad Única - Solo se encarga de renderizar la imagen,
 * manejar su estado de selección y aplicar transformaciones.
 */
const CanvasImage = memo(({ imageData, isSelected, onSelect, onChange, onDragMove }) => {
  const [img] = useImage(imageData.src);
  const shapeRef = useRef();
  const trRef = useRef();

  useEffect(() => {
    if (isSelected) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <React.Fragment>
      <Image
        ref={shapeRef}
        {...imageData}
        image={img}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragMove={(e) => {
          // Fix del Bug de Rotación: Si está rotado, el snap de useCanvasSnap es impreciso
          // porque se basa en cajas alineadas a los ejes (AABB).
          // Decisión: Solo aplicar snap si la rotación es 0 (o múltiplo de 360).
          const isRotated = Math.abs(e.target.rotation() % 360) > 0.1;
          
          if (!isRotated) {
            const { x, y } = onDragMove(
              e.target.x(),
              e.target.y(),
              e.target.width() * e.target.scaleX(),
              e.target.height() * e.target.scaleY()
            );
            e.target.x(x);
            e.target.y(y);
          }
        }}
        onDragEnd={(e) => {
          onChange({
            ...imageData,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={() => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            ...imageData,
            x: node.x(),
            y: node.y(),
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(5, node.height() * scaleY),
            rotation: node.rotation(),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </React.Fragment>
  );
});

CanvasImage.displayName = 'CanvasImage';

export default CanvasImage;
