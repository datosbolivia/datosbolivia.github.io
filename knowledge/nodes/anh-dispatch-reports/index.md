---
type: dataset
title: Despacho y Distribución de Combustibles (ANH Bolivia)
dimensions:
- fecha
- departamento
- estacion_servicio
- producto
contracts:
- type: datapackage
  path: ./datapackage.yaml
lineage:
  source:
  - url: https://github.com/andres-chirinos/anh-dispatch-reports
  version: 1.0.0
  updated_at: '2026-09-11T00:00:00Z'
---

# Despacho y Distribución de Combustibles (ANH Bolivia)

Informes consolidados de despacho de combustibles líquidos desde plantas mayoristas de Yacimientos Petrolíferos Fiscales Bolivianos (YPFB) hacia estaciones de servicio minoristas autorizadas por la Agencia Nacional de Hidrocarburos (ANH).

## Contexto y Marco Operativo

El sistema de distribución de hidrocarburos en Bolivia opera bajo un esquema regulado donde YPFB gestiona las plantas de almacenaje y despacho mayorista (Senkata, Palmasola, Valle Hermoso, entre otras), mientras que la ANH supervisa el abastecimiento territorial continuo a través del Sistema B-SISA y las órdenes de despacho diario.

Este conjunto de datos recopila los volúmenes en litros asignados de **Gasolina Especial** y **Diésel Oíl** despachados a las estaciones de servicio en los 9 departamentos del país.

```ojs
const resourceUrl = dataset.resources?.[0]?.path;
const data = await datamesh.query({
  resource_uri: resourceUrl || "anh-dispatch-reports:anh_dispatch",
  limit: 100
});

return Plot.plot({
  title: "Distribución Territorial de Despachos de Combustible",
  subtitle: "Muestra de despachos por departamento (ANH Bolivia)",
  marginLeft: 120,
  marginRight: 40,
  marks: [
    Plot.barX(data.rows, Plot.groupY({ x: "count" }, {
      y: (d) => d[data.columns.indexOf("departamento")] || "Sin dato",
      fill: "var(--color-primary, #0284c7)",
      sort: { y: "-x" }
    })),
    Plot.ruleX([0])
  ]
});
```

## Valor Analítico y Preguntas Clave

- **Trazabilidad de Abastecimiento:** Detección de desviaciones entre cuotas departamentales asignadas y demanda efectiva de diésel o gasolina.
- **Logística Crítica:** Tiempos de reposición de inventarios desde las plantas de almacenaje de YPFB hacia estaciones de servicio urbanas y rurales.
- **Resiliencia Operativa:** Comportamiento de los despachos ante contingencias logísticas, mantenimiento de refinerías o restricciones en fronteras de importación.
