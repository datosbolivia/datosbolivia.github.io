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

```ojs
// Cargar estadísticas de AGETIC con DataMesh TypeScript SDK
const resourcePath = dataset?.resources?.[0]?.path || "data/ciudadania.csv";
const res = await datamesh.query({ resource_uri: resourcePath });

const yearCol = res.columns.find(c => /año|anio|year/i.test(c)) || res.columns[0];
const regCol = res.columns.find(c => /registro/i.test(c)) || res.columns[1];
const yearIdx = res.columns.indexOf(yearCol);
const regIdx = res.columns.indexOf(regCol);

const data = res.rows.map(r => ({
  anio: String(r[yearIdx]),
  registros: parseFloat(r[regIdx]) || 0
}));

return Plot.plot({
  title: "Crecimiento de Ciudadanía Digital (AGETIC)",
  subtitle: "Registros anuales",
  x: { label: "Año" },
  y: { grid: true, label: "Registros" },
  marks: [
    Plot.lineY(data, { x: "anio", y: "registros", stroke: "var(--color-primary)", strokeWidth: 2.5 }),
    Plot.dot(data, { x: "anio", y: "registros", fill: "var(--color-primary)", r: 4 }),
    Plot.ruleY([0])
  ]
});
```
