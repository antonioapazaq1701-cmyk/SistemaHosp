# SistemaHosp · Planificación UNA Puno

Portal de lectura de la propuesta académica de un sistema hospitalario con asistente de IA. Reúne 25 documentos, 40 vistas UML y un explorador de 65 requisitos, organizados en los 12 pasos de la planificación.

**Sitio:** https://antonioapazaq1701-cmyk.github.io/SistemaHosp/

## Qué presenta

- Portada con dos ilustraciones conceptuales originales de salud e IA.
- Fondo animado con pausa y respeto a movimiento reducido.
- Ruta de pasos, explicaciones breves y estados documentado/pendiente.
- Lectura del contenido de los documentos como HTML, con índices y tablas.
- Diagramas SVG con zoom y navegación por vistas.
- Búsqueda, filtros y criterios de aceptación desplegables.
- Diseño adaptable a computadoras y teléfonos.

P1–P8 están documentados para revisión académica; P9–P12 siguen pendientes. El portal no inicia la construcción del sistema hospitalario, no atiende pacientes ni usa una API de IA. Los procesos institucionales y las decisiones pendientes conservan su estado.

## Equipo

- Apaza Quispe, Antonio Vicente.
- Escobedo Arapa, Kenyi Blanca.

Ingeniería de Software I · Universidad Nacional del Altiplano · 2026-II.

## Archivos del portal

`docs/` es la raíz estática publicada por GitHub Pages desde la rama `main`. No necesita compilación, claves, servidor de aplicación ni servicios externos. Los recursos se incluyen localmente.

Para una vista local:

```text
python -m http.server 4173 --directory docs
```

Abrir `http://localhost:4173`. También puede abrirse `docs/index.html` directamente.

`PortalPlanificacion/preparar.py` regenera el contenido desde las fuentes locales, **cuando están disponibles**. Estas fuentes se conservan fuera del repositorio público en la carpeta local `Planificación`. El contenido web usa sus versiones Markdown sincronizadas con Word y las vistas SVG verificadas de Draw.io. El script no modifica las fuentes.

Los archivos originales `.docx`, `.drawio`, `.pdf`, copias, cuestionarios como archivos separados, perfiles de navegador y auxiliares de los pasos **no se publican**. El portal no ofrece descargas; el contenido que se muestra en una web pública sí puede copiarse o guardarse.

## Publicación

En Settings → Pages: **Deploy from a branch → main → /docs**. La publicación se actualiza al subir cambios a `main`; esperar a que termine el despliegue antes de comprobar la URL.

## Créditos

Las dos ilustraciones fueron generadas con IA para este portal y no representan instalaciones reales. El lector utiliza Marked 17.0.5 (licencia MIT incluida en `docs/assets/vendor/LICENSE-marked.md`); se aplica una lista de elementos permitidos y se controlan enlaces e imágenes antes de mostrar el HTML.

Portal académico independiente; no es un sitio oficial de la universidad o del hospital. Sin cuentas de usuarios ni datos clínicos reales.
