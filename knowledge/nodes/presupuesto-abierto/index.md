---
type: dataset
title: Presupuesto Público del Estado Boliviano (MEFP)
dimensions:
- gestion
- entidad
- actividad
- devengado
- fuente_financiamiento
contracts:
- type: datapackage
  path: ./datapackage.yaml
lineage:
  source:
  - url: https://abierto.economiayfinanzas.gob.bo/
  version: 1.0.0
  updated_at: '2026-09-29T00:00:00Z'
---

# Presupuesto Público del Estado Boliviano (MEFP)

Información histórica exhaustiva de ingresos y gastos de todo el sector público boliviano (2016-2025), consolidada a partir del Sistema Integrado de Gestión Pública (SIGEP) del Ministerio de Economía y Finanzas Públicas.

## Contexto y Estructura Fiscal

El Presupuesto General del Estado (PGE) abarca la totalidad de entidades que componen la estructura estatal plurinacional:
1. **Administración Central:** Ministerios, viceministerios y desconcentradas.
2. **Entidades Territoriales Autónomas (ETAs):** Gobiernos Autónomos Departamentales (GADs), Gobiernos Autónomos Municipales (GAMs) y Autonomías Indígena Originario Campesinas (AIOCs).
3. **Universidades Públicas:** Sistema universitario autónomo boliviano.
4. **Empresas Públicas Nacionales Estratégicas (EPNEs):** YPFB, ENDE, Entel, Comibol, Boa, entre otras.

La ejecución presupuestaria se desglosa en **Presupuesto Aprobado**, **Presupuesto Vigente**, **Comprometido**, **Devengado** y **Pagado**.

```ojs
const resourceUrl = dataset.resources?.[0]?.path;
const data = await datamesh.query({
  resource_uri: resourceUrl || "presupuesto-abierto:gasto",
  limit: 200
});

const entidadIdx = data.columns.findIndex(c => /(entidad|institucion|desc_entidad)/i.test(c));
const devengadoIdx = data.columns.findIndex(c => /(devengado|monto|presupuesto|ejecutado)/i.test(c));

const rows = data.rows.map(r => ({
  entidad: entidadIdx !== -1 ? r[entidadIdx] : "Entidad Estatal",
  devengado: devengadoIdx !== -1 ? (parseFloat(r[devengadoIdx]) || 1) : 1
})).slice(0, 15);

return Plot.plot({
  title: "Ejecución Presupuestaria por Entidad del Estado",
  subtitle: "Distribución del gasto devengado en millones de bolivianos",
  marginLeft: 140,
  marginRight: 40,
  marks: [
    Plot.barX(rows, {
      y: "entidad",
      x: "devengado",
      fill: "var(--color-primary, #0284c7)",
      sort: { y: "-x" }
    }),
    Plot.ruleX([0])
  ]
});
```

## Valor para la Transparencia y Rendición de Cuentas

- **Fiscalización Ciudadana:** Seguimiento granular de proyectos de inversión pública y programas sociales en más de 2.500 categorías estandarizadas de gasto.
- **Eficiencia en la Ejecución:** Medición de las brechas de subejecución presupuestaria al cierre de cada gestión fiscal entre ministerios y municipios.
- **Estructura del Financiamiento:** Desglose de ingresos fiscales por recaudación tributaria (Impuesto a las Transacciones, IVA, IUE), Regalías Petrolíferas / IDH y Créditos Externos.
