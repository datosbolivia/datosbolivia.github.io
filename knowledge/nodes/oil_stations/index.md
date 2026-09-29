---
type: dataset
title: "Estaciones de Gasolina"
description: "Registros de estaciones de gasolina en el Bolivia."
contracts:
  - type: datapackage
    path: ./datapackage.yaml
---

Este dataset es geoespacial de eventos: cada fila es una alerta con su zona de cobertura como polígono.

- **Análisis espacial**: Visualizar polígonos de alerta en mapa interactivo. Agrupar por atributos categóricos (tipo de alerta, departamento).
- **Análisis temporal**: Si hay columna de fecha, agrupar por mes para ver frecuencia de alertas.
- **Cruce de datos**: Correlacionar con calidad del aire por fecha para estudiar impacto de eventos climáticos en contaminación.
- **Dashboard recomendado**: Mapa de polígonos de alertas + Barras por tipo de alerta + Línea de frecuencia mensual.


```chart
{
  "type": "bar",
  "title": "Estaciones de Combustible por Departamento",
  "subtitle": "Distribución de puntos de venta de combustible por departamento (id_departamento)",
  "source": "ANH — Agencia Nacional de Hidrocarburos vía DataMesh",
  "sql": "SELECT CASE id_departamento WHEN 1 THEN 'Chuquisaca' WHEN 2 THEN 'La Paz' WHEN 3 THEN 'Cochabamba' WHEN 4 THEN 'Oruro' WHEN 5 THEN 'Potosí' WHEN 6 THEN 'Tarija' WHEN 7 THEN 'Santa Cruz' WHEN 8 THEN 'Beni' WHEN 9 THEN 'Pando' ELSE 'Otro' END AS departamento, COUNT(*) AS estaciones FROM oil_stations_stations GROUP BY id_departamento ORDER BY estaciones DESC",
  "xKey": "departamento",
  "yKeys": ["estaciones"],
  "colors": ["#d97706"]
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
  "colors": ["#2563eb", "#059669"]
}
```
