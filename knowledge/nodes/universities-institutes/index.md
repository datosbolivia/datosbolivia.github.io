---
type: dataset
title: "Catálogo de Universidades, Sedes y Carreras"
description: "Catálogo completo de universidades e institutos, con el detalle de sus respectivas sedes, carreras ofertadas y plazas disponibles."
contracts:
  - type: datapackage
    path: ./datapackage.yaml
---

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
  "colors": ["#2563eb"]
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
  "colors": ["#059669"]
}
```
