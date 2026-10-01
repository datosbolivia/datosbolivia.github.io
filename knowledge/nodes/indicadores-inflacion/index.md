---
type: dataset
title: Índice de Precios al Consumidor e Inflación (INE)
dimensions:
- fecha
- ciudad
- categoria
- producto
contracts:
- type: datapackage
  path: ./datapackage.yaml
lineage:
  source:
  - url: https://github.com/mauforonda/indicadores_inflacion
  version: 1.0.0
  updated_at: '2026-09-11T00:00:00Z'
---

# Índice de Precios al Consumidor e Inflación (INE)

Conjunto histórico de índices de precios al consumidor publicado por el Instituto Nacional de Estadística (INE), con desglose por producto, división de gasto y ciudad.

## Metodología y Canasta Familiar

El Índice de Precios al Consumidor (IPC) en Bolivia mide la variación mensual ponderada de los precios de una canasta representativa de bienes y servicios consumidos por los hogares bolivianos, clasificada bajo el estándar internacional COICOP (Clasificación del Consumo Individual por Finalidades).

La cobertura geográfica abarca las nueve capitales de departamento más las conurbaciones metropolitanas de El Alto, Warnes, Montero, Sacaba y Quillacollo. Este nodo recopila la serie histórica nacional y las aperturas por divisiones de gasto (Alimentos y bebidas no alcohólicas, Transporte, Vivienda y servicios básicos, Salud y Educación).

```ojs
const resourceUrl = dataset.resources?.[0]?.path;
const data = await datamesh.query({
  resource_uri: resourceUrl || "indicadores-inflacion:ine_ipc_nacional",
  limit: 200
});

const fechaIdx = data.columns.indexOf("fecha");
const var12Idx = data.columns.indexOf("variacion_12_meses");
const varMesIdx = data.columns.indexOf("variacion_mensual");

const rows = data.rows.map(r => ({
  fecha: new Date(r[fechaIdx]),
  inflacion_12m: parseFloat(r[var12Idx]) || 0,
  variacion_mensual: parseFloat(r[varMesIdx]) || 0
})).filter(d => d.fecha instanceof Date && !isNaN(d.fecha.getTime()));

return Plot.plot({
  title: "Evolución Histórica de la Inflación Interanual en Bolivia (12 Meses)",
  subtitle: "Variación porcentual interanual del IPC nacional (INE)",
  x: { label: "Periodo" },
  y: { label: "Variación Interanual (%)", grid: true },
  marks: [
    Plot.lineY(rows, {
      x: "fecha",
      y: "inflacion_12m",
      stroke: "var(--color-primary, #0284c7)",
      strokeWidth: 2
    }),
    Plot.ruleY([0], { stroke: "#94a3b8", strokeDasharray: "2,2" })
  ]
});
```

## Valor para Modelos Económicos y Políticas Públicas

- **Inflación de Alimentos:** Detección temprana de presiones inflacionarias en alimentos perecederos frente a bienes transables importados.
- **Poder Adquisitivo y Salario Real:** Ajuste de escalas salariales y cálculo de líneas de pobreza extrema y moderada.
- **Monitoreo Macroeconómico:** Insumo directo para contrastar metas de estabilidad de precios del Programa Fiscal-Financiero conjunto BCB-Ministerio de Economía.
