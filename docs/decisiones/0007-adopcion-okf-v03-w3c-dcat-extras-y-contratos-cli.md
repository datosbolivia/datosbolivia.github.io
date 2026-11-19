---
type: decision
title: "ADR 0007: Adopción de OKF/ODKF v0.3, W3C DCAT JSON-LD, Envolvente _extras y Contratos okf-cli"
status: Aceptado
timestamp: 2026-11-18T00:00:00Z
tags: [okf-v0.3, odkf, w3c-dcat, json-ld, extras, okf-cli, odrl, well-known]
---

# ADR 0007: Adopción de OKF/ODKF v0.3, W3C DCAT JSON-LD, Envolvente `_extras` y Contratos `okf-cli`

## Estado
Aceptado

## Fecha
2026-11-18

## Contexto
La especificación base del ecosistema (`open-knowledge-format/SPEC.md`) y el cliente TypeScript (`@datosbolivia/datamesh-client` en `datamesh-sdk`) evolucionaron a **OKF/ODKF v0.3**. Esta revisión consolida la interoperabilidad nativa con estándares W3C (DCAT v3, PROV-O, SKOS, ODRL 2.2, DPV, DQV, QUDT/UCUM) bajo un perfil YAML-LD implícito (`https://openknowledgeformat.org/ns/v0.3.jsonld`), introduce traducción biyectiva sin pérdida mediante `_extras.<namespace>`, añade taxonomía multimodal (`nature`) y autenticidad criptográfica (`authenticity_status`), y formaliza contratos declarativos de herramientas (`okf-cli`, `owl-cli`, `openapi`).

El portal `catalogo-datamesh` operaba previamente con convenciones OKF/ODKF v0.2 (`0.2.2`), sin exponer JSON-LD W3C DCAT v3 en las vistas de dataset, con resolución local del SDK limitada solo a modo desarrollo y con reglas de linter restringidas al esquema v0.2.

## Decisión
1. **Sincronización Normativa y de Runtime SDK:**
   - Actualizar `docs/especificacion_knowledge.md` para reflejar integralmente OKF/ODKF v0.3 (`level-0-core`, `level-1-contracts`, `level-2-sovereign`, `PE1–PE5`, `OE1–OE7`, `RULE-01` a `RULE-12`).
   - Configurar `astro.config.mjs` para enlazar `@datosbolivia/datamesh-client` hacia `../datamesh-sdk/bindings/typescript/dist/index.js` tanto en `dev` como en `build` cuando el SDK hermano exista, manteniendo el fallback transparente a `node_modules/@datosbolivia/datamesh-client` (actualizado a `0.3.0`).
2. **Descubrimiento RFC 8615 v0.3:**
   - Actualizar `public/.well-known/okf.json` y `public/.well-known/datamesh.json` a `schema_version: "0.3.0"`, `@context: "https://openknowledgeformat.org/ns/v0.3.jsonld"`, `protocol: "OKF/ODKF v0.3"` y capacidades `w3c_translation: true` y `tool_contracts: true`.
3. **Soporte W3C YAML-LD, `_extras` y DCAT JSON-LD en el Portal:**
   - Extender `src/lib/catalog.ts` con normalización de claves W3C CURIE (`@type`, `dcterms:title`, `dcterms:description`, `dcterms:license`, `prov:wasDerivedFrom`, `odrl:hasPolicy`, `dcat:*`), preservación de `_extras`, `nature`, `authenticity_status` y contratos `okf-cli`/`owl-cli`/`openapi`, además de exportar el generador W3C DCAT v3 JSON-LD (`toDcatJsonLd`).
   - Incrustar `<script type="application/ld+json">` con el manifiesto W3C DCAT v3 en `src/pages/datasets/[slug].astro` para crawlers semánticos y agentes autónomos.
   - Mostrar metadatos v0.3 (`OKF/ODKF v0.3`, `nature`, `authenticity_status`, tipos de contratos) exclusivamente en texto monoespaciado plano (`var(--font-mono)`) con separadores `/` y `•`, respetando la prohibición absoluta de badges/pills/tags y la arquitectura Obsidian zero-scroll.
4. **Actualización de Índices LLM, i18n y Auditoría Normativa:**
   - Actualizar `src/pages/llms.txt.ts`, `src/pages/llms-full.txt.ts`, `src/lib/i18n.ts` (preservando paridad exacta ES/EN) y documentación pública a OKF/ODKF v0.3.
   - Actualizar `scripts/lint-okf.mjs` y `scripts/audit-portal.mjs` para validar conceptos CURIE (`dcat:Dataset`, `dcat:DataService`, `skos:Concept`, `@type`), envolvente `_extras`, políticas ODRL estructuradas y contratos `okf-cli`/`owl-cli`/`openapi` manteniendo intactos los 8 portones de auditoría del portal.

## Consecuencias
- Cualquier crawler W3C DCAT v3, cliente `@datosbolivia/datamesh-client` v0.3.0 o herramienta `okf` CLI puede descubrir e ingerir metadatos del portal de forma determinista y sin pérdida de atributos (`_extras`).
- Se mantiene compatibilidad retroactiva total con nodos y manifiestos OKF/ODKF v0.2 existentes en `knowledge/nodes/`.
- Las invariantes visuales y editoriales del portal (cero badges/tags, neutralidad institucional, 5 rutas canónicas, paridad i18n y visor Obsidian sin scroll de ventana) continúan verificadas automáticamente en `npm run audit`.
