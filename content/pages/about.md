---
type: page
title: "Acerca del Catálogo DataMesh"
description: "Principios de gobernanza de datos federados, contratos sintácticos y estándares abiertos."
---

# El Catálogo DataMesh

**DataMesh Bolivia** es un catálogo abierto y federado que organiza conjuntos de datos bajo principios de soberanía de dominio, contratos sintácticos verificables y acceso descentralizado.

A diferencia de los portales tradicionales que concentran copias estáticas en almacenes centrales, esta plataforma opera como un índice de conocimiento distribuido. Cada entidad o custodio preserva la soberanía sobre sus datos, mientras que el catálogo expone metadatos normativos, esquemas de columnas y semántica formal tanto para humanos como para modelos y agentes de Inteligencia Artificial.

[Más información](/docs/blog-0000-introduccion-a-datamesh)

---

## Principios de la Malla de Datos (Data Mesh)

1. **Propiedad Orientada al Dominio (Domain Ownership)**
   La custodia, actualización y curación corresponde a los generadores y custodios de cada materia (finanzas, clima, transporte, demografía).

2. **Datos como un Producto (Data as a Product)**
   Cada conjunto de datos se entrega con contratos sintácticos tipados (Frictionless DataPackage), diccionarios semánticos y políticas explícitas de acceso.

3. **Plataforma de Autoservicio (Self-Serve Data Platform)**
   Infraestructura común para búsqueda, validación de integridad criptográfica y consumo directo en bibliotecas de análisis (DuckDB, Pandas, Arrow).

4. **Gobernanza Computacional Federada (Federated Governance)**
   Estándares globales unificados (**Open Knowledge Format OKF/ODKF v0.3**), políticas de privacidad *Zero-Microdata* (W3C ODRL 2.2 / DPV) y verificación automatizada mediante linters y pruebas sintácticas.

---

## Estándares Abiertos Utilizados

- **Open Knowledge Format (OKF/ODKF v0.3):** Especificación YAML-LD W3C (`https://openknowledgeformat.org/ns/v0.3.jsonld`) que norma la estructura de carpetas, metadatos frontmatter, envolvente biyectivo `_extras` y trazabilidad criptográfica de procedencia.
- **W3C DCAT v3 JSON-LD y Frictionless DataPackage:** Exposición semántica `<script type="application/ld+json">` en cada ficha de dataset junto a contratos tabulares tipados de columnas y restricciones.
- **Interoperabilidad Semántica W3C SKOS / OWL / QUDT:** Enlaces canónicos a conceptos estandarizados, unidades de medida y vocabularios abiertos de Wikidata.
- **Servicios Remotos OpenAPI 3.x y Contratos CLI (`okf-cli` / `owl-cli`):** Modelado unificado de APIs y ejecutables CLI bajo contratos sintácticos indexados y gobernados por ODRL.
- **Protocolo llms.txt y Descubrimiento Well-Known (RFC 8615):** Exposición estructurada en texto plano y manifiestos `/.well-known/okf.json` (con alias `/.well-known/datamesh.json`) para resolución automática por clientes y agentes autónomos.
