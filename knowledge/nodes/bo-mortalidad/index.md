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

## Dimensiones de Análisis

- **Demografía de Mortalidad**: Monitoreo de sobremortalidad durante periodos críticos (pandemia COVID-19, olas de frío o calor).
- **Subregistro y Calidad del Dato**: Comparativa entre la fecha del suceso biológico y la fecha del asentamiento administrativo en el registro civil.

