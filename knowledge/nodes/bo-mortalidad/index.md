---
type: dataset
title: Mortalidad y Hechos Vitales de Bolivia (SERECÍ / SNIS)
dimensions:
- departamento
- municipio
- fecha
- sexo
- rango_edad
contracts:
- type: datapackage
  path: ./datapackage.yaml
lineage:
  source:
  - url: https://github.com/sociedatos/bo-mortalidad
  version: 1.0.0
  updated_at: '2026-09-11T00:00:00Z'
---

# Mortalidad y Hechos Vitales de Bolivia (SERECÍ / SNIS)

Base de datos de defunciones y estadísticas vitales en Bolivia, originada en los registros del Servicio de Registro Cívico (SERECÍ) y el Sistema Nacional de Información en Salud (SNIS).

## Contexto y Fuentes Institucionales

La captación de hechos vitales en Bolivia transita por dos vías institucionales con propósitos y coberturas diferenciadas:
1. **SERECÍ (Órgano Electoral Plurinacional):** Registro formal de actas civiles de defunción indispensables para trámites de sucesión y actualización del padrón electoral biométrico.
2. **SNIS-VE (Ministerio de Salud y Deportes):** Vigilancia epidemiológica orientada a la detección oportuna de causas clínicas de mortalidad y monitoreo de emergencias sanitarias.

Este nodo unifica ambos repositorios para facilitar la investigación demográfica, el análisis de sobremortalidad y la evaluación del rezago administrativo entre el deceso y su inscripción legal.

```ojs
const resourceUrl = dataset.resources?.[0]?.path;
const data = await datamesh.query({
  resource_uri: resourceUrl || "bo-mortalidad:registro_civil",
  limit: 200
});

const edadIdx = data.columns.indexOf("rango_edad");
const sexoIdx = data.columns.indexOf("sexo");
const decesosIdx = data.columns.indexOf("decesos");

const rows = data.rows.map(r => ({
  rango_edad: r[edadIdx] || "Desconocido",
  sexo: r[sexoIdx] === "M" ? "Masculino" : (r[sexoIdx] === "F" ? "Femenino" : "Otro"),
  decesos: parseInt(r[decesosIdx], 10) || 1
}));

return Plot.plot({
  title: "Distribución de Mortalidad por Grupo Etario y Sexo",
  subtitle: "Muestra de actas de defunción (SERECÍ)",
  x: { label: "Grupo de Edad" },
  y: { label: "Total Decesos", grid: true },
  color: {
    domain: ["Masculino", "Femenino", "Otro"],
    range: ["#0284c7", "#f43f5e", "#94a3b8"],
    legend: true
  },
  marks: [
    Plot.barY(rows, Plot.groupX({ y: "sum" }, {
      x: "rango_edad",
      y: "decesos",
      fill: "sexo"
    })),
    Plot.ruleY([0])
  ]
});
```

## Líneas de Investigación Demográfica

- **Sobremortalidad y Epidemiología:** Detección de anomalías temporales asociadas a eventos climáticos extremos y crisis sanitarias.
- **Brecha Urbano-Rural:** Medición del subregistro en comunidades de difícil acceso donde la inscripción civil suele presentar demoras de semanas o meses.
- **Estructura Poblacional:** Dinámica de envejecimiento y principales rangos etarios vulnerables a nivel municipal.
