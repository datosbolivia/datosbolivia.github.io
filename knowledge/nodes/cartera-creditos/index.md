---
type: dataset
title: Cartera de Créditos del Sistema Financiero Boliviano (ASFI)
dimensions:
- departamento
- municipio
- sector
- categoria
- year
contracts:
- type: datapackage
  path: ./datapackage.yaml
lineage:
  source:
  - url: https://github.com/mauforonda/cartera_de_creditos_en_bolivia
  version: 1.0.0
  updated_at: '2026-09-11T00:00:00Z'
---

# Cartera de Créditos del Sistema Financiero Boliviano

Datos estructurados sobre la colocación de créditos de bancos, cooperativas e instituciones financieras de desarrollo en Bolivia entre 2012 y 2021, desglosados a nivel municipal y por actividad económica CAEDEC.

## Marco Normativo y Regulación Financiera

La Ley N° 393 de Servicios Financieros transformó la canalización crediticia en Bolivia estableciendo cuotas mínimas obligatorias de cartera destinadas al **Sector Productivo** (agricultura, manufactura, turismo, construcción y minería) y a la **Vivienda de Interés Social**.

Este conjunto de datos unifica las memorias de la Autoridad de Supervisión del Sistema Financiero (ASFI), permitiendo auditar la desconcentración territorial del capital y contrastar el volumen financiero frente al número efectivo de prestatarios en cada municipio.

```ojs
const resourceUrl = dataset.resources?.[0]?.path;
const data = await datamesh.query({
  resource_uri: resourceUrl || "cartera-creditos:creditos",
  limit: 2500
});

const deptoIdx = data.columns.indexOf("departamento");
const sectorIdx = data.columns.indexOf("sector");
const carteraIdx = data.columns.indexOf("cartera");

const rows = data.rows.map(r => ({
  departamento: r[deptoIdx] || "Sin dato",
  sector: r[sectorIdx] || "Otros",
  cartera: parseFloat(r[carteraIdx]) || 1
})).filter(d => d.departamento !== "Sin dato");

return Plot.plot({
  title: "Colocación de Cartera Crediticia por Departamento",
  subtitle: "Distribución de créditos en el sistema financiero boliviano",
  marginLeft: 120,
  marginRight: 40,
  color: { scheme: "category10", legend: true },
  marks: [
    Plot.barX(rows, Plot.groupY({ x: "sum" }, {
      y: "departamento",
      x: "cartera",
      fill: "sector",
      sort: { y: "-x" }
    })),
    Plot.ruleX([0])
  ]
});
```

## Preguntas Clave para el Análisis Económico

- **Concentración Metropolitana:** ¿Qué porcentaje del volumen crediticio total se absorbe en el eje troncal (Santa Cruz, La Paz y Cochabamba) en comparación con las regiones periféricas?
- **Impacto de la Ley 393:** Evolución temporal de la participación del crédito productivo vs. crédito de consumo y comercio minorista.
- **Acceso Municipal:** Cantidad promedio de prestatarios por cada millón de bolivianos colocados en municipios rurales.
