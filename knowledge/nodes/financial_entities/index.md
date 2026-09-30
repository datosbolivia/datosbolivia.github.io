---
type: dataset
title: "Entidades Financieras"
description: "Registros de puntos de atención y entidades financieras (sucursales, cajeros automáticos, etc.) en Bolivia."
contracts:
  - type: datapackage
    path: ./datapackage.yaml
---

Este dataset contiene información geoespacial de puntos de interés: cada fila representa una sucursal, agencia, corresponsal o cajero automático de una entidad financiera.

- **Análisis espacial**: Visualizar la distribución de los puntos de atención financiera en un mapa interactivo. Agrupar por `entidad`, `tipoPAF` y `departamento`.
- **Análisis descriptivo**: Conocer la concentración de sucursales y cajeros automáticos por banco o por ubicación geográfica.
- **Cruce de datos**: Se puede integrar con datos demográficos, densidad poblacional o comerciales para evaluar la inclusión o cobertura financiera por zona.
- **Dashboard recomendado**: Mapa de puntos de interés (POIs) interactivo con filtros por entidad financiera (`entidad`), departamento (`departamento`), y grupo de atención (`desGrupo`).

```ojs
// Cargar puntos de atención financiera con DataMesh TypeScript SDK
const resourcePath = dataset?.resources?.[0]?.path || "data/financial_entities_places.csv";
const res = await datamesh.query({ resource_uri: resourcePath });

const deptIdx = res.columns.indexOf("departamento");
const data = res.rows
  .map(r => ({ departamento: (r[deptIdx] || '').trim() }))
  .filter(d => d.departamento);

return Plot.plot({
  title: "Puntos de Atención Financiera por Departamento (ASFI)",
  subtitle: "Distribución geográfica",
  marginLeft: 110,
  x: { grid: true, label: "Total PAF" },
  y: { label: null },
  marks: [
    Plot.barX(data, Plot.groupY({ x: "count" }, { y: "departamento", sort: { y: "-x" }, fill: "#059669" })),
    Plot.ruleX([0])
  ]
});
```

