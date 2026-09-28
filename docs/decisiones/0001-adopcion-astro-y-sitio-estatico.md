---
type: decision
title: "ADR 0001: Adopción de Astro como Generador de Sitio Estático"
status: Aceptado
timestamp: 2026-09-27T00:00:00Z
tags: [arquitectura, astro, estatico, rendimiento, okf]
---

# ADR 0001: Adopción de Astro como Generador de Sitio Estático

## Estado
Aceptado

## Fecha
2026-09-27

## Contexto
El portal del catálogo de DataMesh Bolivia requiere una solución web que sea simple, ultra-rápida, con un consumo mínimo de recursos, enfocada en la legibilidad del contenido y que pueda empaquetarse fácilmente tanto como Progressive Web App (PWA) como aplicación de escritorio nativa mediante Electron.

Frameworks tradicionales pesados (como Next.js o SPAs completas de React/Angular) introducen sobrecarga innecesaria de JavaScript en el cliente, aumentan la fragilidad del despliegue en entornos con baja conectividad y dificultan la lectura por parte de bots y herramientas CLI (`curl`).

## Decisión
Se adopta **Astro** en modo de compilación estática (`output: 'static'`) por las siguientes razones:
1. **Zero-JS por Defecto**: Las páginas se renderizan como HTML puro y CSS ligero, entregando tiempos de carga casi instantáneos.
2. **Compatibilidad Nativa con Markdown y Contenido**: Facilidad para procesar archivos Markdown con Frontmatter YAML procedentes de `knowledge/` y `docs/`.
3. **Generación de Archivos Planos (`build.format: 'file'`)**: Permite que el compilado en `dist/` sea servido sin servidor web activo o desde protocolos locales de escritorio `file://`.
4. **Mínimas Dependencias**: Solo se requieren paquetes esenciales para el ciclo de vida del catálogo.

## Consecuencias
- Excelente rendimiento (puntuaciones 100/100 en Lighthouse y accesibilidad).
- Facilidad para distribuir el sitio en GitHub Pages, servidores Nginx, CDNs o empaquetado en Electron.
- Total transparencia para crawlers y agentes de inteligencia artificial.
