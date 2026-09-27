---
type: dataset
title: Oil Stations
contracts:
  - type: datapackage
    path: ./datapackage.yaml
---

# oil_stations

---

type: DuckDB Table
title: "Estaciones de Gasolina"
description: "Registros de estaciones de gasolina en el Perú."
resource: data/oil_stations/stations.csv
tags: [petroleo, gasolina, estaciones]
timestamp: 2026-06-27T02:00:00Z

---

# Schema

| Column            | Type    | Description                             |
| ----------------- | ------- | --------------------------------------- |
| `id_eess_saldo`   | INTEGER | ID de la estación de combustible        |
| `id_entidad`      | INTEGER | ID de la entidad                        |
| `latitud`         | FLOAT   | Latitud de la estación de combustible   |
| `longitud`        | FLOAT   | Longitud de la estación de combustible  |
| `nombreEstacion`  | STRING  | Nombre de la estación de combustible    |
| `direccion`       | STRING  | Dirección de la estación de combustible |
| `id_departamento` | INTEGER | ID del departamento                     |

# Uso Analítico

Este dataset es geoespacial de eventos: cada fila es una alerta con su zona de cobertura como polígono.

- **Análisis espacial**: Visualizar polígonos de alerta en mapa interactivo. Agrupar por atributos categóricos (tipo de alerta, departamento).
- **Análisis temporal**: Si hay columna de fecha, agrupar por mes para ver frecuencia de alertas.
- **Cruce de datos**: Correlacionar con [calidad del aire](/tables/air_quality_air_quality.md) por fecha para estudiar impacto de eventos climáticos en contaminación.
- **Dashboard recomendado**: Mapa de polígonos de alertas + Barras por tipo de alerta + Línea de frecuencia mensual.

---

# Gráficos del Dataset

```chart
{
  "type": "bar",
  "title": "Estaciones de Combustible por Departamento",
  "subtitle": "Distribución de puntos de venta de combustible por departamento (id_departamento)",
  "source": "ANH — Agencia Nacional de Hidrocarburos vía DataMesh",
  "sql": "SELECT CASE id_departamento WHEN 1 THEN 'Chuquisaca' WHEN 2 THEN 'La Paz' WHEN 3 THEN 'Cochabamba' WHEN 4 THEN 'Oruro' WHEN 5 THEN 'Potosí' WHEN 6 THEN 'Tarija' WHEN 7 THEN 'Santa Cruz' WHEN 8 THEN 'Beni' WHEN 9 THEN 'Pando' ELSE 'Otro' END AS departamento, COUNT(*) AS estaciones FROM oil_stations_stations GROUP BY id_departamento ORDER BY estaciones DESC",
  "xKey": "departamento",
  "yKeys": ["estaciones"],
  "colors": ["#d97706"],
  "questions": [
    "¿Cuál departamento tiene más estaciones de combustible en Bolivia?",
    "¿Existe acceso equitativo a combustible en el país?",
    "¿Cuántas estaciones de servicio hay en La Paz?"
  ]
}
```

```chart
{
  "type": "bar",
  "title": "Disponibilidad de Combustible (Octano y BSA)",
  "subtitle": "Saldo promedio de combustible (octano y BSA) por punto de venta",
  "source": "ANH — Agencia Nacional de Hidrocarburos vía DataMesh",
  "sql": "SELECT id_eess, ROUND(AVG(saldo_octano), 0) AS octano, ROUND(AVG(saldo_bsa), 0) AS bsa FROM oil_stations_supply WHERE saldo_octano > 0 GROUP BY id_eess ORDER BY octano DESC LIMIT 15",
  "xKey": "id_eess",
  "yKeys": ["octano", "bsa"],
  "colors": ["#2563eb", "#059669"],
  "questions": [
    "¿Qué estaciones tienen mayor disponibilidad de combustible?",
    "¿Existe escasez de gasolina en Bolivia?",
    "¿Cómo varía el stock de combustible entre estaciones?"
  ]
}
```
