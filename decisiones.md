# Registro de Decisiones de Diseño

En este documento se registran las decisiones técnicas y de diseño tomadas para el proyecto, justificando su uso según la filosofía SOLID y las necesidades del usuario.

## Reenfocque del Proyecto: Del Generador PDF a Servicio de Impresión a Domicilio

### 2026-04-19: Cambio de Branding y Limpieza de UI
- **Decisión:** Cambiar el nombre comercial de "CMYK Pro" a "impriMELO - Fotografias y más".
  - **Razón:** Reforzar la identidad de marca lúdica y cercana del cliente ("Melo").
- **Decisión:** Eliminar etiquetas de medidas (DimensionLabel) y sacar la previsualización de contenedores rígidos.
  - **Razón:** El usuario reportó que las medidas saturaban la vista y que los contenedores hacían que la previsualización se viera demasiado pequeña. Al liberar el visor, se maximiza el impacto visual de las imágenes.

### 2. Arquitectura de Rutas (React Router)
- **Decisión**: Implementar `react-router-dom` para separar la experiencia del cliente de la del administrador.
- **Razón**: El principio de **Segregación de Interfaces (SOLID)** sugiere que los clientes no deberían verse obligados a depender de interfaces que no usan (la configuración técnica del PDF). El cliente solo sube, el administrador procesa.

### 3. Estética Premium e Inspiradora
- **Decisión**: Uso de Glassmorphism, degradados vibrantes y tipografía moderna (Inter/Outfit).
- **Razón**: El usuario pidió un CTA para "antojarse" a imprimir. Una interfaz visualmente impactante genera confianza y deseo de uso.

### 4. Flujo de Usuario Simplificado
- **Decisión**: La pantalla de inicio (Home) será un Hero con un botón de subida directa.
- **Razón**: Cumplir con la petición del usuario de "la facilidad de que abro la página y ya puedo subir la imagen".

## Implementación Técnica y Persistencia

### 5. Simulación de Pedidos (LocalStorage)
- **Decisión**: Se utiliza `localStorage` para almacenar los pedidos realizados por los clientes.
- **Razón**: Dado que no se dispone de un backend de base de datos persistente en esta fase, esta solución permite demostrar el flujo completo (End-to-End) donde el administrador recibe y procesa las imágenes. Cumple con el principio de **YAGNI** (No lo vas a necesitar todavía) al no añadir complejidad de base de datos prematura.

### 6. Refactorización del Conversor PDF
- **Decisión**: El componente `PdfConverter` se refactorizó para aceptar props opcionales (`initialFile`, `initialPreview`).
- **Razón**: Aplica el **Principio de Abierto/Cerrado (SOLID)**, permitiendo que el componente sea reutilizado tanto en modo de subida manual como en modo de procesamiento de pedidos existentes sin modificar su lógica interna de conversión.

### 7. Animaciones Fluídas (Framer Motion)
- **Decisión**: Integración de `framer-motion` para transiciones de estados y entrada de componentes.
- **Razón**: Mejora la percepción de calidad y modernidad, cumpliendo con la regla de "Wow" visual solicitada.

### 8. Lógica de Mosaico Dinámica
- **Decisión**: El tamaño de los stickers (`sizeCm`) se calcula automáticamente como `20 / columnas`.
- **Razón**: Elimina el riesgo de que el usuario elija un tamaño que no cabe en la hoja y simplifica la UX al reducir los controles manuales. Sigue el principio de **KISS** (Keep It Simple, Stupid).

---
*Este documento se actualizará conforme avance el desarrollo.*

## Editor de Lienzo Libre (Diseño Libre)

### 9. Elección de Konva.js + react-konva (2026-04-20)
- **Decisión**: Usar `konva` + `react-konva@18.2.14` como motor del canvas 2D interactivo.
- **Razón**: Integración nativa con React y API declarativa.

### 10. Generación de PDF en el Frontend con jsPDF (2026-04-20)
- **Decisión**: El PDF se genera en el navegador para asegurar paridad visual total (What You See Is What You Get).

### 11. Soporte de Texto en el Canvas (2026-04-20)
- **Decisión**: Incluir herramienta de texto editable desde la v1.

### 12. Tamaños de Papel Estándar (2026-04-20)
- **Decisión**: Ofrecer Carta, A4, A5 para evitar errores de impresión física.

### 13. Arquitectura SOLID del Editor (2026-04-20)
- **Decisión**: Separar en archivos con responsabilidades únicas (SRP).

### 14. Integración del Editor con Checkout (2026-04-20)
- **Decisión**: Abandonar `localStorage` para el PDF y enviarlo directamente como `Blob` al Checkout.
- **Razón**: Corregir `QuotaExceededError` y unificar el flujo de negocio.

