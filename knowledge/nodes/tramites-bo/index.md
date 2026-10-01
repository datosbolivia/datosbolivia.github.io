---
type: dataset
title: Directorio de Trámites del Estado Boliviano (gob.bo)
dimensions:
- estado
- sigla
- entidad
contracts:
- type: datapackage
  path: ./datapackage.yaml
lineage:
  source:
  - url: https://github.com/datosbolivia/tramites-bo
  version: 1.0.0
  updated_at: '2026-09-11T00:00:00Z'
---

# Directorio de Trámites del Estado Boliviano (gob.bo)

Catálogo integral de trámites administrativos, certificados, licencias y servicios ciudadanos proporcionados por entidades del gobierno central y descentralizado de Bolivia, extraídos periódicamente desde el portal oficial `gob.bo`.

## Contexto y Gobierno Electrónico

Bajo el marco de la Ley N° 164 General de Telecomunicaciones y Tecnologías de Información y Comunicación y el Decreto Supremo N° 3525 sobre simplificación de trámites, el Estado boliviano centraliza en el portal `gob.bo` la guía oficial de procedimientos administrativos para la ciudadanía.

Este repositorio documenta el universo de trámites vigentes e históricos gestionados por instituciones clave como:
- **SEGIP:** Cédulas de identidad y licencias de conducir.
- **SEPREC:** Registro de comercio y sociedades comerciales.
- **SENASAG:** Certificaciones fito y zoosanitarias.
- **ASFI:** Registro y quejas del sistema financiero.
- **Ministerios de Estado:** Autorizaciones, legalizaciones y registros sectoriales.

```ojs
const resourceUrl = dataset.resources?.[1]?.path || dataset.resources?.[0]?.path;
const data = await datamesh.query({
  resource_uri: resourceUrl || "tramites-bo:adiciones",
  limit: 250
});

const siglaIdx = data.columns.indexOf("sigla");

const rows = data.rows.map(r => ({
  institucion: r[siglaIdx] || "OTRA"
})).filter(d => d.institucion && d.institucion !== "OTRA");

return Plot.plot({
  title: "Concentración de Trámites por Institución Pública",
  subtitle: "Distribución de servicios registrados en el portal gob.bo",
  marginLeft: 120,
  marginRight: 40,
  marks: [
    Plot.barX(rows, Plot.groupY({ x: "count" }, {
      y: "institucion",
      fill: "var(--color-primary, #0284c7)",
      sort: { y: "-x" }
    })),
    Plot.ruleX([0])
  ]
});
```

## Valor para Agentes de IA y Desburocratización

- **Asistentes Legales y Ciudadanos:** Fuente de conocimiento estructurada para chatbots y agentes RAG que guían al usuario en requisitos, costos y oficinas de atención.
- **Auditoría de Complejidad:** Detección de duplicidad de requisitos entre instituciones y monitoreo del avance en interoperabilidad estatal.
- **Historial de Modificaciones:** Registro cronológico de cambios de aranceles o flexibilización de requisitos notariales.
