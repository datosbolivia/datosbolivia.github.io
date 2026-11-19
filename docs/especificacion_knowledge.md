---
type: normative
title: "Especificación Normativa de Nodos DataMesh Bolivia (OKF & ODKF v0.3)"
description: "Estándar normativo unificado OKF/ODKF v0.3 para representación de conocimiento, YAML-LD W3C, traducciones biyectivas con _extras, contratos okf-cli/OpenAPI y gobernanza Zero-Microdata."
timestamp: 2026-11-18T00:00:00Z
status: Activo
tags: [especificacion, okf, odkf, v0.3, w3c-dcat, json-ld, extras, contratos, odrl, federacion]
---

# Especificación Normativa de Nodos DataMesh Bolivia (OKF & ODKF v0.3)

**Versión:** 0.3 — Especificación Oficial Unificada  
**Contexto JSON-LD Implícito:** `https://openknowledgeformat.org/ns/v0.3.jsonld`  
**Estado:** Estándar Normativo

OKF (**Open Knowledge Format**) es un estándar abierto, humano-legible y optimizado para agentes de Inteligencia Artificial para representar **conocimiento**: metadatos descriptivos, paradata operativa, contexto narrativo e interoperabilidad semántica alrededor de datos y sistemas.

**ODKF v0.3 (Open Data Knowledge Format)** es el perfil oficial de OKF v0.3 para arquitecturas de malla de datos soberanas y catálogos analíticos federados. Actúa como un **meta-estándar e índice de índices** que unifica **W3C DCAT v3**, **Frictionless DataPackage**, **W3C PROV-O**, **W3C SKOS**, **W3C ODRL 2.2 / DPV**, **QUDT / UCUM**, **OpenAPI 3.1**, **CWL** y contratos declarativos de herramientas CLI (`okf-cli`, `owl-cli`).

> Las palabras clave "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHOULD", "MAY" y "OPTIONAL" siguen la semántica normativa de BCP 14 (RFC 2119 / RFC 8174).

---

## Parte I — Núcleo Open Knowledge Format (OKF v0.3)

### 1. Principios de Diseño y Perfiles de Conformidad (W3C QA SpecGL)

OKF/ODKF v0.3 define tres **Perfiles de Conformidad acumulativos** para permitir adopción incremental sin infraestructura pesada:

1. **Level 0 — Core Knowledge Bundle (`level-0-core`):** Archivos Markdown UTF-8 con YAML frontmatter (`type` o `@type`), enlaces cruzados, `index.md`, `log.md`, `sources`, `generated`, `verified`, `status`, `stale_after` y metadatos declarativos `Attested Computation`.
2. **Level 1 — Data Product & Contracts Profile (`level-1-contracts`):** Extiende Level 0 con `contracts[]` (`datapackage`, `dcat`, `openapi`, `cwl`, `okf-cli`, `owl-cli`), tríadas canónicas (`catalog:dataset:resource`), anclajes `skos`, unidades físicas **UCUM / QUDT** (`unit`, `aggregation_behavior`), contratos de verificación CLI (`okf diff`, `okf attest`) y gobernanza `zero_microdata` con *k-anonimato* (`min_group_size >= 5`).
3. **Level 2 — Sovereign Federated / P2P Profile (`level-2-sovereign`):** Extiende Level 1 con direccionamiento soberano `okf://` y `<dataset>.<resource>@<catalog>`, extracción selectiva de subarchivos `#fragment` vía HTTP Range (RFC 7233), firmas criptográficas Ed25519 / OpenSSH (`eddsa-jcs-2022`) y transporte P2P opcional (Kademlia DHT / GossipSub).

---

### 2. Estructura del Bundle y Archivos Reservados

```text
mi_bundle/
├── index.md                      # Listado jerárquico (revelación progresiva) o Root Concept Manifest DCAT
├── log.md                        # Bitácora cronológica descendente (encabezados YYYY-MM-DD)
├── <concepto>.md                 # Documento de concepto
└── concepts/
    └── <termino>.md              # Glosario semántico / conceptos SKOS
```

#### Reglas de Archivos Reservados (`index.md`, `log.md`)

- `index.md` y `log.md` tienen significado estructural reservado.
- En bundles ODKF (`level-1-contracts`), un `index.md` en la raíz del bundle **PUEDE** actuar como *Root Concept Manifest* declarando una clase DCAT explícita (`type: dcat:Dataset`, `type: dcat:DataService` o `type: dcat:CatalogRecord`). El uso de `type: dataset` o `type: service` abreviado en archivos reservados emite una advertencia `PE3-RESERVED-FILE` para compatibilidad retroactiva con v0.2.
- Todo otro archivo `.md` del árbol es un documento de concepto y **DEBE** incluir YAML frontmatter delimitado por `---` con un campo `type` (o `@type`) no vacío.

