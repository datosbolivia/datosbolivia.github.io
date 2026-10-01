---
type: dataset
title: Monitor de Disponibilidad de Portales Web del Estado (MonitorBolivia)
dimensions:
- timestamp
- site_name
- status
contracts:
- type: datapackage
  path: ./datapackage.yaml
lineage:
  source:
  - url: https://github.com/andres-chirinos/monitorbolivia
  version: 1.0.0
  updated_at: '2026-09-11T00:00:00Z'
---

# Monitor de Disponibilidad de Portales Web del Estado Boliviano

Observatorio continuo de disponibilidad, fiabilidad y tiempos de respuesta de la infraestructura digital pública en Bolivia, evaluando portales ministeriales, judiciales y de servicios ciudadanos.

## Contexto y Soberanía Digital Pública

El acceso a trámites electrónicos, información presupuestaria y servicios de justicia depende críticamente de la alta disponibilidad de los servidores gubernamentales bajo el dominio `.gob.bo`.

MonitorBolivia ejecuta pruebas periódicas de sondeo sintético de protocolo HTTP/HTTPS registrando:
- **Disponibilidad (Uptime %):** Porcentaje del tiempo en que el servicio devuelve respuestas operativas (código 200).
- **Latencia de Red (ms):** Tiempo de respuesta percibido por el usuario final.
- **Incidentes y Caídas:** Errores de pasarela (502, 504), caídas de servidor (500) y certificados TLS vencidos.

```ojs
const resourceUrl = dataset.resources?.[0]?.path;
const data = await datamesh.query({
  resource_uri: resourceUrl || "monitorbolivia:uptime_summary",
  limit: 200
});

const siteIdx = data.columns.indexOf("site_name");
const uptimeIdx = data.columns.indexOf("uptime_percentage");
const latencyIdx = data.columns.indexOf("response_time_ms");

const rows = data.rows.map(r => ({
  portal: r[siteIdx] || "Portal Público",
  uptime: parseFloat(r[uptimeIdx]) || 95,
  latencia: parseFloat(r[latencyIdx]) || 120
})).filter(d => d.portal !== "Portal Público");

return Plot.plot({
  title: "Disponibilidad de Portales del Estado Boliviano (%)",
  subtitle: "Porcentaje de disponibilidad operativa y fiabilidad web",
  marginLeft: 140,
  marginRight: 40,
  x: { domain: [80, 100], label: "Uptime (%)", grid: true },
  marks: [
    Plot.barX(rows, {
      y: "portal",
      x: "uptime",
      fill: (d) => d.uptime >= 99 ? "#10b981" : (d.uptime >= 95 ? "#f59e0b" : "#ef4444"),
      sort: { y: "-x" }
    }),
    Plot.ruleX([95], { stroke: "#94a3b8", strokeDasharray: "2,2" })
  ]
});
```

## Valor Analítico y Rendición de Cuentas

- **Auditoría de Acuerdos de Nivel de Servicio (SLA):** Cumplimiento de estándares de calidad en plataformas de recaudación tributaria (SIN) y contrataciones estatales (SICOES).
- **Resiliencia de Infraestructura:** Detección de puntos únicos de fallo en centros de datos nacionales.
- **Transparencia Activa:** Indicador independiente del funcionamiento continuo de los canales digitales de atención a la ciudadanía.
