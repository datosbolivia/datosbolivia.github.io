---
type: dataset
title: Estadísticas AGETIC
dimensions:
  - annio
  - registros
  - autentificaciones
  - aprobacion_documentos
  - notificaciones_electronicas
contracts:
  - type: datapackage
    path: ./datapackage.json
lineage:
  source:
    - url: https://docs.google.com/spreadsheets/d/e/2PACX-1vSp9n8ENh1spKCUJ_fdqDpcdo2mCNDTLi0UL8xLlFvvfoY5VZFDjM69hujmNfniMM_4ZX5vMazJO1Jk/pub?gid=762714425&single=true&output=csv
    - url: https://docs.google.com/spreadsheets/d/e/2PACX-1vSp9n8ENh1spKCUJ_fdqDpcdo2mCNDTLi0UL8xLlFvvfoY5VZFDjM69hujmNfniMM_4ZX5vMazJO1Jk/pub?gid=751947932&single=true&output=csv
    - url: https://docs.google.com/spreadsheets/d/e/2PACX-1vSp9n8ENh1spKCUJ_fdqDpcdo2mCNDTLi0UL8xLlFvvfoY5VZFDjM69hujmNfniMM_4ZX5vMazJO1Jk/pub?gid=2038574110&single=true&output=csv
    - url: https://docs.google.com/spreadsheets/d/e/2PACX-1vSp9n8ENh1spKCUJ_fdqDpcdo2mCNDTLi0UL8xLlFvvfoY5VZFDjM69hujmNfniMM_4ZX5vMazJO1Jk/pub?gid=1066248476&single=true&output=csv
  version: 1.0.0
  updated_at: 2026-06-30T00:00:00Z
---

# Estadísticas AGETIC

Este nodo agrupa varias series de estadísticas de AGETIC, incluyendo ciudadanía digital, interoperabilidad, emisión de facturas y pasarela de pagos. Cada recurso está disponible como CSV a través de la hoja de cálculo publicada y se describe en el `datapackage.json`.

# Conceptos Relacionados (SKOS)

Este dataset está enriquecido semánticamente utilizando vocabularios controlados. Puedes explorar las definiciones formales asociadas:

- [Ciudadanía Digital](concepts/digital_citizenship.md) - [Q5275815](https://www.wikidata.org/wiki/Q5275815)
- [Interoperabilidad](concepts/interoperability.md) - [Q730006](https://www.wikidata.org/wiki/Q730006)

```chart
{
  "type": "area",
  "title": "Crecimiento de la Ciudadanía Digital en Bolivia",
  "subtitle": "Registros y autentificaciones anuales en la plataforma de identidad digital AGETIC",
  "source": "AGETIC — Agencia de Gobierno Electrónico y TIC del Estado",
  "sql": "SELECT \"Año\" AS anio, \"Registros\" AS registros, \"Autentificaciones\" AS autentificaciones FROM agetic_data_estadisticas_ciudadania_digital ORDER BY \"Año\"",
  "xKey": "anio",
  "yKeys": ["registros", "autentificaciones"],
  "colors": ["#2563eb", "#059669"]
}
```

```chart
{
  "type": "bar",
  "title": "Emisión de Facturas Electrónicas por Año",
  "subtitle": "Total de facturas electrónicas emitidas vía plataforma AGETIC",
  "source": "AGETIC — Agencia de Gobierno Electrónico y TIC del Estado",
  "sql": "SELECT \"Año\" AS anio, \"Cantidad\" AS cantidad FROM agetic_data_estadisticas_emision_facturas ORDER BY \"Año\"",
  "xKey": "anio",
  "yKeys": ["cantidad"],
  "colors": ["#7c3aed"]
}
```
