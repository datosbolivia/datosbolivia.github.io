---
type: dataset
title: Universities and Institutes
contracts:
  - type: datapackage
    path: ./datapackage.yaml
---

# Universities and Institutes

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

---

# Gráficos del Dataset

```chart
{
  "type": "bar",
  "title": "Universidades con Mayor Oferta de Carreras en Bolivia",
  "subtitle": "Número de carreras registradas por universidad en el catálogo oficial",
  "source": "Ministerio de Educación de Bolivia vía DataMesh",
  "sql": "SELECT \"UNIVERSIDAD\", COUNT(DISTINCT \"CARRERA ASIGNADA\") AS carreras FROM universities_institutes_universidades_y_carreras GROUP BY \"UNIVERSIDAD\" ORDER BY carreras DESC LIMIT 12",
  "xKey": "UNIVERSIDAD",
  "yKeys": ["carreras"],
  "colors": ["#2563eb"],
  "questions": [
    "¿Cuál universidad ofrece más carreras en Bolivia?",
    "¿Cuántas carreras de ingeniería existen en Bolivia?",
    "¿Qué universidad privada tiene mayor oferta académica?"
  ]
}
```

```chart
{
  "type": "bar",
  "title": "Total de Plazas Disponibles por Universidad",
  "subtitle": "Capacidad total de admisión por institución universitaria",
  "source": "Ministerio de Educación de Bolivia vía DataMesh",
  "sql": "SELECT \"UNIVERSIDAD\", SUM(\"PLAZAS DISPONIBLES\") AS plazas FROM universities_institutes_universidades_y_carreras WHERE \"PLAZAS DISPONIBLES\" IS NOT NULL GROUP BY \"UNIVERSIDAD\" ORDER BY plazas DESC LIMIT 12",
  "xKey": "UNIVERSIDAD",
  "yKeys": ["plazas"],
  "colors": ["#059669"],
  "questions": [
    "¿Cuántas plazas universitarias existen en Bolivia?",
    "¿Qué universidad pública tiene más capacidad de admisión?",
    "¿Existe suficiente oferta universitaria para la demanda estudiantil?"
  ]
}
```
