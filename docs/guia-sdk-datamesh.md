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

## 3. Uso con TypeScript / Node.js & Navegador

El cliente `@datosbolivia/datamesh-client` permite consultar el catálogo federado, recuperar datos tabulares estructurados y graficar reactivamente con **Observable JS (OJS)**:

```typescript
import { datamesh, DataMeshClient } from '@datosbolivia/datamesh-client';

async function main() {
  // 1. Descubrir recursos disponibles
  const catalog = await datamesh.discover();
  console.log(`Datasets indexados: ${catalog.entries.length}`);

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

### Gráficos Reactivos con Observable JS (` ```ojs `)

Los archivos Markdown de los nodos soportan bloques interactivos ` ```ojs ` evaluados en el navegador mediante `@observablehq/plot` y `@datosbolivia/datamesh-client`:

```markdown
\`\`\`ojs
const data = await datamesh.query({
  resource_uri: "financial_entities:financial_entities_places",
  limit: 200
});

return Plot.plot({
  title: "Puntos de Atención Financiera por Departamento",
  marks: [
    Plot.barX(data.rows, Plot.groupY({ x: "count" }, {
      y: (d) => d[data.columns.indexOf("departamento")],
      fill: "var(--color-primary, #0284c7)",
      sort: { y: "-x" }
    }))
  ]
});
\`\`\`
```

### Conexión a Backend y Servidor MCP (Bypass de CORS y Cómputo Pesado)

Para procesar datasets masivos o consultar fuentes con restricciones CORS, el SDK soporta delegación remota mediante el cliente MCP (`DataMeshMcpClient`):

```typescript
import { DataMeshMcpClient } from './src/lib/mcp';

const mcpClient = new DataMeshMcpClient({
  serverUrl: 'http://localhost:8000/mcp' // Configurable vía PUBLIC_DATAMESH_MCP_URL
});

// Ejecuta SQL remoto en el servidor DuckDB del backend
const resultado = await mcpClient.querySql(`
  SELECT departamento, COUNT(*) AS total
  FROM 'anh-dispatch-reports:anh_dispatch'
  GROUP BY departamento
  ORDER BY total DESC;
`);
console.log(resultado.rows);
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

# Iniciar el servidor unificado HTTP REST, Proxy CORS y MCP (datamesh serve)
datamesh serve --port 8000 --host 0.0.0.0
```

### Servidor (`datamesh serve`)

El comando `datamesh serve` inicia un daemon local que provee:
- **Proxy CORS Transparente (`GET /proxy?url=...`):** Permite a aplicaciones web y navegadores eludir restricciones de orígenes cruzados en datasets remotos.
- **API REST (`GET /api/catalog`, `POST /api/sql`):** Ejecución remota de SQL sobre DuckDB y exploración del catálogo federado.
- **Protocolo MCP (`POST /mcp`):** Servidor JSON-RPC 2.0 para agentes autónomos y LLMs sin requerir pipes stdio directos.

---

## 5. Configuración para Agentes de Inteligencia Artificial (MCP Server)

DataMesh incluye un servidor nativo compatible con el estándar **Model Context Protocol (MCP)**. Esto permite que asistentes de IA (Claude Desktop, Cursor, Antigravity, Roo Code) consulten el catálogo y ejecuten análisis SQL de forma autónoma.

### Iniciar el Servidor MCP

```bash
# Modo Stdio tradicional (para Claude Desktop / Cursor CLI)
datamesh mcp-serve

# Modo HTTP / Daemon de red con proxy CORS integrado
datamesh serve --port 8000
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
