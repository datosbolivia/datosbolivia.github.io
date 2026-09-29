---
type: DuckDB Table
title: "Entidades Financieras"
description: "Registros de puntos de atención y entidades financieras (sucursales, cajeros automáticos, etc.) en Bolivia."
resource: data/financial_entities/financial_entities_places.csv
tags: [finanzas, bancos, sucursales, cajeros, bolivia, paf]
timestamp: 2026-06-27T00:28:00Z
---

Este dataset contiene información geoespacial de puntos de interés: cada fila representa una sucursal, agencia, corresponsal o cajero automático de una entidad financiera.

- **Análisis espacial**: Visualizar la distribución de los puntos de atención financiera en un mapa interactivo. Agrupar por `entidad`, `tipoPAF` y `departamento`.
- **Análisis descriptivo**: Conocer la concentración de sucursales y cajeros automáticos por banco o por ubicación geográfica.
- **Cruce de datos**: Se puede integrar con datos demográficos, densidad poblacional o comerciales para evaluar la inclusión o cobertura financiera por zona.
- **Dashboard recomendado**: Mapa de puntos de interés (POIs) interactivo con filtros por entidad financiera (`entidad`), departamento (`departamento`), y grupo de atención (`desGrupo`).
