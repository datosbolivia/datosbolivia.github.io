---
type: dataset
title: Calidad del Aire — Mediciones ICA
description: "Mediciones del Índice de Calidad del Aire (ICA) en estaciones de monitoreo, con coordenadas geográficas."
contracts:
  - type: datapackage
    path: ./datapackage.yml
---

# Uso Analítico

Este dataset es **espacio-temporal puntual**: cada fila es una medición en un lugar y momento específico.

- **Análisis temporal**: Agrupar por `DATE_TRUNC('day', fecha_hora_registro)` o `DATE_TRUNC('month', ...)`. Usar `AVG(valor_ica)` para tendencia diaria/mensual.
- **Análisis espacial**: Agrupar por `lugar_nombre`. Usar `AVG(valor_ica)` para comparar estaciones. Visualizar con mapa de puntos (`latitude`, `longitude`).
- **Dashboard recomendado**: Gráfico de línea temporal (x=fecha, y=AVG(valor_ica)) + Mapa de puntos por estación + Barras comparativas por estación.

# Joins

Puede cruzarse con [alertas SENAMHI](/tables/alerts_senamhi_alerts.md) por proximidad temporal (`fecha_hora_registro`) para correlacionar contaminación con eventos climáticos.

# Conceptos Relacionados (SKOS)

Este dataset está enriquecido semánticamente utilizando terminologías estándar y vocabularios controlados. Puedes explorar las definiciones formales y relaciones SKOS de las variables medidas en los siguientes documentos de concepto:

- [Índice de Calidad del Aire (ICA/AQI)](concepts/air_quality_index.md) - [Q2364111](https://www.wikidata.org/wiki/Q2364111)
- [Material Particulado 2.5 (PM2.5)](concepts/pm25.md) - [Q3243162](https://www.wikidata.org/wiki/Q3243162)

# Citations

[1] Escala ICA EPA — https://www.airnow.gov/aqi/aqi-basics/

```ojs
// Cargar datos de calidad del aire con DataMesh TypeScript SDK
const resourcePath = "air_quality:Compilación de datos de calidad del aire de Bolivia";
const res = await datamesh.query({ resource_uri: resourcePath });

const placeIdx = res.columns.indexOf("lugar_nombre");
const icaIdx = res.columns.indexOf("valor_ica");

const data = res.rows
  .map(r => ({
    lugar: r[placeIdx],
    ica: parseFloat(r[icaIdx]) || 0
  }))
  .filter(d => d.lugar && d.ica > 0);

return Plot.plot({
  title: "ICA Promedio por Estación de Monitoreo",
  subtitle: "Índice de Calidad del Aire",
  marginLeft: 130,
  x: { grid: true, label: "Índice ICA Promedio" },
  y: { label: null },
  marks: [
    Plot.barX(data, Plot.groupY({ x: "mean" }, { y: "lugar", sort: { y: "-x" }, fill: "#dc2626" })),
    Plot.ruleX([0])
  ]
});
```

