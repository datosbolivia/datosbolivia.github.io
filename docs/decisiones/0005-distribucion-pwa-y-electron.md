---
type: decision
title: "ADR 0005: Distribución Híbrida PWA y Desktop con Extensibilidad de Cómputo"
status: Aceptado
timestamp: 2026-09-27T00:00:00Z
tags: [pwa, electron, desktop, offline, go-sdk]
---

# ADR 0005: Distribución Híbrida PWA y Desktop con Extensibilidad de Cómputo

## Estado
Aceptado

## Fecha
2026-09-27

## Contexto
Los usuarios del catálogo de DataMesh Bolivia poseen diversos perfiles y necesidades tecnológicas:
- **Ciudadanos y periodistas**: Requieren acceso rápido desde teléfonos móviles o navegadores web sin descargar aplicaciones pesadas.
- **Investigadores y Data Engineers**: Requieren consultar datasets masivos en sus estaciones de trabajo, validar carpetas de nodos locales antes de publicarlas y realizar cómputo analítico intensivo con baja latencia.

Asimismo, la visión a medio plazo del SDK de DataMesh (`datamesh-sdk`) contempla compilar el Core Domain a binarios nativos en **Go** para consumo de alta velocidad multi-lenguaje.

## Decisión
1. **Soporte PWA de Primer Nivel**: Integrar un Service Worker (`public/sw.js`) con estrategia *Stale-While-Revalidate* y manifiesto web (`manifest.webmanifest`), permitiendo instalar el portal en un solo clic desde navegadores móviles o de escritorio.
2. **Empaquetado de Escritorio con Electron**: Proveer un arnés ligero (`electron/main.cjs` y `electron/preload.cjs`) que empaqueta la versión estática de Astro en ejecutables para Linux, Windows y macOS.
3. **Ranura de Extensión para Cómputo Local (`electron/engine.cjs`)**:
   - Provee un puente IPC que detecta si existe un binario nativo compilado del SDK (Go o Python CLI).
   - Si el binario existe, delega el procesamiento analítico y la validación criptográfica al motor nativo.
   - Si no existe, realiza un fallback transparente a ejecución analítica en memoria/JavaScript.

## Consecuencias
- Cobertura universal de usuarios: desde navegación móvil offline hasta estaciones de análisis de datos.
- Arquitectura preparada para cuando el SDK en Go sea compilado y distribuido, sin requerir reescribir la interfaz de usuario.
- Portabilidad garantizada para despliegues locales desconectados de internet.
