---
type: decision
title: "ADR 0006: Protocolo de Descubrimiento Soberano Well-Known y Hub Semántico v0.2.2"
status: Aceptado
timestamp: 2026-11-05T00:00:00Z
tags: [well-known, discovery, okf, sdk, mcp, interoperabilidad]
---

# ADR 0006: Protocolo de Descubrimiento Soberano Well-Known y Hub Semántico v0.2.2

## Estado
Aceptado

## Fecha
2026-11-05

## Contexto
El ecosistema de catálogos soberanos DataMesh Bolivia y Open Knowledge Format (OKF/ODKF) evolucionó a la versión `v0.2.2-rc.2`, transitando de un simple índice de archivos estáticos a un **Hub Semántico de Estándares** que unifica datasets tabulares, servicios remotos (OpenAPI), herramientas locales (OWL/OKF CLI) y grafos de conocimiento SKOS/OWL.

Para interactuar de forma determinista con bibliotecas de cliente (`datamesh` en Python, TypeScript y CLI Go), el portal requería un mecanismo de descubrimiento activo según RFC 8615 (`/.well-known/`) que permita a cualquier nodo o agente resolver las capacidades analíticas (SQL, MCP, linaje, grafos) y la ubicación canónica del catálogo sin depender exclusivamente de introspección heurística sobre HTML.

## Decisión
1. Publicar los manifiestos normativos normalizados en:
   - `/.well-known/datamesh.json`
   - `/.well-known/okf.json`
2. Declarar en dicho manifiesto la versión del esquema (`0.2.2`), el protocolo (`OKF/ODKF v0.2`), la URL canónica de catálogo (`/llms.txt`), el tipo (`okf`), las capacidades soberanas disponibles y las rutas de API/archivos crudos.
3. Incorporar `.nojekyll` en la raíz de despliegue para garantizar que servidores estáticos y GitHub Pages sirvan directorios ocultos como `/.well-known/` y `/_astro/` sin intercepciones.
4. Integrar la verificación de presencia e integridad de los documentos `/.well-known/` dentro de la suite de auditoría automatizada (`npm run audit`).

## Consecuencias
- Compatibilidad inmediata con el método `dm.discover_endpoint()` del DataMesh SDK y herramientas de agentes IA.
- Descubrimiento de capacidades sin sobrecarga de red ni consultas innecesarias.
- Gobernanza e interoperabilidad transparente entre portales web estáticos y servidores analíticos en runtime.
