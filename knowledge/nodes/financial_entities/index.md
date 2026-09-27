---
type: dataset
title: Financial Entities
contracts:
  - type: datapackage
    path: ./datapackage.yaml
---

# financial_entities

---

type: DuckDB Table
title: "Entidades Financieras"
description: "Registros de puntos de atención y entidades financieras (sucursales, cajeros automáticos, etc.) en Bolivia."
resource: data/financial_entities/financial_entities_places.csv
tags: [finanzas, bancos, sucursales, cajeros, bolivia, paf]
timestamp: 2026-06-27T00:28:00Z

---

# Schema

| Column              | Type     | Description                                                           |
| ------------------- | -------- | --------------------------------------------------------------------- |
| `codigoPAF`         | INTEGER  | Código del Punto de Atención Financiera                               |
| `numeroSucursal`    | INTEGER  | Número de sucursal                                                    |
| `codigoEntidad`     | INTEGER  | Código de la entidad financiera                                       |
| `entidad`           | STRING   | Nombre de la entidad financiera (ej. Banco Mercantil Santa Cruz S.A.) |
| `fechaModificacion` | DATETIME | Fecha y hora de modificación del registro                             |
| `estado`            | BOOLEAN  | Estado activo o inactivo del registro                                 |
| `latitud`           | NUMBER   | Latitud geográfica de la ubicación                                    |
| `longitud`          | NUMBER   | Longitud geográfica de la ubicación                                   |
| `contenidoHTML`     | STRING   | Contenido HTML con el detalle y horarios de atención                  |
| `tipoPAF`           | STRING   | Tipo de Punto de Atención Financiera (ej. S: Sucursal, C: Cajero)     |
| `departamento`      | STRING   | Nombre del departamento (ej. Chuquisaca)                              |
| `centidadTipo`      | INTEGER  | Código de tipo de entidad                                             |
| `desGrupo`          | STRING   | Descripción del grupo (ej. Oficina Externa, Cajero Automático)        |
| `tdescripcion`      | STRING   | Descripción específica del tipo de oficina o punto de atención        |
| `cgrupo`            | STRING   | Código del grupo (ej. OE, CA, AF, SU)                                 |
| `tentidadSigla`     | STRING   | Sigla de la entidad financiera (ej. BME, BNB)                         |
| `ctipoSucursal`     | STRING   | Código de tipo de sucursal                                            |
| `cod_departamento`  | INTEGER  | Código numérico del departamento                                      |
| `cod_entidad`       | INTEGER  | Código numérico alternativo de la entidad                             |

# Uso Analítico

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
  "colors": ["#059669"],
  "questions": [
    "¿Cuál departamento tiene más cobertura financiera en Bolivia?",
    "¿Cómo compara la bancarización de Beni vs Santa Cruz?",
    "¿Qué regiones de Bolivia tienen menor acceso a servicios financieros?"
  ]
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
  "colors": ["#2563eb", "#059669", "#d97706", "#dc2626", "#7c3aed", "#0891b2", "#ec4899", "#475569"],
  "questions": [
    "¿Qué tipo de punto de atención financiera predomina en Bolivia?",
    "¿Cuántos cajeros automáticos hay en Bolivia?",
    "¿Están bien distribuidos los agentes bancarios?"
  ]
}
```
