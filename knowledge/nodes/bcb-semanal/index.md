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

## Variables Principales

- **Reservas Internacionales Netas (RIN)**: Composición granular en divisas líquidas, barras de oro y Derechos Especiales de Giro (DEG).
- **Indicadores Monetarios**: Base monetaria, depósitos del sistema bancario, liquidez del sistema financiero y créditos al sector público.

## Valor para Modelos Macroeconómicos

- Seguimiento de la sostenibilidad cambiaria y liquidez externa de la economía boliviana.
- Integración directa con DuckDB y paneles de visualización financiera.

