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

## Valor Analítico

- Detección de la brecha cambiaria real entre el tipo de cambio oficial del BCB y el mercado paralelo digital.
- Medición de la liquidez disponible por entidad financiera y método de transferencia local.