---

### 3. Procedencia, Confianza Ortogonal, Ciclo de Vida y Cómputo Atestado

#### 3.1 Procedencia (`sources` / `prov:wasDerivedFrom`)

`sources` registra los materiales externos o internos de los que deriva un concepto, junto con señales objetivas de credibilidad (`author`, `usage_count`, `last_modified`, `usage_window`) y citas puntuales en el cuerpo mediante notas al pie `[^id]`.

#### 3.2 Dos Ejes Ortogonales de Confianza (`trust_tier` y `authenticity_status`)

OKF v0.3 separa estrictamente la revisión epistémica de la autenticidad criptográfica:

1. **Nivel de Revisión Epistémica (`trust_tier`, derivado de `verified[]`):**
   - Sin `verified`: `unverified`.
   - `verified` por actores no humanos (`process:*`, `<agente>/<ver>`): `machine-confirmed`.
   - `verified` por actor humano (`human:<id>`): `human-reviewed`.
2. **Autenticidad Criptográfica (`authenticity_status`, alineado a W3C Data Integrity `eddsa-jcs-2022`):**
   - Evaluada sobre `signatures[]` (`did:key`, `did:github:<user>`, Ed25519 hex, OpenSSH `ssh-ed25519`) verificando el digest SHA-256 de la canonicalización **RFC 8785 (JCS)** del frontmatter (sin `signatures`) concatenada con `\n` y los bytes UTF-8 del cuerpo Markdown.
   - Resuelve exclusivamente en runtime a: `unsigned`, `self-signed`, `trusted-signer` o `invalid`. No debe persistirse como verdad estática en el frontmatter.

#### 3.3 Ciclo de Vida (`status` y `stale_after`)

- `status`: `draft`, `proposed`, `active`, `stable` (por defecto), `deprecated`, `retired` o `superseded` (este último **REQUIERE** `superseded_by`).
- `stale_after`: instante absoluto ISO 8601 UTC (`now >= stale_after` indica obsolescencia). Se acepta `freshness.expires` como alias heredado de v0.2.

#### 3.4 Cómputo Atestado (`type: Attested Computation`) y Contratos CLI

Un nodo `Attested Computation` declara `runtime`, `parameters`, `computation` (inline en `# Computation` o ruta externa), `executor` (`resource`, `receipt`) y `attester` (`resource`).

- **`okf attest`:** Realiza verificación estática/declarativa determinista comparando la normalización AST/canónica del SQL ejecutado contra `canonical_query_hash` sin ejecutar scripts no confiables en el host, emitiendo `AttestationVerdict` JSON (`verdict: verified | refuted | error`, códigos de salida `0 | 1 | 2`).
- **`okf diff`:** Clasifica evolución de esquemas y conceptos bajo **SemVer 2.0.0** (`PATCH` en prosa, `MINOR` en adiciones compatibles, `MAJOR` ante eliminación/renombrado de columnas, mutación de tipos o cambio de unidades UCUM/QUDT y anclajes ontológicos).

---

## Parte II — Perfil ODKF v0.3 (Open Data Knowledge Format)

### 4. Epistemología Tripartita y Taxonomía Multimodal (`nature`)

1. **Metadatos (Descriptivo y Conceptual):** Qué representa el activo (título, dimensiones, anclajes SKOS/Wikidata, contratos).
2. **Paradata (Proceso y Gobernanza):** Cómo se generó, verificó, versionó y firmó (`generated`, `verified`, `lineage.transformations`, `signatures`, `policy`).
3. **Datos (Carga Sustantiva):** Registros físicos o streams consultables.

La propiedad opcional `nature` clasifica la modalidad operativa del recurso:
`tabular` | `multidimensional` | `geospatial` | `document` | `graph` | `service_api` | `model`.

---

### 5. Perfil W3C YAML-LD, Mapeos CURIE y Envolvente Biyectivo `_extras`

Todo documento ODKF v0.3 es un **documento YAML-LD** gobernado por el contexto implícito `https://openknowledgeformat.org/ns/v0.3.jsonld`. Los parsers y el portal normalizan de forma equivalente claves cortas, CURIEs W3C e IRIs completas:

