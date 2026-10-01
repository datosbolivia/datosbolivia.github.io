---
type: dataset
title: Casos de Delitos de la Fiscalía General del Estado (Bolivia)
dimensions:
- departamento
- municipio
- delito
- robo_modalidad
- year
contracts:
- type: datapackage
  path: ./datapackage.yaml
lineage:
  source:
  - url: https://portales.mp.gob.bo
  version: 1.0.0
  updated_at: '2026-09-11T00:00:00Z'
---

# Casos de Delitos Registrados por el Ministerio Público (Fiscalía General del Estado)

Registro estructurado de denuncias penales y casos abiertos por el Ministerio Público de Bolivia a través del sistema JL2 / Ecosistema Justicia Libre, con enfoque en delitos patrimoniales (robo, hurto, abigeato y despojo) y modalidades de comisión.

## Contexto y Sistema de Información Penal

El Ministerio Público centraliza las denuncias penales a nivel nacional mediante el sistema informático Justicia Libre, clasificando cada hecho según el Código Penal boliviano, el departamento de ocurrencia, la franja horaria, el modus operandi y la caracterización de las víctimas.

Este dataset permite el análisis criminológico territorial, identificando patrones de criminalidad urbana y rural, modalidades emergentes de sustracción y la eficacia del registro procesal formal.

```ojs
const resourceUrl = dataset.resources?.[0]?.path;
const data = await datamesh.query({
  resource_uri: resourceUrl || "delitos-fiscalia:delitos-robos",
  limit: 200
});

const deptoIdx = data.columns.indexOf("hecho_departamento");
const modalidadIdx = data.columns.indexOf("robo_modalidad");

const rows = data.rows.map(r => ({
  departamento: r[deptoIdx] || "Sin dato",
  modalidad: r[modalidadIdx] || "No especificada"
})).filter(d => d.departamento !== "Sin dato");

return Plot.plot({
  title: "Denuncias Penales por Departamento",
  subtitle: "Muestra de casos penales (Fiscalía General del Estado)",
  marginLeft: 120,
  marginRight: 40,
  marks: [
    Plot.barX(rows, Plot.groupY({ x: "count" }, {
      y: "departamento",
      fill: "var(--color-primary, #0284c7)",
      sort: { y: "-x" }
    })),
    Plot.ruleX([0])
  ]
});
```

## Líneas de Investigación Criminológica

- **Patrones Espacio-Temporales:** Identificación de hotspots urbanos y franjas horarias de mayor incidencia de delitos patrimoniales.
- **Modalidades de Comisión:** Tendencias de robo agravado con violencia frente a hurtos sin uso de fuerza.
- **Perfil de Víctimas y Bienes:** Caracterización por edad y sexo de las personas denunciantes, así como tipos de bienes sustraídos de mayor frecuencia.
