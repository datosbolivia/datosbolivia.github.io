---
type: guide
title: "Guía de Fork, Personalización y Despliegue del Catálogo"
description: "Paso a paso para que cualquier institución o colectivo cree su propio portal de datos abiertos utilizando esta plantilla."
timestamp: 2026-09-27T00:00:00Z
tags: [fork, despliegue, github-pages, electron, pwa, personalizacion]
---

# Guía de Fork y Despliegue de tu Propio Portal de Datos

Este repositorio está arquitecturado específicamente para ser **forkeable**: cualquier gobierno local (municipio, gobernación), universidad, centro de investigación o colectivo ciudadano puede reutilizarlo para publicar su propio portal de datos abiertos en menos de 5 minutos.

---

## Paso 1: Hacer Fork del Repositorio

1. Dirígete a [github.com/datosbolivia/catalogo](https://github.com/datosbolivia/catalogo) y presiona el botón **Fork**.
2. Clona tu repositorio forkeado:
   
```bash
git clone https://github.com/datosbolivia/catalogo.git
cd catalogo
npm install
```

---

## Paso 2: Personalizar la Configuración en `portal.config.ts`

Abre `portal.config.ts` y modifica los datos de tu institución:

```typescript
export const config = {
  organization: {
    name: "Datos Salud",
    slug: "datos-salud",
    url: "https://datos-salud.org",
    github: "https://github.com/datos-salud/datos-salud.github.io",
    description: "Portal de datos abiertos sobre Salud."
  },
  site: {
    title: "Catálogo de Datos Abiertos de Salud",
    description: "Índice del Sistema SNIS, RNVE, entre otros.",
    tagline: "Transparencia y datos abiertos de salud para Bolivia",
    url: "https://datos-salud.org",
    base: "/"
  },
  // ...
};
```

---

## Paso 3: Personalizar el Estilo en `src/styles/theme.css`

Sin tocar código TypeScript ni componentes Astro, cambia las variables CSS en `src/styles/theme.css` para aplicar los colores institucionales de tu entidad:

```css
:root {
  --color-primary: #10b981;       /* Verde institucional */
  --color-primary-hover: #059669;
  --color-secondary: #064e3b;
  --color-accent: #f59e0b;
  /* ... */
}
```

---

## Paso 4: Editar los Contenidos en `content/pages/`

Edita los archivos Markdown para adaptar los textos:
- `content/pages/home.md`: Bienvenida y presentación institucional.
- `content/pages/about.md`: Historia, equipo, publicaciones de la institución.
- `content/pages/download.md`: Opciones de descarga.

---

## Paso 5: Añadir tus Nodos de Datos en `knowledge/`

1. Añade carpetas dentro de `knowledge/nodes/<mi-dataset>/`:
   - `index.md`: Resumen y metadatos YAML.
   - `datapackage.yaml`: Contrato de columnas y tipos.
2. Registra el nuevo dataset en `knowledge/index.md`.
3. Valida el estándar:

```bash
npm run lint:okf
```

---

## Paso 6: Opciones de Despliegue

### Despliegue en GitHub Pages (Gratuito)
1. Ejecuta el build:

```bash
npm run build
```

2. En GitHub, ve a **Settings > Pages** y selecciona la rama de publicación (ej. `gh-pages` o la carpeta `dist`).

### Despliegue en Vercel, Netlify o Cloudflare Pages
Conecta tu repositorio de GitHub:
- Build command: `npm run build`
- Output directory: `dist`

### Empaquetar como Aplicación de Escritorio con Electron

```bash
npm run electron:build
```
Los instaladores generados se guardarán en la carpeta `dist/releases`.
