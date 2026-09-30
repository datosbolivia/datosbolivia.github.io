---
type: guide
title: "Guía de Instalación y Uso del SDK DataMesh"
description: "Manual de desarrollo para consultar catálogos federados mediante Python, TypeScript, CLI y servidor MCP."
timestamp: "2026-09-30T00:00:00Z"
category: guia
status: Activo
---

# Guía de Instalación y Uso del SDK DataMesh

El **SDK DataMesh** es una biblioteca soberana y descentralizada diseñada para interactuar con catálogos abiertos bajo el estándar **OKF / ODKF v0.2**. Proporciona una arquitectura hexagonal (Ports & Adapters) con núcleo analítico en **Go** y **DuckDB**, con enlaces nativos para **Python**, **TypeScript / Node.js**, una **CLI de línea de comandos** y un servidor **Model Context Protocol (MCP)** para agentes de inteligencia artificial.

Repositorio central: [https://github.com/datosbolivia/datamesh](https://github.com/datosbolivia/datamesh)

---

## 1. Instalación del SDK

### Opción A: Python (Recomendado para Ciencia de Datos y Análisis)

El paquete de Python incluye enlaces directos al motor analítico embebido y la herramienta de línea de comandos `datamesh`.

```bash
# Instalación directa desde el repositorio oficial
pip install git+https://github.com/datosbolivia/datamesh.git#subdirectory=bindings/python
```

Requisitos: Python 3.9 o superior.

### Opción B: TypeScript / JavaScript (Node.js & Navegadores)

Para aplicaciones web, scripts de automatización o integraciones frontend:

```bash
npm install @datosbolivia/datamesh-client
```

O utilizando Yarn / Pnpm:

```bash
pnpm add @datosbolivia/datamesh-client
```

### Opción C: Binario CLI en Go

Para entornos de servidor o scripts bash independientes sin dependencias de runtime:

```bash
# Descarga directa del binario compilado (Linux x86_64)
curl -L https://github.com/datosbolivia/datamesh/releases/latest/download/datamesh-linux-amd64 -o /usr/local/bin/datamesh
chmod +x /usr/local/bin/datamesh
```

---

## 2. Uso con Python

El SDK de Python permite consultar datasets federados en una sola línea utilizando sintaxis ANSI SQL sobre DuckDB.

### Descubrimiento de Nodos del Catálogo

```python
import datamesh as dm

# Descubrir datasets disponibles en la federación soberana
catalogo = dm.discover()

for nodo in catalogo.nodes:
    print(f"[{nodo.category}] {nodo.slug} - {nodo.title}")
    for recurso in nodo.resources:
        print(f"   -> {recurso.triad} ({recurso.format})")
```

### Consultas SQL en Memoria

Cualquier recurso se referencia mediante su **Tríada Canónica Universal**: `"catalogo:dataset:recurso"`. DuckDB descarga y cachea el archivo tabular de forma transparente:

```python
import datamesh as dm

# Consulta analítica con agregación y ordenamiento
query = """
SELECT 
    departamento, 
    COUNT(*) AS total_entidades
FROM 'bolivia:financial_entities:financial_entities_places'
WHERE departamento IS NOT NULL
GROUP BY departamento
ORDER BY total_entidades DESC
LIMIT 5;
"""

resultado = dm.sql(query)
print(resultado)
```

### Integración con Pandas y Polars

El resultado de `dm.sql()` puede convertirse directamente a DataFrames estándar:

```python
import datamesh as dm

# A DataFrame de Pandas
df = dm.sql("SELECT * FROM 'bolivia:air_quality:air_quality_compilaci_n_de_datos_de_calidad_del_aire_de_bolivia' LIMIT 100").to_df()
print(df.describe())

# A Polars DataFrame
import polars as pl
pl_df = pl.from_arrow(dm.sql("SELECT * FROM 'bolivia:oil_stations:oil_stations_stations'").to_arrow())
print(pl_df.head())
```

---

## 3. Uso con TypeScript / Node.js

El cliente `@datosbolivia/datamesh-client` permite consultar el catálogo federado y recuperar datos tabulares estructurados:

```typescript
import { datamesh } from '@datosbolivia/datamesh-client';

async function main() {
  // 1. Descubrir recursos disponibles
  const catalog = await datamesh.discover({
    catalogUrl: 'https://datosbolivia.github.io/llms.txt'
  });

  console.log(`Datasets indexados: ${catalog.length}`);

  // 2. Ejecutar consulta sobre una tríada específica
  const records = await datamesh.query({
    resource_uri: 'bolivia:financial_entities:financial_entities_places',
    limit: 10,
    filters: {
      departamento: 'La Paz'
    }
  });

  console.log('Registros recuperados:', records);
}

main().catch(console.error);
```

---

## 4. Uso desde la Línea de Comandos (CLI)

Una vez instalado el SDK, el comando `datamesh` queda disponible globalmente en la terminal:

### Comandos Principales

```bash
# Verificar versión y estado del motor
datamesh --version

# Listar todos los catálogos y datasets federados
datamesh discover

# Inspeccionar el esquema de un dataset específico
datamesh inspect "bolivia:air_quality:air_quality_compilaci_n_de_datos_de_calidad_del_aire_de_bolivia"

# Ejecutar una consulta SQL directa
datamesh sql "SELECT lugar_nombre, ROUND(AVG(valor_ica), 1) AS promedio_ica FROM 'bolivia:air_quality:air_quality_compilaci_n_de_datos_de_calidad_del_aire_de_bolivia' GROUP BY lugar_nombre ORDER BY promedio_ica DESC LIMIT 5"

# Exportar el resultado a formato JSON o CSV
datamesh sql "SELECT * FROM 'bolivia:agetic_data:estadisticas_ciudadania_digital'" --format=json > ciudadania.json
```

---

## 5. Configuración para Agentes de Inteligencia Artificial (MCP Server)

DataMesh incluye un servidor nativo compatible con el estándar **Model Context Protocol (MCP)**. Esto permite que asistentes de IA (Claude Desktop, Cursor, Antigravity, Roo Code) consulten el catálogo y ejecuten análisis SQL de forma autónoma.

### Iniciar el Servidor MCP

```bash
datamesh mcp-serve
```

### Configuración en Claude Desktop

Añade la siguiente entrada en tu archivo `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "datamesh": {
      "command": "datamesh",
      "args": ["mcp-serve"],
      "env": {
        "DATAMESH_CATALOG_URL": "https://datosbolivia.github.io/llms.txt"
      }
    }
  }
}
```

### Capacidades Expuestas a los Agentes

- `datamesh_discover`: Descubre nodos, categorías y esquemas disponibles en la federación.
- `datamesh_inspect`: Obtiene metadatos, contratos y tipos de columnas de una tríada.
- `datamesh_sql`: Ejecuta consultas SQL seguras en DuckDB sobre recursos remotos.

---

## 6. Variables de Entorno y Configuración Determinista

El comportamiento del SDK puede parametrizarse mediante variables de entorno en sistemas CI/CD o contenedores:

| Variable | Tipo | Por Defecto | Descripción |
| :--- | :--- | :--- | :--- |
| `DATAMESH_CATALOG_URL` | String | `https://datosbolivia.github.io/llms.txt` | URL del endpoint soberano `llms.txt` |
| `DATAMESH_CACHE_DIR` | String | `~/.cache/datamesh` | Directorio local de caché para Parquet/DuckDB |
| `DATAMESH_DUCKDB_MEMORY_LIMIT` | String | `4GB` | Límite máximo de memoria RAM para DuckDB |
| `DATAMESH_OFFLINE` | Boolean | `false` | Forzar uso exclusivo de caché local sin red |

---

## 7. Licencia y Atribución

El SDK DataMesh está distribuido bajo la **Licencia MIT con Requisito de Atribución**. Se permite el uso comercial, privado, modificaciones y redistribución, siempre que se conserve el copyright original y la debida referencia a la iniciativa [Datos Bolivia](https://github.com/datosbolivia/datamesh).
