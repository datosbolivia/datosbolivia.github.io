---
type: dataset
title: Mercado Cambiario P2P BOB / USDT (Binance Bolivia)
dimensions:
- timestamp
- advertiser_usertype
- source
contracts:
- type: datapackage
  path: ./datapackage.yaml
lineage:
  source:
  - url: https://github.com/andres-chirinos/p2p-bob-exchange
  version: 1.0.0
  updated_at: '2026-09-11T00:00:00Z'
---

# Mercado Cambiario P2P BOB / USDT (Binance Bolivia)

Pipeline ETL y series históricas continuas sobre el mercado cambiario libre y cotizaciones de criptoactivos estables (USDT cotizado en Bolivianos BOB), capturadas de libros de órdenes P2P.

## Contexto del Mercado Cambiario Paralelo Digital

A partir de las restricciones de liquidez física de dólares estadounidenses en el sistema bancario boliviano desde 2023, las plataformas P2P (Peer-to-Peer) de criptoactivos estables como Tether (USDT) se convirtieron en el termómetro predilecto para medir la cotización libre del tipo de cambio efectivo.

Este conjunto de datos recopila de forma automatizada las órdenes de compra y venta publicadas por comerciantes verificados y usuarios particulares, detallando:
- **Volumen Operativo:** Cantidad de órdenes completadas en los últimos 30 días.
- **Tasa de Cumplimiento (%):** Porcentaje de transacciones finalizadas exitosamente sin arbitraje.
- **Reputación:** Calificaciones positivas y antigüedad de los operadores en el mercado cambiario.

```ojs
const resourceUrl = dataset.resources?.[0]?.path;
const data = await datamesh.query({
  resource_uri: resourceUrl || "p2p-bob-exchange:advertiser",
  limit: 200
});

const nickIdx = data.columns.indexOf("advertiser_nickname");
const ordersIdx = data.columns.indexOf("advertiser_monthordercount");
const finishIdx = data.columns.indexOf("advertiser_monthfinishrate");

const rows = data.rows.map(r => ({
  comerciante: r[nickIdx] || "Anonimo",
  ordenes: parseFloat(r[ordersIdx]) || 1,
  cumplimiento: parseFloat(r[finishIdx]) || 90
})).sort((a, b) => b.ordenes - a.ordenes).slice(0, 15);

return Plot.plot({
  title: "Top Comerciantes Cambiarios P2P BOB / USDT",
  subtitle: "Volumen de órdenes ejecutadas en los últimos 30 días",
  marginLeft: 130,
  marginRight: 40,
  marks: [
    Plot.barX(rows, {
      y: "comerciante",
      x: "ordenes",
      fill: "var(--color-primary, #0284c7)",
      sort: { y: "-x" }
    }),
    Plot.ruleX([0])
  ]
});
```

## Valor para Modelos Financieros y Riesgo Cambiario

- **Estimación de la Brecha Cambiaria:** Medición objetiva del diferencial porcentual entre el tipo de cambio oficial fijado por el BCB (6.96 Bs/USD) y el mercado P2P.
- **Liquidez Bancaria Local:** Identificación de los bancos comerciales con mayor volumen de transferencias inmediatas vía QR y Simple.
- **Detección de Spreads:** Análisis del margen entre precios de compra (Bid) y precios de venta (Ask) en momentos de alta volatilidad macroeconómica.
