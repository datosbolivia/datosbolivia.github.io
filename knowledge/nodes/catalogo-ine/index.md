---
type: dataset
title: Catálogo e Inventario Estadístico del INE Bolivia
dimensions:
- pagina
- tipo
- disponible
contracts:
- type: datapackage
  path: ./datapackage.yaml
lineage:
  source:
  - url: https://github.com/mauforonda/catalogo-ine
  version: 1.0.0
  updated_at: '2026-09-11T00:00:00Z'
---

# Catálogo e Inventario Estadístico del INE Bolivia

Inventario centralizado de todas las publicaciones periódicas, boletines sectoriales, balances de comercio exterior y cuadros estadísticos mantenidos por el Instituto Nacional de Estadística (INE).

## Contexto y Preservación Digital

El Instituto Nacional de Estadística (INE), como órgano rector del Sistema Nacional de Información Estadística (SNIE) bajo la Ley N° 1405, genera y difunde la producción cuantitativa oficial del Estado boliviano (cuentas nacionales, comercio exterior, demografía, empleo y censos).

Históricamente, gran parte de este acervo se ha publicado disperso en formatos propietarios (planillas XLS, reportes PDF o servidores temporales), lo que dificulta la indexación y trazabilidad a largo plazo. Este inventario sistematiza miles de recursos publicados, catalogando su temática, peso en kilobytes, formato y estado de disponibilidad en línea.

```ojs
const resourceUrl = dataset.resources?.[0]?.path;
const data = await datamesh.query({
  resource_uri: resourceUrl || "catalogo-ine:catalogo",
  limit: 250
});

const paginaIdx = data.columns.indexOf("pagina");
const tipoIdx = data.columns.indexOf("tipo");

const rows = data.rows.map(r => ({
  pagina: r[paginaIdx] || "General",
  tipo: (r[tipoIdx] || "Otros").toUpperCase()
})).filter(d => d.pagina && d.pagina !== "General");

return Plot.plot({
  title: "Publicaciones Estadísticas del INE por Sección Temática",
  subtitle: "Distribución del acervo documental e inventario estadístico",
  marginLeft: 140,
  marginRight: 40,
  marks: [
    Plot.barX(rows, Plot.groupY({ x: "count" }, {
      y: "pagina",
      fill: "var(--color-primary, #0284c7)",
      sort: { y: "-x" }
    })),
    Plot.ruleX([0])
  ]
});
```

## Relevancia para la Soberanía de Datos

- **Auditoría de Enlaces Rotos:** Detección sistemática de documentos estadísticos que desaparecen o cambian de ruta tras rediseños institucionales.
- **Transición a Datos Abiertos:** Evaluación de qué porcentaje del acervo se encuentra en formatos legibles por máquina (CSV/Parquet) versus formatos estáticos.
- **Acceso Soberano para Agentes:** Permite a modelos de lenguaje y sistemas analíticos consultar metadatos del INE sin depender de navegadores web lentos o interfaces con captcha.
