---
type: decision
title: "ADR 0004: Desacople de Capa de Estilos y Contenido en Markdown"
status: Aceptado
timestamp: 2026-09-27T00:00:00Z
tags: [arquitectura, desacople, css, markdown, mantenibilidad]
---

# ADR 0004: Desacople de Capa de Estilos y Contenido en Markdown

## Estado
Aceptado

## Fecha
2026-09-27

## Contexto
Uno de los principales problemas al mantener o forquear portales web de datos abiertos es el acoplamiento entre el código fuente de los componentes visuales (HTML/JSX/Astro) y el contenido textual o institucional. 

Cuando los usuarios o administradores desean cambiar textos explicativos, descripciones o la paleta de colores institucional, se ven obligados a alterar la lógica del template o componentes de interfaz, lo que incrementa el riesgo de introducir errores de sintaxis y dificulta las actualizaciones de la plantilla base.

## Decisión
1. **Contenido 100% en Markdown**: Los textos de las páginas principales (`/`, `/about`, `/download`) residen en archivos Markdown con Frontmatter YAML en la carpeta `content/pages/` (`home.md`, `about.md`, `download.md`).
2. **Tokens de Diseño en `src/styles/theme.css`**: Toda la identidad visual (colores institucionales, fuentes, radios de curvatura, sombras) se declara como variables semánticas en un único archivo CSS.
3. **Parámetros Globales en `portal.config.ts`**: Título, URL de la organización, repositorios y DOI del Whitepaper se centralizan en una configuración declarativa tipada.

## Consecuencias
- Un usuario no técnico o un nuevo mantenedor puede actualizar textos editando simplemente un archivo `.md`.
- Una nueva institución puede personalizar toda la apariencia del portal cambiando únicamente las variables CSS en `theme.css`.
- Los componentes de interfaz (`.astro`) se mantienen libres de textos duros y son 100% reutilizables.
