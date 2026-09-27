---
type: dataset
title: Despacho de Carga y Operación Eléctrica Nacional (CNDC)
dimensions:
- fecha
- agente
- area
- cat
contracts:
- type: datapackage
  path: ./datapackage.yaml
lineage:
  source:
  - url: https://github.com/datosbolivia/despacho_de_carga
  version: 1.0.0
  updated_at: '2026-09-11T00:00:00Z'
---

# Despacho de Carga y Operación Eléctrica Nacional (CNDC)

Datos operativos generados por el Comité Nacional de Despacho de Carga (CNDC), entidad responsable de coordinar la operación en tiempo real del Sistema Interconectado Nacional (SIN) de Bolivia.

## Contenido

- **Eventos Mayores**: Contingencias de gran magnitud que comprometen la estabilidad del sistema o provocan cortes masivos de suministro eléctrico.
- **Fallas Operativas**: Fallas en líneas de alta tensión, subestaciones y plantas de generación térmica, hidroeléctrica y renovable.
- **Mantenimientos y Restricciones**: Programación y ejecución de intervenciones técnicas en la red nacional.

## Uso Analítico

- Monitoreo de confiabilidad del sistema eléctrico nacional y detección temprana de cuellos de botella de transmisión.
- Cruce de eventos con variables meteorológicas extremas (vientos, tormentas, descargas atmosféricas).

