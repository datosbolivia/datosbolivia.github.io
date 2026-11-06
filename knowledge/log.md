# Bitácora de Datos y Conocimiento (OKF / ODKF)

## 2026-11-06
- Normalización de identificadores técnicos (`name`) a formato canónico snake_case en `air_quality/datapackage.yml` (`calidad_aire`), `universities-institutes/datapackage.yaml` (`universidades_carreras`, `institutos_carreras`) y en los 5 recursos tabulares internos de `censo-2024/datapackage.yaml` (`preresultados`, `personas`, `vivienda`, `emigracion`, `mortalidad`), preservando títulos descriptivos en `title`.
- Sustitución de enlaces web `github.com/.../blob/...` por endpoints de descarga directa `raw.githubusercontent.com/...` con esquema `https` en `oil_stations/datapackage.yaml`.

## 2026-11-05
- Asignación de identificadores canónicos de recurso (`name: *_zip`) a los contenedores comprimidos en `knowledge/nodes/censo-2024/datapackage.yaml` (`preresultados_zip`, `personas_municipios_zip`, `vivienda_municipios_zip`, `emigracion_zip`, `mortalidad_zip`) para cumplimiento estricto con especificaciones Frictionless y OKF v0.2.
- Normalización del tipo documental de contexto a `type: guide` en los nodos `air_quality`, `financial_entities`, `oil_stations` y `universities-institutes`, garantizando conformidad con la taxonomía normativa ODKF v0.2.
