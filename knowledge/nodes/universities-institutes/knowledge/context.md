---
type: DuckDB Table
title: "Catálogo de Universidades, Sedes y Carreras"
description: "Catálogo completo de universidades e institutos, con el detalle de sus respectivas sedes, carreras ofertadas y plazas disponibles."
resource: data/universities-institutes/universities.csv
tags: [universidades, educacion, carreras, sedes, plazas, academia]
timestamp: 2026-07-13T00:00:00Z
---

# Schemas

## Universidades y Carreras

| Column | Type | Description |
|---|---|---|
| `UNI ID` | INTEGER | Identificador único de la universidad |
| `UNIVERSIDAD` | STRING | Nombre de la universidad o instituto |
| `SEDE ID` | INTEGER | Identificador único de la sede |
| `SEDE` | STRING | Nombre de la sede académica |
| `CARRERA ID` | INTEGER | Identificador único de la carrera |
| `CARRERA ASIGNADA` | STRING | Nombre de la carrera asignada |
| `PLAZAS DISPONIBLES` | INTEGER | Cantidad de plazas disponibles para la carrera |
| `page` | INTEGER | Número de página del documento original |
| `table_num` | INTEGER | Número de tabla dentro de la página del documento original |

## Institutos y Carreras

| Column | Type | Description |
|---|---|---|
| `INSTITUTO ID` | INTEGER | Identificador único del instituto |
| `INSTITUTO` | STRING | Nombre del instituto |
| `DEPARTAMENTO ID` | INTEGER | Identificador único del departamento |
| `DEPARTAMENTO` | STRING | Nombre del departamento geográfico |
| `CARRERA ID` | INTEGER | Identificador único de la carrera |
| `CARRERA ASIGNADA` | STRING | Nombre de la carrera asignada |
| `PLAZAS DISPONIBLES` | INTEGER | Cantidad de plazas disponibles para la carrera |
| `page` | INTEGER | Número de página del documento original |
| `table_num` | INTEGER | Número de tabla dentro de la página del documento original |

# Uso Analítico

Este dataset contiene información sobre la oferta académica a nivel universitario:

- **Análisis de cobertura académica**: Permite identificar qué carreras se ofrecen en qué sedes o regiones geográficas.
- **Análisis de capacidad**: Evaluación de la oferta de plazas (`PLAZAS DISPONIBLES`) agrupando por carreras o por universidad.
- **Cruce de datos**: Se puede integrar con datos demográficos o de demanda laboral para planificar y ajustar la oferta académica del país.
- **Dashboard recomendado**: Panel de control con filtros por Universidad y Sede, gráficos de barras de carreras con mayor/menor cantidad de plazas disponibles.
