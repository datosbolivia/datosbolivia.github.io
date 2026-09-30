---
type: dataset
title: "Estaciones de Gasolina"
description: "Registros de estaciones de gasolina en el Bolivia."
contracts:
  - type: datapackage
    path: ./datapackage.yaml
---

Este dataset es geoespacial de eventos: cada fila es una alerta con su zona de cobertura como polígono.

- **Análisis espacial**: Visualizar polígonos de alerta en mapa interactivo. Agrupar por atributos categóricos (tipo de alerta, departamento).
- **Análisis temporal**: Si hay columna de fecha, agrupar por mes para ver frecuencia de alertas.
- **Cruce de datos**: Correlacionar con calidad del aire por fecha para estudiar impacto de eventos climáticos en contaminación.
- **Dashboard recomendado**: Mapa de polígonos de alertas + Barras por tipo de alerta + Línea de frecuencia mensual.


```ojs
// Cargar recurso de estaciones mediante DataMesh TypeScript SDK
const resourcePath = dataset?.resources?.[0]?.path || "https://github.com/sociedatos/bo-combustible/blob/main/stations.csv";
const res = await datamesh.query({ resource_uri: resourcePath });

const depts = { "1": "Chuquisaca", "2": "La Paz", "3": "Cochabamba", "4": "Oruro", "5": "Potosí", "6": "Tarija", "7": "Santa Cruz", "8": "Beni", "9": "Pando" };
const deptIdx = res.columns.indexOf("id_departamento");

const data = res.rows.map(r => ({
  departamento: depts[r[deptIdx]] || "Otro"
}));

return Plot.plot({
  title: "Estaciones de Combustible por Departamento",
  subtitle: "Distribución geográfica",
  marginLeft: 110,
  x: { grid: true, label: "Número de Estaciones" },
  y: { label: null },
  marks: [
    Plot.barX(data, Plot.groupY({ x: "count" }, { y: "departamento", sort: { y: "-x" }, fill: "var(--color-primary)" })),
    Plot.ruleX([0])
  ]
});
```

