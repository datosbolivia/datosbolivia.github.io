---
type: dataset
title: Red de Estaciones Meteorológicas de Bolivia (SENAMHI)
dimensions:
- nameDepartment
- nameMunicipality
- nameBasin
- macroregion
- stationType
contracts:
- type: datapackage
  path: ./datapackage.yaml
lineage:
  source:
  - url: https://github.com/sociedatos/bo-meteorologia
  version: 1.0.0
  updated_at: '2026-09-11T00:00:00Z'
---

# Red de Estaciones Meteorológicas de Bolivia (SENAMHI)

Catálogo y red nacional de estaciones meteorológicas operadas y coordinadas por el Servicio Nacional de Meteorología e Hidrología (SENAMHI), recopiladas y estandarizadas por Sociedatos.

## Dimensiones y Cobertura

- **Distribución Geoespacial**: Coordenadas geográficas, pisos altitudinales y cuencas hidrográficas de las tres macroregiones de Bolivia (Altiplano, Valles, Amazonía/Chaco).
- **Tipología y Equipamiento**: Clasificación entre estaciones convencionales con lecturas manuales y estaciones automáticas de transmisión telemétrica.

## Aplicaciones

- Monitoreo de sequías, heladas, inundaciones y anomalías de precipitación.
- Modelado hidrológico y calibración de sensores satelitales en cuencas andinas y amazónicas.

