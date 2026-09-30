---
type: dataset
title: "Catálogo de Universidades, Sedes y Carreras"
description: "Catálogo completo de universidades e institutos, con el detalle de sus respectivas sedes, carreras ofertadas y plazas disponibles."
contracts:
  - type: datapackage
    path: ./datapackage.yaml
---

Este dataset contiene información sobre la oferta académica a nivel universitario:

- **Análisis de cobertura académica**: Permite identificar qué carreras se ofrecen en qué sedes o regiones geográficas.
- **Análisis de capacidad**: Evaluación de la oferta de plazas (`PLAZAS DISPONIBLES`) agrupando por carreras o por universidad.
- **Cruce de datos**: Se puede integrar con datos demográficos o de demanda laboral para planificar y ajustar la oferta académica del país.
- **Dashboard recomendado**: Panel de control con filtros por Universidad y Sede, gráficos de barras de carreras con mayor/menor cantidad de plazas disponibles.

```ojs
// Cargar universidades y carreras con DataMesh TypeScript SDK
const resourcePath = dataset?.resources?.[0]?.path || "data/universidades.csv";
const res = await datamesh.query({ resource_uri: resourcePath });

const uIdx = res.columns.findIndex(c => /universidad/i.test(c));
const data = res.rows
  .map(r => ({ universidad: (r[uIdx] || '').trim() }))
  .filter(d => d.universidad);

return Plot.plot({
  title: "Universidades con Mayor Oferta de Carreras",
  subtitle: "Distribución analítica",
  marginLeft: 140,
  x: { grid: true, label: "Número de Carreras Registradas" },
  y: { label: null },
  marks: [
    Plot.barX(data, Plot.groupY({ x: "count" }, { y: "universidad", sort: { y: "-x", limit: 10 }, fill: "var(--color-primary)" })),
    Plot.ruleX([0])
  ]
});
```
