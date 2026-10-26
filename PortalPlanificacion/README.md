# Mantenimiento del portal

El sitio publicado vive en `../docs`. La carpeta original `../Planificación` queda local e intacta; los pasos académicos continúan allí.

1. Completar o corregir las fuentes del paso correspondiente mediante el proceso académico habitual.
2. Revisar los estados y descripciones de `preparar.py` antes de incorporar nuevos pasos. El estado actual P1–P8 documentados / P9–P12 pendientes es deliberado, no se calcula por la existencia de una carpeta.
3. Ejecutar `python PortalPlanificacion/preparar.py` desde la raíz local que contiene las fuentes.
4. Ejecutar `python PortalPlanificacion/verificar.py`.
5. Revisar en el navegador el contenido modificado, escritorio y móvil; subir solamente el portal y sus herramientas públicas.

El archivo `manifest.json` registra huellas de las fuentes usadas, sin incluir los originales. Los elementos de `_qa` son evidencias locales ignoradas por Git. `_local` queda reservado para herramientas puntuales de esta máquina y nunca se publica.

El generador conserva Markdown en `docs/assets/data.js`; el lector lo convierte a HTML semántico dentro de la página. No usa un visor Word, PDF ni iframe. Las figuras de P7 apuntan a las diez vistas SVG de P6.

Pausar el fondo no detiene la navegación. El estado `prefers-reduced-motion` lo inicia pausado. Los diálogos permiten cerrar con Escape y mantienen el foco dentro del diálogo nativo.

Para volver a probar enlaces de recursos con el sitio servido localmente: `python PortalPlanificacion/verificar.py --url http://127.0.0.1:4173/`. Este control del portal no es una prueba del sistema hospitalario ni una validación de la propuesta por la institución.
