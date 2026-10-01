---
type: dataset
title: Reservas Internacionales y Reportes Semanales del BCB
dimensions:
- fecha
- tipo_reserva
- categoria
- variable
contracts:
- type: datapackage
  path: ./datapackage.yaml
lineage:
  source:
  - url: https://github.com/mauforonda/bcb_semanal
  version: 1.0.0
  updated_at: '2026-09-11T00:00:00Z'
---

# Reservas Internacionales y Reportes Semanales del Banco Central de Bolivia

Monitoreo semanal estandarizado de la posición financiera y monetaria del Banco Central de Bolivia (BCB), enfocado en la evolución histórica de las Reservas Internacionales Netas (RIN), emisión de circulante y encaje legal bancario.

## Contexto y Estructura Monetaria

Las Reservas Internacionales Netas (RIN) reflejan los activos externos de disponibilidad inmediata con los que cuenta el Estado para respaldar la estabilidad del boliviano (BOB), atender el servicio de la deuda externa y financiar requerimientos estratégicos de importación de combustibles y bienes de capital.

El balance semanal del BCB clasifica las reservas en tres pilares esenciales:
1. **Divisas Líquidas:** Moneda extranjera convertible (dólares estadounidenses, euros y otras divisas en cuentas corresponsales).
2. **Oro Físico:** Tenencias de oro monetario valorizadas a cotización internacional de mercado.
3. **Derechos Especiales de Giro (DEG):** Activos de reserva internacionales creados por el Fondo Monetario Internacional (FMI).

```ojs
const resourceUrl = dataset.resources?.[0]?.path;
const data = await datamesh.query({
  resource_uri: resourceUrl || "bcb-semanal:bcb_reservas",
  limit: 250
});

const fechaIdx = data.columns.indexOf("fecha");
const tipoIdx = data.columns.indexOf("tipo");
const valorIdx = data.columns.indexOf("valor");

const formatted = data.rows.map(r => ({
  fecha: new Date(r[fechaIdx]),
  tipo: r[tipoIdx] || "General",
  valor: parseFloat(r[valorIdx]) || 0
})).filter(d => !isNaN(d.valor) && d.fecha instanceof Date && !isNaN(d.fecha.getTime()));

return Plot.plot({
  title: "Evolución de Componentes de Reservas Internacionales (RIN)",
  subtitle: "Valores expresados en millones de dólares estadounidenses (USD)",
  x: { label: "Fecha de Reporte" },
  y: { label: "Millones USD", grid: true },
  color: { scheme: "tableau10", legend: true },
  marks: [
    Plot.lineY(formatted, {
      x: "fecha",
      y: "valor",
      stroke: "tipo",
      strokeWidth: 2
    }),
    Plot.dot(formatted, {
      x: "fecha",
      y: "valor",
      stroke: "tipo",
      fill: "var(--color-surface, #ffffff)",
      r: 3
    })
  ]
});
```

## Valor para Modelos Macroeconómicos

- **Liquidez Externa:** Análisis de la capacidad de cobertura de meses de importaciones frente a shocks de comercio exterior.
- **Transmisión de Política Monetaria:** Correlación entre variaciones del encaje legal bancario en moneda extranjera y el ritmo de monetización del oro.
- **Interoperabilidad:** Acceso programático para economistas, analistas de riesgo soberano y agentes inteligentes vía `@datosbolivia/datamesh-client`.
