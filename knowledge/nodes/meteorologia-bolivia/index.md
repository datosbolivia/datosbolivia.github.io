---
type: dataset
title: Red de Estaciones Meteorológicas de Bolivia (SENAMHI)
dimensions:
- nameDepartment
- nameMunicipality
- nameBasin
- macroregion
- stationType
contracts:
- type: datapackage
  path: ./datapackage.yaml
lineage:
  source:
  - url: https://github.com/sociedatos/bo-meteorologia
  version: 1.0.0
  updated_at: '2026-09-11T00:00:00Z'
---

# Red de Estaciones Meteorológicas de Bolivia (SENAMHI)

Catálogo y red nacional de estaciones meteorológicas operadas y coordinadas por el Servicio Nacional de Meteorología e Hidrología (SENAMHI), recopiladas y estandarizadas por Sociedatos.

## Contexto y Cobertura Hidrometeorológica

La topografía de Bolivia abarca un gradiente altitudinal que va desde los 80 metros sobre el nivel del mar en las llanuras amazónicas del río Paraguay hasta más de 6.500 msnm en las cumbres de la Cordillera Occidental.

El SENAMHI mantiene una red de estaciones pluviométricas, climatológicas ordinarias y sinópticas principales distribuidas en tres macrocuencas:
1. **Cuenca del Amazonas:** Abarca el norte y oriente (Beni, Pando, norte de La Paz, Santa Cruz y Cochabamba).
2. **Cuenca del Plata:** Al sur del país (Tarija, Chuquisaca y este de Potosí).
3. **Cuenca Endorreica o del Altiplano:** Altiplano norte y sur, regulada por los lagos Titicaca y Poopó y los salares de Uyuni y Coipasa.

```ojs
const resourceUrl = dataset.resources?.[0]?.path;
const data = await datamesh.query({
  resource_uri: resourceUrl || "meteorologia-bolivia:estaciones_meteorologicas",
  limit: 250
});

const deptoIdx = data.columns.indexOf("nameDepartment");
const tipoIdx = data.columns.indexOf("stationType");
const macroIdx = data.columns.indexOf("macroregion");

const rows = data.rows.map(r => ({
  departamento: r[deptoIdx] || "Sin dato",
  tipo: r[tipoIdx] || "Convencional",
  macroregion: r[macroIdx] || "No especificada"
})).filter(d => d.departamento !== "Sin dato");

return Plot.plot({
  title: "Densidad de Estaciones Meteorológicas por Departamento",
  subtitle: "Distribución de la red hidrometeorológica nacional (SENAMHI)",
  marginLeft: 120,
  marginRight: 40,
  color: { scheme: "set2", legend: true },
  marks: [
    Plot.barX(rows, Plot.groupY({ x: "count" }, {
      y: "departamento",
      fill: "tipo",
      sort: { y: "-x" }
    })),
    Plot.ruleX([0])
  ]
});
```

## Líneas de Aplicación Climática

- **Gestión de Riesgos y Alertas Tempranas:** Modelación hidrológica para la predicción de crecidas en la cuenca del Mamoré y cuenca del Pilcomayo.
- **Seguridad Alimentaria y Sequías:** Vigilancia del balance hídrico en áreas agrícolas del Chaco boliviano y valles interandinos.
- **Calibración Satelital:** Ground-truth para corregir estimaciones satelitales de precipitación (CHIRPS, GPM) en zonas de alta montaña.
