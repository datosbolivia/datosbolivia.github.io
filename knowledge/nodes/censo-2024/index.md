---
type: dataset
title: "Censo de Población y Vivienda Bolivia 2024"
description: "Microdatos oficiales y resultados preliminares del Censo de Población y Vivienda 2024 (CPV 2024) de Bolivia recopilados por el Instituto Nacional de Estadística (INE), estructurados en formato abierto OKF / Frictionless."
contracts:
  - type: datapackage
    path: ./datapackage.yaml
lineage:
  source:
    - url: "https://github.com/datosbolivia/censos/releases/tag/CPV2024_personas_v1.0.0"
      title: "Releases CPV2024 en Datos Bolivia"
    - url: "https://censos.ine.gob.bo/"
      title: "Portal Oficial del Censo - Instituto Nacional de Estadística (INE)"
  version: "1.0.0"
  updated_at: "2026-03-31"
---

El **Censo de Población y Vivienda 2024 (CPV 2024)** es la operación estadística nacional más importante de Bolivia en la década, ejecutada por el Instituto Nacional de Estadística (INE). Este nodo federado expone los microdatos completos y el conteo poblacional preliminar organizados en 5 tablas estandarizadas y validadas con el Formato de Conocimiento Abierto (OKF v0.2).

## Recursos de Datos Disponibles

1. **Base de Datos del Conteo del Censo de Población y Vivienda 2024 (`preresultados.csv`)**:
   - Conteo preliminar de población a nivel nacional, departamental y municipal.
   - Variables clave: `CODIGO`, `TIPO`, `POB`.

2. **Base de Datos de Personas (`municipio/persona-municipio-*.csv`)**:
   - Microdatos individuales a nivel municipal con 118 variables sociodemográficas.
   - Dimensiones: edad, sexo, parentesco, educación alcanzada, ocupación, actividad económica, idiomas hablados, cobertura en salud y autoidentificación con naciones y pueblos indígena originario campesinos (NPIOC).

3. **Base de Datos de Vivienda (`municipio/vivienda-municipio-*.csv`)**:
   - Características de viviendas particulares y colectivas con 48 variables.
   - Dimensiones: tipo de vivienda, condición de ocupación, materiales de paredes, techos y pisos, acceso a agua potable, red de saneamiento, energía eléctrica, gas por cañería, combustible para cocinar y equipamiento del hogar.

4. **Base de Datos de Emigración (`emigracion.csv`)**:
   - Registro de personas que salieron del país en el periodo intercensal.
   - Variables: departamento, provincia, municipio de origen, sexo, año de salida, edad al emigrar y país de destino.

5. **Base de Datos de Mortalidad (`mortalidad.csv`)**:
   - Fallecimientos ocurridos en los hogares en los últimos años.
   - Variables: departamento, provincia, municipio, mes y año de defunción, edad al fallecer, sexo y causas asociadas (incluyendo atención durante el parto y COVID-19).

## Consultas Analíticas con DataMesh

Todos los recursos se encuentran empaquetados en contenedores ZIP de compresión columnar y pueden consultarse directamente en memoria con DuckDB o a través del daemon soberano MCP:

```bash
# Conteo poblacional por departamento
datamesh sql "SELECT * FROM 'censo-2024:Base de Datos del Conteo del Censo de Población y Vivienda 2024' LIMIT 10"

# Consulta de distribución demográfica de personas
datamesh sql "SELECT P25_SEXO, COUNT(*) AS total FROM 'censo-2024:Base de Datos de Personas del Censo de Población y Vivienda 2024' GROUP BY P25_SEXO"
```
