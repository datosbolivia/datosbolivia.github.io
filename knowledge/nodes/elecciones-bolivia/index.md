---
type: dataset
title: Atlas Electoral y Elecciones Generales de Bolivia (1979-2025)
dimensions:
- año
- departamento
- circunscripcion
- partido
contracts:
- type: datapackage
  path: ./datapackage.yaml
lineage:
  source:
  - url: https://github.com/datosbolivia/elecciones2025
  version: 1.0.0
  updated_at: '2026-09-11T00:00:00Z'
---

# Atlas Electoral y Elecciones Generales de Bolivia

Conjunto de datos estructurados sobre la historia democrática y procesos electorales bolivianos desde 1979 hasta los comicios generales contemporáneos, desagregados a nivel de recinto y mesa electoral.

## Contexto y Sistema Electoral Boliviano

El sistema electoral plurinacional boliviano, regido por la Ley N° 018 del Órgano Electoral Plurinacional y la Ley N° 026 del Régimen Electoral, contempla la elección presidencial en distrito único nacional más los sufragios de las comunidades de bolivianos en el exterior.

La arquitectura de cómputo del Tribunal Supremo Electoral (TSE) genera actas digitalizadas por cada mesa electoral con desglose estricto de:
- **Padrón de Mesa:** Ciudadanos inscritos habilitados para sufragar.
- **Votos Válidos, Blancos y Nulos:** Participación efectiva y abstención pasiva.
- **Distribución de Votos:** Fuerza política asignada en la franja presidencial y uninominal.

```ojs
const resourceUrl = dataset.resources?.[0]?.path;
const data = await datamesh.query({
  resource_uri: resourceUrl || "elecciones-bolivia:elecciones_generales_2020",
  limit: 200
});

const partidoIdx = data.columns.indexOf("partido");
const votosIdx = data.columns.indexOf("votos");

const rows = data.rows.map(r => ({
  partido: r[partidoIdx] || "Otros",
  votos: parseInt(r[votosIdx], 10) || 1
})).filter(d => d.partido && d.partido !== "Otros");

return Plot.plot({
  title: "Distribución de Votos por Fuerza Política",
  subtitle: "Muestra de actas computadas en elecciones generales",
  marginLeft: 100,
  marginRight: 40,
  marks: [
    Plot.barX(rows, Plot.groupY({ x: "sum" }, {
      y: "partido",
      x: "votos",
      fill: "var(--color-primary, #0284c7)",
      sort: { y: "-x" }
    })),
    Plot.ruleX([0])
  ]
});
```

## Valor Analítico y Auditoría Ciudadana

- **Transparencia Electoral:** Verificación reproducible de actas de sufragio y detección de inconsistencias en el cómputo final.
- **Geografía Política:** Evolución de bastiones electorales urbanos frente a circunscripciones rurales e indígena-originarias.
- **Participación y Ausentismo:** Comportamiento del voto nulo, blanco y participación ciudadana a lo largo de ciclos democráticos.
