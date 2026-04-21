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
          const node = e.target;
          // Obtenemos la caja delimitadora real (AABB) del elemento rotado
          const rect = node.getClientRect({ relativeTo: node.getLayer() });
          
          // Calculamos el snap basado en la caja visual
          const { x: nx, y: ny } = onDragMove(
            rect.x,
            rect.y,
            rect.width,
            rect.height
          );
          
          // Calculamos cuánto debemos mover el pivot (x, y) del nodo
          const dx = nx - rect.x;
          const dy = ny - rect.y;
          
          node.x(node.x() + dx);
          node.y(node.y() + dy);
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
          rotationSnaps={[0, 90, 180, 270]}
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
