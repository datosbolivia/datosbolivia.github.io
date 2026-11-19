# Bitácora de Ingeniería y Arquitectura del Portal

## 2026-11-18
- Migración integral del portal a **OKF/ODKF v0.3**: actualización normativa de `docs/especificacion_knowledge.md` y registro de `docs/decisiones/0007-adopcion-okf-v03-w3c-dcat-extras-y-contratos-cli.md`.
- Actualización de `astro.config.mjs` para enlazar `@datosbolivia/datamesh-client` v0.3.0 desde `../datamesh-sdk/bindings/typescript/dist/index.js` tanto en `dev` como en `build` con fallback a `node_modules/@datosbolivia/datamesh-client`.
- Actualización de manifiestos RFC 8615 `public/.well-known/okf.json` y `public/.well-known/datamesh.json` a `schema_version: "0.3.0"`, `@context: "https://openknowledgeformat.org/ns/v0.3.jsonld"`, `protocol: "OKF/ODKF v0.3"` y capacidades `w3c_translation: true`, `tool_contracts: true`.
- Soporte en `src/lib/catalog.ts` para claves W3C YAML-LD CURIE (`@type`, `dcat:*`, `dcterms:*`, `prov:wasDerivedFrom`, `odrl:hasPolicy`), envolvente biyectivo `_extras`, `nature`, `authenticity_status`, contratos `okf-cli`/`openapi` y helper `toDcatJsonLd` para incrustar `<script type="application/ld+json">` en `/datasets/[slug]`.
- Actualización de `scripts/lint-okf.mjs` y `scripts/audit-portal.mjs` a OKF/ODKF v0.3 manteniendo los 8 portones normativos de auditoría.

## 2026-11-06
- Generación de rutas estáticas canónicas por recurso `/datasets/{slug}/{resource}` (ej. `/datasets/bo-combustible/{resource}`) en `src/pages/datasets/[slug]/[...doc].astro` con sincronización de URL en el explorador Obsidian mediante `history.pushState` y navegación de historial `popstate`.
- Creación del componente reutilizable `src/components/DatasetExplorerView.astro` unificando la navegación tipo Obsidian, selección de pestañas activas e hidratación SSG.
- Reducción del banner de tríadas a la tríada básica única (`bolivia:dataset:recurso`) con botón de copiado, descartando metadatos redundantes en la interfaz de usuario.
- Soporte nativo de ejecución DuckDB-WASM en cliente para datasets en formato Parquet y resolución de series particionadas con comodín (`*.csv`).
- Implementación de `resolveResourceMetadata` y `cleanResourceIdentifier` en `src/lib/catalog.ts` para resolución canónica de la tríada SQL tripartita (`bolivia:dataset:recurso`), DNS Soberano (`dataset.recurso@bolivia`), URI OKF (`okf://bolivia/dataset/recurso`) y enlaces físicos de descarga directa.
- Inclusión del elemento `#pane-download-link` en la barra de navegación del panel Obsidian (`src/pages/datasets/[slug].astro`) sincronizado con la selección de recursos en el árbol lateral.
- Despliegue de banners de Tríada SQL, DNS Soberano y URI OKF con acciones de copiado al portapapeles en `src/pages/datasets/[slug].astro` y `src/components/DataExplorer.astro`.
- Adición de botones de descarga física directa en la barra de herramientas de datos y en las tarjetas de contingencia (Parquet, contenedores ZIP y errores CORS) en `src/components/DataExplorer.astro`.
- Exposición del identificador canónico de dataset `bolivia:${dataset.slug}` en `src/components/DatasetCard.astro`.
- Soporte de transferencia binaria y cabeceras permisivas CORS en `src/pages/raw/[...slug].ts` para archivos CSV, Parquet, ZIP y TSV.

## 2026-11-05
- Incorporación del protocolo de descubrimiento soberano RFC 8615 con manifiestos estáticos normalizados en `public/.well-known/datamesh.json` y `public/.well-known/okf.json` para resolución directa vía `dm.discover_endpoint()` del SDK DataMesh v0.2.2.
- Adición de regla `.nojekyll` en el directorio de distribución pública para garantizar el servicio estático de rutas ocultas (`/.well-known/` y `/_astro/`) en despliegues sobre GitHub Pages.
- Registro de decisión arquitectónica `docs/decisiones/0006-descubrimiento-soberano-well-known-y-hub-semantico.md` detallando la integración de endpoints Well-Known y la federación de hubs semánticos.
- Extensión de la suite de auditoría automatizada en `scripts/audit-portal.mjs` con regla de verificación para la exposición e integridad de `.well-known/datamesh.json` y `.well-known/okf.json`.
- Eliminación de advertencias de compilación Vite en `src/lib/catalog.ts` reexportando símbolos utilitarios directamente desde `@datosbolivia/datamesh-client`.
- Sincronización de manuales técnicos en `docs/guia-sdk-datamesh.md` y `content/pages/about.md` con las capacidades de Hub Semántico, OpenAPI y Knowledge Graph v2.
