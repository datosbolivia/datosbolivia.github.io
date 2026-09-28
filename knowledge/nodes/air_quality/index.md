---
type: dataset
title: Calidad del Aire — Mediciones ICA
description: "Mediciones del Índice de Calidad del Aire (ICA) en estaciones de monitoreo, con coordenadas geográficas."
contracts:
  - type: datapackage
    path: ./datapackage.yml
---

# Uso Analítico

Este dataset es **espacio-temporal puntual**: cada fila es una medición en un lugar y momento específico.

- **Análisis temporal**: Agrupar por `DATE_TRUNC('day', fecha_hora_registro)` o `DATE_TRUNC('month', ...)`. Usar `AVG(valor_ica)` para tendencia diaria/mensual.
- **Análisis espacial**: Agrupar por `lugar_nombre`. Usar `AVG(valor_ica)` para comparar estaciones. Visualizar con mapa de puntos (`latitude`, `longitude`).
- **Dashboard recomendado**: Gráfico de línea temporal (x=fecha, y=AVG(valor_ica)) + Mapa de puntos por estación + Barras comparativas por estación.

# Joins

Puede cruzarse con [alertas SENAMHI](/tables/alerts_senamhi_alerts.md) por proximidad temporal (`fecha_hora_registro`) para correlacionar contaminación con eventos climáticos.

# Conceptos Relacionados (SKOS)

Este dataset está enriquecido semánticamente utilizando terminologías estándar y vocabularios controlados. Puedes explorar las definiciones formales y relaciones SKOS de las variables medidas en los siguientes documentos de concepto:

- [Índice de Calidad del Aire (ICA/AQI)](concepts/air_quality_index.md) - [Q2364111](https://www.wikidata.org/wiki/Q2364111)
- [Material Particulado 2.5 (PM2.5)](concepts/pm25.md) - [Q3243162](https://www.wikidata.org/wiki/Q3243162)

# Citations

[1] Escala ICA EPA — https://www.airnow.gov/aqi/aqi-basics/

---

# Gráficos del Dataset

```chart
{
  "type": "bar",
  "title": "ICA Promedio por Estación de Monitoreo",
  "subtitle": "Promedio del Índice de Calidad del Aire por punto de monitoreo — mayor = peor calidad",
  "source": "SENAMHI / Monica-SwissContact vía DataMesh Bolivia",
  "unit": "ICA",
  "sql": "SELECT lugar_nombre, ROUND(AVG(valor_ica), 1) AS promedio_ica FROM air_quality_compilaci_n_de_datos_de_calidad_del_aire_de_bolivia GROUP BY lugar_nombre ORDER BY promedio_ica DESC LIMIT 10",
  "xKey": "lugar_nombre",
  "yKeys": ["promedio_ica"],
  "colors": ["#dc2626"],
  "questions": [
    "¿Cuál ciudad de Bolivia tiene la peor calidad del aire y por qué?",
    "¿Cómo compara el ICA de Potosí con La Paz?",
    "¿Qué políticas han mejorado la calidad del aire en Bolivia?"
  ]
}
```

```chart
{
  "type": "area",
  "title": "Evolución Mensual del ICA — Promedio Nacional",
  "subtitle": "Tendencia del Índice de Calidad del Aire agregado por mes",
  "source": "SENAMHI / Monica-SwissContact vía DataMesh Bolivia",
  "unit": "ICA",
  "sql": "SELECT STRFTIME(CAST(fecha_hora_registro AS DATE), '%Y-%m') AS mes, ROUND(AVG(valor_ica), 1) AS promedio_ica, COUNT(*) AS mediciones FROM air_quality_compilaci_n_de_datos_de_calidad_del_aire_de_bolivia WHERE fecha_hora_registro IS NOT NULL GROUP BY mes ORDER BY mes LIMIT 24",
  "xKey": "mes",
  "yKeys": ["promedio_ica"],
  "colors": ["#2563eb"],
  "questions": [
    "¿En qué meses la calidad del aire es peor en Bolivia?",
    "¿La calidad del aire ha mejorado o empeorado en los últimos años?",
    "¿Existe estacionalidad en los niveles de ICA?"
  ]
}
```
