---
type: dataset
title: Despacho de Carga y Operación Eléctrica Nacional (CNDC)
dimensions:
- fecha
- agente
- area
- cat
contracts:
- type: datapackage
  path: ./datapackage.yaml
lineage:
  source:
  - url: https://github.com/datosbolivia/despacho_de_carga
  version: 1.0.0
  updated_at: '2026-09-11T00:00:00Z'
---

# Despacho de Carga y Operación Eléctrica Nacional (CNDC)

Datos operativos generados por el Comité Nacional de Despacho de Carga (CNDC), entidad responsable de coordinar la operación técnica y económica en tiempo real del Sistema Interconectado Nacional (SIN) de Bolivia.

## Contexto y Sistema Eléctrico Interconectado

El Sistema Interconectado Nacional (SIN) integra las cuatro áreas operativas principales del país:
- **Área Central:** Nodos de generación y consumo de Cochabamba.
- **Área Oriental:** Centros de carga de Santa Cruz y plantas termoeléctricas (Guaracachi, Warnes).
- **Área Norte:** Red de La Paz, Yungas y plantas hidroeléctricas de Zongo y Corani.
- **Área Sur:** Redes de Chuquisaca, Potosí y Tarija, vinculadas a minería y plantas de ciclo combinado.

El CNDC monitorea de forma continua la frecuencia, tensión, reservas de giro y contingencias de desconexión de carga para asegurar la estabilidad del suministro.

```ojs
const resourceUrl = dataset.resources?.[0]?.path;
const data = await datamesh.query({
  resource_uri: resourceUrl || "despacho-carga:eventos_mayores",
  limit: 200
});

const areaIdx = data.columns.indexOf("area");
const mwIdx = data.columns.indexOf("mw_desc");

const rows = data.rows.map(r => ({
  area: r[areaIdx] || "Sin Clasificar",
  mw: parseFloat(r[mwIdx]) || 1
})).filter(d => d.area !== "Sin Clasificar");

return Plot.plot({
  title: "Eventos Mayores de Desconexión de Carga por Área del SIN",
  subtitle: "Potencia acumulada desconectada (MW) registrada por el CNDC",
  marginLeft: 120,
  marginRight: 40,
  marks: [
    Plot.barX(rows, Plot.groupY({ x: "sum" }, {
      y: "area",
      x: "mw",
      fill: "var(--color-primary, #0284c7)",
      sort: { y: "-x" }
    })),
    Plot.ruleX([0])
  ]
});
```

## Valor Analítico y Seguridad Energética

- **Vulnerabilidad de Corredores:** Detección de tramos de líneas de alta tensión con alta tasa de disparos automáticos o indisponibilidad forzada.
- **Respaldo Hidrotérmico:** Modelado de la complementariedad estacional entre generación hidráulica en época de lluvias y generación térmica en estiaje.
- **Transición Energética:** Monitoreo del impacto de la integración de parques solares y eólicos en la inercia del sistema eléctrico.