| Clave corta OKF | Equivalente W3C JSON-LD / CURIE | Vocabulario |
| :--- | :--- | :--- |
| `type` | `@type` (`dcat:Dataset`, `dcat:DataService`, `dcat:Catalog`, `skos:Concept`) | W3C DCAT / SKOS / JSON-LD |
| `resource` / `id` | `@id` | JSON-LD |
| `title`, `description`, `license` | `dcterms:title`, `dcterms:description`, `dcterms:license` | Dublin Core Terms |
| `tags` | `dcat:keyword` | W3C DCAT v3 |
| `skos`, `exact_match`, `close_match`, `broader` | `dcat:theme`, `skos:exactMatch`, `skos:closeMatch`, `skos:broader` | W3C DCAT / SKOS |
| `contracts` | `dcat:conformsTo` | W3C DCAT v3 |
| `resources` | `dcat:distribution` | W3C DCAT v3 |
| `sources` | `prov:wasDerivedFrom` *(alias heredado: `lineage.sources`)* | W3C PROV-O |
| `generated`, `verified` | `prov:qualifiedGeneration`, `prov:wasAttributedTo` | W3C PROV-O |
| `lineage.transformations` | `prov:wasGeneratedByActivity` | W3C PROV-O |
| `policy`, `policies` | `odrl:hasPolicy`, `okf:policies` | W3C ODRL 2.2 + DPV |
| `quality` | `dqv:hasQualityMeasurement` | W3C DQV |
| `spatial`, `temporal` | `dcterms:spatial`, `dcterms:temporal` | Dublin Core Terms |

#### Garantía de Traducción Biyectiva (`_extras.<namespace>`)

Al traducir metadatos entre formatos ($S_1 \leftrightarrow \text{OKF (W3C + \_extras)} \leftrightarrow S_2$):
- Los campos con equivalencia semántica W3C pueblan las propiedades canónicas W3C.
- Los atributos específicos sin mapeo W3C directo se preservan sin pérdida bajo `_extras.<namespace>` (por ejemplo `_extras.ckan`, `_extras.frictionless`, `_extras.stac`, `_extras.schema_org`).
- Los campos de usuario arbitrarios en la raíz del frontmatter se conservan intactos durante parsing, firma JCS y exportación (`okf translate` y `<script type="application/ld+json">` en DCAT v3).

```yaml
---
type: dcat:Dataset
nature: tabular
title: Atlas Electoral de Bolivia
description: Estadísticas electorales oficiales por mesa y recinto.
license: CC-BY-4.0
tags: [demografia, elecciones, padron]
generated: { by: process:oep-export, at: 2026-05-01T00:00:00Z }
sources:
  - id: oep-fuente
    resource: https://atlaselectoral.oep.org.bo/

skos:
  - http://www.wikidata.org/entity/Q39825
  - https://schema.org/GovernmentData

dimensions: [departamento, municipio, recinto, anio]

contracts:
  - type: datapackage
    path: datapackage.yaml
  - type: openapi
    ref: https://api.datos.gob.bo/v3/api-docs
  - type: okf-cli
    binary: duckdb
    action: odrl:aggregate
    inputs:
      - { name: departamento, flag: "--depto", type: string, required: true }
    outputs: { format: json }

semantic_fields:
  - field_name: codigo_municipio
    concept_id: censo_2024:concepts/municipio.md
    rdf_type: https://schema.org/AdministrativeArea
    unit: http://qudt.org/vocab/unit/NUM
    aggregation_behavior: sum

policy:
  profile: zero_microdata
  min_group_size: 5

_extras:
  ckan:
    organization_id: datos-bolivia
---
```

---

### 6. Contratos Sintácticos, CLI (`okf-cli` / `owl-cli`) y Servicios

La lista `contracts[]` admite referencias por archivo local (`path`), URI remota (`ref`) o descriptor ejecutable CLI (`binary`):

| Categoría | Valores `type` aceptados | Propósito |
| :--- | :--- | :--- |
| **Tabulares y Estadísticos** | `datapackage`, `sdmx`, `ddi`, `json_schema`, `avro`, `parquet` | Esquemas tabulares, cubos multidimensionales, unidades UCUM/QUDT. |
| **Catálogos y Geoespacial** | `dcat`, `iso19115`, `stac` | Distribuciones DCAT v3, bounding boxes, proyecciones CRS. |
| **Servicios y Streaming** | `openapi`, `asyncapi`, `graphql`, `grpc`, `flight_sql`, `sparql` | Servicios REST/RPC remotos validados por esquema `http(s)://` (`OE6`). |
| **Herramientas CLI y Flujos** | `okf-cli`, `owl-cli`, `cli_tool`, `cwl`, `dbt` | Ejecución segura por `argv` discretos sin shell (`shell=False`), acotada por `action` ODRL (`odrl:read` vs `odrl:aggregate`). |

---

### 7. Gobernanza Zero-Microdata (W3C ODRL 2.2 + DPV)

