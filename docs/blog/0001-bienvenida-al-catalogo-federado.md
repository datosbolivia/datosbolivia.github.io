---
title: "Lanzamiento del Catálogo Federado DataMesh Bolivia"
type: document
description: "Presentación del índice distribuido de datos abiertos y la arquitectura de nodos federados."
timestamp: "2026-09-27T12:00:00Z"
author: "datos-bolivia"
status: "Publicado"
---

# Lanzamiento del Catálogo Federado DataMesh Bolivia

Nos complace presentar la versión operativa del catálogo **DataMesh Bolivia**, una plataforma comunitaria diseñada para conectar y catalogar datos abiertos del país mediante estándares modernos y verificables.

## ¿Por qué un Catálogo Federado?

Tradicionalmente, las iniciativas de datos abiertos en América Latina han enfrentado dos problemas recurrentes:
1. **Silos centralizados obsoletos:** Portales institucionales monolíticos que requieren subir copias estáticas que pierden vigencia rápidamente.
2. **Ausencia de contratos sintácticos:** Archivos CSV sin tipado formal, codificación de caracteres ambigua y nula validación de esquemas.

DataMesh propone un cambio de paradigma: los datos permanecen bajo la custodia de cada entidad o proyecto, mientras que este catálogo indexa contratos tipados (**Frictionless DataPackage**) y vocabularios semánticos (**W3C SKOS / Wikidata**).

## Capacidades Principales

- **Explorador Estilo Obsidian:** Navegación por árbol de archivos condensado que permite consultar la narrativa, el contexto y los esquemas sin recargas innecesarias.
- **Acceso para Modelos de IA:** Soporte nativo para el protocolo `llms.txt` y rutas en crudo (`/raw/`) para auditoría automatizada.
- **Modo Desconectado (PWA) y Desktop:** Capacidad de consulta local mediante Service Worker y empaquetado Electron.
