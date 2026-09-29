---
type: dataset
title: "Entidades Financieras"
description: "Registros de puntos de atención y entidades financieras (sucursales, cajeros automáticos, etc.) en Bolivia."
contracts:
  - type: datapackage
    path: ./datapackage.yaml
---

Este dataset contiene información geoespacial de puntos de interés: cada fila representa una sucursal, agencia, corresponsal o cajero automático de una entidad financiera.

- **Análisis espacial**: Visualizar la distribución de los puntos de atención financiera en un mapa interactivo. Agrupar por `entidad`, `tipoPAF` y `departamento`.
- **Análisis descriptivo**: Conocer la concentración de sucursales y cajeros automáticos por banco o por ubicación geográfica.
- **Cruce de datos**: Se puede integrar con datos demográficos, densidad poblacional o comerciales para evaluar la inclusión o cobertura financiera por zona.
- **Dashboard recomendado**: Mapa de puntos de interés (POIs) interactivo con filtros por entidad financiera (`entidad`), departamento (`departamento`), y grupo de atención (`desGrupo`).

---

# Gráficos del Dataset

```chart
{
  "type": "bar",
  "title": "Puntos de Atención Financiera por Departamento",
  "subtitle": "Distribución de sucursales, cajeros y agencias por departamento — indicador de inclusión financiera",
  "source": "ASFI — Autoridad de Supervisión del Sistema Financiero",
  "sql": "SELECT departamento, COUNT(*) AS total_puntos FROM financial_entities_financial_entities_places WHERE departamento IS NOT NULL GROUP BY departamento ORDER BY total_puntos DESC",
  "xKey": "departamento",
  "yKeys": ["total_puntos"],
  "colors": ["#059669"]
}
```

```chart
{
  "type": "pie",
  "title": "Tipos de Puntos de Atención Financiera",
  "subtitle": "Distribución porcentual por tipo de PAF en Bolivia",
  "source": "ASFI — Autoridad de Supervisión del Sistema Financiero",
  "sql": "SELECT desGrupo AS tipo, COUNT(*) AS cantidad FROM financial_entities_financial_entities_places WHERE desGrupo IS NOT NULL GROUP BY desGrupo ORDER BY cantidad DESC LIMIT 8",
  "xKey": "tipo",
  "yKeys": ["cantidad"],
  "colors": ["#2563eb", "#059669", "#d97706", "#dc2626", "#7c3aed", "#0891b2", "#ec4899", "#475569"]
}
```