`policy` y `policies[]` soportan formas abreviadas o estructuras ODRL/PolicySpec evaluadas con precedencia **más-restrictivo-gana** (`deny > zero_microdata > allow_all`):

- `allow_all`: lectura abierta permitida.
- `zero_microdata` (por defecto `min_group_size: 5`, `dpv:KAnonymity`): bloquea lecturas de filas crudas (`odrl:read`), `SELECT *` y agrupaciones sin `HAVING COUNT(*) >= min_group_size` para consumidores públicos no autenticados (*fail-closed*). Solo autoriza agregaciones sancionadas (`odrl:aggregate`) o consultas de roles privilegiados con firma verificada `trusted-signer`.
- `deny`: acceso público bloqueado por defecto.
- Objetos estructurados: `{ profile, min_group_size, type: odrl|dpv|opa|rego|xacml, path, ref, inline, rules }` o documentos W3C ODRL 2.2 JSON-LD (`permission`, `prohibition`, `odrl:permission`, `odrl:prohibition`, `@graph`).

---

### 8. Direccionamiento por Tríada Canónica y Subarchivos `#fragment`

Todo recurso soporta las **cinco representaciones canónicas** más fragmentos RFC 3986 (`#subruta/archivo.csv`) para lectura por rango HTTP (RFC 7233):

1. Tríada con dos puntos: `[catalogo:]dataset:recurso` (ej. `bolivia:elecciones:votos`)
2. Tríada con barras: `[catalogo/]dataset/recurso`
3. DNS soberano inverso: `<dataset>.<recurso>@<catalogo>` (con soporte para nombres entrecomillados con puntos)
4. URI soberana: `okf://[catalogo/]dataset/recurso` (alias `odkf://`, `datamesh://`)
5. URL directa física: `https://.../recurso.parquet` o `file:///...`

---

### 9. Invariantes Normativos (`PE1–PE5`, `OE1–OE7`) y Reglas (`RULE-01` a `RULE-12`)

- **PE1–PE5 (Productor):** Frontmatter YAML válido (`PE1`), `type` o `@type` obligatorio (`PE2`), integridad de archivos reservados `index.md`/`log.md` (`PE3`), contratos válidos con `path` local o `ref` HTTP/S (`PE4`) y digests `sha256:<hex64>` en transformaciones (`PE5`).
- **OE1–OE7 (Consumidor / Runtime):** Revelación progresiva (`OE1`), tolerancia multimodal `nature` (`OE2`), cumplimiento estricto ODRL/DPV `zero_microdata` (`OE3`), resolución de las 5 tríadas (`OE4`), fallback offline (`OE5`), guardia de esquemas URL permitiendo únicamente `http://`/`https://` en referencias remotas (`OE6`), y contención de rutas locales contra traversal y Zip Slip (`OE7`).
- **RULE-01 a RULE-12:** Validación de sintaxis YAML, `type`, URI semánticas `skos`, `contracts[]`, hashes `sha256`, políticas ODRL/DPV/OPA, bundles no vacíos, gramática de tríadas, formato de actores, ciclo de vida `superseded_by`, marcas temporales ISO 8601 y aciclicidad DAG en `relations`.

---

### 10. Descubrimiento Soberano (`/.well-known/okf.json`), `llms.txt` y Portal Web

1. **RFC 8615 Discovery:** Todo nodo o portal expone `/.well-known/okf.json` (manteniendo `/.well-known/datamesh.json` como alias retrocompatible) declarando `@context: "https://openknowledgeformat.org/ns/v0.3.jsonld"`, `schema_version: "0.3.0"`, `protocol: "OKF/ODKF v0.3"` y capacidades (`w3c_translation`, `tool_contracts`, `knowledge_graph`, `catalog`).
2. **Catálogo Ultra-Ligero Tri-Legible (`llms.txt` y `llms-full.txt`):** Índice Markdown legible por humanos, parsers deterministas y agentes LLM.
3. **Semántica Web W3C DCAT v3 JSON-LD:** Las fichas de datasets (`/datasets/[slug]`) incrustan `<script type="application/ld+json">` con el manifiesto W3C DCAT v3 (`@context: "https://www.w3.org/ns/dcat.jsonld"`, `@type: "dcat:Dataset"`, `dcat:distribution`, `dcat:conformsTo`, `odrl:hasPolicy`, `_extras`), habilitando indexación directa por crawlers semánticos y SDKs.
4. **Ejecución Monitorizada y Estado Operacional:** El runner unificado `okf run` captura eventos JSONL vía `OKF_PROVENANCE_OUT` y los SDKs separan configuración declarativa (`okf.yaml`, `trust.yaml`) del estado operativo local (`$OKF_HOME/metadata.db`).
